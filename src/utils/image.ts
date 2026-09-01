import fs from 'fs';
import path from 'path';

// In-memory cache for resolved base64 images (avoids redundant disk I/O and network requests)
const imageBase64Cache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

function generatePlaceholderSvg(text: string = 'Image'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#1e293b"/>
    <rect x="20" y="20" width="360" height="360" rx="8" fill="none" stroke="#334155" stroke-width="4" stroke-dasharray="8 8"/>
    <circle cx="200" cy="180" r="40" fill="#475569"/>
    <text x="200" y="260" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18" font-weight="600" text-anchor="middle">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Resolves an image URL, local path, or fallback to a base64 Data URL.
 * Resilient against network timeouts, 404s, and corrupted files.
 */
export async function resolveImageToBase64(imageSrc: string | undefined): Promise<string> {
  if (!imageSrc) {
    return '';
  }

  // If it's already a base64 data URL, return it immediately
  if (imageSrc.startsWith('data:')) {
    return imageSrc;
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
          console.warn(`[resolveImageToBase64] Remote image 404/error (${response.status}) for ${imageSrc}`);
          return setCache(imageSrc, generatePlaceholderSvg('Media Unavailable'));
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';
        return setCache(imageSrc, `data:${contentType};base64,${buffer.toString('base64')}`);
      } catch (err: unknown) {
        console.warn(`[resolveImageToBase64] Network fetch failed for ${imageSrc}:`, err instanceof Error ? err.message : String(err));
        return setCache(imageSrc, generatePlaceholderSvg('Load Timeout'));
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
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.svg') {
        contentType = 'image/svg+xml';
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

    // 4. Ultimate Fallback: Generate clean SVG placeholder instead of crashing Satori
    console.warn(`[resolveImageToBase64] Image not found: ${imageSrc}, providing SVG fallback`);
    return setCache(imageSrc, generatePlaceholderSvg('Missing Asset'));
  } catch (error) {
    console.error(`[resolveImageToBase64] Error resolving ${imageSrc}:`, error);
    return generatePlaceholderSvg('Asset Error');
  }
}
