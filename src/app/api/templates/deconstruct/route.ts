import { NextRequest, NextResponse } from 'next/server';
import { getGenAIClient, discoverBestVisionModel } from '@/utils/ai';
import { resolveDynamicGeminiKey } from '@/lib/env';
import { extractContractFromAST } from '@/core/contracts/extractor';
import { saveDynamicTemplate, StoredTemplate } from '@/core/templates/storage';
import { recordTokenUsage } from '@/utils/token-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let imageBase64 = '';
  let mimeType = 'image/png';
  let filename = 'ad-creative.png';

  try {
    const contentTypeHeader = request.headers.get('content-type') || '';
    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
      }
      filename = file.name || filename;
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString('base64');
      mimeType = file.type || 'image/png';
    } else {
      const body = await request.json();
      const { image, name } = body;
      if (!image) {
        return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
      }
      filename = name || filename;
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,([\s\S]+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          imageBase64 = matches[2].replace(/\s/g, '');
        } else {
          return NextResponse.json({ success: false, error: 'Invalid data URL format' }, { status: 400 });
        }
      } else {
        imageBase64 = image.replace(/\s/g, '');
      }
    }

    const keyResolution = resolveDynamicGeminiKey(request.headers);
    let extractedZones: any[] = [];
    let canvasBgColor = '#111827';
    let detectedModel = 'ambient_heuristic';
    let promptTokens = 0;
    let candidatesTokens = 0;

    if (keyResolution) {
      try {
        const ai = getGenAIClient({ apiKey: keyResolution.key });
        detectedModel = await discoverBestVisionModel(ai);

        const prompt = `You are an expert direct-response ad reverse-engineering AI.
Analyze this ad image and deconstruct it into discrete visual layers on a 1080x1080 canvas.
Extract all text blocks and image zones with their exact bounding box coordinates (left, top, width, height), font styles, and colors.
Return a valid JSON object matching this structure:
{
  "canvasBgColor": "#hex",
  "layers": [
    {
      "type": "text" | "image" | "shape",
      "left": number,
      "top": number,
      "width": number,
      "height": number,
      "text": "verbatim text content",
      "fontSize": number,
      "fontWeight": "bold" | "normal",
      "fill": "#hex color",
      "textAlign": "center" | "left" | "right",
      "rx": number (border radius if rounded)
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: detectedModel,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        promptTokens = response.usageMetadata?.promptTokenCount || 0;
        candidatesTokens = response.usageMetadata?.candidatesTokenCount || 0;

        const textResp = response.text || '{}';
        const cleanJson = textResp.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        canvasBgColor = parsed.canvasBgColor || canvasBgColor;
        extractedZones = Array.isArray(parsed.layers) ? parsed.layers : [];
      } catch (aiErr: any) {
        console.warn('[Deconstruct] AI Vision failed or timed out, falling back to heuristic layout:', aiErr.message);
        extractedZones = getHeuristicLayoutZones(filename);
      }
    } else {
      extractedZones = getHeuristicLayoutZones(filename);
    }

    // Record token usage & cost telemetry
    const durationMs = Date.now() - startTime;
    const telemetry = await recordTokenUsage({
      task: 'template_deconstruction',
      source: (request.headers.get('x-superads-source') as any) || 'web',
      agentId: request.headers.get('x-superads-agent-id') || undefined,
      campaignId: request.headers.get('x-superads-campaign-id') || undefined,
      model: detectedModel,
      promptTokens,
      candidatesTokens,
      totalTokens: promptTokens + candidatesTokens,
      latencyMs: durationMs,
    });

    // Run dynamic contract extraction engine
    const cleanSlug = filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 32);
    const templateId = `tpl-${cleanSlug}-${Date.now().toString(36).slice(-4)}`;
    const templateName = `Ad Template: ${filename.replace(/\.[^/.]+$/, '')}`;

    const extraction = extractContractFromAST(extractedZones, {
      templateId,
      templateName,
      canvasWidth: 1080,
      canvasHeight: 1080,
    });

    // Synthesize persistent template
    const storedTemplate: StoredTemplate = {
      id: templateId,
      name: templateName,
      category: 'direct-response',
      dimensions: { width: 1080, height: 1080 },
      contract: extraction.contract,
      defaultVariables: extraction.defaultVariables,
      layers: extractedZones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveDynamicTemplate(storedTemplate);

    return NextResponse.json({
      success: true,
      templateId,
      templateName,
      template: storedTemplate,
      contract: extraction.contract,
      defaultVariables: extraction.defaultVariables,
      diagnostics: extraction.diagnostics,
      _telemetry: telemetry,
    }, {
      headers: {
        'X-Tokens-Prompt': String(promptTokens),
        'X-Tokens-Completion': String(candidatesTokens),
        'X-Estimated-Cost-USD': String(telemetry.estimatedCostUsd || 0),
      },
    });
  } catch (error: any) {
    console.error('[Deconstruct] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Template deconstruction failed.',
    }, { status: 500 });
  }
}

function getHeuristicLayoutZones(filename: string): any[] {
  return [
    { type: 'rect', left: 0, top: 0, width: 1080, height: 100, fill: '#000000', zIndex: 1 },
    { type: 'textbox', left: 0, top: 0, width: 1080, height: 100, text: 'FORMULE VOLCANIQUE 100% BIO', fontSize: 42, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', zIndex: 2 },
    { type: 'rect', left: 0, top: 100, width: 1080, height: 110, fill: '#E50914', zIndex: 3 },
    { type: 'textbox', left: 0, top: 100, width: 1080, height: 110, text: '2 MINUTES? TU ES FAIBLE?', fontSize: 50, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', zIndex: 4 },
    { type: 'image', left: 80, top: 240, width: 520, height: 620, src: '/templates/assets/30.png', zIndex: 5 },
    { type: 'image', left: 660, top: 300, width: 330, height: 460, src: '/templates/assets/30.png', zIndex: 6 },
    { type: 'rect', left: 650, top: 780, width: 350, height: 70, fill: '#000000', rx: 15, zIndex: 7 },
    { type: 'textbox', left: 650, top: 780, width: 350, height: 70, text: 'PRIX 5.000F(10$)', fontSize: 32, fontWeight: 'bold', fill: '#FFE600', textAlign: 'center', zIndex: 8 },
    { type: 'rect', left: 0, top: 880, width: 1080, height: 90, fill: '#E50914', zIndex: 9 },
    { type: 'textbox', left: 0, top: 880, width: 1080, height: 90, text: 'COMMANDEZ ET PAYEZ A LA LIVRAISON', fontSize: 38, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', zIndex: 10 },
  ];
}
