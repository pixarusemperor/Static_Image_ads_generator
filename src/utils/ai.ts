import { GoogleGenAI } from '@google/genai';
import { env, getGcpProject, resolveDynamicGeminiKey, requireGeminiApiKey } from '@/lib/env';

export interface ModelDiscoveryResult {
  id: string;
  displayName: string;
  description: string;
}

// In-memory cache for dynamic model discovery
interface CachedModelDiscovery {
  selectedModel: string;
  availableModels: ModelDiscoveryResult[];
  expiresAt: number;
}

let discoveryCache: CachedModelDiscovery | null = null;
let activeDiscoveryPromise: Promise<string> | null = null;

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const DISCOVERY_TIMEOUT_MS = 2500; // 2.5 second ceiling
const SAFE_FALLBACK_MODEL = 'gemini-2.5-flash';
const KNOWN_VISION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Initializes the Google Gen AI client dynamically.
 * Supports explicit per-request key override, dynamic header injection,
 * live process.env updates, ambient Antigravity CLI subscription, or Vertex AI.
 */
export function getGenAIClient(options?: { apiKey?: string; headers?: Headers | Record<string, string | null | undefined> }): GoogleGenAI {
  if (env.VERTEX_AI) {
    const project = getGcpProject();
    const location = env.GCP_LOCATION;

    const config: any = { vertexai: true };
    if (project) config.project = project;
    if (location) config.location = location;

    return new GoogleGenAI(config);
  }

  // Check explicit override first
  if (options?.apiKey && options.apiKey.trim()) {
    return new GoogleGenAI({ apiKey: options.apiKey.trim() });
  }

  // Check dynamic header / env cascade
  const resolved = resolveDynamicGeminiKey(options?.headers);
  if (resolved) {
    return new GoogleGenAI({ apiKey: resolved.key });
  }

  const apiKey = requireGeminiApiKey();
  return new GoogleGenAI({ apiKey });
}

/**
 * Dynamically queries Gemini API to discover the latest and best vision-capable model.
 * Uses single-flight deduplication and a 12-hour in-memory cache to guarantee zero per-request latency.
 */
export async function discoverBestVisionModel(ai: GoogleGenAI): Promise<string> {
  // 1. If explicitly configured via env.GEMINI_MODEL and not default, respect explicit override
  if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== 'gemini-2.5-flash' && process.env.GEMINI_MODEL.trim()) {
    return process.env.GEMINI_MODEL.trim();
  }

  // 2. Check in-memory cache
  const now = Date.now();
  if (discoveryCache && discoveryCache.expiresAt > now) {
    return discoveryCache.selectedModel;
  }

  // 3. Single-flight request deduplication (prevents thundering herd on cold cache)
  if (activeDiscoveryPromise) {
    return activeDiscoveryPromise;
  }

  activeDiscoveryPromise = (async () => {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), DISCOVERY_TIMEOUT_MS);

      // Call ai.models.list() - returns a Pager<Model>
      const pager = await ai.models.list({
        config: {
          pageSize: 50,
          abortSignal: abortController.signal,
        },
      });
      clearTimeout(timeoutId);

      const candidateModels: ModelDiscoveryResult[] = [];
      const page = pager.page || [];

      for (const m of page) {
        const rawName = m.name || '';
        // Strip 'models/' prefix if present
        const id = rawName.startsWith('models/') ? rawName.slice(7) : rawName;
        const supported = m.supportedActions || [];

        // In Gemini Developer API, multimodal vision models support generateContent
        const canGenerate = supported.length === 0 || supported.includes('generateContent');
        const isKnownVision = KNOWN_VISION_MODELS.some(known => id.includes(known)) || id.toLowerCase().includes('flash') || id.toLowerCase().includes('pro');

        if (canGenerate && isKnownVision) {
          candidateModels.push({
            id,
            displayName: m.displayName || id,
            description: m.description || 'Gemini Multimodal Model',
          });
        }
      }

      // Rank discovered models: Prefer 2.5 Flash > 2.0 Flash > 1.5 Flash > others
      let bestModel = SAFE_FALLBACK_MODEL;
      for (const preference of KNOWN_VISION_MODELS) {
        const match = candidateModels.find(c => c.id === preference || c.id.includes(preference));
        if (match) {
          bestModel = match.id;
          break;
        }
      }

      discoveryCache = {
        selectedModel: bestModel,
        availableModels: candidateModels.length > 0 ? candidateModels : KNOWN_VISION_MODELS.map(id => ({ id, displayName: id, description: 'Pre-configured Vision Model' })),
        expiresAt: now + CACHE_TTL_MS,
      };

      return bestModel;
    } catch (err: any) {
      console.warn('[ModelDiscovery] Dynamic model discovery timed out or failed, using safe fallback:', err?.message || err);
      // Set short 5-minute cooldown on error to avoid repeated failing network requests
      discoveryCache = {
        selectedModel: SAFE_FALLBACK_MODEL,
        availableModels: KNOWN_VISION_MODELS.map(id => ({ id, displayName: id, description: 'Fallback Vision Model' })),
        expiresAt: now + 1000 * 60 * 5,
      };
      return SAFE_FALLBACK_MODEL;
    } finally {
      activeDiscoveryPromise = null;
    }
  })();

  return activeDiscoveryPromise;
}

/**
 * Returns all available multimodal models discovered from the API (for UI dropdown selector).
 */
export async function listAvailableGeminiModels(ai: GoogleGenAI): Promise<ModelDiscoveryResult[]> {
  await discoverBestVisionModel(ai);
  return discoveryCache?.availableModels || KNOWN_VISION_MODELS.map(id => ({ id, displayName: id, description: 'Pre-configured Vision Model' }));
}

/**
 * Returns current model name (synchronous fallback, backward compatible).
 */
export function getGenAIModel(): string {
  if (discoveryCache?.selectedModel) {
    return discoveryCache.selectedModel;
  }
  return process.env.GEMINI_MODEL || SAFE_FALLBACK_MODEL;
}

export { resolveDynamicGeminiKey, requireGeminiApiKey };
