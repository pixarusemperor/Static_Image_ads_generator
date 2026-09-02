import { NextRequest, NextResponse } from 'next/server';
import { getTemplateContract, TEMPLATE_CONTRACTS } from '@/core/templates/contracts';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const contract = getTemplateContract(id);

  if (!contract) {
    return NextResponse.json(
      {
        error: `Template "${id}" not found.`,
        availableTemplates: Object.keys(TEMPLATE_CONTRACTS),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    template: contract,
  });
}
