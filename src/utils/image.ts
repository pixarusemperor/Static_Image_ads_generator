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
    let absolutePath = imageSrc;
    if (!path.isAbsolute(imageSrc)) {
      absolutePath = path.join(process.cwd(), imageSrc);
    }

    // Helper check for paths
    const checkPaths = [
      absolutePath,
      path.join(process.cwd(), 'public', imageSrc),
      path.join(process.cwd(), 'TYPE OF ADS SAMPLE', imageSrc),
      path.join(process.cwd(), 'TYPE OF ADS SAMPLE ', imageSrc) // with trailing space
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

    // If we've got a relative path starting with /, let's also try strip leading slash
    if (imageSrc.startsWith('/')) {
      const strippedSrc = imageSrc.substring(1);
      const checkPathsStripped = [
        path.join(process.cwd(), strippedSrc),
        path.join(process.cwd(), 'public', strippedSrc),
        path.join(process.cwd(), 'TYPE OF ADS SAMPLE', strippedSrc),
        path.join(process.cwd(), 'TYPE OF ADS SAMPLE ', strippedSrc)
      ];
      for (const p of checkPathsStripped) {
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
    }

    console.warn(`[resolveImageToBase64] Image file not found for: ${imageSrc}`);
    return imageSrc;
  } catch (error) {
    console.error(`[resolveImageToBase64] Error resolving image: ${imageSrc}`, error);
    return imageSrc;
  }
}
