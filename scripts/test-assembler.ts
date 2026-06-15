import fs from 'fs';
import path from 'path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { Template1B } from '../src/components/templates/Template1B';
import { resolveImageToBase64 } from '../src/utils/image';
import { getFontBuffers } from '../src/utils/fonts';

async function test() {
  console.log('Starting assembler test...');

  try {
    // 1. Load fonts
    console.log('Loading fonts...');
    const fonts = await getFontBuffers();

    // 2. Resolve image paths to base64 Data URLs
    console.log('Resolving images...');
    const topBgBase64 = await resolveImageToBase64('32.png');
    const productBase64 = await resolveImageToBase64('33.png');

    console.log('Images resolved to base64 successfully.');

    // 3. Render React component to SVG
    console.log('Rendering Template 1-B to SVG using Satori...');
    const width = 1080;
    const height = 1080;

    const element = React.createElement(Template1B, {
      topBackgroundImage: topBgBase64,
      productImage: productBase64,
      priceBadgeText: 'PRIX: 5.000 F (10$)',
      title: '2 MINUTES AU LIT',
      subtitle: "C'EST RIDICULE",
      bodyParagraph: 'Découvrez la méthode naturelle pour durer plus longtemps au lit sans aucun effet secondaire ni produit chimique.',
      footerText: 'CA MARCHE SANS PRODUIT',
      width,
      height,
    });

    const svg = await satori(element, {
      width,
      height,
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

    console.log('SVG generated successfully.');

    // 4. Convert SVG to PNG using Resvg
    console.log('Converting SVG to PNG using resvg-js...');
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: width,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 5. Ensure output directory exists and save the file
    const outputDir = path.join(__dirname, '../public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'test-variant.png');
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`PNG ad variant saved successfully at: ${outputPath}`);

  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

test();
