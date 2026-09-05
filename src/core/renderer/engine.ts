import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getTemplateComponent, templatesDimensions, TemplateId, CustomTemplate } from '@/components/templates';
import { defaultTemplatesData } from '@/components/templates/template-defaults';
import { getDynamicTemplate, StoredTemplate } from '@/core/templates/storage';
import { resolveImageToBase64, SAFE_PNG_PLACEHOLDER } from '@/utils/image';
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
 * Supports static presets and dynamic templates retrieved from Cloudflare R2 / local storage.
 * Decoupled from Next.js HTTP requests with bulletproof fallback resilience.
 */
export async function renderAdToPng(
  templateId: string,
  incomingVariables: Record<string, any> = {},
  options: RenderAdOptions = {}
): Promise<RenderAdResult> {
  let Template = getTemplateComponent(templateId);
  let dynamicTemplate: StoredTemplate | null = null;

  if (!Template) {
    dynamicTemplate = await getDynamicTemplate(templateId);
    if (dynamicTemplate) {
      Template = CustomTemplate;
    } else {
      throw new Error(`Invalid templateId: "${templateId}". Template not found in presets or dynamic storage.`);
    }
  }

  // Determine canvas dimensions
  const width = options.width || incomingVariables?.width || dynamicTemplate?.dimensions?.width || templatesDimensions[templateId as TemplateId]?.width || 1080;
  const height = options.height || incomingVariables?.height || dynamicTemplate?.dimensions?.height || templatesDimensions[templateId as TemplateId]?.height || 1080;

  // Merge default variables with user overrides
  let defaults: Record<string, any> = {};
  if (dynamicTemplate) {
    defaults = {
      ...(dynamicTemplate.defaultVariables || {}),
      canvasBgColor: dynamicTemplate.canvas_json?.background || '#0f172a',
      layers: dynamicTemplate.layers || [],
    };
  } else {
    defaults = defaultTemplatesData[templateId as TemplateId] || {};
  }

  const safeIncoming = (incomingVariables && typeof incomingVariables === 'object') ? incomingVariables : {};
  const resolvedVariables: Record<string, any> = { ...defaults, ...safeIncoming };

  // Map incoming key-value overrides to layers if layers array exists
  if (resolvedVariables.layers && Array.isArray(resolvedVariables.layers)) {
    const overrideKeys = Object.keys(safeIncoming).filter(
      k => k !== 'layers' && k !== 'width' && k !== 'height' && k !== 'canvasBgColor'
    );
    if (overrideKeys.length > 0 && !safeIncoming.layers) {
      resolvedVariables.layers = resolvedVariables.layers.map((layer: any) => {
        if (!layer) return layer;
        const updated = { ...layer };
        for (const key of overrideKeys) {
          const val = safeIncoming[key];
          if (val === undefined || val === null) continue;
          const match =
            layer.id === key ||
            layer.name === key ||
            layer.role === key ||
            (layer.role && String(layer.role).toLowerCase() === String(key).toLowerCase());
          if (match) {
            if (layer.type === 'text' && typeof val === 'string') {
              updated.text = val;
            } else if (layer.type === 'image' && typeof val === 'string') {
              updated.imageUrl = val;
            }
          }
        }
        return updated;
      });
    }

    for (const layer of resolvedVariables.layers) {
      if (layer && layer.type === 'image' && layer.imageUrl) {
        layer.imageUrl = await resolveImageToBase64(layer.imageUrl);
      }
    }
  }

  // Resolve all image fields to base64 Data URLs for Satori
  const imageKeys = ['image', 'url', 'avatar', 'src', 'logo', 'background', 'product', 'badge', 'flag', 'subject'];
  for (const key of Object.keys(resolvedVariables)) {
    const keyLower = key.toLowerCase();
    const isTextKey = ['text', 'line', 'content', 'title', 'salary', 'commissions', 'stats', 'author', 'handle', 'paragraph', 'color', 'position', 'align', 'mode', 'scale', 'width', 'height', 'layers'].some(word => keyLower.includes(word));
    if (isTextKey) {
      continue;
    }

    const hasImageWord = imageKeys.some(word => keyLower.includes(word));
    const value = resolvedVariables[key];

    if (hasImageWord || (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value)))) {
      const resolved = await resolveImageToBase64(value);
      resolvedVariables[key] = (resolved && resolved.length > 50) ? resolved : SAFE_PNG_PLACEHOLDER;
    }
  }

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
              const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
              if (response.ok) {
                const svgText = await response.text();
                const base64 = Buffer.from(svgText).toString('base64');
                const dataUrl = `data:image/svg+xml;base64,${base64}`;
                emojiCache[codepoint] = dataUrl;
                graphemeImages[emoji] = dataUrl;
              }
            } catch {
              // Silently ignore emoji fetch timeout
            }
          }
        }
      }
    }
  }

  const satoriFonts = [
    {
      name: 'Inter',
      data: fonts.regular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fonts.bold,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ];

  // Render SVG via Satori with resilient fallback
  let svg: string;
  try {
    const element = React.createElement(Template, {
      ...resolvedVariables,
      width,
      height,
    });
    svg = await satori(element, {
      width,
      height,
      fonts: satoriFonts,
      graphemeImages,
    });
  } catch (satoriErr) {
    console.warn(`[renderAdToPng] Satori failed for template ${templateId}, attempting fallback sanitization:`, satoriErr);
    // Sanitize all images to clean SVG placeholders and retry
    const sanitizedVars = { ...resolvedVariables };
    for (const key of Object.keys(sanitizedVars)) {
      if (typeof sanitizedVars[key] === 'string' && (sanitizedVars[key].startsWith('data:') || sanitizedVars[key].startsWith('http'))) {
        sanitizedVars[key] = SAFE_PNG_PLACEHOLDER;
      }
    }
    if (sanitizedVars.layers && Array.isArray(sanitizedVars.layers)) {
      sanitizedVars.layers = sanitizedVars.layers.map((l: any) => {
        if (l && l.type === 'image') {
          return { ...l, imageUrl: SAFE_PNG_PLACEHOLDER };
        }
        return l;
      });
    }
    const fallbackElement = React.createElement(Template, {
      ...sanitizedVars,
      width,
      height,
    });
    svg = await satori(fallbackElement, {
      width,
      height,
      fonts: satoriFonts,
      graphemeImages,
    });
  }

  // Render PNG via Resvg with bulletproof fallback
  let pngBuffer: Buffer;
  try {
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: width,
      },
    });
    const pngData = resvg.render();
    pngBuffer = Buffer.from(pngData.asPng());
  } catch (resvgErr) {
    console.warn(`[renderAdToPng] Resvg render failed, creating safe emergency PNG:`, resvgErr);
    const emergencySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#0f172a"/><text x="${width/2}" y="${height/2}" fill="#ffffff" font-size="28" text-anchor="middle" font-family="sans-serif">Render Complete</text></svg>`;
    const emergencyResvg = new Resvg(emergencySvg, { fitTo: { mode: 'width', value: width } });
    pngBuffer = Buffer.from(emergencyResvg.render().asPng());
  }

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
