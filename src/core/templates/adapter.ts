/**
 * Template Composition Adapter
 * Fits raw copy strings to template spatial contracts, enforces character limits,
 * word limits, forced casing, and maps semantic content fields to element contracts.
 */

import { getTemplateContract, TEMPLATE_CONTRACTS, TemplateContract } from './contracts';

export interface FitTextOptions {
  text: string;
  maxCharacters?: number;
  maxWords?: number;
  forcedCase?: 'UPPERCASE' | 'lowercase' | 'NONE';
  mode?: 'ellipsize' | 'truncate';
}

export interface FitTextResult {
  fitted: string;
  originalLength: number;
  fittedLength: number;
  wasTruncated: boolean;
  wasCased: boolean;
}

/**
 * Deterministic text fitting utility enforcing casing and length constraints.
 */
export function fitText(options: FitTextOptions): FitTextResult {
  let {
    text = '',
    maxCharacters = Infinity,
    maxWords = Infinity,
    forcedCase = 'NONE',
    mode = 'ellipsize',
  } = options;

  if (typeof text !== 'string') {
    text = String(text || '');
  }

  const originalText = text.trim();
  let fitted = originalText;
  let wasCased = false;
  let wasTruncated = false;

  // 1. Forced casing
  if (forcedCase === 'UPPERCASE' && fitted !== fitted.toUpperCase()) {
    fitted = fitted.toUpperCase();
    wasCased = true;
  } else if (forcedCase === 'lowercase' && fitted !== fitted.toLowerCase()) {
    fitted = fitted.toLowerCase();
    wasCased = true;
  }

  // 2. Word count limit
  const words = fitted.split(/\s+/).filter(w => w.length > 0);
  if (maxWords && words.length > maxWords) {
    fitted = words.slice(0, maxWords).join(' ');
    wasTruncated = true;
    if (mode === 'ellipsize') {
      fitted += '...';
    }
  }

  // 3. Character boundary
  if (maxCharacters && fitted.length > maxCharacters) {
    wasTruncated = true;
    if (mode === 'truncate') {
      fitted = fitted.substring(0, maxCharacters).trim();
    } else {
      const targetLen = Math.max(0, maxCharacters - 3);
      const sub = fitted.substring(0, targetLen);
      const lastSpace = sub.lastIndexOf(' ');
      if (lastSpace > targetLen * 0.6) {
        fitted = sub.substring(0, lastSpace).trim() + '...';
      } else {
        fitted = sub.trim() + '...';
      }
    }
  }

  return {
    fitted,
    originalLength: originalText.length,
    fittedLength: fitted.length,
    wasTruncated,
    wasCased,
  };
}

export interface AdaptationRecord {
  field: string;
  original: unknown;
  adapted: unknown;
  action: string;
}

export interface TemplateAdaptationResult {
  templateId: string;
  variables: Record<string, any>;
  adaptations: AdaptationRecord[];
  warnings: string[];
  missingMandatory: string[];
}

/**
 * Resolves a semantic field from raw content using direct key or alias list.
 */
function resolveRawField(rawContent: Record<string, any>, primaryKey: string, aliases: string[]): any {
  if (rawContent[primaryKey] !== undefined && rawContent[primaryKey] !== null && rawContent[primaryKey] !== '') {
    return rawContent[primaryKey];
  }
  for (const alias of aliases) {
    if (rawContent[alias] !== undefined && rawContent[alias] !== null && rawContent[alias] !== '') {
      return rawContent[alias];
    }
  }
  return undefined;
}

/**
 * Semantic alias mapping per template element.
 */
const SEMANTIC_ALIASES: Record<string, Record<string, string[]>> = {
  '1-a': {
    headerLine1: ['qualification', 'category', 'brandName', 'topBanner'],
    headerLine2: ['headline', 'title', 'hook', 'problemHook'],
    subjectImage: ['subjectImageUrl', 'image', 'photoUrl', 'assets.subjectImageUrl'],
    productImage: ['productMockupUrl', 'productImageUrl', 'mockupUrl', 'assets.productMockupUrl'],
    priceBadgeText: ['price', 'priceBadge', 'badgeText', 'offer'],
    footerLine1: ['cta', 'callToAction', 'guarantee', 'reassurance'],
    footerLine2: ['reassurance', 'delivery', 'trust', 'proofPoints'],
  },
  '1-b': {
    topBackgroundImage: ['backgroundImage', 'subjectImage', 'subjectImageUrl', 'photoUrl'],
    productImage: ['productMockupUrl', 'productImageUrl', 'mockupUrl'],
    priceBadgeText: ['price', 'priceBadge', 'badgeText'],
    title: ['headline', 'headerLine2', 'hook'],
    subtitle: ['subhead', 'secondaryBenefit'],
    bodyParagraph: ['body', 'description', 'messageText', 'postContent'],
    footerText: ['cta', 'guarantee', 'reassurance'],
  },
  '2-a': {
    backgroundImage: ['subjectImage', 'subjectImageUrl', 'photoUrl'],
    headline: ['title', 'headerLine2', 'hook'],
    highlightColor: ['accentColor'],
    logoUrl: ['logo', 'brandLogo'],
    avatarUrl: ['authorAvatar', 'avatar', 'subjectImage'],
  },
  '3-a': {
    backgroundImage: ['subjectImage', 'subjectImageUrl', 'photoUrl'],
    productImage: ['productMockupUrl', 'mysteryImage', 'mysteryImageUrl'],
    badgeText: ['priceBadgeText', 'price', 'discount', 'badge'],
    headline: ['title', 'headerLine2', 'hook'],
  },
  '3-b': {
    backgroundImage: ['subjectImage', 'subjectImageUrl', 'photoUrl'],
    postAuthor: ['author', 'senderName', 'name'],
    postHandle: ['handle', 'username', 'authorHandle'],
    postAvatar: ['avatarUrl', 'authorAvatar', 'subjectImage'],
    postContent: ['body', 'messageText', 'testimonial', 'headline'],
    postStats: ['stats', 'proofPoints'],
  },
  '4-a': {
    headerTitle: ['headline', 'title', 'jobTitle'],
    bodyImage: ['subjectImage', 'subjectImageUrl', 'image'],
    flagBadgeUrl: ['flagUrl', 'badgeUrl'],
    footerSalary: ['price', 'salary', 'compensation'],
    footerCommissions: ['commissions', 'bonus', 'upside'],
  },
  '5-a': {
    backgroundColor: ['bgColor', 'color'],
    title: ['headline', 'headerLine2', 'hook'],
    subtitle: ['subhead', 'cta', 'body'],
    emoji: ['icon'],
  },
  'hd-red-circle': {
    subjectImage: ['subjectImageUrl', 'image', 'backgroundImage', 'photoUrl'],
    mysteryImage: ['mysteryImageUrl', 'productImage', 'productMockupUrl'],
    headlineWhite: ['qualification', 'prefixHook', 'newsTag'],
    headlineYellow: ['headline', 'title', 'hook', 'headerLine2'],
    footerReassurance: ['source', 'proofPoints', 'reassurance', 'sourceText'],
  },
  'hd-breaking-news': {
    backgroundImage: ['subjectImage', 'subjectImageUrl', 'photoUrl'],
    alertBadgeText: ['badge', 'alertBadge', 'newsPill'],
    sourceText: ['source', 'proofPoints', 'footerReassurance'],
    headline: ['title', 'headerLine2', 'hook'],
    subtitle: ['body', 'description', 'subhead'],
  },
  'hd-native-alert': {
    backgroundImage: ['subjectImage', 'subjectImageUrl', 'photoUrl'],
    senderName: ['author', 'postAuthor', 'doctorName', 'contactName'],
    timestamp: ['time', 'date'],
    messageText: ['body', 'postContent', 'headline', 'testimonial'],
    calloutBadge: ['badge', 'proofBadge'],
    bottomNotice: ['cta', 'reassurance', 'notice'],
  },
};

/**
 * Fits and adapts raw input content to match any template contract.
 */
export function adaptContentToTemplate(
  templateId: string,
  rawContent: Record<string, any>,
  customContract?: TemplateContract
): TemplateAdaptationResult {
  const contract = customContract || getTemplateContract(templateId) || TEMPLATE_CONTRACTS[templateId];

  if (!contract) {
    return {
      templateId,
      variables: { ...rawContent },
      adaptations: [],
      warnings: [`Contract for template "${templateId}" not found.`],
      missingMandatory: [`Template "${templateId}" is unknown.`],
    };
  }

  const variables: Record<string, any> = {};
  const adaptations: AdaptationRecord[] = [];
  const warnings: string[] = [];
  const missingMandatory: string[] = [];

  const templateAliases = SEMANTIC_ALIASES[templateId] || {};

  for (const elem of contract.elements) {
    const aliases = templateAliases[elem.key] || [];
    let rawVal = resolveRawField(rawContent, elem.key, aliases);

    // Special price formatting if element is price-related
    if ((elem.key.toLowerCase().includes('price') || elem.key.toLowerCase().includes('salary')) && typeof rawVal === 'string') {
      if (rawVal && !rawVal.toUpperCase().startsWith('PRIX') && !rawVal.toUpperCase().startsWith('SALAIRE') && !rawVal.includes(':')) {
        const prefix = elem.key.toLowerCase().includes('salary') ? 'SALAIRE : ' : 'PRIX : ';
        rawVal = `${prefix}${rawVal}`;
      }
    }

    // Special headlineWhite derivation if not explicitly provided for hd-red-circle
    if (templateId === 'hd-red-circle' && elem.key === 'headlineWhite' && !rawVal) {
      if (rawContent.headline && typeof rawContent.headline === 'string' && rawContent.headline.includes(':')) {
        const parts = rawContent.headline.split(':');
        rawVal = parts[0].trim() + ':';
      }
    }

    // Special headlineYellow derivation if not explicitly provided for hd-red-circle
    if (templateId === 'hd-red-circle' && elem.key === 'headlineYellow' && !rawVal) {
      if (rawContent.headline && typeof rawContent.headline === 'string' && rawContent.headline.includes(':')) {
        const parts = rawContent.headline.split(':');
        rawVal = parts.slice(1).join(':').trim();
      }
    }

    // Fall back to default value if empty
    if (rawVal === undefined || rawVal === null || rawVal === '') {
      if (elem.mandatory) {
        if (elem.defaultValue !== undefined) {
          rawVal = elem.defaultValue;
          adaptations.push({
            field: elem.key,
            original: undefined,
            adapted: elem.defaultValue,
            action: 'filled_mandatory_default',
          });
        } else {
          missingMandatory.push(`Missing mandatory element: "${elem.key}" (${elem.label})`);
        }
      } else {
        rawVal = elem.defaultValue;
      }
    }

    // Apply text rules if text or badge
    if ((elem.type === 'text' || elem.type === 'badge') && typeof rawVal === 'string') {
      const rules = elem.textRules || {};
      const fitResult = fitText({
        text: rawVal,
        maxCharacters: rules.maxCharacters,
        maxWords: rules.maxWords,
        forcedCase: rules.forcedCase || (elem.type === 'badge' ? 'UPPERCASE' : 'NONE'),
        mode: 'ellipsize',
      });

      if (fitResult.wasCased || fitResult.wasTruncated) {
        adaptations.push({
          field: elem.key,
          original: rawVal,
          adapted: fitResult.fitted,
          action: [
            fitResult.wasCased ? `cased_${rules.forcedCase}` : null,
            fitResult.wasTruncated ? `truncated_maxChars_${rules.maxCharacters}` : null,
          ].filter(Boolean).join(','),
        });
      }

      variables[elem.key] = fitResult.fitted;
    } else {
      variables[elem.key] = rawVal;
    }
  }

  // Pass through any custom positional coordinates (like circlePos or arrowPath)
  if (templateId === 'hd-red-circle') {
    if (rawContent.circlePos) variables.circlePos = rawContent.circlePos;
    if (rawContent.arrowPath) variables.arrowPath = rawContent.arrowPath;
  }

  return {
    templateId,
    variables,
    adaptations,
    warnings,
    missingMandatory,
  };
}
