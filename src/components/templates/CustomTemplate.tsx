import React from 'react';

export interface CanvasLayer {
  id: string;
  type: 'text' | 'image' | 'shape';
  name: string;
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
  fontWeight?: string; // 'normal' | 'bold' | '300' | '500' | '800'
  textAlign?: 'left' | 'center' | 'right';
  textBackgroundColor?: string;
  
  // Image specific
  imageUrl?: string;
  borderRadius?: number;
  
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

          if (layer.type === 'shape') {
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
                  borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : '0px',
                }}
              >
                <span />
              </div>
            );
          }

          if (layer.type === 'image') {
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
                  borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : '0px',
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
                    objectFit: 'cover',
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
                }}
              >
                <span
                  style={{
                    color: layer.color || '#FFFFFF',
                    fontSize: `${layer.fontSize || 32}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    textAlign: layer.textAlign || 'left',
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
