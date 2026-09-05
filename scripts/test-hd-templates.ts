import fs from 'fs';
import path from 'path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { TemplateHDRedCircle } from '../src/components/templates/TemplateHDRedCircle';
import { TemplateHDBreakingNews } from '../src/components/templates/TemplateHDBreakingNews';
import { TemplateHDNativeAlert } from '../src/components/templates/TemplateHDNativeAlert';
import { resolveImageToBase64 } from '../src/utils/image';
import { getFontBuffers } from '../src/utils/fonts';

async function testHighDopamineTemplates() {
  console.log('🚀 Starting High-Dopamine Templates Assembler Verification...\n');

  try {
    // 1. Load fonts
    console.log('📦 Loading Inter font buffers...');
    const fonts = await getFontBuffers();

    // 2. Resolve sample images
    console.log('🖼️ Resolving sample images...');
    const speakerBase64 = await resolveImageToBase64('subject_speaker.png');
    const mysteryBase64 = await resolveImageToBase64('33.png');
    const zuckBase64 = await resolveImageToBase64('zuck_news_bg.jpg');
    const coupleBase64 = await resolveImageToBase64('subject_couple.png');

    const outputDir = path.join(__dirname, '../public/tests');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const templatesToTest = [
      {
        id: 'hd-red-circle',
        name: 'HD-1: Red Circle & Jitter Arrow',
        element: React.createElement(TemplateHDRedCircle, {
          subjectImage: speakerBase64,
          mysteryImage: mysteryBase64,
          headlineWhite: 'DATA LEAK:',
          headlineYellow: 'WHY TOP AGENCIES ARE HIDING THIS PROTOCOL',
          circlePos: { cx: 760, cy: 360, r: 130 },
          arrowPath: { start: [660, 410], end: [370, 510], curvature: -45 },
          footerReassurance: 'CONFIDENTIAL REPORT · SOURCE: INTERNAL AUDIT',
          width: 1080,
          height: 1080,
        }),
      },
      {
        id: 'hd-breaking-news',
        name: 'HD-2: Tabloid Breaking News Card',
        element: React.createElement(TemplateHDBreakingNews, {
          backgroundImage: zuckBase64,
          alertBadgeText: 'BREAKING NEWS',
          headline: 'LEAKED MEMO EXPOSES [42M ALGORITHM SHIFT] FORCING IMMEDIATE ACTION',
          subtitle: 'Independent audits confirm 3 out of 4 established accounts lost tracking visibility overnight.',
          sourceText: 'CONSUMER REPORT · INVESTIGATION',
          width: 1080,
          height: 1080,
        }),
      },
      {
        id: 'hd-native-alert',
        name: 'HD-3: Native SMS / Notification Overlay',
        element: React.createElement(TemplateHDNativeAlert, {
          backgroundImage: coupleBase64,
          senderName: 'Dr. Koffi',
          timestamp: 'Today 2:45 PM',
          messageText: "The new batch cleared the test group in 48 hours. We recorded a 94.2% success rate with zero side effects. Do not leak this yet!",
          calloutBadge: 'VERIFIED SMS ALERT',
          bottomNotice: 'Tap to view full message thread • 100% Confidential',
          width: 1080,
          height: 1080,
        }),
      },
    ];

    for (const tpl of templatesToTest) {
      console.log(`\n🎨 Testing [${tpl.id}] (${tpl.name})...`);

      // Satori render to SVG
      const svg = await satori(tpl.element, {
        width: 1080,
        height: 1080,
        fonts: [
          {
            name: 'Inter',
            data: fonts.regular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fonts.bold,
            weight: 700,
            style: 'normal',
          },
        ],
      });
      console.log(`   ✓ Satori SVG generated (${svg.length} bytes)`);

      // Resvg render to PNG
      const resvg = new Resvg(svg, {
        fitTo: {
          mode: 'width',
          value: 1080,
        },
      });
      const pngBuffer = resvg.render().asPng();
      const outputPath = path.join(outputDir, `${tpl.id}.png`);
      fs.writeFileSync(outputPath, pngBuffer);
      console.log(`   ✓ PNG rasterized & saved to: ${outputPath} (${pngBuffer.length} bytes)`);
    }

    console.log('\n✅ All 3 High-Dopamine Satori templates successfully verified end-to-end!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testHighDopamineTemplates();
