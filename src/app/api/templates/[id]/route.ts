import { NextRequest, NextResponse } from 'next/server';
import { resolveTemplateContract, TEMPLATE_CONTRACTS } from '@/core/templates/contracts';
import { getDynamicTemplate } from '@/core/templates/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const contract = await resolveTemplateContract(id);

  if (!contract) {
    return NextResponse.json(
      {
        error: `Template "${id}" not found.`,
        availableStaticTemplates: Object.keys(TEMPLATE_CONTRACTS),
      },
      { status: 404 }
    );
  }

  const dynamicTpl = await getDynamicTemplate(id);

  return NextResponse.json({
    success: true,
    template: contract,
    defaultVariables: dynamicTpl?.defaultVariables,
    isDynamic: Boolean(dynamicTpl),
  });
}
