import { NextRequest, NextResponse } from 'next/server';
import { addStudioPage } from '@/core/database/studio';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const page = await addStudioPage(id, {
      title: body.title,
      canvas_json: body.canvas_json,
      after_sort_order: body.after_sort_order,
    });
    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add page' }, { status: 500 });
  }
}
