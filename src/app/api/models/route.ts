import { NextRequest, NextResponse } from 'next/server';
import { getGenAIClient, listAvailableGeminiModels, discoverBestVisionModel } from '@/utils/ai';
import { resolveDynamicGeminiKey } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const keyResolution = resolveDynamicGeminiKey(request.headers);
    if (!keyResolution) {
      return NextResponse.json({
        success: false,
        connected: false,
        source: null,
        error: 'No Gemini API key found. Please configure a key in Settings or environment variables.',
        models: [],
        bestModel: null,
      }, { status: 200 }); // Return 200 with connected: false to let UI display clean setup banner
    }

    const ai = getGenAIClient({ apiKey: keyResolution.key });
    const bestModel = await discoverBestVisionModel(ai);
    const models = await listAvailableGeminiModels(ai);

    return NextResponse.json({
      success: true,
      connected: true,
      source: keyResolution.source,
      bestModel,
      models,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message || 'Failed to connect to Gemini API',
      models: [],
      bestModel: null,
    }, { status: 200 });
  }
}
