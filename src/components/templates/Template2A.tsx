import React from 'react';

export interface Template2AProps {
  backgroundImage?: string;
  logoUrl?: string; // base64 or URL
  logoPosition?: 'left' | 'right';
  hasAvatar?: boolean;
  avatarUrl?: string;
  headline?: string; // e.g. "CETTE HABITUDE [TUE] VOTRE CELLULE"
  highlightColor?: string; // e.g. "#E50914" (Red) or "#00875A" (Green)
  width?: number;
  height?: number;
}

export const Template2A: React.FC<Template2AProps> = ({
  backgroundImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000",
  logoUrl = "",
  logoPosition = 'left',
  hasAvatar = false,
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  headline = "CETTE HABITUDE [TUE] APPRIVOISEE PAR LA SCIENCE",
  highlightColor = "#E50914",
  width = 1080,
  height = 1080,
}) => {
  const parseHeadline = (text: string) => {
    const parts: { text: string; highlight: boolean }[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), highlight: false });
      }
      parts.push({ text: match[1], highlight: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false });
    }

    if (parts.length === 0) {
      parts.push({ text, highlight: false });
    }

    return parts;
  };

  const headlineParts = parseHeadline(headline);

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

      {/* Dark Bottom Gradient Overlay */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '1080px',
          height: '450px',
          backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Brand Logo Overlay */}
      {logoUrl && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '50px',
            [logoPosition === 'left' ? 'left' : 'right']: '50px',
            height: '50px',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo"
            style={{
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {!logoUrl && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '50px',
            [logoPosition === 'left' ? 'left' : 'right']: '50px',
            backgroundColor: '#000000',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
            NEWS
          </span>
        </div>
      )}

      {/* Circular Avatar Inset */}
      {hasAvatar && avatarUrl && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: '80px',
            bottom: '380px',
            width: '160px',
            height: '160px',
            borderRadius: '80px',
            border: '6px solid #FFFFFF',
            overflow: 'hidden',
            backgroundColor: '#E5E7EB',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Bottom Headline with Highlights */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          position: 'absolute',
          left: '80px',
          bottom: '80px',
          width: '920px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {headlineParts.map((part, index) => {
          if (part.highlight) {
            return (
              <span
                key={index}
                style={{
                  backgroundColor: highlightColor,
                  color: '#FFFFFF',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  padding: '6px 14px',
                  margin: '4px 8px',
                  borderRadius: '4px',
                  lineHeight: '1.2',
                }}
              >
                {part.text.toUpperCase()}
              </span>
            );
          }
          return (
            <span
              key={index}
              style={{
                color: '#FFFFFF',
                fontSize: '48px',
                fontWeight: 'bold',
                margin: '4px 8px',
                lineHeight: '1.2',
              }}
            >
              {part.text.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
