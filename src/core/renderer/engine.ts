import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getTemplateComponent, templatesDimensions, TemplateId } from '@/components/templates';
import { defaultTemplatesData } from '@/components/templates/template-defaults';
import { resolveImageToBase64 } from '@/utils/image';
import { getFontBuffers } from '@/utils/fonts';
import { isR2Configured } from '@/lib/env';
import { uploadToR2 } from '@/lib/r2';
import crypto from 'crypto';

const emojiCache: Record<string, string> = {};

export interface RenderAdOptions {
  width?: number;
  height?: number;
  uploadToR2?: boolean;
  r2KeyPrefix?: string;
}

export interface RenderAdResult {
  pngBuffer: Buffer;
  svg: string;
  width: number;
  height: number;
  r2Url?: string;
}

/**
 * Universal headless ad rendering engine.
 * Decoupled from Next.js HTTP requests so it can be called by CLI, MCP server, or REST route.
 */
export async function renderAdToPng(
  templateId: string,
  incomingVariables: Record<string, any> = {},
  options: RenderAdOptions = {}
): Promise<RenderAdResult> {
  const Template = getTemplateComponent(templateId);
  if (!Template) {
    throw new Error(`Invalid templateId: "${templateId}".`);
  }

  // Determine canvas dimensions
  const width = options.width || incomingVariables.width || templatesDimensions[templateId as TemplateId]?.width || 1080;
  const height = options.height || incomingVariables.height || templatesDimensions[templateId as TemplateId]?.height || 1080;

  // Merge default variables with user overrides
  const defaults = defaultTemplatesData[templateId as TemplateId] || {};
  const resolvedVariables: Record<string, any> = { ...defaults, ...incomingVariables };

  // Resolve images inside CustomTemplate layers if applicable
  if (resolvedVariables.layers && Array.isArray(resolvedVariables.layers)) {
    for (const layer of resolvedVariables.layers) {
      if (layer.type === 'image' && layer.imageUrl) {
        layer.imageUrl = await resolveImageToBase64(layer.imageUrl);
      }
    }
  }

  // Resolve all image fields to base64 Data URLs for Satori
  const imageKeys = ['image', 'url', 'avatar', 'src', 'logo', 'background', 'product', 'badge', 'flag', 'subject'];
  for (const key of Object.keys(resolvedVariables)) {
    const value = resolvedVariables[key];
    if (typeof value === 'string') {
      const keyLower = key.toLowerCase();
      const isTextKey = ['text', 'line', 'content', 'title', 'salary', 'commissions', 'stats', 'author', 'handle', 'paragraph', 'color', 'position', 'align', 'mode', 'scale', 'width', 'height'].some(word => keyLower.includes(word));
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

  // Create React element
  const element = React.createElement(Template, {
    ...resolvedVariables,
    width,
    height,
  });

  // Ignore SSL issues for internal requests
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // Load fonts
  const fonts = await getFontBuffers();

  // Scan variables for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F09F}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2B50}\u{263A}\u{26A1}\u{2705}]/gu;
  const graphemeImages: Record<string, string> = {};

  const allStrings: string[] = [];
  const collectStrings = (obj: unknown) => {
    if (typeof obj === 'string') {
      allStrings.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(collectStrings);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(collectStrings);
    }
  };
  collectStrings(resolvedVariables);

  for (const val of allStrings) {
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

  // Render SVG via Satori
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

  // Render PNG via Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = Buffer.from(pngData.asPng());

  let r2Url: string | undefined;
  if (options.uploadToR2 && isR2Configured()) {
    const prefix = options.r2KeyPrefix || 'rendered';
    const randomId = crypto.randomBytes(6).toString('hex');
    const key = `${prefix}/ad-${templateId}-${Date.now()}-${randomId}.png`;
    r2Url = await uploadToR2({
      key,
      body: pngBuffer,
      contentType: 'image/png',
    });
  }

  return {
    pngBuffer,
    svg,
    width,
    height,
    r2Url,
  };
}
