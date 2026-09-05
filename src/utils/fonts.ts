import fs from 'fs';
import path from 'path';

// In-memory singleton font cache to avoid re-reading disk or re-fetching across render requests
let cachedFonts: { regular: Buffer; bold: Buffer } | null = null;

/**
 * Ensures that TTF font files exist and are valid, caching in memory for zero-latency subsequent calls.
 */
export async function getFontBuffers(): Promise<{ regular: Buffer; bold: Buffer }> {
  if (cachedFonts) {
    return cachedFonts;
  }

  const fontDir = path.join(process.cwd(), 'src/assets/fonts');
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  const regularPath = path.join(fontDir, 'Inter-Regular.ttf');
  const boldPath = path.join(fontDir, 'Inter-Bold.ttf');

  const regularUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Regular.ttf';
  const boldUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Bold.ttf';

  // Check if file exists and does not start with HTML tags (i.e. not a 404/github page)
  const isValidTtf = (filePath: string): boolean => {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.size < 1000) return false; // a real TTF font is usually > 50KB
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(100);
    fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);
    const prefix = buffer.toString('utf8');
    return !prefix.trim().startsWith('<!DOCTYPE') && !prefix.trim().startsWith('<html') && !prefix.trim().startsWith('404:');
  };

  if (!isValidTtf(regularPath)) {
    console.log('[Fonts] Downloading regular font from Google Fonts...');
    const res = await fetch(regularUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch regular font: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(regularPath, Buffer.from(arrayBuffer));
    console.log('[Fonts] Saved regular font.');
  }

  if (!isValidTtf(boldPath)) {
    console.log('[Fonts] Downloading bold font from Google Fonts...');
    const res = await fetch(boldUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch bold font: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(boldPath, Buffer.from(arrayBuffer));
    console.log('[Fonts] Saved bold font.');
  }

  cachedFonts = {
    regular: fs.readFileSync(regularPath),
    bold: fs.readFileSync(boldPath),
  };

  return cachedFonts;
}

