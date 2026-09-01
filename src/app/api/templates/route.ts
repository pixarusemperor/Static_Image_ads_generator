import { NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY, TEMPLATE_CATEGORIES } from '@/components/templates/template-registry';
import { defaultTemplatesData } from '@/components/templates/template-defaults';
import { TEMPLATE_SCHEMAS } from '@/core/templates/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const templates = TEMPLATES_REGISTRY.map((meta) => {
    const defaults = defaultTemplatesData[meta.id] || {};
    const schemaObj = TEMPLATE_SCHEMAS[meta.id];
    const shape = schemaObj ? schemaObj.shape : {};
    
    const fields = Object.keys(shape).map((key) => {
      const fieldDef = shape[key];
      return {
        name: key,
        description: fieldDef?.description || '',
        defaultValue: defaults[key] ?? null,
      };
    });

    return {
      ...meta,
      defaultVariables: defaults,
      fields,
    };
  });

  return NextResponse.json({
    templates,
    categories: TEMPLATE_CATEGORIES,
    total: templates.length,
  });
}
