import { GoogleGenAI } from '@google/genai';

/**
 * Initializes the unified Google Gen AI client based on environment variables.
 * Supports both Gemini API Studio (API Key) and Google Cloud Vertex AI (Application Default Credentials).
 */
export function getGenAIClient(): GoogleGenAI {
  const isVertexAI = process.env.VERTEX_AI === 'true';

  if (isVertexAI) {
    const project = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GCP_LOCATION || 'us-central1';

    const config: any = {
      vertexai: true,
    };

    if (project) {
      config.project = project;
    }
    if (location) {
      config.location = location;
    }

    console.log(`[getGenAIClient] Initializing Vertex AI Client for project: ${project || 'default'}, location: ${location}`);
    return new GoogleGenAI(config);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'PLACEHOLDER' || apiKey === '') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  console.log('[getGenAIClient] Initializing Gemini API Studio Client');
  return new GoogleGenAI({ apiKey });
}

/**
 * Returns the recommended model name to use based on the environment.
 */
export function getGenAIModel(): string {
  // Use the standard high-speed flash model
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}
