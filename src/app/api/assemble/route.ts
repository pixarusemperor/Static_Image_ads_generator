import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getTemplateComponent, templatesDimensions, TemplateId } from '@/components/templates';
import { resolveImageToBase64 } from '@/utils/image';
import { getFontBuffers } from '@/utils/fonts';

export const dynamic = 'force-dynamic';

const emojiCache: Record<string, string> = {};

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { templateId, variables = {} } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
    }

    const Template = getTemplateComponent(templateId);
    if (!Template) {
      return NextResponse.json({ error: `Invalid templateId: ${templateId}` }, { status: 400 });
    }

    // Load fonts
    const fonts = await getFontBuffers();

    // Get dimensions
    const dimensions = templatesDimensions[templateId as TemplateId] || { width: 1080, height: 1080 };
    const { width, height } = dimensions;

    // Resolve images
    const resolvedVariables = { ...variables };
    const imageKeys = [
      'image', 'url', 'avatar', 'src', 'logo', 'background', 'product', 'badge', 'flag', 'subject'
    ];
    
    for (const key of Object.keys(resolvedVariables)) {
      const value = resolvedVariables[key];
      if (typeof value === 'string') {
        const keyLower = key.toLowerCase();
        
        // Skip keys that obviously contain text, even if they contain an image keyword (like 'priceBadgeText')
        const isTextKey = ['text', 'line', 'content', 'title', 'salary', 'commissions', 'stats', 'author', 'handle', 'paragraph', 'color'].some(word => keyLower.includes(word));
        if (isTextKey) {
          continue;
        }

        const hasImageWord = imageKeys.some(word => keyLower.includes(word));
        const hasImageExt = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value);
        const isUrlOrPath = value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') || value.includes('/');
        
        if (hasImageWord || hasImageExt || isUrlOrPath) {
          resolvedVariables[key] = await resolveImageToBase64(value);
        }
      }
    }

    // Render component to React element
    const element = React.createElement(Template, {
      ...resolvedVariables,
      width,
      height,
    });

    // Ignore SSL issues for internal requests
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // Scan variables for emojis to build graphemeImages map
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F09F}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2B50}\u{263A}\u{26A1}\u{2705}]/gu;
    const graphemeImages: Record<string, string> = {};

    for (const key of Object.keys(resolvedVariables)) {
      const val = resolvedVariables[key];
      if (typeof val === 'string') {
        const matches = val.match(emojiRegex);
        if (matches) {
          for (const emoji of matches) {
            if (!graphemeImages[emoji]) {
              const codepoint = [...emoji]
                .map(char => char.codePointAt(0)!.toString(16))
                .filter(hex => hex !== 'fe0f')
                .join('-');

              if (emojiCache[codepoint]) {
                graphemeImages[emoji] = emojiCache[codepoint];
              } else {
                try {
                  const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`;
                  const response = await fetch(url);
                  if (response.ok) {
                    const svgText = await response.text();
                    const base64 = Buffer.from(svgText).toString('base64');
                    const dataUrl = `data:image/svg+xml;base64,${base64}`;
                    emojiCache[codepoint] = dataUrl;
                    graphemeImages[emoji] = dataUrl;
                  }
                } catch (e) {
                  console.error(`Failed to pre-fetch emoji ${emoji}:`, e);
                }
              }
            }
          }
        }
      }
    }

    // Render to SVG using Satori
    const svg = await satori(element, {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
      ],
      graphemeImages,
    });

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: width,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Return PNG image
    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    console.error('Error in Assembly API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
