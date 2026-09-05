import { NextRequest, NextResponse } from 'next/server';
import { adaptContentToTemplate } from '@/core/templates/adapter';
import { getTemplateContract } from '@/core/templates/contracts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { templateId, rawContent } = body || {};

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "templateId" in request body' },
        { status: 400 }
      );
    }

    const contract = getTemplateContract(templateId);
    if (!contract) {
      return NextResponse.json(
        { error: `Unknown templateId: "${templateId}"` },
        { status: 404 }
      );
    }

    const incomingRaw = (rawContent && typeof rawContent === 'object') ? rawContent : {};
    const result = adaptContentToTemplate(templateId, incomingRaw, contract);

    return NextResponse.json({
      success: true,
      templateId,
      variables: result.variables,
      adaptations: result.adaptations,
      warnings: result.warnings,
      missingMandatory: result.missingMandatory,
    });
  } catch (error: unknown) {
    console.error('Error in /api/adapt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
