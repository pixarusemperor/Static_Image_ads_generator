import fs from 'fs';
import path from 'path';

// In-memory cache for resolved base64 images (avoids redundant disk I/O and network requests)
const imageBase64Cache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

// Valid 100x100 dark neutral PNG placeholder for Satori (Satori requires raster PNG/JPEG, not SVG)
export const SAFE_PNG_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA80lEQVR4nO3RMQEAIBAAIS3ibgb75/Jr3AAV2Oe+v8gQEiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkjMAKvslsmIIK6FAAAAAElFTkSuQmCC';

function isValidRasterDataUrl(dataUrl: string): boolean {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return false;
    const buf = Buffer.from(parts[1], 'base64');
    if (buf.length < 32) return false;

    // PNG validation & dimension check
    if (dataUrl.startsWith('data:image/png')) {
      if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) return false;
      // Read dimensions from IHDR chunk (bytes 16-24)
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      if (w === 0 || h === 0) return false;
      // Reject extreme aspect ratios (> 6:1 or < 1:6) that overflow Satori object-fit: cover scaling
      const ratio = w / h;
      if (ratio > 6 || ratio < 0.16) return false;
      return true;
    }

    // JPEG validation
    if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
      return buf[0] === 0xFF && buf[1] === 0xD8;
    }

    // WebP validation
    if (dataUrl.startsWith('data:image/webp')) {
      return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Resolves an image URL, local path, or fallback to a base64 Data URL.
 * Automatically sanitizes and guards against corrupted images, dead URLs, and extreme aspect ratios.
 */
export async function resolveImageToBase64(imageSrc: string | undefined): Promise<string> {
  if (!imageSrc || typeof imageSrc !== 'string' || imageSrc.trim() === '') {
    return SAFE_PNG_PLACEHOLDER;
  }

  // If it's a PNG/JPEG/WebP data URL, check signature & aspect ratio
  if (imageSrc.startsWith('data:image/png') || imageSrc.startsWith('data:image/jpeg') || imageSrc.startsWith('data:image/webp')) {
    if (isValidRasterDataUrl(imageSrc)) {
      return imageSrc;
    }
    return SAFE_PNG_PLACEHOLDER;
  }

  // If it's an SVG data URL, fallback to safe PNG placeholder for Satori
  if (imageSrc.startsWith('data:image/svg+xml')) {
    return SAFE_PNG_PLACEHOLDER;
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
          return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
        }

        const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
        if (isValidRasterDataUrl(dataUrl)) {
          return setCache(imageSrc, dataUrl);
        }
        return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
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
        return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
      }

      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      }

      const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
      if (isValidRasterDataUrl(dataUrl)) {
        return setCache(imageSrc, dataUrl);
      }
      return setCache(imageSrc, SAFE_PNG_PLACEHOLDER);
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
          const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
          if (isValidRasterDataUrl(dataUrl)) {
            return setCache(imageSrc, dataUrl);
          }
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
