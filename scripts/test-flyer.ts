import fs from 'fs';
import path from 'path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { Template5A } from '../src/components/templates/Template5A';
import { getFontBuffers } from '../src/utils/fonts';

const emojiCache: Record<string, string> = {};

async function runTest() {
  console.log('Running Template 5-A Satori test...');
  try {
    const fonts = await getFontBuffers();
    const width = 1080;
    const height = 1080;

    // Test 1: Simple Title only
    console.log('Test 1: Render Template 5-A with dynamic graphemeImages...');

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F09F}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2B50}\u{263A}\u{26A1}\u{2705}]/gu;
    const graphemeImages: Record<string, string> = {};
    
    // We will test with a title, subtitle, and pointing down emoji 👇
    const testVariables = {
      title: "DOUBLER VOS VENTES EN 90 JOURS",
      subtitle: "(SANS PAYER PLUS DE PUBLICITÉ)",
      emoji: "👇",
    };

    // Parse all variables for emojis and pre-fetch them
    for (const key of Object.keys(testVariables)) {
      const val = (testVariables as any)[key];
      if (typeof val === 'string') {
        const matches = val.match(emojiRegex);
        if (matches) {
          for (const emoji of matches) {
            if (!graphemeImages[emoji]) {
              const codepoint = [...emoji]
                .map(char => char.codePointAt(0)!.toString(16))
                .filter(hex => hex !== 'fe0f')
                .join('-');

              console.log(`Pre-fetching emoji ${emoji} (codepoint: ${codepoint})...`);
              try {
                const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`;
                const response = await fetch(url);
                if (response.ok) {
                  const svgText = await response.text();
                  const base64 = Buffer.from(svgText).toString('base64');
                  graphemeImages[emoji] = `data:image/svg+xml;base64,${base64}`;
                  console.log(`Successfully cached base64 for ${emoji}`);
                } else {
                  console.error(`Failed to fetch emoji ${emoji}: ${response.statusText}`);
                }
              } catch (e: any) {
                console.error(`Error fetching emoji: ${e.message}`);
              }
            }
          }
        }
      }
    }

    const element1 = React.createElement(Template5A, {
      ...testVariables,
      width,
      height,
    });

    const svg1 = await satori(element1, {
      width,
      height,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
      ],
      graphemeImages,
    });

    console.log('Test 1 SVG generated successfully!');

    const resvg = new Resvg(svg1, {
      fitTo: { mode: 'width', value: width },
    });
    const pngBuffer = resvg.render().asPng();
    fs.writeFileSync('public/test-flyer-render.png', pngBuffer);
    console.log('Test 1 PNG saved successfully.');

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTest();
