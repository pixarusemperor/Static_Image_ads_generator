import { NextRequest, NextResponse } from 'next/server';
import { listStudioDesigns, createStudioDesign } from '@/core/database/studio';

export async function GET() {
  try {
    const designs = await listStudioDesigns();
    return NextResponse.json(designs);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to list designs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const design = await createStudioDesign({
      name: body.name,
      canvas_json: body.canvas_json,
      width: body.width,
      height: body.height,
    });
    return NextResponse.json(design);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create design' }, { status: 500 });
  }
}
