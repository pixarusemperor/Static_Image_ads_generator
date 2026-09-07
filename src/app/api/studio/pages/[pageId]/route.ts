import { NextRequest, NextResponse } from 'next/server';
import { updateStudioPage, deleteStudioPage } from '@/core/database/studio';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const body = await req.json();
    const updated = await updateStudioPage(pageId, {
      title: body.title,
      canvas_json: body.canvas_json,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    await deleteStudioPage(pageId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete page' }, { status: 400 });
  }
}
