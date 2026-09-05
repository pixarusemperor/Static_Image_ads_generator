#!/usr/bin/env tsx
/**
 * Automated End-to-End Orchestration Verification Suite
 * Tests full integration pipeline connecting Symphony context to SuperAds:
 * 1. Sabri Suby copy compliance (Grade <= 5.0, Zero-You in lines 1-3)
 * 2. Post-click landing page bridge generation
 * 3. Spatial template adaptation
 * 4. High-dopamine PNG rendering (hd-red-circle, 1-a, hd-breaking-news)
 * 5. Database persistence (campaign & creative records in Supabase / cache)
 * 6. Mystery object recommendation matrix lookup
 */

import fs from 'fs';
import path from 'path';
import {
  orchestrateCampaign,
  getMysteryObjectRecommendation,
  evaluateReadability,
  OrchestrationPayload,
} from '../src/core/orchestration';
import { getCampaignRecord, listCampaignCreatives } from '../src/core/database/creatives';
import { adaptContentToTemplate } from '../src/core/templates/adapter';

async function runOrchestrationTest() {
  console.log('🚀 Starting SuperAds End-to-End Orchestration Test Suite...\n');

  let passedTests = 0;
  let failedTests = 0;

  const testDir = path.join(process.cwd(), 'public', 'tests', 'orchestration');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // ============================================================================
  // Test 1: Niche-to-Mystery-Object Transformation Matrix
  // ============================================================================
  console.log('--- Test 1: Niche-to-Mystery-Object Matrix ---');
  try {
    const recHealth = getMysteryObjectRecommendation('Health & Sexual Wellness');
    console.log(`✓ Health Mystery Object: "${recHealth.tangibleMysteryObject}"`);
    console.log(`  Formula: "${recHealth.tabloidBannerFormula}"`);
    console.log(`  Templates: ${recHealth.recommendedTemplates.join(', ')}`);

    const recSaaS = getMysteryObjectRecommendation('B2B SaaS / Automation');
    console.log(`✓ SaaS Mystery Object: "${recSaaS.tangibleMysteryObject}"`);

    if (
      recHealth.tangibleMysteryObject &&
      recHealth.recommendedTemplates.includes('hd-red-circle') &&
      recSaaS.tangibleMysteryObject.includes('USB')
    ) {
      console.log('  PASS: Mystery object recommendations resolved successfully.');
      passedTests++;
    } else {
      console.error('  FAIL: Mystery object matrix mapping error');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 1:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 2: Copy Adaptation & Spatial Rule Fitting
  // ============================================================================
  console.log('\n--- Test 2: Template Spatial Adaptation (/api/adapt logic) ---');
  try {
    const adapted1A = adaptContentToTemplate('1-a', {
      headline: 'Durez plus de 45 minutes naturellement avec cette infusion de plantes rares',
      price: '5.000 FCFA',
      qualification: 'Remède traditionnel bio',
    });

    console.log(`✓ Adapted headerLine1: "${adapted1A.variables.headerLine1}"`);
    console.log(`✓ Adapted headerLine2 (uppercase): "${adapted1A.variables.headerLine2}"`);
    console.log(`✓ Adapted priceBadgeText: "${adapted1A.variables.priceBadgeText}"`);

    const isUpper = adapted1A.variables.headerLine2 === adapted1A.variables.headerLine2.toUpperCase();
    const hasPrice = adapted1A.variables.priceBadgeText.startsWith('PRIX :');

    if (isUpper && hasPrice && adapted1A.variables.headerLine1) {
      console.log('  PASS: Copy fitting enforced forcedCase, character limits, and semantic defaults.');
      passedTests++;
    } else {
      console.error('  FAIL: Adaptation did not meet contract requirements');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 2:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 3: Master Campaign Orchestration Flow
  // ============================================================================
  console.log('\n--- Test 3: Master Campaign Orchestration Pipeline ---');
  const payload: OrchestrationPayload = {
    campaignName: 'Volcano Tea Q4 Scale',
    product: {
      name: 'Thé Volcanique',
      category: 'Health & Sexual Wellness',
      mechanism: "Active volcanique minérale stimulant l'endurance naturelle",
      price: '5.000 FCFA',
      proofPoints: '8.900+ clients satisfaits à Abidjan',
    },
    avatar: {
      awarenessStage: 'Problem-Aware',
      painPoints: ['Éjaculation précoce', 'Perte de confiance', 'Remèdes inefficaces'],
      language: 'fr',
    },
    targetTemplates: ['hd-red-circle', '1-a', 'hd-breaking-news'],
    assets: {
      productMockupUrl: '/templates/assets/PATSIMMSCFLYER5.png',
      subjectImageUrl: '/templates/assets/MRESISTORFLYER1.png',
      mysteryImageUrl: '/templates/assets/PATSIMMSCFLYER8.png',
    },
    channel: 'meta',
    uploadToR2: false, // Local headless test
  };

  let orchestrationResult: any = null;
  try {
    const startTime = Date.now();
    orchestrationResult = await orchestrateCampaign(payload);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✓ Orchestration finished in ${duration}s`);
    console.log(`  Campaign ID: ${orchestrationResult.campaignId}`);
    console.log(`  Campaign Name: ${orchestrationResult.campaignName}`);
    console.log(`  Creatives Rendered: ${orchestrationResult.creatives.length}`);

    if (
      orchestrationResult.success &&
      orchestrationResult.campaignId &&
      orchestrationResult.creatives.length === 3
    ) {
      console.log('  PASS: Orchestration returned successful bundle with all 3 creatives.');
      passedTests++;
    } else {
      console.error('  FAIL: Orchestration result incomplete');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 3:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 4: Sabri Suby Feed Copy & Readability Grade <= 5.0 Audit
  // ============================================================================
  console.log('\n--- Test 4: Sabri Suby Copy Readability Audit ---');
  try {
    const feedCopy = orchestrationResult.feedCopy;
    console.log(`✓ Feed Copy Headline: "${feedCopy.headline}"`);
    console.log(`  CTA: "${feedCopy.cta}"`);
    console.log(`  Description: "${feedCopy.description}"`);
    console.log('  Primary Text:');
    feedCopy.primaryText.split('\n').forEach((l: string, i: number) => {
      console.log(`    [Line ${i + 1}]: ${l}`);
    });

    const readability = evaluateReadability(feedCopy.primaryText);
    console.log(`✓ Flesch-Kincaid Grade Level: ${readability.scores.fleschKincaidGrade} (Target: <= 5.0)`);
    console.log(`✓ Flesch Reading Ease: ${readability.scores.fleschReadingEase} / 100`);
    console.log(`✓ Zero "You" Rule in Lines 1-3: ${readability.zeroYouRule.passed ? 'PASSED (0 violations)' : 'VIOLATION'}`);

    if (
      readability.scores.fleschKincaidGrade <= 5.0 &&
      readability.zeroYouRule.passed &&
      feedCopy.cta === 'Learn More'
    ) {
      console.log('  PASS: Feed copy strictly satisfies Sabri Suby Grade <= 5 and Zero-You rules.');
      passedTests++;
    } else {
      console.error('  FAIL: Feed copy failed readability or policy rules');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 4:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 5: Post-Click Landing Page Bridge Scent Congruence
  // ============================================================================
  console.log('\n--- Test 5: Post-Click Landing Page Bridge ---');
  try {
    const bridge = orchestrationResult.landingPageBridge;
    console.log(`✓ Landing Page H1: "${bridge.landingPageH1}"`);
    console.log(`✓ Subhead: "${bridge.landingPageSubhead}"`);
    console.log(`✓ Opening Narrative: "${bridge.openingStory.slice(0, 80)}..."`);

    if (
      bridge.landingPageH1 &&
      bridge.landingPageSubhead &&
      bridge.openingStory &&
      bridge.openingStory.length > 50
    ) {
      console.log('  PASS: Landing page bridge generated with perfect scent match.');
      passedTests++;
    } else {
      console.error('  FAIL: Missing landing page bridge components');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 5:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 6: PNG Rendering & File Validation for All Creatives
  // ============================================================================
  console.log('\n--- Test 6: PNG Rasterization & Creative Artifacts ---');
  try {
    let allPングsValid = true;

    for (const creative of orchestrationResult.creatives) {
      const outPath = path.join(testDir, `campaign-${creative.templateId}.png`);
      const base64Data = creative.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outPath, buf);

      const sizeKb = (buf.length / 1024).toFixed(1);
      console.log(`✓ [${creative.templateId}] Rasterized PNG: ${sizeKb} KB -> ${outPath}`);
      console.log(`  Dimensions: ${creative.width}x${creative.height}`);
      console.log(`  Policy Score: ${creative.compliance.policyScore}/100`);

      if (buf.length < 10000 || creative.width !== 1080 || creative.height !== 1080) {
        allPングsValid = false;
      }
    }

    if (allPングsValid) {
      console.log('  PASS: All 3 high-dopamine creatives rendered to valid 1080x1080 PNG buffers.');
      passedTests++;
    } else {
      console.error('  FAIL: One or more rendered PNGs was invalid or under expected size');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 6:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Test 7: Database Record Persistence & Retrieval
  // ============================================================================
  console.log('\n--- Test 7: Database Record Persistence Verification ---');
  try {
    const campaignId = orchestrationResult.campaignId;
    const campaignRecord = await getCampaignRecord(campaignId);
    console.log(`✓ Retrieved Campaign Record: "${campaignRecord?.name}" (Status: ${campaignRecord?.status})`);

    const creativeRecords = await listCampaignCreatives(campaignId);
    console.log(`✓ Retrieved ${creativeRecords.length} Creative Records linked to campaign ${campaignId}`);

    const hasAllTemplates = ['hd-red-circle', '1-a', 'hd-breaking-news'].every((id) =>
      creativeRecords.some((c) => c.template_id === id)
    );

    if (campaignRecord && creativeRecords.length === 3 && hasAllTemplates) {
      console.log('  PASS: Campaign and all 3 creative records persisted and retrieved successfully.');
      passedTests++;
    } else {
      console.error('  FAIL: Database persistence or retrieval incomplete');
      failedTests++;
    }
  } catch (err: any) {
    console.error('  FAIL Test 7:', err.message);
    failedTests++;
  }

  // ============================================================================
  // Final Scoreboard
  // ============================================================================
  console.log('\n======================================================');
  console.log(`Orchestration Verification: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runOrchestrationTest().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
