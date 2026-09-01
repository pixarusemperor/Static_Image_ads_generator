import fs from 'fs';
import path from 'path';

// In-memory cache for resolved base64 images (avoids redundant disk I/O and network requests)
const imageBase64Cache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

// Valid 100x100 dark neutral PNG placeholder for Satori (Satori requires raster PNG/JPEG, not SVG)
export const SAFE_PNG_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA80lEQVR4nO3RMQEAIBAAIS3ibgb75/Jr3AAV2Oe+v8gQEiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkjMAKvslsmIIK6FAAAAAElFTkSuQmCC';

/**
 * Resolves an image URL, local path, or fallback to a base64 Data URL.
 * Automatically converts SVGs to raster PNGs so Satori never throws on vector inputs.
 */
export async function resolveImageToBase64(imageSrc: string | undefined): Promise<string> {
  if (!imageSrc) {
    return SAFE_PNG_PLACEHOLDER;
  }

  // If it's a PNG/JPEG/WebP data URL, return it directly
  if (imageSrc.startsWith('data:image/png') || imageSrc.startsWith('data:image/jpeg') || imageSrc.startsWith('data:image/webp')) {
    // Validate minimal base64 length
    if (imageSrc.length > 50) {
      return imageSrc;
    }
    return SAFE_PNG_PLACEHOLDER;
  }

  // If it's an SVG data URL, rasterize it to PNG for Satori
  if (imageSrc.startsWith('data:image/svg+xml')) {
    try {
      const parts = imageSrc.split(',');
      if (parts.length === 2) {
        const svgContent = Buffer.from(parts[1], 'base64').toString('utf-8');
        const { Resvg } = await import('@resvg/resvg-js');
        const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: 400 } });
        const pngBuf = resvg.render().asPng();
        return `data:image/png;base64,${Buffer.from(pngBuf).toString('base64')}`;
      }
    } catch {
      return SAFE_PNG_PLACEHOLDER;
    }
  }

  // Check in-memory cache
  if (imageBase64Cache.has(imageSrc)) {
    return imageBase64Cache.get(imageSrc)!;
  }

  const setCache = (key: string, val: string) => {
    if (imageBase64Cache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageBase64Cache.keys().next().value;
      if (firstKey) imageBase64Cache.delete(firstKey);
    }
    imageBase64Cache.set(key, val);
    return val;
  };

  try {
    // 1. Remote HTTP/HTTPS URL
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      try {
        const response = await fetch(imageSrc, {
          signal: AbortSignal.timeout(3000), // Strict 3s timeout
        });
        if (!response.ok) {
          return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';

        if (contentType.includes('svg')) {
          try {
            const { Resvg } = await import('@resvg/resvg-js');
            const resvg = new Resvg(buffer.toString('utf-8'), { fitTo: { mode: 'width', value: 400 } });
            const pngBuf = resvg.render().asPng();
            return setCache(imageSrc, `data:image/png;base64,${Buffer.from(pngBuf).toString('base64')}`);
          } catch {
            return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
          }
        }

        return setCache(imageSrc, `data:${contentType};base64,${buffer.toString('base64')}`);
      } catch {
        return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
      }
    }

    // 2. Local File System Path
    const cleanSrc = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
    const checkPaths = [
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', cleanSrc),
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'templates', 'assets', path.basename(cleanSrc)),
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'templates', 'thumbnails', path.basename(cleanSrc)),
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', path.basename(cleanSrc)),
      path.join(/*turbopackIgnore: true*/ process.cwd(), cleanSrc),
    ];

    let foundPath = '';
    for (const p of checkPaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      const buffer = fs.readFileSync(foundPath);
      const ext = path.extname(foundPath).toLowerCase();

      if (ext === '.svg') {
        try {
          const { Resvg } = await import('@resvg/resvg-js');
          const resvg = new Resvg(buffer.toString('utf-8'), { fitTo: { mode: 'width', value: 400 } });
          const pngBuf = resvg.render().asPng();
          return setCache(imageSrc, `data:image/png;base64,${Buffer.from(pngBuf).toString('base64')}`);
        } catch {
          return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
        }
      }

      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      }
      return setCache(imageSrc, `data:${contentType};base64,${buffer.toString('base64')}`);
    }

    // 3. Fallback: Cloudflare R2 CDN Public URL
    try {
      const { getR2PublicUrl } = await import('@/lib/env');
      const r2PublicUrl = getR2PublicUrl();
      if (r2PublicUrl) {
        const r2Url = `${r2PublicUrl}/${cleanSrc}`;
        const response = await fetch(r2Url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/png';
          return setCache(imageSrc, `data:${contentType};base64,${buffer.toString('base64')}`);
        }
      }
    } catch {
      // Ignore R2 fallback errors
    }

    // 4. Ultimate Fallback: Return safe PNG placeholder
    return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
  } catch (error) {
    console.error(`[resolveImageToBase64] Error resolving ${imageSrc}:`, error);
    return SAFE_PNG_PLACEHOLDER;
  }
}
