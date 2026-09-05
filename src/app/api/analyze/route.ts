import { NextRequest, NextResponse } from 'next/server';
import { getGenAIClient, discoverBestVisionModel } from '@/utils/ai';
import { resolveDynamicGeminiKey } from '@/lib/env';
import { recordTokenUsage } from '@/utils/token-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let filename = '';

  try {
    let imageBase64 = '';
    let mimeType = 'image/png';

    // 1. Parse request body
    const contentTypeHeader = request.headers.get('content-type') || '';
    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
      }
      filename = file.name || '';
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString('base64');
      mimeType = file.type || 'image/png';
    } else {
      const body = await request.json();
      const { image, name } = body;
      if (!image) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }
      filename = name || '';

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,([\s\S]+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          imageBase64 = matches[2].replace(/\s/g, '');
        } else {
          return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
        }
      } else {
        imageBase64 = image.replace(/\s/g, '');
      }
    }

    // 2. Resolve Gemini API key dynamically (header -> env -> ambient token)
    const keyResolution = resolveDynamicGeminiKey(request.headers);
    if (!keyResolution) {
      console.warn('[Analyze] No Gemini API key configured. Returning mock classification.');
      const mockResult = getMockClassification(filename);
      return NextResponse.json({
        ...mockResult,
        warning: 'No Gemini API key provided. Using fallback layout.',
      });
    }

    let ai;
    let model = 'gemini-2.5-flash';
    try {
      ai = getGenAIClient({ apiKey: keyResolution.key });
      model = await discoverBestVisionModel(ai);
    } catch (e: any) {
      console.warn('[Analyze] Gen AI Client could not be initialized:', e.message);
      const mockResult = getMockClassification(filename);
      return NextResponse.json(mockResult);
    }

    // 3. Construct prompt
    const prompt = `You are an expert direct-response marketing design analysis AI. 
Analyze the uploaded advertisement image and:
1. Classify it into exactly one of these 7 template layout categories:
   - "1-a": Direct-Response Niche Product Ad. Layout: two header banners (top black, second red), a main subject image on left, a product mockup on right, a yellow price badge, and a red footer banner with a white line below it.
   - "1-b": Direct-Response Niche Product Ad variant. Layout: top background image, a product mockup overlay, a title, a subtitle, body paragraph copy, and a yellow price badge.
   - "2-a": Publisher Content Card resembling a native publisher post. Layout: full background image, logo space (left/right), optional avatar, and a bold headline with some text enclosed in brackets [like this] to apply highlight styling.
   - "3-a": Native Social Ad. Layout: background image, overlapping product image, bold headline, and a promotional badge text.
   - "3-b": Native Social Ad mimicking a social media post (like a Twitter/X post card). Layout: background image, post author name, post handle (@handle), avatar image, post body content, and stats (likes, retweets).
   - "4-a": Recruitment Flyer. Layout: header banner for recruiting, centered body image, optional flag badge, and footer details for salary and commissions.
   - "5-a": Typographic Flyer. Layout: solid colored background, centered bold title, and a subtitle. No images.

2. Extract all the textual content, badge texts, stats, and custom colors present in the image and place them in the corresponding variables object:
   - For "1-a": headerLine1, headerLine2, priceBadgeText, footerLine1, footerLine2.
   - For "1-b": priceBadgeText, title, subtitle, bodyParagraph, footerText.
   - For "2-a": headline (include brackets [around high-intensity words] to highlight them, e.g., "CETTE HABITUDE [TUE] VOTRE FOIE"), highlightColor (hex code, default #E50914), logoPosition ('left' or 'right'), hasAvatar (true/false).
   - For "3-a": headline, badgeText.
   - For "3-b": postAuthor, postHandle, postContent, postStats.
   - For "4-a": headerTitle, footerSalary, footerCommissions.
   - For "5-a": backgroundColor (hex code), title, subtitle.

Return a JSON object with:
{
  "templateId": "1-a" | "1-b" | "2-a" | "3-a" | "3-b" | "4-a" | "5-a",
  "variables": { ... }
}`;

    // 4. Call Gemini API using structured JSON output
    const response = await ai.models.generateContent({
      model,
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

    const promptTokens = response.usageMetadata?.promptTokenCount || 0;
    const candidatesTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const durationMs = Date.now() - startTime;

    const telemetry = await recordTokenUsage({
      task: 'ad_classification_analysis',
      source: (request.headers.get('x-superads-source') as any) || 'web',
      agentId: request.headers.get('x-superads-agent-id') || undefined,
      campaignId: request.headers.get('x-superads-campaign-id') || undefined,
      model,
      promptTokens,
      candidatesTokens,
      totalTokens: promptTokens + candidatesTokens,
      latencyMs: durationMs,
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    const cleanJson = textResponse.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonResult = JSON.parse(cleanJson);

    return NextResponse.json({
      ...jsonResult,
      _telemetry: telemetry,
    }, {
      headers: {
        'X-Tokens-Prompt': String(promptTokens),
        'X-Tokens-Completion': String(candidatesTokens),
        'X-Estimated-Cost-USD': String(telemetry.estimatedCostUsd || 0),
      },
    });

  } catch (error: unknown) {
    console.error('Error in analyze API route:', error);
    const mockResult = getMockClassification(filename);
    return NextResponse.json({
      ...mockResult,
      warning: 'Failed to connect to Gemini API. Returned fallback mock layout.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function getMockClassification(filename: string) {
  const nameLower = filename.toLowerCase();

  if (nameLower.includes('recrutement') || nameLower.includes('recrute') || nameLower.includes('flyer')) {
    return {
      templateId: '4-a',
      variables: {
        headerTitle: 'RECRUTEMENT CONSEILLERS CLIENTS',
        footerSalary: 'SALAIRE DE BASE: 170.000 F CFA',
        footerCommissions: '+ ASSURANCE MALADIE ET TRANSPORTS',
        bodyImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000',
        flagBadgeUrl: '',
      },
    };
  }

  if (nameLower.includes('tweet') || nameLower.includes('twitter') || nameLower.includes('post') || nameLower.includes('hormozi')) {
    return {
      templateId: '3-b',
      variables: {
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000',
        postAuthor: 'Alex Hormozi',
        postHandle: '@AlexHormozi',
        postAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        postContent: 'The biggest mistake people make in their 20s is thinking they have time. You don\'t. Work like someone is trying to take it all away.',
        postStats: '12.4k Likes • 2.1k Retweets',
      },
    };
  }

  if (nameLower.includes('green') || nameLower.includes('text') || nameLower.includes('simple') || nameLower.includes('typo')) {
    return {
      templateId: '5-a',
      variables: {
        backgroundColor: '#00875A',
        title: 'DOUBLER VOS VENTES EN 90 JOURS',
        subtitle: '(SANS PAYER PLUS DE PUBLICITÉ)',
      },
    };
  }

  if (nameLower.includes('publisher') || nameLower.includes('card') || nameLower.includes('tue')) {
    return {
      templateId: '2-a',
      variables: {
        backgroundImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000',
        logoUrl: '',
        logoPosition: 'left',
        hasAvatar: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        headline: 'CETTE HABITUDE [TUE] APPRIVOISEE PAR LA SCIENCE',
        highlightColor: '#E50914',
      },
    };
  }

  // Default to 1-a Direct Response Product
  return {
    templateId: '1-a',
    variables: {
      headerLine1: 'TU VERSES LE LIQUIDE VITE',
      headerLine2: '2 MINUTES? TU ES FAIBLE?',
      priceBadgeText: 'PRIX 5.000F(10$)',
      footerLine1: 'LIS LA METHODE ET APPLIQUES',
      footerLine2: 'PAS BESOIN DE FAIRE LE SPORT',
      subjectImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      productImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    },
  };
}
