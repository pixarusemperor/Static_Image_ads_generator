import { CanvasLayer } from '@/components/templates/CustomTemplate';
import {
  TemplateContract,
  TemplateElementContract,
} from '@/core/templates/contracts';
import { calculateSafeCharacterLimit } from '@/core/contracts/extractor';
import {
  registerCustomTemplateMetadata,
  registerImportedCustomTemplate,
  customTemplatesStore,
  getImportedCustomTemplate,
  type ImportedTemplateResult,
} from '@/components/templates/template-registry';
import type { StudioTemplate } from '@/core/database/studio';

export type { ImportedTemplateResult };
export { customTemplatesStore, getImportedCustomTemplate };

/**
 * Converts Fabric.js canvas JSON into SuperAds CanvasLayer[] array.
 * Supports Textbox, IText, Rect, Circle, and FabricImage.
 */
export function fabricJsonToCanvasLayers(
  canvasJson: string,
  targetWidth = 1080,
  targetHeight = 1080
): { layers: CanvasLayer[]; canvasBgColor: string } {
  let parsed: any = {};
  try {
    parsed = typeof canvasJson === 'string' ? JSON.parse(canvasJson) : canvasJson;
  } catch (err) {
    console.error('Failed to parse Fabric canvas JSON:', err);
    return { layers: [], canvasBgColor: '#0f172a' };
  }

  const canvasBgColor = parsed.backgroundColor || '#0f172a';
  const objects: any[] = Array.isArray(parsed.objects) ? parsed.objects : [];
  const layers: CanvasLayer[] = [];

  objects.forEach((obj, index) => {
    if (!obj) return;
    const type = obj.type?.toLowerCase() || '';
    const left = Math.round(obj.left || 0);
    const top = Math.round(obj.top || 0);
    const width = Math.round((obj.width || 100) * (obj.scaleX || 1));
    const height = Math.round((obj.height || 100) * (obj.scaleY || 1));
    const opacity = typeof obj.opacity === 'number' ? obj.opacity : 1;
    const zIndex = index + 1;

    if (type === 'textbox' || type === 'i-text' || type === 'text') {
      layers.push({
        id: obj.id || `text_${index + 1}`,
        name: obj.name || `Text Layer ${index + 1}`,
        type: 'text',
        left,
        top,
        width,
        height: Math.max(height, Math.round((obj.fontSize || 32) * (obj.lineHeight || 1.2))),
        zIndex,
        opacity,
        text: obj.text || '',
        color: typeof obj.fill === 'string' ? obj.fill : '#ffffff',
        fontSize: Math.round((obj.fontSize || 32) * (obj.scaleY || 1)),
        fontWeight: obj.fontWeight ? String(obj.fontWeight) : 'normal',
        textAlign: obj.textAlign || 'left',
        textBackgroundColor: obj.backgroundColor || 'transparent',
        lineHeight: obj.lineHeight || 1.2,
        letterSpacing: obj.charSpacing ? `${obj.charSpacing / 1000}em` : undefined,
      });
    } else if (type === 'rect') {
      layers.push({
        id: obj.id || `rect_${index + 1}`,
        name: obj.name || `Rectangle ${index + 1}`,
        type: 'shape',
        shapeType: 'rect',
        left,
        top,
        width,
        height,
        zIndex,
        opacity,
        backgroundColor: typeof obj.fill === 'string' ? obj.fill : '#1e293b',
        borderColor: typeof obj.stroke === 'string' ? obj.stroke : undefined,
        borderWidth: obj.strokeWidth || 0,
        borderRadius: obj.rx || 0,
      });
    } else if (type === 'circle') {
      const radius = Math.round((obj.radius || width / 2) * (obj.scaleX || 1));
      layers.push({
        id: obj.id || `circle_${index + 1}`,
        name: obj.name || `Circle ${index + 1}`,
        type: 'shape',
        shapeType: 'circle',
        left,
        top,
        width: radius * 2,
        height: radius * 2,
        zIndex,
        opacity,
        backgroundColor: typeof obj.fill === 'string' ? obj.fill : '#6366f1',
        borderColor: typeof obj.stroke === 'string' ? obj.stroke : undefined,
        borderWidth: obj.strokeWidth || 0,
      });
    } else if (type === 'image') {
      layers.push({
        id: obj.id || `image_${index + 1}`,
        name: obj.name || `Image ${index + 1}`,
        type: 'image',
        left,
        top,
        width,
        height,
        zIndex,
        opacity,
        imageUrl: obj.src || '/templates/assets/30.png',
        borderRadius: obj.rx || 0,
        objectFit: 'cover',
      });
    }
  });

  return { layers, canvasBgColor };
}

/**
 * Imports an OpenDesign canvas layout, derives 3-Sigma Glyph Capacity bounds,
 * constructs a formal SuperAds TemplateContract, and registers it in memory and DB.
 */
export async function importOpenDesignAsTemplate(params: {
  id?: string;
  name: string;
  canvasJson: string;
  category?: 'direct-response' | 'publisher' | 'social' | 'recruitment' | 'typographic';
  width?: number;
  height?: number;
  thumbnailUrl?: string | null;
}): Promise<ImportedTemplateResult> {
  const width = params.width || 1080;
  const height = params.height || 1080;
  const rawId = params.id || params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const templateId = rawId.startsWith('custom-') ? rawId : `custom-${rawId}`;

  const { layers, canvasBgColor } = fabricJsonToCanvasLayers(params.canvasJson, width, height);

  const elements: TemplateElementContract[] = [];
  const defaultVariables: Record<string, unknown> = {
    canvasBgColor,
    width,
    height,
    layers,
  };

  let textCounter = 1;
  let imageCounter = 1;

  layers.forEach((layer) => {
    if (layer.type === 'text') {
      const isLarge = (layer.fontSize || 32) >= 44;
      const isUpper = (layer.text || '').toUpperCase() === layer.text && (layer.text || '').length > 3;
      const key = isLarge && textCounter === 1 ? 'headline' : `text_${textCounter++}`;
      
      const { maxCharacters, maxLines } = calculateSafeCharacterLimit({
        width: layer.width,
        height: layer.height,
        fontSize: layer.fontSize || 32,
        isUppercase: isUpper,
        isBold: layer.fontWeight === 'bold' || layer.fontWeight === '700',
      });

      elements.push({
        key,
        label: key === 'headline' ? 'Main Headline' : layer.name || `Text ${key}`,
        type: 'text',
        mandatory: key === 'headline',
        defaultValue: layer.text || '',
        spatial: {
          position: 'absolute',
          left: layer.left,
          top: layer.top,
          width: layer.width,
          height: layer.height,
          zIndex: layer.zIndex,
        },
        textRules: {
          maxCharacters,
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight as any,
          forcedCase: isUpper ? 'UPPERCASE' : 'NONE',
        },
        purpose: `Extracted OpenDesign text layer: ${layer.name}`,
      });

      defaultVariables[key] = layer.text || '';
    } else if (layer.type === 'image') {
      const isMockup = layer.width > 250 && layer.height > 250;
      const key = isMockup && imageCounter === 1 ? 'productImage' : `image_${imageCounter++}`;

      elements.push({
        key,
        label: key === 'productImage' ? 'Product Image' : layer.name || `Image ${key}`,
        type: 'image',
        mandatory: key === 'productImage',
        defaultValue: layer.imageUrl || '/templates/assets/30.png',
        spatial: {
          position: 'absolute',
          left: layer.left,
          top: layer.top,
          width: layer.width,
          height: layer.height,
          zIndex: layer.zIndex,
        },
        compositionRules: {
          format: 'any',
          subjectPlacement: 'Centered within defined bounds',
        },
        purpose: `Extracted OpenDesign image layer: ${layer.name}`,
      });

      defaultVariables[key] = layer.imageUrl || '/templates/assets/30.png';
    }
  });

  // Ensure at least one headline exists
  if (!elements.some((e) => e.key === 'headline')) {
    defaultVariables['headline'] = params.name;
    elements.unshift({
      key: 'headline',
      label: 'Main Headline',
      type: 'text',
      mandatory: true,
      defaultValue: params.name,
      spatial: { position: 'absolute', left: 40, top: 40, width: width - 80, height: 120, zIndex: 10 },
      textRules: { maxCharacters: 80, fontSize: 48, fontWeight: 'bold', forcedCase: 'NONE' },
      purpose: 'Default headline slot',
    });
  }

  const contract: TemplateContract = {
    id: templateId,
    name: params.name,
    category: params.category || 'direct-response',
    categoryLabel: 'OpenDesign Custom',
    description: `Custom visual template created via OpenDesign Studio. Composed of ${layers.length} layers.`,
    dimensions: { width, height },
    bestUseCase: 'Visual graphics & custom promotional direct-response ad compositions.',
    funnelStage: 'Problem-Aware',
    recommendedNiches: ['All Niches', 'E-commerce', 'Social Media'],
    conversionRationale: 'Engineered via OpenDesign canvas and 3-Sigma Glyph Capacity Theorem.',
    elements,
  };

  const result: ImportedTemplateResult = {
    templateId,
    name: params.name,
    layers,
    contract,
    defaultVariables,
    width,
    height,
    canvasBgColor,
  };

  // Register in memory
  registerImportedCustomTemplate(result);

  // Register in global templates selector registry
  registerCustomTemplateMetadata({
    id: templateId as any,
    name: params.name,
    category: (params.category as any) || 'custom',
    categoryLabel: 'OpenDesign Custom',
    description: `Custom template created in OpenDesign Studio with ${layers.length} layers.`,
    thumbnailUrl: params.thumbnailUrl || '/templates/thumbnails/custom.png',
    badge: 'Custom',
    dimensions: { width, height },
    tags: ['OpenDesign', 'Custom Canvas', 'Extracted Contract'],
    elementCount: elements.length,
  });

  // Save to studio templates database table
  const studioTemplate: StudioTemplate = {
    id: templateId,
    name: params.name,
    category: params.category || 'custom',
    canvas_json: params.canvasJson,
    width,
    height,
    thumbnail_url: params.thumbnailUrl || null,
    sort_order: 100,
  };

  try {
    const { saveStudioTemplate } = await import('@/core/database/studio');
    await saveStudioTemplate(studioTemplate);
  } catch (err) {
    console.warn('[opendesign-importer] Failed to persist template to database:', err);
  }

  return result;
}
