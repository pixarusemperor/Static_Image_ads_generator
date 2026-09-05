import React from 'react';

export interface CanvasLayer {
  id: string;
  type: 'text' | 'image' | 'shape';
  name: string;
  role?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  opacity?: number;
  
  // Text specific
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string; // 'normal' | 'bold' | '300' | '500' | '700' | '800'
  textAlign?: 'left' | 'center' | 'right';
  textBackgroundColor?: string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Image specific
  imageUrl?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  
  // Shape specific
  shapeType?: 'rect' | 'circle';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface CustomTemplateProps {
  layers?: CanvasLayer[];
  canvasBgColor?: string;
  canvasBgImage?: string;
  width?: number;
  height?: number;
}

export const CustomTemplate: React.FC<CustomTemplateProps> = ({
  layers = [],
  canvasBgColor = '#0f172a',
  width = 1080,
  height = 1080,
}) => {
  const sortedLayers = Array.isArray(layers)
    ? [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: canvasBgColor || '#0f172a',
        position: 'relative',
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      {sortedLayers
        .map((layer) => {
          if (!layer) return null;

          const layerOpacity = typeof layer.opacity === 'number' ? Math.max(0, Math.min(1, layer.opacity)) : 1;

          if (layer.type === 'shape') {
            const isCircle = layer.shapeType === 'circle';
            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: `${layer.left}px`,
                  top: `${layer.top}px`,
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                  backgroundColor: layer.backgroundColor || '#1e293b',
                  borderRadius: isCircle ? '50%' : (layer.borderRadius ? `${layer.borderRadius}px` : '0px'),
                  borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : undefined,
                  borderStyle: layer.borderWidth ? 'solid' : undefined,
                  borderColor: layer.borderColor || undefined,
                  opacity: layerOpacity,
                }}
              />
            );
          }

          if (layer.type === 'image') {
            const isCircle = layer.shapeType === 'circle';
            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: `${layer.left}px`,
                  top: `${layer.top}px`,
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                  borderRadius: isCircle ? '50%' : (layer.borderRadius ? `${layer.borderRadius}px` : '0px'),
                  borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : undefined,
                  borderStyle: layer.borderWidth ? 'solid' : undefined,
                  borderColor: layer.borderColor || undefined,
                  opacity: layerOpacity,
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={layer.imageUrl || '/templates/assets/30.png'}
                  alt={layer.name || 'image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: layer.objectFit || 'cover',
                  }}
                />
              </div>
            );
          }

          if (layer.type === 'text') {
            const isBold =
              layer.fontWeight === 'bold' ||
              layer.fontWeight === '700' ||
              layer.fontWeight === '800';
            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: `${layer.left}px`,
                  top: `${layer.top}px`,
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                  justifyContent:
                    layer.textAlign === 'center'
                      ? 'center'
                      : layer.textAlign === 'right'
                      ? 'flex-end'
                      : 'flex-start',
                  alignItems: 'center',
                  backgroundColor: layer.textBackgroundColor || 'transparent',
                  borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : '0px',
                  opacity: layerOpacity,
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    color: layer.color || '#FFFFFF',
                    fontSize: `${layer.fontSize || 32}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    textAlign: layer.textAlign || 'left',
                    textTransform: layer.textTransform || 'none',
                    lineHeight: layer.lineHeight ? `${layer.lineHeight}` : 1.2,
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {layer.text || ''}
                </span>
              </div>
            );
          }

          return null;
        })
        .filter(Boolean)}
    </div>
  );
};

