import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let imageBase64 = '';
    let contentType = 'image/png';

    // 1. Parse request body
    const contentTypeHeader = request.headers.get('content-type') || '';
    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString('base64');
      contentType = file.type || 'image/png';
    } else {
      // Expect JSON with { image: 'data:image/png;base64,...' or 'https://...' or pure base64 }
      const body = await request.json();
      const { image } = body;
      if (!image) {
        return NextResponse.json({ error: 'No image provided in request body' }, { status: 400 });
      }

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          contentType = matches[1];
          imageBase64 = matches[2];
        } else {
          return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
        }
      } else if (image.startsWith('http://') || image.startsWith('https://')) {
        // Fetch remote image
        const res = await fetch(image);
        if (!res.ok) {
          return NextResponse.json({ error: `Failed to fetch image from URL: ${res.statusText}` }, { status: 400 });
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        imageBase64 = buffer.toString('base64');
        contentType = res.headers.get('content-type') || 'image/png';
      } else {
        // Assume pure base64
        imageBase64 = image;
      }
    }

    // 2. Prepare temp files for rembg subprocess
    const tempDir = os.tmpdir();
    const randomId = Math.random().toString(36).substring(2, 11);
    const inputExt = contentType.includes('jpeg') || contentType.includes('jpg') ? '.jpg' : '.png';
    const inputPath = path.join(tempDir, `rembg_input_${randomId}${inputExt}`);
    const outputPath = path.join(tempDir, `rembg_output_${randomId}.png`);

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(inputPath, imageBuffer);

    let processedBuffer: Buffer | null = null;

    // 3. Attempt to run rembg command line
    try {
      // First try calling the rembg command directly
      await execPromise(`rembg i "${inputPath}" "${outputPath}"`);
      if (fs.existsSync(outputPath)) {
        processedBuffer = fs.readFileSync(outputPath);
      }
    } catch (cmdError: unknown) {
      const cmdErrorMsg = cmdError instanceof Error ? cmdError.message : String(cmdError);
      console.warn('Direct rembg command failed, trying python subprocess...', cmdErrorMsg);
      
      // Try calling python rembg library as a backup
      try {
        const pyCode = `import sys; from rembg import remove; from PIL import Image; input_path = sys.argv[1]; output_path = sys.argv[2]; input_img = Image.open(input_path); output_img = remove(input_img); output_img.save(output_path)`;
        await execPromise(`python3 -c "${pyCode}" "${inputPath}" "${outputPath}"`);
        if (fs.existsSync(outputPath)) {
          processedBuffer = fs.readFileSync(outputPath);
        }
      } catch (pyError: unknown) {
        const pyErrorMsg = pyError instanceof Error ? pyError.message : String(pyError);
        console.error('All background removal subprocesses failed. Using mock fallback.', pyErrorMsg);
      }
    }

    // 4. Cleanup input temp file
    if (fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch {}
    }

    // 5. If processed image is available, return it
    if (processedBuffer) {
      if (fs.existsSync(outputPath)) {
        try { fs.unlinkSync(outputPath); } catch {}
      }
      return new NextResponse(new Uint8Array(processedBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'X-Rembg-Processed': 'true',
        },
      });
    }

    // 6. Otherwise, execute fallback mock background removal
    // Fallback: Return the original image but signal via header that fallback was used.
    // To mimic transparency masking or canvas clipping conceptually (since we are server-side and want to stay highly runnable without native deps),
    // we return the original image but wrapped in the response. The client editor will also be able to crop/handle transparent overlay effects.
    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Rembg-Processed': 'false',
        'X-Fallback-Reason': 'rembg_not_found',
      },
    });

  } catch (err: unknown) {
    console.error('Error in remove-bg API route:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}
