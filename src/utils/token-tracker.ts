import fs from 'fs';
import path from 'path';
import { isR2Configured, uploadToR2 } from '@/lib/r2';

export interface TokenUsageRecord {
  id?: string;
  timestamp?: string;
  task: string;
  source?: 'web' | 'mcp' | 'cli' | 'hermes' | 'synphonys';
  agentId?: string;
  campaignId?: string;
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
  latencyMs?: number;
}

export interface TokenUsageStats {
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  totalTasks: number;
  byTask: Record<string, { count: number; tokens: number; costUsd: number }>;
  bySource: Record<string, { count: number; tokens: number; costUsd: number }>;
  byModel: Record<string, { count: number; tokens: number; costUsd: number }>;
  recentRecords: TokenUsageRecord[];
}

// Model pricing rates per 1M tokens (USD)
const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  'gemini-2.5-flash': { prompt: 0.075, completion: 0.30 },
  'gemini-2.0-flash': { prompt: 0.075, completion: 0.30 },
  'gemini-1.5-flash': { prompt: 0.075, completion: 0.30 },
  'gemini-2.5-pro': { prompt: 3.50, completion: 10.50 },
  'gemini-1.5-pro': { prompt: 3.50, completion: 10.50 },
};
const DEFAULT_PRICING = { prompt: 0.15, completion: 0.60 };

export function calculateTokenCost(model: string, promptTokens: number, candidatesTokens: number): number {
  const matchingKey = Object.keys(MODEL_PRICING).find(key => model.includes(key));
  const rate = matchingKey ? MODEL_PRICING[matchingKey] : DEFAULT_PRICING;
  const cost = (promptTokens / 1_000_000) * rate.prompt + (candidatesTokens / 1_000_000) * rate.completion;
  return Number(cost.toFixed(6));
}

// In-memory ring buffer (fast, zero-overhead, holds last 200 records)
const MAX_RING_BUFFER = 200;
const ringBuffer: TokenUsageRecord[] = [];

// Cumulative in-memory aggregator (survives requests, drained on flush)
const cumulativeStats: TokenUsageStats = {
  totalPromptTokens: 0,
  totalCandidatesTokens: 0,
  totalTokens: 0,
  totalCostUsd: 0,
  totalTasks: 0,
  byTask: {},
  bySource: {},
  byModel: {},
  recentRecords: [],
};

const LEDGER_PATH = path.join(process.cwd(), 'data', 'analytics', 'token-usage.jsonl');

/**
 * Records a single AI token consumption event.
 * Updates in-memory buffer instantly and appends asynchronously to disk/R2.
 */
export async function recordTokenUsage(entry: TokenUsageRecord): Promise<TokenUsageRecord> {
  const now = new Date().toISOString();
  const id = entry.id || `tok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const model = entry.model || 'unknown';
  const promptTokens = Math.max(0, entry.promptTokens || 0);
  const candidatesTokens = Math.max(0, entry.candidatesTokens || 0);
  const totalTokens = Math.max(promptTokens + candidatesTokens, entry.totalTokens || 0);
  const estimatedCostUsd = entry.estimatedCostUsd ?? calculateTokenCost(model, promptTokens, candidatesTokens);
  const source = entry.source || 'web';
  const task = entry.task || 'general_ai';

  const record: TokenUsageRecord = {
    id,
    timestamp: now,
    task,
    source,
    agentId: entry.agentId || 'anonymous',
    campaignId: entry.campaignId,
    model,
    promptTokens,
    candidatesTokens,
    totalTokens,
    estimatedCostUsd,
    latencyMs: entry.latencyMs || 0,
  };

  // 1. Update in-memory ring buffer
  ringBuffer.unshift(record);
  if (ringBuffer.length > MAX_RING_BUFFER) {
    ringBuffer.pop();
  }

  // 2. Update cumulative aggregator
  cumulativeStats.totalPromptTokens += promptTokens;
  cumulativeStats.totalCandidatesTokens += candidatesTokens;
  cumulativeStats.totalTokens += totalTokens;
  cumulativeStats.totalCostUsd = Number((cumulativeStats.totalCostUsd + estimatedCostUsd).toFixed(6));
  cumulativeStats.totalTasks += 1;

  // By task
  if (!cumulativeStats.byTask[task]) {
    cumulativeStats.byTask[task] = { count: 0, tokens: 0, costUsd: 0 };
  }
  cumulativeStats.byTask[task].count += 1;
  cumulativeStats.byTask[task].tokens += totalTokens;
  cumulativeStats.byTask[task].costUsd = Number((cumulativeStats.byTask[task].costUsd + estimatedCostUsd).toFixed(6));

  // By source
  if (!cumulativeStats.bySource[source]) {
    cumulativeStats.bySource[source] = { count: 0, tokens: 0, costUsd: 0 };
  }
  cumulativeStats.bySource[source].count += 1;
  cumulativeStats.bySource[source].tokens += totalTokens;
  cumulativeStats.bySource[source].costUsd = Number((cumulativeStats.bySource[source].costUsd + estimatedCostUsd).toFixed(6));

  // By model
  if (!cumulativeStats.byModel[model]) {
    cumulativeStats.byModel[model] = { count: 0, tokens: 0, costUsd: 0 };
  }
  cumulativeStats.byModel[model].count += 1;
  cumulativeStats.byModel[model].tokens += totalTokens;
  cumulativeStats.byModel[model].costUsd = Number((cumulativeStats.byModel[model].costUsd + estimatedCostUsd).toFixed(6));

  // 3. Asynchronous append to local JSONL ledger (non-blocking)
  try {
    const dir = path.dirname(LEDGER_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFile(LEDGER_PATH, JSON.stringify(record) + '\n', (err) => {
      if (err) console.warn('[TokenTracker] Failed to append to ledger:', err.message);
    });
  } catch (err: any) {
    console.warn('[TokenTracker] Local ledger write ignored:', err.message);
  }

  return record;
}

/**
 * Returns current token consumption statistics and recent history.
 */
export async function getTokenUsageStats(): Promise<TokenUsageStats> {
  // If in-memory aggregator is empty on cold start, try to hydrate from local JSONL
  if (cumulativeStats.totalTasks === 0 && fs.existsSync(LEDGER_PATH)) {
    try {
      const content = fs.readFileSync(LEDGER_PATH, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines.slice(-200)) {
        try {
          const parsed: TokenUsageRecord = JSON.parse(line);
          ringBuffer.unshift(parsed);
          cumulativeStats.totalPromptTokens += parsed.promptTokens || 0;
          cumulativeStats.totalCandidatesTokens += parsed.candidatesTokens || 0;
          cumulativeStats.totalTokens += parsed.totalTokens || 0;
          cumulativeStats.totalCostUsd = Number((cumulativeStats.totalCostUsd + (parsed.estimatedCostUsd || 0)).toFixed(6));
          cumulativeStats.totalTasks += 1;

          const task = parsed.task || 'general_ai';
          const source = parsed.source || 'web';
          const model = parsed.model || 'unknown';

          if (!cumulativeStats.byTask[task]) cumulativeStats.byTask[task] = { count: 0, tokens: 0, costUsd: 0 };
          cumulativeStats.byTask[task].count += 1;
          cumulativeStats.byTask[task].tokens += parsed.totalTokens || 0;
          cumulativeStats.byTask[task].costUsd = Number((cumulativeStats.byTask[task].costUsd + (parsed.estimatedCostUsd || 0)).toFixed(6));

          if (!cumulativeStats.bySource[source]) cumulativeStats.bySource[source] = { count: 0, tokens: 0, costUsd: 0 };
          cumulativeStats.bySource[source].count += 1;
          cumulativeStats.bySource[source].tokens += parsed.totalTokens || 0;
          cumulativeStats.bySource[source].costUsd = Number((cumulativeStats.bySource[source].costUsd + (parsed.estimatedCostUsd || 0)).toFixed(6));

          if (!cumulativeStats.byModel[model]) cumulativeStats.byModel[model] = { count: 0, tokens: 0, costUsd: 0 };
          cumulativeStats.byModel[model].count += 1;
          cumulativeStats.byModel[model].tokens += parsed.totalTokens || 0;
          cumulativeStats.byModel[model].costUsd = Number((cumulativeStats.byModel[model].costUsd + (parsed.estimatedCostUsd || 0)).toFixed(6));
        } catch {
          // ignore malformed line
        }
      }
    } catch {
      // hydration error ignored
    }
  }

  return {
    ...cumulativeStats,
    recentRecords: ringBuffer.slice(0, 50),
  };
}

/**
 * Flushes the current rollup to Cloudflare R2 bucket.
 * Called periodically or upon SIGTERM container shutdown.
 */
export async function flushTokenAnalyticsToR2(): Promise<void> {
  if (!isR2Configured() || cumulativeStats.totalTasks === 0) {
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const hourStr = String(now.getUTCHours()).padStart(2, '0');
  const key = `analytics/tokens/${dateStr}/rollup-hour-${hourStr}.json`;

  try {
    const payload = JSON.stringify({
      timestamp: now.toISOString(),
      stats: cumulativeStats,
      recentRecords: ringBuffer.slice(0, 50),
    }, null, 2);

    await uploadToR2({
      key,
      body: Buffer.from(payload),
      contentType: 'application/json',
    });
    console.log(`[TokenTracker] Flushed token analytics rollup to R2: ${key}`);
  } catch (err: any) {
    console.warn('[TokenTracker] Failed to flush analytics to R2:', err.message);
  }
}
