import { NextRequest, NextResponse } from 'next/server';
import { getGenAIClient, getGenAIModel } from '@/utils/ai';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricObject = Record<string, any>;

interface FabricCanvasJSON {
  version?: string;
  objects: FabricObject[];
  background?: string;
}

/**
 * POST /api/chat-fabric
 * Accepts a Fabric.js canvas JSON + user prompt, returns updated canvas JSON.
 * The AI modifies object properties (text, fill, left, top, etc.) directly.
 */
export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { prompt, canvas_json } = body;

  if (!prompt) {
    return NextResponse.json({ error: 'Missing user prompt' }, { status: 400 });
  }
  if (!canvas_json) {
    return NextResponse.json({ error: 'Missing canvas_json (Fabric.js canvas state)' }, { status: 400 });
  }

  // Parse canvas JSON if it's a string
  let canvas: FabricCanvasJSON;
  try {
    canvas = typeof canvas_json === 'string' ? JSON.parse(canvas_json) : canvas_json;
  } catch {
    return NextResponse.json({ error: 'Invalid canvas_json format' }, { status: 400 });
  }

  // Build a readable summary of the canvas objects for the AI
  const objectSummary = canvas.objects.map((obj, i) => {
    const base = `[${i}] type=${obj.type}`;
    const pos = `pos=(${Math.round(obj.left || 0)},${Math.round(obj.top || 0)})`;
    const size = `size=${Math.round(obj.width || 0)}x${Math.round(obj.height || 0)}`;

    if (obj.type === 'textbox' || obj.type === 'text') {
      const text = obj.text ? `"${obj.text.substring(0, 80)}"` : '""';
      const fill = obj.fill ? `fill=${obj.fill}` : '';
      const fontSize = obj.fontSize ? `fontSize=${obj.fontSize}` : '';
      const fontWeight = obj.fontWeight ? `fontWeight=${obj.fontWeight}` : '';
      return `${base} ${pos} ${size} text=${text} ${fill} ${fontSize} ${fontWeight}`;
    }
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
      const fill = obj.fill ? `fill=${obj.fill}` : '';
      const stroke = obj.stroke ? `stroke=${obj.stroke}` : '';
      return `${base} ${pos} ${size} ${fill} ${stroke}`;
    }
    if (obj.type === 'image') {
      const src = obj.src ? `src=${obj.src.substring(0, 60)}` : '';
      return `${base} ${pos} ${size} ${src}`;
    }
    return `${base} ${pos} ${size}`;
  }).join('\n');

  const systemInstruction = `You are an expert AI design assistant working with a Fabric.js canvas editor.
The canvas contains layered objects (text, shapes, images). You can modify any object's properties.

Current canvas state (${canvas.objects.length} objects):
${objectSummary}

Canvas size: ${canvas.objects[0] ? Math.round(canvas.objects[0].width || 1080) : 1080}w × ${canvas.objects[0] ? Math.round(canvas.objects[0].height || 1080) : 1080}h

RULES:
1. You will receive a user prompt describing design changes.
2. Output the COMPLETE updated canvas JSON with all modifications applied.
3. DO NOT remove any existing objects unless explicitly asked.
4. DO NOT add new objects unless the user requests it.
5. When modifying text objects, update the "text" property.
6. When changing colors, update the "fill" property with valid CSS hex (#RRGGBB).
7. When moving objects, update "left" and "top" properties (keep within canvas bounds).
8. When resizing, update "width" and "height" properties.
9. Preserve all other properties (type, fontFamily, fontSize, etc.) exactly as they were.
10. For image objects, you may update the "src" property if the user provides a new URL.
11. Output a JSON object with a single key "canvas_json" containing the updated Fabric.js canvas state.

The user's request will be provided at the end. Apply the changes and return the full updated canvas.`;

  // Try Gemini first, fall back to mock
  let updatedCanvas: FabricCanvasJSON;

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: getGenAIModel(),
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser request: "${prompt}"\n\nReturn the complete updated canvas_json object.` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            canvas_json: {
              type: 'OBJECT',
              description: 'The complete updated Fabric.js canvas state with all modifications applied.',
              properties: {
                version: { type: 'STRING' },
                background: { type: 'STRING' },
                objects: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    description: 'A Fabric.js object with all its properties.',
                  }
                }
              }
            }
          },
          required: ['canvas_json']
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    const jsonResult = JSON.parse(textResponse);
    updatedCanvas = jsonResult.canvas_json || jsonResult;

  } catch (error: unknown) {
    console.warn('Gemini API failed, using mock canvas update:', error);
    updatedCanvas = getMockCanvasUpdate(prompt, canvas);
  }

  return NextResponse.json({ canvas_json: updatedCanvas });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMockCanvasUpdate(prompt: string, canvas: FabricCanvasJSON): FabricCanvasJSON {
  const promptLower = prompt.toLowerCase();
  // Deep clone
  const updated: FabricCanvasJSON = JSON.parse(JSON.stringify(canvas));

  for (const obj of updated.objects) {
    // Text modifications
    if (obj.type === 'textbox' || obj.type === 'text') {
      // Quote-based text replacement
      const quoteMatch = prompt.match(/['"«]([^'"]+)['"»]/);
      if (quoteMatch) {
        const newText = quoteMatch[1];
        const textLower = (obj.text || '').toLowerCase();

        // Match by keywords in prompt to specific text objects
        if (promptLower.includes('title') && obj.fontSize && obj.fontSize >= 44) {
          obj.text = newText;
        } else if (promptLower.includes('subtitle') && obj.fontSize && obj.fontSize >= 30 && obj.fontSize < 44) {
          obj.text = newText;
        } else if (promptLower.includes('body') || promptLower.includes('paragraph')) {
          if (obj.fontSize && obj.fontSize < 30) obj.text = newText;
        } else if (promptLower.includes('footer') || promptLower.includes('bas')) {
          if (obj.top && obj.top > 800) obj.text = newText;
        } else if (promptLower.includes('header') || promptLower.includes('top')) {
          if (obj.top !== undefined && obj.top < 200) obj.text = newText;
        } else if (promptLower.includes('price') || promptLower.includes('prix')) {
          if (textLower.includes('prix') || textLower.includes('fcfa') || textLower.includes('$')) {
            obj.text = `PRIX ${newText}`;
          }
        } else if (promptLower.includes('author') || promptLower.includes('nom')) {
          if (obj.fontWeight === 'bold' && obj.fontSize && obj.fontSize >= 28 && obj.fontSize <= 36) {
            obj.text = newText;
          }
        } else if (promptLower.includes('badge')) {
          if (obj.fontSize && obj.fontSize <= 26) obj.text = newText;
        } else {
          // Default: replace the first textbox
          obj.text = newText;
          break;
        }
      }
    }

    // Color modifications
    if (promptLower.includes('color') || promptLower.includes('couleur') || promptLower.includes('background') || promptLower.includes('fond')) {
      let color = '#FF0000';
      if (promptLower.includes('green') || promptLower.includes('vert')) color = '#22C55E';
      if (promptLower.includes('blue') || promptLower.includes('bleu')) color = '#3B82F6';
      if (promptLower.includes('yellow') || promptLower.includes('jaune')) color = '#EAB308';
      if (promptLower.includes('black') || promptLower.includes('noir')) color = '#000000';
      if (promptLower.includes('white') || promptLower.includes('blanc')) color = '#FFFFFF';
      if (promptLower.includes('purple') || promptLower.includes('violet')) color = '#A855F7';
      if (promptLower.includes('red') || promptLower.includes('rouge')) color = '#E50914';

      // Apply color to shapes or matching text
      if (obj.type === 'rect' || obj.type === 'circle') {
        if (obj.top !== undefined && obj.top > 800 && (promptLower.includes('footer') || promptLower.includes('bas'))) {
          obj.fill = color;
        } else if (obj.top !== undefined && obj.top < 200 && (promptLower.includes('header') || promptLower.includes('top'))) {
          obj.fill = color;
        } else if (promptLower.includes('all') || promptLower.includes('tous')) {
          obj.fill = color;
        }
      }
    }
  }

  return updated;
}
