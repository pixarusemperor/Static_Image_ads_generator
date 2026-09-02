import { NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES } from '@/components/templates/template-registry';
import { defaultTemplatesData } from '@/components/templates/template-defaults';
import { TEMPLATE_CONTRACTS } from '@/core/templates/contracts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const templates = TEMPLATES_REGISTRY.map((meta) => {
    const defaults = defaultTemplatesData[meta.id] || {};
    const contract = TEMPLATE_CONTRACTS[meta.id];

    return {
      ...meta,
      bestUseCase: contract?.bestUseCase || meta.description,
      recommendedNiches: contract?.recommendedNiches || [],
      funnelStage: contract?.funnelStage || 'All-Stages',
      conversionRationale: contract?.conversionRationale || '',
      defaultVariables: defaults,
      elements: contract?.elements || [],
    };
  });

  return NextResponse.json({
    templates,
    categories: TEMPLATE_CATEGORIES,
    total: templates.length,
  });
}
