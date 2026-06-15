import React from 'react';

export interface Template3BProps {
  backgroundImage?: string;
  postAuthor?: string;
  postHandle?: string;
  postAvatar?: string;
  postContent?: string;
  postStats?: string;
  width?: number;
  height?: number;
}

export const Template3B: React.FC<Template3BProps> = ({
  backgroundImage = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000",
  postAuthor = "Alex Hormozi",
  postHandle = "@AlexHormozi",
  postAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  postContent = "The biggest mistake people make in their 20s is thinking they have time. You don't. Work like someone is trying to take it all away from you.",
  postStats = "12.4k Likes • 2.1k Retweets",
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
            opacity: 0.85,
          }}
        />
      </div>

      {/* Floating White Social Post Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: '140px',
          top: '340px',
          width: '800px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
        }}
      >
        {/* Author Header */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '25px' }}>
          {/* Avatar */}
          <div
            style={{
              display: 'flex',
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              overflow: 'hidden',
              marginRight: '20px',
              backgroundColor: '#E5E7EB',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={postAvatar}
              alt={postAuthor}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Names */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#0F1419', fontSize: '28px', fontWeight: 'bold' }}>{postAuthor}</span>
            <span style={{ color: '#536471', fontSize: '22px' }}>{postHandle}</span>
          </div>
        </div>

        {/* Content */}
        <span
          style={{
            color: '#0F1419',
            fontSize: '32px',
            lineHeight: '1.4',
            marginBottom: '30px',
            fontWeight: 'normal',
          }}
        >
          {postContent}
        </span>

        {/* Separator line */}
        <div style={{ height: '1px', backgroundColor: '#EFF3F4', marginBottom: '20px' }} />

        {/* Stats */}
        <span style={{ color: '#536471', fontSize: '20px', fontWeight: 'bold' }}>{postStats}</span>
      </div>

      {/* Emoji Overlay */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: '780px',
          top: '640px',
          fontSize: '120px',
        }}
      >
        🔥
      </div>
    </div>
  );
};
