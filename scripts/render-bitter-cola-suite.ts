import fs from 'fs';
import path from 'path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { TemplateHDRedCircle } from '../src/components/templates/TemplateHDRedCircle';
import { TemplateHDBreakingNews } from '../src/components/templates/TemplateHDBreakingNews';
import { TemplateHDNativeAlert } from '../src/components/templates/TemplateHDNativeAlert';
import { Template5A } from '../src/components/templates/Template5A';
import { Template1B } from '../src/components/templates/Template1B';
import { resolveImageToBase64 } from '../src/utils/image';
import { getFontBuffers } from '../src/utils/fonts';

async function renderBitterColaSuite() {
  console.log('🚀 Starting Bitter Cola Attack Ad Packs Rendering...\n');

  const fonts = await getFontBuffers();
  const baseDir = '/home/stevenjossu/erectile_dysfunction_sandha_oil/working_ads/ad_packs';

  // Base64 images from generator assets
  const speakerBase64 = await resolveImageToBase64('subject_speaker.png');
  const mysteryBase64 = await resolveImageToBase64('33.png');
  const zuckBase64 = await resolveImageToBase64('zuck_news_bg.jpg');
  const coupleBase64 = await resolveImageToBase64('subject_couple.png');
  const bookBase64 = await resolveImageToBase64('product_resistor_book.png');

  const packs = [
    {
      folder: 'ad_pack_06_bitter_cola_tabloid_news',
      name: 'Format 1 : Tabloid Medical Exposé',
      templateId: 'hd-breaking-news',
      element: React.createElement(TemplateHDBreakingNews, {
        backgroundImage: zuckBase64,
        alertBadgeText: 'ALERTE SANTÉ',
        headline: 'ENQUÊTE MÉDICALE : [LE BITTER COLA] NE RÉPARE PAS LA CIRCULATION PELVIENNE',
        subtitle: "Les biochimistes révèlent comment ce mélange populaire bloque l'apport sanguin en provoquant un pic d'adrénaline vasoconstricteur.",
        sourceText: 'OBSERVATOIRE DE LA SANTÉ VASCULAIRE · ÉTUDE CLINIQUE',
        width: 1080,
        height: 1080,
      }),
    },
    {
      folder: 'ad_pack_07_bitter_cola_forensic_red_circle',
      name: 'Format 2 : Sabri Suby Forensic Marker',
      templateId: 'hd-red-circle',
      element: React.createElement(TemplateHDRedCircle, {
        subjectImage: speakerBase64,
        mysteryImage: mysteryBase64,
        headlineWhite: 'ARRÊTEZ DE CROQUER CECI :',
        headlineYellow: 'LE PIÈGE QUI VERROUILLE LA MICRO-CIRCULATION',
        circlePos: { cx: 740, cy: 370, r: 135 },
        arrowPath: { start: [640, 430], end: [340, 530], curvature: -45 },
        footerReassurance: 'RAPPORT CARDIOVASCULAIRE · DIFFUSION RESTREINTE',
        width: 1080,
        height: 1080,
      }),
    },
    {
      folder: 'ad_pack_08_bitter_cola_native_sms_alert',
      name: 'Format 3 : Leaked Urologist WhatsApp Alert',
      templateId: 'hd-native-alert',
      element: React.createElement(TemplateHDNativeAlert, {
        backgroundImage: coupleBase64,
        senderName: 'Dr. Mensah (Urologie)',
        timestamp: "Aujourd'hui 17:42",
        messageText: "Stoppez la Guinness et le bitter cola ! Votre prise de sang montre un pic d'adrénaline et une gastrite aiguë. Vos vaisseaux pelviens sont juste calcifiés, ils ont besoin d'être assouplis localement, pas agressés par voie orale.",
        calloutBadge: 'ALERTE MÉDICALE VÉRIFIÉE',
        bottomNotice: 'Touchez pour lire l\'échange complet sur WhatsApp • Échange 100% Anonyme',
        width: 1080,
        height: 1080,
      }),
    },
    {
      folder: 'ad_pack_09_bitter_cola_brutalist_typo',
      name: 'Format 4 : Brutalist Typographic Pattern-Interrupt',
      templateId: '5-a',
      element: React.createElement(Template5A, {
        backgroundColor: '#8B0000',
        title: 'CROQUER DU BITTER COLA NE RÉPARERA JAMAIS LA PANNE',
        subtitle: '(VOICI CE QUE LES VENDEURS DE RUE VOUS CACHENT DEPUIS DES ANNÉES)',
        emoji: '👇',
        width: 1080,
        height: 1080,
      }),
    },
    {
      folder: 'ad_pack_10_bitter_cola_comparative_split',
      name: 'Format 5 : Direct-Response Comparative Split Card',
      templateId: '1-b',
      element: React.createElement(Template1B, {
        topBackgroundImage: speakerBase64,
        productImage: bookBase64,
        priceBadgeText: 'RAPPORT OFFERT (WHATSAPP)',
        title: '2 MINUTES AU LIT ?',
        subtitle: 'LE PIÈGE DU BITTER COLA DÉVOILÉ',
        bodyParagraph: 'Découvrez pourquoi avaler des décoctions amères ne peut pas déboucher les micro-artères de votre bas-bassin, et quelle approche ciblée réactive la fermeté durable.',
        footerText: 'PROTOCOLE SANS EFFET SECONDAIRE NI RISQUE CARDIAQUE',
        width: 1080,
        height: 1080,
      }),
    },
  ];

  for (const pack of packs) {
    const packDir = path.join(baseDir, pack.folder);
    if (!fs.existsSync(packDir)) {
      fs.mkdirSync(packDir, { recursive: true });
    }

    console.log(`🎨 Rendering [${pack.templateId}] for ${pack.folder}...`);

    const svg = await satori(pack.element, {
      width: 1080,
      height: 1080,
      fonts: [
        {
          name: 'Inter',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1080 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const outputPath = path.join(packDir, 'ad_creative.png');
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`   ✓ Saved: ${outputPath} (${pngBuffer.length} bytes)`);
  }

  console.log('\n✅ All 5 Bitter Cola creatives rendered successfully!');
}

renderBitterColaSuite().catch((err) => {
  console.error('❌ Error rendering suite:', err);
  process.exit(1);
});
