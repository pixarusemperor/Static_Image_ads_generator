import { NextRequest, NextResponse } from 'next/server';
import { duplicateStudioPage } from '@/core/database/studio';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const duplicated = await duplicateStudioPage(pageId);
    if (!duplicated) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(duplicated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to duplicate page' }, { status: 500 });
  }
}
