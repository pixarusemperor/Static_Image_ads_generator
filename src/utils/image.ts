import fs from 'fs';
import path from 'path';

/**
 * Resolves an image URL or local path to a base64 Data URL.
 */
export async function resolveImageToBase64(imageSrc: string | undefined): Promise<string> {
  if (!imageSrc) {
    return '';
  }

  // If it's already a base64 data URL, return it
  if (imageSrc.startsWith('data:')) {
    return imageSrc;
  }

  try {
    // If it's a remote URL
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/png';
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    }

    // Otherwise, treat as a local path
    const cleanSrc = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
    const checkPaths = [
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', cleanSrc),
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'templates', 'assets', path.basename(cleanSrc)),
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
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    }

    // Fallback: If not found on local disk, try fetching from Cloudflare R2 if configured
    try {
      const { getR2PublicUrl } = await import('@/lib/env');
      const r2PublicUrl = getR2PublicUrl();
      if (r2PublicUrl) {
        const r2Url = `${r2PublicUrl}/${cleanSrc}`;
        const response = await fetch(r2Url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/png';
          return `data:${contentType};base64,${buffer.toString('base64')}`;
        }
      }
    } catch {
      // Ignore R2 fallback errors
    }

    console.warn(`[resolveImageToBase64] Image file not found for: ${imageSrc}`);
    return imageSrc;
  } catch (error) {
    console.error(`[resolveImageToBase64] Error resolving image: ${imageSrc}`, error);
    return imageSrc;
  }
}
