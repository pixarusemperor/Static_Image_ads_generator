import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DESIGNS_DIR = join(process.cwd(), 'data', 'designs');

async function ensureDir() {
  if (!existsSync(DESIGNS_DIR)) {
    await mkdir(DESIGNS_DIR, { recursive: true });
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// GET /api/designs - List all designs
export async function GET() {
  await ensureDir();
  const files = await readdir(DESIGNS_DIR);
  const designs = [];
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const content = await readFile(join(DESIGNS_DIR, file), 'utf-8');
      const design = JSON.parse(content);
      designs.push({
        id: design.id,
        name: design.name,
        width: design.width,
        height: design.height,
        thumbnail_url: design.thumbnail_url || null,
        created_at: design.created_at,
        updated_at: design.updated_at,
      });
    } catch {
      // skip malformed files
    }
  }
  
  // Sort by updated_at descending
  designs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  return NextResponse.json(designs);
}

// POST /api/designs - Create a new design
export async function POST(request: NextRequest) {
  await ensureDir();
  const body = await request.json();
  
  const id = generateId();
  const now = new Date().toISOString();
  
  const design = {
    id,
    name: body.name || 'Untitled Design',
    canvas_json: body.canvas_json || '{}',
    width: body.width || 1080,
    height: body.height || 1080,
    thumbnail_url: body.thumbnail_url || null,
    created_at: now,
    updated_at: now,
  };
  
  await writeFile(join(DESIGNS_DIR, `${id}.json`), JSON.stringify(design, null, 2));
  
  return NextResponse.json(design);
}
