import { NextResponse } from 'next/server';
import { listStudioTemplates } from '@/core/database/studio';

export async function GET() {
  try {
    const templates = await listStudioTemplates();
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to list templates' }, { status: 500 });
  }
}
