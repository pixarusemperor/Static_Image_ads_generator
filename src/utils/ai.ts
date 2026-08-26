import { GoogleGenAI } from '@google/genai';
import { env, getGcpProject, requireGeminiApiKey, hasGeminiApiKey } from '@/lib/env';

/**
 * Initializes the unified Google Gen AI client based on environment variables.
 * Supports both Gemini API Studio (API Key) and Google Cloud Vertex AI (Application Default Credentials).
 */
export function getGenAIClient(): GoogleGenAI {
  if (env.VERTEX_AI) {
    const project = getGcpProject();
    const location = env.GCP_LOCATION;

    const config: any = { vertexai: true };
    if (project) config.project = project;
    if (location) config.location = location;

    console.log(`[getGenAIClient] Initializing Vertex AI Client for project: ${project || 'default'}, location: ${location}`);
    return new GoogleGenAI(config);
  }

  const apiKey = requireGeminiApiKey();
  console.log('[getGenAIClient] Initializing Gemini API Studio Client');
  return new GoogleGenAI({ apiKey });
}

/**
 * Returns the recommended model name to use based on the environment.
 */
export function getGenAIModel(): string {
  return env.GEMINI_MODEL;
}

export { hasGeminiApiKey, requireGeminiApiKey };
