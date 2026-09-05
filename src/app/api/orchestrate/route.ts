import { NextRequest, NextResponse } from 'next/server';
import { orchestrateCampaign, OrchestrationPayload } from '@/core/orchestration';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let payload: OrchestrationPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    if (!payload.campaignName) {
      return NextResponse.json({ error: 'Missing "campaignName" in request body' }, { status: 400 });
    }

    if (!payload.product?.name) {
      return NextResponse.json({ error: 'Missing "product.name" in request body' }, { status: 400 });
    }

    if (!Array.isArray(payload.targetTemplates) || payload.targetTemplates.length === 0) {
      return NextResponse.json(
        { error: 'targetTemplates must be a non-empty array of template IDs (e.g. ["hd-red-circle", "1-a"])' },
        { status: 400 }
      );
    }

    const result = await orchestrateCampaign(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in /api/orchestrate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during orchestration' },
      { status: 500 }
    );
  }
}
