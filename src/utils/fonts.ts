import fs from 'fs';
import path from 'path';

/**
 * Ensures that Inter-Regular and Inter-Bold (Lato fallback) TTF files exist
 * and are valid. If not, it fetches them from the google/fonts repository.
 */
export async function getFontBuffers(): Promise<{ regular: Buffer; bold: Buffer }> {
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
    console.log('Downloading regular font from Google Fonts...');
    const res = await fetch(regularUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch regular font: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(regularPath, Buffer.from(arrayBuffer));
    console.log('Saved regular font.');
  }

  if (!isValidTtf(boldPath)) {
    console.log('Downloading bold font from Google Fonts...');
    const res = await fetch(boldUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch bold font: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(boldPath, Buffer.from(arrayBuffer));
    console.log('Saved bold font.');
  }

  return {
    regular: fs.readFileSync(regularPath),
    bold: fs.readFileSync(boldPath),
  };
}
