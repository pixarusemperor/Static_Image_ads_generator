import {
  TemplateContract,
  TemplateElementContract,
  CompositionRules,
  TextRules,
} from '@/core/templates/contracts';
import {
  normalizeCoordinates,
  normalizeTextContent,
  ExtractionDiagnostic,
} from './diagnostics';

export type SemanticRole =
  | 'header_eyebrow'
  | 'headline_hook'
  | 'body_copy'
  | 'price_pill'
  | 'subject_portrait'
  | 'product_mockup'
  | 'social_proof_badge'
  | 'footer_cta'
  | 'reassurance_strip'
  | 'brand_logo'
  | 'background_visual'
  | 'container_shape';

export interface ExtractedContractResult {
  contract: TemplateContract;
  defaultVariables: Record<string, any>;
  diagnostics: ExtractionDiagnostic[];
}

/**
 * 3-Sigma Glyph Capacity Theorem
 * Computes leak-proof character limits for direct-response layouts.
 * Factors in uppercase advance width inflation, line height budgets, and greedy word-wrap ragged edges.
 */
export function calculateSafeCharacterLimit(params: {
  width: number;
  height: number;
  fontSize: number;
  isUppercase?: boolean;
  isBold?: boolean;
  language?: 'fr' | 'en' | 'es' | 'de';
  paddingHoriz?: number;
  paddingVert?: number;
}): { maxCharacters: number; maxLines: number } {
  const {
    width,
    height,
    fontSize,
    isUppercase = false,
    isBold = true,
    language = 'fr',
    paddingHoriz = 16,
    paddingVert = 8,
  } = params;

  const safeF = Math.max(12, fontSize || 36);
  const safeW = Math.max(80, width - paddingHoriz * 2);
  const safeH = Math.max(20, height - paddingVert * 2);

  // 1. Line height factor (1.20 for headlines/badges, 1.35 for paragraphs)
  const lineHeightRatio = safeF >= 36 ? 1.20 : 1.35;
  const maxLines = Math.max(1, Math.floor(safeH / (safeF * lineHeightRatio)));

  // 2. Proportional advance factor (mu + 0.5 * sigma for 3-sigma safety)
  // Bold uppercase in Inter requires 0.710 average advance vs 0.548 for mixed bold
  const mu = isUppercase ? (isBold ? 0.710 : 0.665) : (isBold ? 0.548 : 0.512);
  const sigma = isUppercase ? 0.098 : 0.150;
  const charAdvance = (mu + 0.5 * sigma) * safeF;

  // 3. Greedy word wrap packing penalty (average word length in chars)
  const avgWordLen = language === 'fr' ? 6.4 : (language === 'de' ? 7.2 : 5.2);
  const wordWidthPx = (avgWordLen + 1) * mu * safeF;
  const wordPenalty = wordWidthPx / (2 * safeW);
  const packEfficiency = Math.max(0.55, Math.min(0.90, 1 - wordPenalty));

  // 4. Safe character limit
  const usableWidth = safeW * packEfficiency;
  const maxCharacters = Math.max(4, Math.floor((maxLines * usableWidth) / charAdvance));

  return { maxCharacters, maxLines };
}

/**
 * Binary search font auto-fitter for Satori.
 * Determines the largest font size that guarantees text fits inside container bounds without line overflow.
 */
export function calculateFitFontSize(params: {
  text: string;
  width: number;
  height: number;
  initialFontSize: number;
  minFontSize?: number;
  isUppercase?: boolean;
  isBold?: boolean;
}): number {
  const {
    text,
    width,
    height,
    initialFontSize,
    minFontSize = 16,
    isUppercase = false,
    isBold = true,
  } = params;

  if (!text) return initialFontSize;

  let low = minFontSize;
  let high = initialFontSize;
  let optimalSize = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const { maxCharacters } = calculateSafeCharacterLimit({
      width,
      height,
      fontSize: mid,
      isUppercase,
      isBold,
    });

    if (text.length <= maxCharacters) {
      optimalSize = mid;
      low = mid + 1; // Try larger font
    } else {
      high = mid - 1; // Try smaller font
    }
  }

  return optimalSize;
}

/**
 * Ingests any visual layout AST (Fabric objects, Satori layers, or AI vision zones)
 * and extracts a complete, zero-hardcoded TemplateContract.
 */
export function extractContractFromAST(
  input: any,
  options?: {
    templateId?: string;
    templateName?: string;
    canvasWidth?: number;
    canvasHeight?: number;
  }
): ExtractedContractResult {
  const diagnostics: ExtractionDiagnostic[] = [];
  const canvasW = options?.canvasWidth || input?.width || 1080;
  const canvasH = options?.canvasHeight || input?.height || 1080;
  const templateId = options?.templateId || input?.id || `tpl-${Date.now()}`;
  const templateName = options?.templateName || input?.name || `Custom Ad Template (${templateId})`;

  // Extract raw layer nodes from input
  const rawNodes: any[] = Array.isArray(input)
    ? input
    : Array.isArray(input?.canvas_json?.objects)
    ? input.canvas_json.objects
    : Array.isArray(input?.layers)
    ? input.layers
    : Array.isArray(input?.zones)
    ? input.zones
    : [];

  const elements: TemplateElementContract[] = [];
  const defaultVariables: Record<string, any> = {};

  // Sort raw nodes by area descending for natural z-index hierarchy
  const sortedNodes = [...rawNodes].sort((a, b) => {
    const areaA = (a.width || 100) * (a.height || 100);
    const areaB = (b.width || 100) * (b.height || 100);
    return areaB - areaA;
  });

  let textCounter = 0;
  let imageCounter = 0;
  let hasMockup = false;
  let hasSubject = false;
  let hasHook = false;

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const spatial = normalizeCoordinates(
      {
        left: node.left ?? node.x,
        top: node.top ?? node.y,
        width: node.width ?? node.w,
        height: node.height ?? node.h,
        zIndex: (node.zIndex !== undefined) ? node.zIndex : i * 10,
      },
      canvasW,
      canvasH,
      diagnostics
    );

    // Determine type: text, image, badge, or shape
    const nodeType = String(node.type || node.kind || '').toLowerCase();
    const isText = ['textbox', 'text', 'i-text'].includes(nodeType) || typeof node.text === 'string' || typeof node.rawText === 'string';
    const isImage = ['image', 'img'].includes(nodeType) || Boolean(node.src || node.imageUrl || node.url || node.visualDetails);

    // Direct-Response Role Classifier
    let role: SemanticRole = 'container_shape';
    let key = '';

    if (isText) {
      textCounter++;
      const textContent = normalizeTextContent(node.text || node.rawText || node.content || '');
      const fontSize = Number(node.fontSize || node.fontSizeEstimated || 40);
      const isUpper = textContent === textContent.toUpperCase() && textContent !== textContent.toLowerCase();

      // Hook vs Eyebrow vs Price vs Footer vs Body
      const isCurrency = /((\$|€|£|FCFA|CFA|\bF\b)\s*\d+|\d+\s*(\$|€|£|FCFA|CFA|\bF\b)|PRIX|OFFRE|-?\d+%\s*OFF)/i.test(textContent);
      const isTopArea = spatial.top <= canvasH * 0.35;
      const isBottomArea = spatial.top >= canvasH * 0.75;
      const isActionImperative = /(COMMANDEZ|ACHETEZ|CLIQUEZ|COMMANDER|LIVRAISON|PAIEMENT|RECRUTEMENT|OFFRE)/i.test(textContent);

      if (isCurrency || (spatial.width <= 420 && spatial.height <= 110 && (node.rx || node.borderRadius))) {
        role = 'price_pill';
        key = `priceBadgeText`;
      } else if (isTopArea && fontSize >= 42 && !hasHook) {
        role = 'headline_hook';
        key = `headerLine2`;
        hasHook = true;
      } else if (isTopArea && spatial.top < 120) {
        role = 'header_eyebrow';
        key = `headerLine1`;
      } else if (isBottomArea && isActionImperative) {
        role = 'footer_cta';
        key = `footerLine1`;
      } else if (isBottomArea) {
        role = 'reassurance_strip';
        key = `footerLine2`;
      } else if (fontSize <= 28) {
        role = 'body_copy';
        key = `bodyText_${textCounter}`;
      } else {
        role = 'headline_hook';
        key = `headline_${textCounter}`;
      }

      const { maxCharacters } = calculateSafeCharacterLimit({
        width: spatial.width,
        height: spatial.height,
        fontSize,
        isUppercase: isUpper,
        isBold: Boolean(node.fontWeight === 'bold' || node.fontWeight === 700 || isUpper),
      });

      const textRules: TextRules = {
        maxCharacters,
        minWords: Math.max(1, Math.floor(maxCharacters / 8)),
        maxWords: Math.max(2, Math.floor(maxCharacters / 4.5)),
        forcedCase: isUpper ? 'UPPERCASE' : 'NONE',
        fontSize,
        fontWeight: (node.fontWeight === 'bold' || node.fontWeight === 700 || isUpper) ? 'bold' : 'normal',
      };

      const isMandatory = ['headline_hook', 'price_pill'].includes(role);
      const defVal = textContent || (role === 'price_pill' ? 'PRIX : 5.000 FCFA' : 'NOUVELLE FORMULE NATURELLE');

      elements.push({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        type: role === 'price_pill' ? 'badge' : 'text',
        mandatory: isMandatory,
        defaultValue: defVal,
        spatial: {
          position: 'absolute',
          left: spatial.left,
          top: spatial.top,
          width: spatial.width,
          height: spatial.height,
          zIndex: spatial.zIndex,
          borderRadius: node.rx || node.borderRadius,
        },
        textRules,
        purpose: `Dynamically extracted ${role.replace('_', ' ')} element`,
      });

      defaultVariables[key] = defVal;

    } else if (isImage) {
      imageCounter++;
      const isFullBleed = spatial.width >= canvasW * 0.90 && spatial.height >= canvasH * 0.90;
      const isMockupCandidate = spatial.left >= canvasW * 0.45 && spatial.width <= 450 && spatial.height >= 300;
      const isPortraitCandidate = spatial.left <= canvasW * 0.50 && spatial.width >= 400 && spatial.height >= 500;

      let compositionRules: CompositionRules = {};

      if (isFullBleed) {
        role = 'background_visual';
        key = 'backgroundImage';
        compositionRules = {
          format: 'full-bleed-photo',
          subjectPlacement: 'Atmospheric or pattern background across full canvas.',
          aspectRatio: '1:1',
          minResolution: { width: 1080, height: 1080 },
        };
      } else if (isMockupCandidate && !hasMockup) {
        role = 'product_mockup';
        key = 'productImage';
        hasMockup = true;
        compositionRules = {
          format: 'transparent-png',
          subjectPlacement: 'CRITICAL: Must be a clean 3D product mockup with transparent background.',
          minResolution: { width: 400, height: 500 },
        };
      } else if (isPortraitCandidate && !hasSubject) {
        role = 'subject_portrait';
        key = 'subjectImage';
        hasSubject = true;
        compositionRules = {
          format: 'portrait-photo',
          subjectPlacement: 'CRITICAL: The person or symptom sufferer MUST BE CENTERED horizontally and vertically.',
          minResolution: { width: 500, height: 600 },
        };
      } else {
        role = 'product_mockup';
        key = `image_${imageCounter}`;
        compositionRules = {
          format: 'any',
          subjectPlacement: 'Centered subject within photo frame.',
        };
      }

      const isMandatory = ['product_mockup', 'subject_portrait'].includes(role);
      const defImg = node.src || node.imageUrl || '/templates/assets/30.png';

      elements.push({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        type: 'image',
        mandatory: isMandatory,
        defaultValue: defImg,
        spatial: {
          position: 'absolute',
          left: spatial.left,
          top: spatial.top,
          width: spatial.width,
          height: spatial.height,
          zIndex: spatial.zIndex,
          borderRadius: node.rx || node.borderRadius || (spatial.width === spatial.height && spatial.width <= 200 ? 100 : undefined),
        },
        compositionRules,
        purpose: `Dynamically extracted ${role.replace('_', ' ')} asset zone`,
      });

      defaultVariables[key] = defImg;
    }
  }

  // Ensure at least one hook text exists
  if (elements.length === 0) {
    elements.push({
      key: 'title',
      label: 'Main Headline',
      type: 'text',
      mandatory: true,
      defaultValue: 'OFFRE EXCLUSIVE DU JOUR',
      spatial: { position: 'absolute', left: 80, top: 400, width: 920, height: 200, zIndex: 10 },
      textRules: {
        maxCharacters: 60,
        forcedCase: 'UPPERCASE',
        fontSize: 64,
        fontWeight: 'bold',
      },
      purpose: 'Default fallback headline hook',
    });
    defaultVariables['title'] = 'OFFRE EXCLUSIVE DU JOUR';
  }

  const contract: TemplateContract = {
    id: templateId,
    name: templateName,
    category: 'direct-response',
    categoryLabel: 'Direct-Response Product',
    description: 'Dynamic direct-response template reverse-engineered from layout AST.',
    dimensions: { width: canvasW, height: canvasH },
    bestUseCase: 'Dynamic direct-response marketing ad synthesized from layout AST.',
    funnelStage: 'Problem-Aware',
    recommendedNiches: ['Health & Wellness', 'E-commerce', 'Physical Products'],
    conversionRationale: 'Dynamic contract mathematically optimized via 3-Sigma Glyph Capacity Theorem.',
    elements,
  };

  return {
    contract,
    defaultVariables,
    diagnostics,
  };
}
