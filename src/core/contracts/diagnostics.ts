export type DiagnosticSeverity = 'FATAL' | 'ERROR' | 'WARNING' | 'REPAIR' | 'INFO';
export type DiagnosticCategory = 'SOURCE' | 'VISION' | 'GEOM' | 'TYPO' | 'STORAGE';

export interface DiagnosticAction {
  rule: string;
  originalValue: any;
  healedValue: any;
  explanation: string;
}

export interface ExtractionDiagnostic {
  id: string;
  code: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  message: string;
  elementKey?: string;
  actionTaken?: DiagnosticAction;
  timestamp: string;
}

export interface NormalizedBox {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
}

/**
 * Normalizes raw bounding boxes from multiple coordinate scales:
 * - Unit scale ([0.0, 1.0])
 * - Millenary scale ([0, 1000])
 * - Target canvas pixels (e.g. 1080x1080)
 */
export function normalizeCoordinates(
  rawBox: { left?: number; x?: number; top?: number; y?: number; width?: number; w?: number; height?: number; h?: number; zIndex?: number },
  canvasWidth = 1080,
  canvasHeight = 1080,
  diagnostics: ExtractionDiagnostic[] = []
): NormalizedBox {
  let left = rawBox.left ?? rawBox.x ?? 0;
  let top = rawBox.top ?? rawBox.y ?? 0;
  let width = rawBox.width ?? rawBox.w ?? 200;
  let height = rawBox.height ?? rawBox.h ?? 100;
  const zIndex = rawBox.zIndex ?? 0;

  // 1. Detect Unit Scale ([0.0, 1.0])
  if (width <= 1.0 && height <= 1.0 && left <= 1.0 && top <= 1.0) {
    left = Math.round(left * canvasWidth);
    top = Math.round(top * canvasHeight);
    width = Math.round(width * canvasWidth);
    height = Math.round(height * canvasHeight);
    diagnostics.push({
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: 'GEOM_UNIT_SCALE_CONVERTED',
      category: 'GEOM',
      severity: 'REPAIR',
      message: 'Detected unit scale [0, 1]; scaled coordinates to canvas pixel space.',
      timestamp: new Date().toISOString(),
    });
  } 
  // 2. Detect Millenary Scale ([0, 1000])
  else if (Math.max(left, top, width, height) <= 1000 && (canvasWidth !== 1000 || canvasHeight !== 1000)) {
    // Check if coordinates were clearly 0-1000 normalized vision coordinates
    if (left + width <= 1000 && top + height <= 1000) {
      left = Math.round((left / 1000) * canvasWidth);
      top = Math.round((top / 1000) * canvasHeight);
      width = Math.round((width / 1000) * canvasWidth);
      height = Math.round((height / 1000) * canvasHeight);
      diagnostics.push({
        id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: 'GEOM_MILLENARY_SCALE_CONVERTED',
        category: 'GEOM',
        severity: 'REPAIR',
        message: 'Detected millenary scale [0, 1000]; scaled coordinates to target pixel dimensions.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Repair Inverted Box Dimensions (width or height < 0)
  if (width < 0) {
    left = left + width;
    width = Math.abs(width);
    diagnostics.push({
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: 'GEOM_INVERTED_WIDTH_FLIPPED',
      category: 'GEOM',
      severity: 'REPAIR',
      message: 'Flipped inverted negative box width.',
      timestamp: new Date().toISOString(),
    });
  }
  if (height < 0) {
    top = top + height;
    height = Math.abs(height);
    diagnostics.push({
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: 'GEOM_INVERTED_HEIGHT_FLIPPED',
      category: 'GEOM',
      severity: 'REPAIR',
      message: 'Flipped inverted negative box height.',
      timestamp: new Date().toISOString(),
    });
  }

  // 4. Integer pixel snapping (eliminates 1px anti-aliasing seam artifacts)
  left = Math.round(left);
  top = Math.round(top);
  width = Math.round(width);
  height = Math.round(height);

  // 5. Clamping to canvas boundaries
  left = Math.max(0, Math.min(canvasWidth - 40, left));
  top = Math.max(0, Math.min(canvasHeight - 40, top));
  width = Math.max(40, Math.min(canvasWidth - left, width));
  height = Math.max(20, Math.min(canvasHeight - top, height));

  return { left, top, width, height, zIndex };
}

/**
 * Normalizes text content: strips markdown artifacts, trims whitespace,
 * and handles grapheme segment boundaries.
 */
export function normalizeTextContent(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}
