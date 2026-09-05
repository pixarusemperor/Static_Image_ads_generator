import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_gemini_api_key_here',
  'PLACEHOLDER',
  'changeme',
]);

const RawEnvSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().optional().default('gemini-2.5-flash'),
  VERTEX_AI: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .pipe(z.boolean()),
  GCP_PROJECT: z.string().optional().default(''),
  GOOGLE_CLOUD_PROJECT: z.string().optional().default(''),
  GCP_LOCATION: z.string().optional().default('us-central1'),
  PORT: z
    .string()
    .optional()
    .default('3000')
    .transform((v) => Number.parseInt(v, 10))
    .pipe(z.number().int().positive()),
  NODE_TLS_REJECT_UNAUTHORIZED: z.string().optional(),
  // Cloudflare R2 Object Storage (Optional, with local fallback)
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET_NAME: z.string().optional().default(''),
  R2_PUBLIC_URL: z.string().optional().default(''),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().optional().default(''),
});

export type Env = z.infer<typeof RawEnvSchema>;

function loadEnv(): Env {
  const parsed = RawEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `[env] Invalid environment configuration:\n${issues}\n` +
        `Fix the variables above in Coolify → ${process.env.COOLIFY_APP_NAME ?? 'app'} → Environment Variables, then redeploy.`,
    );
  }
  return parsed.data;
}

export const env: Env = loadEnv();

export function hasGeminiApiKey(): boolean {
  return !PLACEHOLDER_VALUES.has(env.GEMINI_API_KEY);
}

/**
 * Resolves the active Gemini API key using a 5-tier fallback cascade:
 * 1. Request Header: 'x-gemini-api-key' (client UI / API callers)
 * 2. Request Header: 'Authorization: Bearer <key>'
 * 3. JSON Request Body: 'apiKey'
 * 4. Live runtime process.env.GEMINI_API_KEY (supports changes without restart)
 * 5. Ambient Antigravity CLI Google Cloud Code Assist token (~/.bashrc)
 * 6. Validated startup env.GEMINI_API_KEY
 */
export function resolveDynamicGeminiKey(
  reqHeaders?: Headers | Record<string, string | null | undefined>,
  reqBody?: Record<string, any>
): { key: string; source: 'header' | 'bearer' | 'body' | 'env_live' | 'ambient_agy' | 'env_startup' } | null {
  // 1. Check Header 'x-gemini-api-key'
  if (reqHeaders) {
    const headerKey = typeof (reqHeaders as Headers).get === 'function'
      ? (reqHeaders as Headers).get('x-gemini-api-key')
      : (reqHeaders as Record<string, string | null | undefined>)['x-gemini-api-key'];
    if (headerKey && !PLACEHOLDER_VALUES.has(headerKey.trim())) {
      return { key: headerKey.trim(), source: 'header' };
    }

    // 2. Check Authorization Bearer
    const authHeader = typeof (reqHeaders as Headers).get === 'function'
      ? (reqHeaders as Headers).get('authorization')
      : (reqHeaders as Record<string, string | null | undefined>)['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token && !PLACEHOLDER_VALUES.has(token)) {
        return { key: token, source: 'bearer' };
      }
    }
  }

  // 3. Check Request Body
  if (reqBody && typeof reqBody.apiKey === 'string') {
    const bodyKey = reqBody.apiKey.trim();
    if (bodyKey && !PLACEHOLDER_VALUES.has(bodyKey)) {
      return { key: bodyKey, source: 'body' };
    }
  }

  // 4. Check Live Runtime process.env.GEMINI_API_KEY
  const liveEnvKey = process.env.GEMINI_API_KEY?.trim();
  if (liveEnvKey && !PLACEHOLDER_VALUES.has(liveEnvKey)) {
    return { key: liveEnvKey, source: 'env_live' };
  }

  // 5. Check Ambient Antigravity CLI Host Subscription Token
  try {
    if (typeof process !== 'undefined' && process.env.HOME) {
      const bashrcPath = path.join(process.env.HOME, '.bashrc');
      if (fs.existsSync(bashrcPath)) {
        const content = fs.readFileSync(bashrcPath, 'utf-8');
        const match = content.match(/export\s+GEMINI_API_KEY=["']?(AQ\.[a-zA-Z0-9_\-]+)["']?/);
        if (match && match[1]) {
          return { key: match[1], source: 'ambient_agy' };
        }
      }
    }
  } catch {
    // ignore filesystem access errors in sandboxed containers
  }

  // 6. Check Validated Startup env
  if (env.GEMINI_API_KEY && !PLACEHOLDER_VALUES.has(env.GEMINI_API_KEY.trim())) {
    return { key: env.GEMINI_API_KEY.trim(), source: 'env_startup' };
  }

  return null;
}

export function requireGeminiApiKey(): string {
  const resolved = resolveDynamicGeminiKey();
  if (!resolved) {
    throw new Error(
      '[env] GEMINI_API_KEY is not configured. ' +
        'Set it in the UI Settings modal, request headers (x-gemini-api-key), or Environment Variables. ' +
        'Without it, AI-powered features will fail.',
    );
  }
  return resolved.key;
}

export function getGcpProject(): string {
  return env.GCP_PROJECT || env.GOOGLE_CLOUD_PROJECT;
}

export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  );
}

export function getR2PublicUrl(): string {
  const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || (typeof env !== 'undefined' ? (env.NEXT_PUBLIC_R2_PUBLIC_URL || env.R2_PUBLIC_URL) : '');
  return (url || '').replace(/\/+$/, '');
}
