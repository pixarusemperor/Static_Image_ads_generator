import { NextRequest, NextResponse } from 'next/server';
import { getGenAIClient, getGenAIModel } from '@/utils/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { prompt, templateId, variables } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing user prompt' }, { status: 400 });
    }
    if (!templateId) {
      return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
    }
    if (!variables) {
      return NextResponse.json({ error: 'Missing variables' }, { status: 400 });
    }

    // 1. Initialize Google Gen AI client
    let ai;
    try {
      ai = getGenAIClient();
    } catch (e) {
      console.warn('Gen AI Client could not be initialized. Returning mock chat layout update.', e);
      const updatedVariables = getMockChatUpdate(prompt, templateId, variables);
      return NextResponse.json({ variables: updatedVariables });
    }

    // 3. Create instruction and prompt
    const systemInstruction = `You are an expert AI design assistant inside an HTML/CSS ad layout editor.
Your job is to update the JSON layout variables based on the user's natural language request.
You must:
1. Examine the user request, the templateId: "${templateId}", and the current variables: ${JSON.stringify(variables)}.
2. Apply the request by updating the relevant fields inside the variables.
3. Keep all unchanged fields exactly as they were. Do not delete them.
4. Do not invent new fields that don't belong to the template.
5. If the request is for Template 2-a (headline highlight), remember that words wrapped in square brackets like [TUE] will be highlighted in red or green.
6. If the request asks for a color change, ensure you output valid CSS color hex codes (e.g. #FF0000) or names where appropriate.

You must output a JSON object containing the updated "variables" property.`;

    // 2. Call Gemini API
    const response = await ai.models.generateContent({
      model: getGenAIModel(),
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser request: "${prompt}"` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            variables: {
              type: 'OBJECT',
              description: 'The complete set of updated variables with the design changes applied.',
              properties: {
                headerLine1: { type: 'STRING' },
                headerLine2: { type: 'STRING' },
                priceBadgeText: { type: 'STRING' },
                footerLine1: { type: 'STRING' },
                footerLine2: { type: 'STRING' },
                title: { type: 'STRING' },
                subtitle: { type: 'STRING' },
                bodyParagraph: { type: 'STRING' },
                footerText: { type: 'STRING' },
                headline: { type: 'STRING' },
                highlightColor: { type: 'STRING' },
                logoPosition: { type: 'STRING' },
                hasAvatar: { type: 'BOOLEAN' },
                badgeText: { type: 'STRING' },
                postAuthor: { type: 'STRING' },
                postHandle: { type: 'STRING' },
                postContent: { type: 'STRING' },
                postStats: { type: 'STRING' },
                headerTitle: { type: 'STRING' },
                footerSalary: { type: 'STRING' },
                footerCommissions: { type: 'STRING' },
                backgroundColor: { type: 'STRING' },
                subjectImage: { type: 'STRING' },
                productImage: { type: 'STRING' },
                backgroundImage: { type: 'STRING' },
                avatarUrl: { type: 'STRING' },
                logoUrl: { type: 'STRING' },
                bodyImage: { type: 'STRING' },
                emoji: { type: 'STRING' },
              }
            }
          },
          required: ['variables']
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    const jsonResult = JSON.parse(textResponse);
    return NextResponse.json(jsonResult);

  } catch (error: unknown) {
    console.error('Error in chat API route:', error);
    // If Gemini fails, fallback to a mock response based on the prompt
    const mockVariables = getMockChatUpdate(body?.prompt || '', body?.templateId || '1-a', body?.variables || {});
    return NextResponse.json({
      variables: mockVariables,
      warning: 'Failed to connect to Gemini API. Returned heuristic fallback layout.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMockChatUpdate(prompt: string, templateId: string, variables: any) {
  const updated = { ...variables };
  const promptLower = prompt.toLowerCase();

  // Simple heuristics for color modifications
  if (promptLower.includes('color') || promptLower.includes('couleur') || promptLower.includes('background') || promptLower.includes('fond')) {
    let color = '#FF0000'; // Default to red fallback
    if (promptLower.includes('green') || promptLower.includes('vert')) color = '#22C55E';
    if (promptLower.includes('blue') || promptLower.includes('bleu')) color = '#3B82F6';
    if (promptLower.includes('yellow') || promptLower.includes('jaune')) color = '#EAB308';
    if (promptLower.includes('black') || promptLower.includes('noir')) color = '#000000';
    if (promptLower.includes('white') || promptLower.includes('blanc')) color = '#FFFFFF';
    if (promptLower.includes('purple') || promptLower.includes('violet')) color = '#A855F7';

    if (templateId === '5-a') {
      updated.backgroundColor = color;
    } else if (templateId === '2-a') {
      updated.highlightColor = color;
    }
  }

  // Simple heuristics for price modifications
  if (promptLower.includes('price') || promptLower.includes('prix') || promptLower.includes('dollar') || promptLower.includes('$') || promptLower.includes('fcfa')) {
    // Look for numbers in prompt
    const match = prompt.match(/\d+([.,]\d+)?\s*(?:\$|F\s*CFA|€|£|FCFA|dollars|euros)/i);
    const newPrice = match ? match[0] : '15.000 F CFA';
    if (templateId === '1-a') {
      updated.priceBadgeText = `PRIX ${newPrice}`;
    } else if (templateId === '1-b') {
      updated.priceBadgeText = `PRIX ${newPrice}`;
    }
  }

  // Simple heuristics for text replacements
  // e.g. "change title to 'hello world'" -> look for quotes
  const quoteMatch = prompt.match(/['"«]([^'"»]+)['"»]/);
  if (quoteMatch) {
    const textContent = quoteMatch[1];
    
    if (templateId === '1-a') {
      if (promptLower.includes('header 1') || promptLower.includes('banner 1') || promptLower.includes('ligne 1')) {
        updated.headerLine1 = textContent;
      } else if (promptLower.includes('header 2') || promptLower.includes('banner 2') || promptLower.includes('ligne 2')) {
        updated.headerLine2 = textContent;
      } else if (promptLower.includes('footer 1') || promptLower.includes('bas 1')) {
        updated.footerLine1 = textContent;
      } else if (promptLower.includes('footer 2') || promptLower.includes('bas 2')) {
        updated.footerLine2 = textContent;
      } else {
        // Default replacement
        updated.headerLine1 = textContent;
      }
    } else if (templateId === '1-b') {
      if (promptLower.includes('sub') || promptLower.includes('sous-titre')) {
        updated.subtitle = textContent;
      } else if (promptLower.includes('body') || promptLower.includes('paragraph') || promptLower.includes('texte')) {
        updated.bodyParagraph = textContent;
      } else if (promptLower.includes('footer') || promptLower.includes('bas')) {
        updated.footerText = textContent;
      } else {
        updated.title = textContent;
      }
    } else if (templateId === '2-a') {
      updated.headline = textContent.includes('[') ? textContent : `[${textContent}]`;
    } else if (templateId === '3-a') {
      if (promptLower.includes('badge')) {
        updated.badgeText = textContent;
      } else {
        updated.headline = textContent;
      }
    } else if (templateId === '3-b') {
      if (promptLower.includes('author') || promptLower.includes('nom') || promptLower.includes('auteur')) {
        updated.postAuthor = textContent;
      } else if (promptLower.includes('handle') || promptLower.includes('user') || promptLower.includes('@')) {
        updated.postHandle = textContent.startsWith('@') ? textContent : `@${textContent}`;
      } else if (promptLower.includes('stat') || promptLower.includes('like')) {
        updated.postStats = textContent;
      } else {
        updated.postContent = textContent;
      }
    } else if (templateId === '4-a') {
      if (promptLower.includes('salary') || promptLower.includes('salaire')) {
        updated.footerSalary = textContent;
      } else if (promptLower.includes('commission')) {
        updated.footerCommissions = textContent;
      } else {
        updated.headerTitle = textContent;
      }
    } else if (templateId === '5-a') {
      if (promptLower.includes('subtitle') || promptLower.includes('sous-titre')) {
        updated.subtitle = textContent;
      } else if (promptLower.includes('emoji') || promptLower.includes('main')) {
        updated.emoji = textContent;
      } else {
        updated.title = textContent;
      }
    }
  }

  // Handle generic bracket modifications for headline highlights
  if (templateId === '2-a' && promptLower.includes('highlight') || promptLower.includes('surligner')) {
    // Highlight specific word in prompt if it exists in current headline
    const words = prompt.split(/\s+/);
    for (const word of words) {
      const cleaned = word.replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      if (cleaned.length > 2 && variables.headline && variables.headline.toLowerCase().includes(cleaned.toLowerCase())) {
        // Find exact casing word in headline and wrap in brackets
        const regex = new RegExp(`\\b(${cleaned})\\b`, 'i');
        const newHeadline = variables.headline.replace(regex, '[$1]').replace(/\[\[/g, '[').replace(/\]\]/g, ']');
        updated.headline = newHeadline;
        break;
      }
    }
  }

  return updated;
}
