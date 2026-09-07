import { NextRequest, NextResponse } from 'next/server';
import { getStudioDesign, updateStudioDesign, deleteStudioDesign } from '@/core/database/studio';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const design = await getStudioDesign(id);
    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }
    return NextResponse.json(design);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch design' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateStudioDesign(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update design' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteStudioDesign(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete design' }, { status: 500 });
  }
}
