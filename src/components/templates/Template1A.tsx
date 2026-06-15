import React from 'react';

export interface Template1AProps {
  headerLine1?: string;
  headerLine2?: string;
  subjectImage?: string; // base64 or URL
  productImage?: string; // base64 or URL
  priceBadgeText?: string;
  footerLine1?: string;
  footerLine2?: string;
  width?: number;
  height?: number;
}

export const Template1A: React.FC<Template1AProps> = ({
  headerLine1 = "TU VERSES LE LIQUIDE VITE",
  headerLine2 = "2 MINUTES? TU ES FAIBLE?",
  subjectImage = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500",
  productImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  priceBadgeText = "PRIX 5.000F(10$)",
  footerLine1 = "LIS LA METHODE ET APPLIQUES",
  footerLine2 = "PAS BESOIN DE FAIRE LE SPORT",
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
        backgroundColor: '#FFFFFF',
        position: 'relative',
        fontFamily: 'Inter',
      }}
    >
      {/* Header Banner 1 */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1080px',
          height: '100px',
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '44px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {headerLine1.toUpperCase()}
        </span>
      </div>

      {/* Header Banner 2 */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: '100px',
          width: '1080px',
          height: '110px',
          backgroundColor: '#E50914',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '52px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {headerLine2.toUpperCase()}
        </span>
      </div>

      {/* Subject Image (Rounded corners) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '80px',
          top: '240px',
          width: '520px',
          height: '620px',
          borderRadius: '30px',
          overflow: 'hidden',
          backgroundColor: '#F3F4F6',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={subjectImage}
          alt="Subject"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Product Image */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '660px',
          top: '300px',
          width: '330px',
          height: '460px',
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

      {/* Price Badge */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '650px',
          top: '780px',
          width: '350px',
          height: '70px',
          borderRadius: '15px',
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFE600',
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {priceBadgeText}
        </span>
      </div>

      {/* Footer Banner 1 */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: '880px',
          width: '1080px',
          height: '90px',
          backgroundColor: '#E50914',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {footerLine1.toUpperCase()}
        </span>
      </div>

      {/* Footer Line 2 */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: '970px',
          width: '1080px',
          height: '110px',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <span
          style={{
            color: '#E50914',
            fontSize: '44px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {footerLine2.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
