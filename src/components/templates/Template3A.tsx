import React from 'react';

export interface Template3AProps {
  backgroundImage?: string;
  productImage?: string;
  headline?: string;
  badgeText?: string;
  width?: number;
  height?: number;
}

export const Template3A: React.FC<Template3AProps> = ({
  backgroundImage = "https://images.unsplash.com/photo-1531256456869-ce942a665e80?w=1000",
  productImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  headline = "CE LIVRE A CHANGE MA VIE EN 30 JOURS",
  badgeText = "OFFRE EXCLUSIVE",
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
        position: 'relative',
        backgroundColor: '#000000',
        fontFamily: 'Inter',
      }}
    >
      {/* Background Image */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1080px',
          height: '1080px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt="Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Floating Badge (EXCLUSIVE) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '50px',
          right: '50px',
          backgroundColor: '#E50914',
          padding: '12px 24px',
          borderRadius: '8px',
          transform: 'rotate(5deg)',
        }}
      >
        <span style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold' }}>
          {badgeText.toUpperCase()}
        </span>
      </div>

      {/* Circular Product Inset */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '80px',
          top: '80px',
          width: '240px',
          height: '240px',
          borderRadius: '120px',
          border: '8px solid #FFE600',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage}
          alt="Product Thumbnail"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Bottom Text Bar Overlay */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '50px',
          bottom: '80px',
          width: '980px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '30px 40px',
          borderRadius: '16px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '42px',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: '1.3',
          }}
        >
          {headline.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
