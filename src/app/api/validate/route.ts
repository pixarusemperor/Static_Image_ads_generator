import { NextRequest, NextResponse } from 'next/server';
import { validateTemplatePayload } from '@/core/templates/contracts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { templateId, variables } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Missing "templateId" in request body' }, { status: 400 });
    }

    const incomingVars = (variables && typeof variables === 'object')
      ? variables
      : (() => {
          const { templateId: _, ...rest } = body;
          return rest;
        })();

    const diagnostic = validateTemplatePayload(templateId, incomingVars);

    return NextResponse.json({
      success: true,
      diagnostic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
