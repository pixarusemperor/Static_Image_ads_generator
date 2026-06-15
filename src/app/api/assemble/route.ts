import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getTemplateComponent, templatesDimensions, TemplateId } from '@/components/templates';
import { resolveImageToBase64 } from '@/utils/image';
import { getFontBuffers } from '@/utils/fonts';

export const dynamic = 'force-dynamic';

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
