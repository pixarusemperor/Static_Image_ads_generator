import React from 'react';

export interface TemplateHDRedCircleProps {
  subjectImage?: string;
  mysteryImage?: string;
  headlineWhite?: string;
  headlineYellow?: string;
  circlePos?: { cx: number; cy: number; r: number };
  arrowPath?: { start: [number, number]; end: [number, number]; curvature?: number };
  footerReassurance?: string;
  width?: number;
  height?: number;
}

/**
 * Generates an organic, hand-drawn circle path simulating a human phone markup stroke.
 * Loops slightly past 360 degrees to mimic the overlapping tail of human handwriting.
 */
function generateImperfectCirclePath(cx: number, cy: number, r: number, phase = 0): string {
  const points: string[] = [];
  const steps = 36;
  // Draw ~395 degrees (2 * PI + 0.6 rad) so the tail overlaps naturally
  const totalAngle = Math.PI * 2 + 0.65;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = phase + t * totalAngle;
    // Multi-frequency harmonic wobble + slight eccentricity
    const wobble =
      Math.sin(angle * 3) * (r * 0.032) +
      Math.cos(angle * 5) * (r * 0.02) +
      Math.sin(angle) * (r * 0.015);
    const radius = r + wobble;
    const x = (cx + radius * Math.cos(angle)).toFixed(1);
    const y = (cy + radius * Math.sin(angle)).toFixed(1);

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  return points.join(' ');
}

/**
 * Computes quadratic Bezier curve and arrowhead paths with hand-drawn jitter offsets.
 */
function computeJitterArrow(
  start: [number, number],
  end: [number, number],
  curvature: number = -45
) {
  const [sx, sy] = start;
  const [ex, ey] = end;

  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.hypot(dx, dy) || 1;

  // Unit normal vector perpendicular to chord
  const nx = -dy / dist;
  const ny = dx / dist;

  // Midpoint with curve perpendicular offset
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const cpx = mx + nx * curvature;
  const cpy = my + ny * curvature;

  // Arrowhead tangent at end (vector from control point to end)
  const tx = ex - cpx;
  const ty = ey - cpy;
  const angle = Math.atan2(ty, tx);

  const arrowLength = 32;
  const spread = Math.PI / 6.5; // ~28 degrees

  const w1x = ex - arrowLength * Math.cos(angle - spread);
  const w1y = ey - arrowLength * Math.sin(angle - spread);
  const w2x = ex - arrowLength * Math.cos(angle + spread);
  const w2y = ey - arrowLength * Math.sin(angle + spread);

  // Main paths
  const mainCurve = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  const mainHead = `M ${w1x.toFixed(1)} ${w1y.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)} L ${w2x.toFixed(1)} ${w2y.toFixed(1)}`;

  // Slight jitter/marker duplicate stroke
  const jcpx = cpx + nx * 3 + 1;
  const jcpy = cpy + ny * 3 - 1;
  const jitterCurve = `M ${(sx + 1).toFixed(1)} ${(sy - 1).toFixed(1)} Q ${jcpx.toFixed(1)} ${jcpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;

  // Drop shadow underlay (+3, +3)
  const shadowCurve = `M ${(sx + 2).toFixed(1)} ${(sy + 3).toFixed(1)} Q ${(cpx + 2).toFixed(1)} ${(cpy + 3).toFixed(1)} ${(ex + 2).toFixed(1)} ${(ey + 3).toFixed(1)}`;
  const shadowHead = `M ${(w1x + 2).toFixed(1)} ${(w1y + 3).toFixed(1)} L ${(ex + 2).toFixed(1)} ${(ey + 3).toFixed(1)} L ${(w2x + 2).toFixed(1)} ${(w2y + 3).toFixed(1)}`;

  return {
    mainCurve,
    mainHead,
    jitterCurve,
    shadowCurve,
    shadowHead,
  };
}

export const TemplateHDRedCircle: React.FC<TemplateHDRedCircleProps> = ({
  subjectImage = '/templates/assets/subject_speaker.png',
  mysteryImage = '/templates/assets/33.png',
  headlineWhite = 'DATA LEAK:',
  headlineYellow = 'WHY TOP AGENCIES ARE HIDING THIS PROTOCOL',
  circlePos = { cx: 780, cy: 360, r: 130 },
  arrowPath = { start: [670, 420], end: [360, 520], curvature: -45 },
  footerReassurance = 'CONFIDENTIAL REPORT · SOURCE: INTERNAL AUDIT',
  width = 1080,
  height = 1080,
}) => {
  const { cx, cy, r } = circlePos;
  const { start, end, curvature = -45 } = arrowPath;

  // Generate hand-drawn circle paths (base shadow, primary marker, and organic jitter)
  const circleMainPath = generateImperfectCirclePath(cx, cy, r, 0.4);
  const circleJitterPath = generateImperfectCirclePath(cx, cy, r + 1, 0.8);
  const circleShadowPath = generateImperfectCirclePath(cx + 2, cy + 3, r, 0.4);

  // Generate jitter arrow paths
  const arrow = computeJitterArrow(start, end, curvature);

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
      {/* 1. Full Bleed Subject Background Photo */}
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
          src={subjectImage}
          alt="Subject"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 2. Atmospheric Contrast Overlay (Soft Vignette) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage:
            'linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.45) 75%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />

      {/* 3. Circular Mystery Detail Inset */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: `${cx - r}px`,
          top: `${cy - r}px`,
          width: `${r * 2}px`,
          height: `${r * 2}px`,
          borderRadius: `${r}px`,
          overflow: 'hidden',
          backgroundColor: '#1E1E1E',
          border: '4px solid #FFFFFF',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mysteryImage}
          alt="Mystery Detail"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 4. Native Satori SVG Overlay: Imperfect Red Circle & Curved Jitter Arrow */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'flex',
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* --- Circle Shadow & Strokes --- */}
        <path
          d={circleShadowPath}
          stroke="rgba(0, 0, 0, 0.4)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={circleMainPath}
          stroke="#E50914"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={circleJitterPath}
          stroke="#FF2B36"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.8}
        />

        {/* --- Arrow Shadow & Strokes --- */}
        {/* Drop Shadow */}
        <path
          d={arrow.shadowCurve}
          stroke="rgba(0, 0, 0, 0.4)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={arrow.shadowHead}
          stroke="rgba(0, 0, 0, 0.4)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Main Marker Stroke */}
        <path
          d={arrow.mainCurve}
          stroke="#E50914"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={arrow.mainHead}
          stroke="#E50914"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Jitter Overlay Stroke for Phone Marker Realism */}
        <path
          d={arrow.jitterCurve}
          stroke="#FF3838"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.85}
        />
      </svg>

      {/* 5. Tabloid Breaking News Banner at Bottom 20-25% */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: `${width}px`,
          height: '240px',
          backgroundColor: '#0F0F0F',
          borderTop: '5px solid #E50914',
          padding: '24px 36px',
          justifyContent: 'center',
        }}
      >
        {/* Reassurance / News Strip */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: '#E50914',
              padding: '4px 12px',
              borderRadius: '4px',
              marginRight: '14px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '1.5px',
              }}
            >
              INVESTIGATION
            </span>
          </div>
          {footerReassurance && (
            <span
              style={{
                color: '#94A3B8',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              {footerReassurance.toUpperCase()}
            </span>
          )}
        </div>

        {/* Chromatic Headline Text Split (White Lead + Vibrant Tabloid Yellow) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '44px',
              fontWeight: 'bold',
              lineHeight: '1.15',
              marginRight: '12px',
            }}
          >
            {headlineWhite.toUpperCase()}
          </span>
          <span
            style={{
              color: '#FFE500',
              fontSize: '44px',
              fontWeight: 'bold',
              lineHeight: '1.15',
            }}
          >
            {headlineYellow.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
