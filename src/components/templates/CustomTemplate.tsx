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
  canvasBgColor = '#FFFFFF',
  canvasBgImage = '',
  width = 1080,
  height = 1080,
}) => {
  const sortedLayers = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      style={{
        display: 'flex',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: canvasBgColor,
        backgroundImage: canvasBgImage ? `url(${canvasBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      {sortedLayers.map((layer) => {
        const commonStyle: React.CSSProperties = {
          display: 'flex',
          position: 'absolute',
          left: `${layer.left}px`,
          top: `${layer.top}px`,
          width: `${layer.width}px`,
          height: `${layer.height}px`,
          zIndex: layer.zIndex || 0,
          opacity: layer.opacity !== undefined ? layer.opacity : 1,
        };

        if (layer.type === 'shape') {
          const shapeStyle: React.CSSProperties = {
            ...commonStyle,
            backgroundColor: layer.backgroundColor || layer.color || '#000000',
            borderRadius: layer.shapeType === 'circle' ? '50%' : layer.borderRadius ? `${layer.borderRadius}px` : '0px',
            borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : '0px',
            borderColor: layer.borderColor || 'transparent',
            borderStyle: layer.borderWidth ? 'solid' : 'none',
          };
          return <div key={layer.id} style={shapeStyle} />;
        }

        if (layer.type === 'image') {
          const imageStyle: React.CSSProperties = {
            ...commonStyle,
            borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : '0px',
            overflow: 'hidden',
            backgroundColor: 'transparent',
          };
          return (
            <div key={layer.id} style={imageStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layer.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'}
                alt={layer.name}
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
          const isBold = layer.fontWeight === 'bold' || layer.fontWeight === '700' || layer.fontWeight === '800';
          const textStyle: React.CSSProperties = {
            ...commonStyle,
            color: layer.color || '#000000',
            fontSize: `${layer.fontSize || 32}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            textAlign: layer.textAlign || 'left',
            whiteSpace: 'pre-wrap',
            backgroundColor: layer.textBackgroundColor || 'transparent',
            borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : '0px',
            padding: layer.textBackgroundColor ? '10px 20px' : '0px',
          };
          return (
            <div key={layer.id} style={textStyle}>
              <span style={{ textAlign: layer.textAlign || 'left' }}>
                {layer.text}
              </span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
