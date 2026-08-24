import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DESIGNS_DIR = join(process.cwd(), 'data', 'designs');

function getDesignPath(id: string): string {
  return join(DESIGNS_DIR, `${id}.json`);
}

// GET /api/designs/[id] - Get a design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = getDesignPath(id);
  
  if (!existsSync(path)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const content = await readFile(path, 'utf-8');
  const design = JSON.parse(content);
  
  return NextResponse.json(design);
}

// PUT /api/designs/[id] - Update a design
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = getDesignPath(id);
  
  if (!existsSync(path)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const existing = JSON.parse(await readFile(path, 'utf-8'));
  const body = await request.json();
  
  const updated = {
    ...existing,
    name: body.name ?? existing.name,
    canvas_json: body.canvas_json ?? existing.canvas_json,
    width: body.width ?? existing.width,
    height: body.height ?? existing.height,
    thumbnail_url: body.thumbnail_url ?? existing.thumbnail_url,
    updated_at: new Date().toISOString(),
  };
  
  await writeFile(path, JSON.stringify(updated, null, 2));
  
  return NextResponse.json(updated);
}

// DELETE /api/designs/[id] - Delete a design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = getDesignPath(id);
  
  if (!existsSync(path)) {
    return NextResponse.json({ ok: true });
  }
  
  await unlink(path);
  
  return NextResponse.json({ ok: true });
}
