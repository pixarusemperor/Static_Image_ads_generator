import React from 'react';

export interface TemplateHDNativeAlertProps {
  backgroundImage?: string;
  senderName?: string;
  timestamp?: string;
  messageText?: string;
  calloutBadge?: string;
  bottomNotice?: string;
  width?: number;
  height?: number;
}

export const TemplateHDNativeAlert: React.FC<TemplateHDNativeAlertProps> = ({
  backgroundImage = '/templates/assets/subject_couple.png',
  senderName = 'Dr. Koffi',
  timestamp = 'Today 2:45 PM',
  messageText = "The new batch cleared the test group in 48 hours. We recorded a 94.2% success rate with zero side effects. Do not leak this yet!",
  calloutBadge = 'VERIFIED SMS ALERT',
  bottomNotice = 'Tap to view full message thread • 100% Confidential',
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
        backgroundColor: '#000000',
        position: 'relative',
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      {/* 1. Full-Bleed Candid Lifestyle Photo Background */}
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
          alt="Candid Lifestyle"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 2. Soft Dark Gradient Overlays for Pop */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${width}px`,
          height: '350px',
          backgroundImage:
            'linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 60%, rgba(0, 0, 0, 0) 100%)',
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: `${width}px`,
          height: '250px',
          backgroundImage:
            'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* 3. Drop Shadow Underlay for Floating iOS Alert Card */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '76px',
          left: '64px',
          width: `${width - 128}px`,
          height: '260px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '30px',
        }}
      />

      {/* 4. Floating iOS Translucent Alert Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: '70px',
          left: '60px',
          width: `${width - 120}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '30px',
          padding: '24px 32px',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
        }}
      >
        {/* Top App Header Row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          {/* Left App Icon & Tag */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Green iOS Message Bubble Icon */}
            <div
              style={{
                display: 'flex',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#34C759',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '12px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: 'flex' }}
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <span
              style={{
                color: '#4B5563',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              MESSAGES
            </span>
            <span
              style={{
                color: '#9CA3AF',
                fontSize: '18px',
                margin: '0 8px',
              }}
            >
              •
            </span>
            <span
              style={{
                color: '#059669',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              {calloutBadge.toUpperCase()}
            </span>
          </div>

          {/* Right Timestamp */}
          <span
            style={{
              color: '#6B7280',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            {timestamp}
          </span>
        </div>

        {/* Sender Name with Avatar and Verified Check */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          {/* Avatar Icon */}
          <div
            style={{
              display: 'flex',
              width: '42px',
              height: '42px',
              borderRadius: '21px',
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '12px',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              {senderName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Sender Text */}
          <span
            style={{
              color: '#111827',
              fontSize: '26px',
              fontWeight: 'bold',
              marginRight: '8px',
            }}
          >
            {senderName}
          </span>

          {/* Blue Verified Badge */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: 'flex' }}
          >
            <circle cx="12" cy="12" r="10" fill="#3B82F6" />
            <path
              d="M9 12l2 2 4-4"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Message Content Bubble */}
        <div
          style={{
            display: 'flex',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              color: '#1F2937',
              fontSize: '30px',
              fontWeight: 500,
              lineHeight: '1.35',
            }}
          >
            {messageText}
          </span>
        </div>
      </div>

      {/* 5. Bottom Tap Callout Pill */}
      {bottomNotice && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 0,
            bottom: '50px',
            width: `${width}px`,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderRadius: '32px',
              padding: '14px 32px',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              style={{
                color: '#FFE500',
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              {bottomNotice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
