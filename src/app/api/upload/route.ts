import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { isR2Configured } from '@/lib/env';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer;
    let mimeType = 'image/png';
    let originalName = 'upload.png';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      mimeType = file.type || 'image/png';
      originalName = file.name || 'upload.png';
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, name } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid dataUrl in body' }, { status: 400 });
      }

      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid base64 Data URL format' }, { status: 400 });
      }

      mimeType = match[1];
      originalName = name || 'upload.png';
      fileBuffer = Buffer.from(match[2], 'base64');
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Determine extension
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : mimeType.split('/')[1] || 'png';
    const randomId = crypto.randomBytes(8).toString('hex');
    const storageKey = `uploads/${Date.now()}-${randomId}.${ext}`;

    // If Cloudflare R2 is configured, upload to R2
    if (isR2Configured()) {
      const publicUrl = await uploadToR2({
        key: storageKey,
        body: fileBuffer,
        contentType: mimeType,
      });

      return NextResponse.json({
        url: publicUrl,
        storage: 'r2',
        size: fileBuffer.length,
        type: mimeType,
      });
    }

    // Fallback if R2 is not yet configured: return inline base64 Data URL
    const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return NextResponse.json({
      url: base64Url,
      storage: 'inline',
      size: fileBuffer.length,
      type: mimeType,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
