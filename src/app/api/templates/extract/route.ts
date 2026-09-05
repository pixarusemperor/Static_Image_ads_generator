import { NextRequest, NextResponse } from 'next/server';
import { extractContractFromAST } from '@/core/contracts/extractor';
import { getTemplateContract } from '@/core/templates/contracts';
import { getDynamicTemplate } from '@/core/templates/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      payload, 
      sourceAst, 
      ast, 
      layers, 
      templateId, 
      name, 
      canvasWidth = 1080, 
      canvasHeight = 1080 
    } = body;

    // 1. If templateId is provided, retrieve its contract directly
    if (templateId) {
      const builtInContract = getTemplateContract(templateId);
      if (builtInContract) {
        return NextResponse.json({
          success: true,
          source: 'built_in',
          contract: builtInContract,
          defaultVariables: {},
          diagnostics: [],
        });
      }

      const dynamicTemplate = await getDynamicTemplate(templateId);
      if (dynamicTemplate) {
        return NextResponse.json({
          success: true,
          source: 'dynamic_storage',
          contract: dynamicTemplate.contract,
          defaultVariables: dynamicTemplate.defaultVariables,
          diagnostics: [],
        });
      }

      return NextResponse.json(
        { success: false, error: `Template not found: "${templateId}"` },
        { status: 404 }
      );
    }

    // 2. Extract from AST / layers payload
    const rawAst = payload || sourceAst || ast || layers;
    if (!rawAst) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing input. Provide "payload" (or "sourceAst", "ast", "layers") or "templateId". For raw images, use /api/templates/deconstruct.' 
        },
        { status: 400 }
      );
    }

    const extractionResult = extractContractFromAST(rawAst, {
      templateName: name,
      canvasWidth,
      canvasHeight,
    });

    return NextResponse.json({
      success: true,
      source: 'ast_extracted',
      contract: extractionResult.contract,
      defaultVariables: extractionResult.defaultVariables,
      diagnostics: extractionResult.diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Dynamic contract extraction failed.' },
      { status: 500 }
    );
  }
}
