import { NextRequest, NextResponse } from 'next/server';
import { renderAdToPng } from '@/core/renderer/engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { templateId, variables: rawVariables, uploadToR2 = false } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
    }

    // Support both nested `variables: {...}` and flat body `{ templateId, ...variables }`
    const incomingVariables = (rawVariables && typeof rawVariables === 'object' && Object.keys(rawVariables).length > 0)
      ? rawVariables
      : (() => {
          const { templateId: _, ...rest } = body;
          return rest;
        })();

    const result = await renderAdToPng(templateId, incomingVariables, { uploadToR2 });

    // If client requested R2 upload or JSON response
    const acceptHeader = request.headers.get('accept') || '';
    if (uploadToR2 || acceptHeader.includes('application/json')) {
      const base64Url = `data:image/png;base64,${result.pngBuffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        templateId,
        width: result.width,
        height: result.height,
        dimensions: { width: result.width, height: result.height },
        r2Url: result.r2Url || null,
        dataUrl: base64Url,
        imageBase64: base64Url,
      });
    }

    // Default: return binary PNG image stream
    return new NextResponse(new Uint8Array(result.pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    console.error('Error in Assembly API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
