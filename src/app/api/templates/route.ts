import { NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES } from '@/components/templates/template-registry';
import { defaultTemplatesData } from '@/components/templates/template-defaults';
import { TEMPLATE_CONTRACTS } from '@/core/templates/contracts';
import { listDynamicTemplates } from '@/core/templates/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const staticTemplates = TEMPLATES_REGISTRY.map((meta) => {
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

  // Load dynamically stored templates from R2 / memory / disk
  const dynamicList = await listDynamicTemplates();
  const dynamicTemplates = dynamicList.map((dt) => ({
    id: dt.id,
    name: dt.name,
    description: dt.contract?.bestUseCase || 'Custom dynamic ad template',
    category: dt.category || 'custom',
    dimensions: dt.dimensions || { width: 1080, height: 1080 },
    bestUseCase: dt.contract?.bestUseCase || 'Custom dynamic ad template',
    recommendedNiches: dt.contract?.recommendedNiches || ['E-commerce', 'General'],
    funnelStage: dt.contract?.funnelStage || 'Problem-Aware',
    conversionRationale: dt.contract?.conversionRationale || '',
    defaultVariables: dt.defaultVariables || {},
    elements: dt.contract?.elements || [],
    isDynamic: true,
  }));

  const allTemplates = [...staticTemplates, ...dynamicTemplates];

  return NextResponse.json({
    templates: allTemplates,
    categories: TEMPLATE_CATEGORIES,
    total: allTemplates.length,
  });
}
