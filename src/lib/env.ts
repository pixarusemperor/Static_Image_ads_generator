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

export function requireGeminiApiKey(): string {
  if (!hasGeminiApiKey()) {
    throw new Error(
      '[env] GEMINI_API_KEY is not configured. ' +
        'Set it in Coolify → Environment Variables, then redeploy. ' +
        'Without it, AI-powered features (/api/assemble, /api/analyze) will fail.',
    );
  }
  return env.GEMINI_API_KEY;
}

export function getGcpProject(): string {
  return env.GCP_PROJECT || env.GOOGLE_CLOUD_PROJECT;
}
