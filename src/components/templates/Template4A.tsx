import React from 'react';

export interface Template4AProps {
  headerTitle?: string;
  bodyImage?: string;
  flagBadgeUrl?: string; // e.g. flag of Cameroon, Senegal, etc.
  footerSalary?: string;
  footerCommissions?: string;
  width?: number;
  height?: number;
}

export const Template4A: React.FC<Template4AProps> = ({
  headerTitle = "RECRUTEMENT TELEVENTE",
  bodyImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000",
  flagBadgeUrl = "",
  footerSalary = "SALAIRE DE BASE: 150.000 F CFA",
  footerCommissions = "+ COMMISSIONS DEPLAFONNEES",
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
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1080px',
          height: '140px',
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '4px solid #E50914',
        }}
      >
        <span
          style={{
            color: '#E50914',
            fontSize: '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: '1px',
          }}
        >
          {headerTitle.toUpperCase()}
        </span>
      </div>

      {/* Centered Corporate Image */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '80px',
          top: '180px',
          width: '920px',
          height: '600px',
          overflow: 'hidden',
          backgroundColor: '#F3F4F6',
          borderRadius: '16px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bodyImage}
          alt="Recruitment Call Center"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Flag Badge Overlay inside Image */}
        {flagBadgeUrl && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '30px',
              left: '30px',
              width: '120px',
              height: '80px',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagBadgeUrl}
              alt="Flag Badge"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: '80px',
          bottom: '60px',
          width: '920px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#000000',
            fontSize: '44px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px',
          }}
        >
          {footerSalary.toUpperCase()}
        </span>
        <span
          style={{
            color: '#E50914',
            fontSize: '38px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {footerCommissions.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
