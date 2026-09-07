import { NextRequest, NextResponse } from 'next/server';
import { importOpenDesignAsTemplate } from '@/core/contracts/opendesign-importer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.canvasJson) {
      return NextResponse.json({ error: 'Name and canvasJson are required' }, { status: 400 });
    }

    const result = await importOpenDesignAsTemplate({
      id: body.id,
      name: body.name,
      canvasJson: body.canvasJson,
      category: body.category || 'direct-response',
      width: body.width || 1080,
      height: body.height || 1080,
      thumbnailUrl: body.thumbnailUrl,
    });

    return NextResponse.json({
      success: true,
      templateId: result.templateId,
      name: result.name,
      layerCount: result.layers.length,
      contract: result.contract,
      defaultVariables: result.defaultVariables,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to import template' }, { status: 500 });
  }
}
