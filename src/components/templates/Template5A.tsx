import React from 'react';

export interface Template5AProps {
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  emoji?: string;
  width?: number;
  height?: number;
}

export const Template5A: React.FC<Template5AProps> = ({
  backgroundColor = "#55B23B",
  title = "DOUBLER VOS VENTES EN 90 JOURS",
  subtitle = "(SANS PAYER PLUS DE PUBLICITÉ)",
  emoji = "👇",
  width = 1080,
  height = 1080,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: 'Inter',
        padding: '100px',
      }}
    >
      {/* Title */}
      <span
        style={{
          color: '#FFFFFF',
          fontSize: '72px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: '1.2',
          marginBottom: '40px',
        }}
      >
        {title.toUpperCase()}
      </span>

      {/* Subtitle */}
      <span
        style={{
          color: '#FFFFFF',
          fontSize: '44px',
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: '1.4',
        }}
      >
        {subtitle}
      </span>

      {/* Symmetrical pointing hands at the bottom corners */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '80px',
          bottom: '80px',
          fontSize: '120px',
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: '80px',
          bottom: '80px',
          fontSize: '120px',
        }}
      >
        {emoji}
      </div>
    </div>
  );
};
