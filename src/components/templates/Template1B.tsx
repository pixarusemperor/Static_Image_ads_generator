import React from 'react';

export interface Template1BProps {
  topBackgroundImage?: string;
  productImage?: string;
  priceBadgeText?: string;
  title?: string;
  subtitle?: string;
  bodyParagraph?: string;
  footerText?: string;
  width?: number;
  height?: number;
}

export const Template1B: React.FC<Template1BProps> = ({
  topBackgroundImage = "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800",
  productImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  priceBadgeText = "PRIX 5.000F(10$)",
  title = "2 MINUTES AU LIT",
  subtitle = "C'EST RIDICULE",
  bodyParagraph = "Découvrez la méthode naturelle pour durer plus longtemps au lit sans aucun effet secondaire ni produit chimique.",
  footerText = "CA MARCHE SANS PRODUIT",
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
        backgroundColor: '#FFE600',
        position: 'relative',
        fontFamily: 'Inter',
      }}
    >
      {/* Top Background Image */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1080px',
          height: '500px',
          overflow: 'hidden',
          backgroundColor: '#F3F4F6',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={topBackgroundImage}
          alt="Top Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Book Cover Mockup on the right */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '780px',
          top: '380px',
          width: '230px',
          height: '330px',
          backgroundColor: '#E5E7EB',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage}
          alt="Product"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Green Price Badge capsule */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '740px',
          top: '740px',
          width: '310px',
          height: '64px',
          borderRadius: '32px',
          backgroundColor: '#00875A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '26px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {priceBadgeText}
        </span>
      </div>

      {/* Text column area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: '50px',
          top: '530px',
          width: '660px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            color: '#000000',
            fontSize: '56px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '10px',
          }}
        >
          {title.toUpperCase()}
        </span>
        <span
          style={{
            color: '#E50914',
            fontSize: '56px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '20px',
          }}
        >
          {subtitle.toUpperCase()}
        </span>
        <span
          style={{
            color: '#000000',
            fontSize: '26px',
            fontWeight: 'normal',
            lineHeight: 1.5,
          }}
        >
          {bodyParagraph}
        </span>
      </div>

      {/* Red Footer Rect */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: '960px',
          width: '1080px',
          height: '120px',
          backgroundColor: '#E50914',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '48px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {footerText.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
