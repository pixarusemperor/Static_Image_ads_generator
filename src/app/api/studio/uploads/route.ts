import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const blob = file as Blob;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = (file as any).name || 'upload.png';
    const ext = fileName.split('.').pop()?.toLowerCase() || 'png';

    const allowed = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
    if (!allowed.has(ext)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const mime =
      ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'webp'
        ? 'image/webp'
        : ext === 'gif'
        ? 'image/gif'
        : ext === 'svg'
        ? 'image/svg+xml'
        : 'image/png';

    // If R2 is configured, upload to Cloudflare R2
    if (isR2Configured()) {
      const key = `studio/uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      try {
        const url = await uploadToR2({
          key,
          body: buffer,
          contentType: mime,
        });
        return NextResponse.json({ url });
      } catch (r2Err) {
        console.warn('R2 upload failed, falling back to base64 data URL:', r2Err);
      }
    }

    // Fallback to inline Base64 data URL
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;
    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
