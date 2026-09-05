import React from 'react';

export interface TemplateHDBreakingNewsProps {
  backgroundImage?: string;
  alertBadgeText?: string;
  headline?: string;
  subtitle?: string;
  sourceText?: string;
  width?: number;
  height?: number;
}

export const TemplateHDBreakingNews: React.FC<TemplateHDBreakingNewsProps> = ({
  backgroundImage = '/templates/assets/zuck_news_bg.jpg',
  alertBadgeText = 'BREAKING NEWS',
  headline = 'LEAKED MEMO EXPOSES [42M ALGORITHM SHIFT] FORCING IMMEDIATE ACTION',
  subtitle = 'Independent audits confirm 3 out of 4 established accounts lost tracking visibility overnight.',
  sourceText = 'CONSUMER REPORT · INVESTIGATION',
  width = 1080,
  height = 1080,
}) => {
  // Parse bracketed highlights: e.g. [42M ALGORITHM SHIFT]
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
        backgroundColor: '#000000',
        position: 'relative',
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      {/* 1. Full-Bleed Atmospheric Background Image */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt="News Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 2. High-Contrast Bottom Gradient Vignette for Readability */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: `${width}px`,
          height: '620px',
          backgroundImage:
            'linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.88) 40%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* 3. Top High-Dopamine Alert Badge (Bright Red Pill) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '50px',
          left: '50px',
          backgroundColor: '#E50914',
          borderRadius: '32px',
          padding: '10px 24px',
          alignItems: 'center',
          border: '2px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Pulsing Red Dot / Broadcast Icon */}
        <div
          style={{
            display: 'flex',
            width: '14px',
            height: '14px',
            borderRadius: '7px',
            backgroundColor: '#FFFFFF',
            marginRight: '12px',
          }}
        />
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {alertBadgeText}
        </span>
      </div>

      {/* 4. Lower-Third News Ticker Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: '50px',
          bottom: '50px',
          width: `${width - 100}px`,
          backgroundColor: '#0D0D0D',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          overflow: 'hidden',
        }}
      >
        {/* Top Red Source Ticker Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#E50914',
            padding: '10px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {sourceText}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#000000',
              padding: '3px 10px',
              borderRadius: '4px',
            }}
          >
            <span
              style={{
                color: '#FFE500',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              LIVE BROADCAST
            </span>
          </div>
        </div>

        {/* Card Body: Massive Bold Sans-Serif Headline + Subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 30px',
          }}
        >
          {/* Massive Headline with Chromatic Yellow Highlights */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
            }}
          >
            {headlineParts.map((part, index) => {
              if (part.highlight) {
                return (
                  <span
                    key={index}
                    style={{
                      color: '#FFE500',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      lineHeight: '1.2',
                      marginRight: '10px',
                      backgroundColor: 'rgba(255, 229, 0, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
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
                    lineHeight: '1.2',
                    marginRight: '10px',
                  }}
                >
                  {part.text.toUpperCase()}
                </span>
              );
            })}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                display: 'flex',
                marginTop: '16px',
              }}
            >
              <span
                style={{
                  color: '#CBD5E1',
                  fontSize: '26px',
                  fontWeight: 'normal',
                  lineHeight: '1.38',
                }}
              >
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Live News Ticker Footer Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#FFE500',
              padding: '3px 8px',
              borderRadius: '4px',
              marginRight: '12px',
            }}
          >
            <span
              style={{
                color: '#000000',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              FLASH
            </span>
          </div>
          <span
            style={{
              color: '#94A3B8',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            Official report updated minutes ago · Documents available for public review
          </span>
        </div>
      </div>
    </div>
  );
};
