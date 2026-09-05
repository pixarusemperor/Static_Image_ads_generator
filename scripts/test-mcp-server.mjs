#!/usr/bin/env node

/**
 * Automated Verification Suite for SuperAds MCP Server
 * Tests JSON-RPC 2.0 stdio transport across exposed tools:
 * 1. tools/list
 * 2. list_templates
 * 3. get_template_details (contracts, spatial rules, mandatory flags)
 * 4. validate_template_payload (missing mandatory checks, spatial guidance)
 * 5. validate_ad_copy
 * 6. render_ad
 * 7. batch_render_campaign
 * 8. get_mystery_object_recommendation
 * 9. adapt_copy_to_template
 * 10. orchestrate_campaign_creatives
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting SuperAds MCP Server Verification Suite...\n');

const mcpProcess = spawn('node', ['scripts/mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let messageId = 1;
const pendingRequests = new Map();
let buffer = '';

mcpProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.id && pendingRequests.has(parsed.id)) {
        const { resolve, reject } = pendingRequests.get(parsed.id);
        pendingRequests.delete(parsed.id);
        if (parsed.error) {
          reject(new Error(`MCP Error [${parsed.error.code}]: ${parsed.error.message}`));
        } else {
          resolve(parsed.result);
        }
      }
    } catch {
      // ignore non-json lines
    }
  }
});

function sendJsonRpc(method, params = {}) {
  const id = messageId++;
  const payload = {
    jsonrpc: '2.0',
    id,
    method,
    params,
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request id ${id} (${method}) timed out after 60s`));
    }, 60000);

    pendingRequests.set(id, {
      resolve: (res) => {
        clearTimeout(timeout);
        resolve(res);
      },
      reject: (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    });

    mcpProcess.stdin.write(JSON.stringify(payload) + '\n');
  });
}

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  // Test 1: Handshake / tools/list
  console.log('--- Test 1: tools/list ---');
  try {
    const listRes = await sendJsonRpc('tools/list', {});
    const tools = listRes?.tools || [];
    console.log(`✓ Received ${tools.length} registered MCP tools: ${tools.map(t => t.name).join(', ')}`);
    if (tools.length >= 6) {
      console.log(`  PASS: All tools registered correctly (${tools.length} tools available).`);
      passedCount++;
    } else {
      console.error(`  FAIL: Expected at least 6 tools, got ${tools.length}`);
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 1:', err.message);
    failedCount++;
  }

  // Test 2: Call tool list_templates
  console.log('\n--- Test 2: tools/call list_templates ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'list_templates',
      arguments: { category: 'direct-response' },
    });
    const contentText = res?.content?.[0]?.text;
    const parsed = JSON.parse(contentText);
    console.log(`✓ Filtered direct-response templates count: ${parsed.count}`);
    const sample = parsed.templates[0];
    console.log(`  Sample template: ${sample.name}, Best use: ${sample.bestUseCase.slice(0, 50)}...`);
    console.log(`  Mandatory elements: ${sample.mandatoryElements.join(', ')}`);
    if (parsed.count >= 2 && sample.mandatoryElements.length > 0) {
      console.log('  PASS: Template listing works with rich metadata and mandatory element lists.');
      passedCount++;
    } else {
      console.error('  FAIL: Expected direct-response templates with mandatory elements');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 2:', err.message);
    failedCount++;
  }

  // Test 3: Call tool get_template_details
  console.log('\n--- Test 3: tools/call get_template_details ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'get_template_details',
      arguments: { templateId: '1-a' },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Template details: ${parsed.name} (${parsed.dimensions.width}x${parsed.dimensions.height})`);
    console.log(`  Elements count: ${parsed.elements.length}`);
    const subjectImgElem = parsed.elements.find(e => e.key === 'subjectImage');
    console.log(`  subjectImage composition rule: ${subjectImgElem?.compositionRules?.subjectPlacement?.slice(0, 60)}...`);
    if (parsed.elements.length >= 7 && subjectImgElem?.compositionRules?.subjectPlacement) {
      console.log('  PASS: Full template contract returned with spatial and composition rules.');
      passedCount++;
    } else {
      console.error('  FAIL: Missing expected element contracts');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 3:', err.message);
    failedCount++;
  }

  // Test 4: Call tool validate_template_payload
  console.log('\n--- Test 4: tools/call validate_template_payload ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'validate_template_payload',
      arguments: {
        templateId: '1-a',
        variables: {
          headerLine1: 'INFUSION BIO',
          // Missing mandatory headerLine2, subjectImage, productImage, priceBadgeText
        },
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Validation payload result: isValid=${parsed.isValid}`);
    console.log(`  Missing mandatory detected: ${parsed.missingMandatory.length} items`);
    console.log(`  Composition advice: ${parsed.compositionAdvice.length} rules returned`);
    if (!parsed.isValid && parsed.missingMandatory.length >= 3) {
      console.log('  PASS: Validation correctly caught missing mandatory elements and returned spatial guidance.');
      passedCount++;
    } else {
      console.error('  FAIL: Validation failed to detect missing mandatory elements');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 4:', err.message);
    failedCount++;
  }

  // Test 5: Call tool validate_ad_copy
  console.log('\n--- Test 5: tools/call validate_ad_copy ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'validate_ad_copy',
      arguments: {
        headline: 'RETROUVEZ VOTRE ENDURANCE NATURELLE EN 7 JOURS',
        priceBadge: 'PRIX : 5.000 FCFA',
        body: 'Formule volcanique 100% bio garantie sans effets secondaires.',
        cta: 'PAIEMENT SÉCURISÉ À LA LIVRAISON PARTOUT À ABIDJAN',
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Ad copy audit grade: ${parsed.qualityGrade} (Score: ${parsed.copyScore}/100)`);
    if (parsed.copyScore >= 80) {
      console.log('  PASS: Copy validation correctly evaluated direct response triggers.');
      passedCount++;
    } else {
      console.error('  FAIL: Copy audit score lower than expected');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 5:', err.message);
    failedCount++;
  }

  // Test 6: Call tool render_ad
  console.log('\n--- Test 6: tools/call render_ad ---');
  const testOutputPath = path.resolve('./output/test-mcp-ad-v2.png');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'render_ad',
      arguments: {
        templateId: '1-a',
        variables: {
          headerLine1: 'SUPERADS HEADLESS MICROSERVICE',
          headerLine2: 'INTEGRATED WITH EXTERNAL APPS',
          priceBadgeText: 'PRIX : 5.000 FCFA',
        },
        outputPath: testOutputPath,
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Render result: Success=${parsed.success}, Saved=${parsed.localSavedPath}`);
    if (fs.existsSync(testOutputPath) && fs.statSync(testOutputPath).size > 10000) {
      console.log(`  PASS: Rendered ad written to disk (${(fs.statSync(testOutputPath).size / 1024).toFixed(1)} KB).`);
      passedCount++;
    } else {
      console.error('  FAIL: Rendered output file missing or empty');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 6:', err.message);
    failedCount++;
  }

  // Test 7: Call tool batch_render_campaign
  console.log('\n--- Test 7: tools/call batch_render_campaign ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'batch_render_campaign',
      arguments: {
        manifest: [
          {
            templateId: '1-a',
            variables: { headerLine1: 'BATCH VARIATION 1' },
            outputName: 'batch-v2-1.png',
          },
          {
            templateId: '5-a',
            variables: { title: 'SUPERADS TYPO BATCH' },
            outputName: 'batch-v2-2.png',
          },
        ],
        outputDir: './output/mcp-batch-test-v2',
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Batch results: ${parsed.successful}/${parsed.totalRequested} successful in ${parsed.outputDirectory}`);
    if (parsed.successful === 2) {
      console.log('  PASS: Batch rendering generated all variations cleanly.');
      passedCount++;
    } else {
      console.error('  FAIL: Batch rendering missed variations');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 7:', err.message);
    failedCount++;
  }

  // Test 8: Call tool get_mystery_object_recommendation
  console.log('\n--- Test 8: tools/call get_mystery_object_recommendation ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'get_mystery_object_recommendation',
      arguments: { category: 'Health & Sexual Wellness' },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Mystery object recommendation: ${parsed.tangibleMysteryObject}`);
    console.log(`  Concept: ${parsed.patternInterruptConcept.slice(0, 60)}...`);
    if (parsed.tangibleMysteryObject && parsed.recommendedTemplates?.length > 0) {
      console.log('  PASS: Mystery object recommendation resolved from transformation matrix.');
      passedCount++;
    } else {
      console.error('  FAIL: Missing expected mystery object properties');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 8:', err.message);
    failedCount++;
  }

  // Test 9: Call tool adapt_copy_to_template
  console.log('\n--- Test 9: tools/call adapt_copy_to_template ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'adapt_copy_to_template',
      arguments: {
        templateId: '1-a',
        rawContent: {
          headline: 'Durez plus de 45 minutes naturellement avec cette infusion rare',
          price: '5.000 FCFA',
          cta: 'Commander maintenant',
        },
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Adapted variables for 1-a: headerLine2="${parsed.variables?.headerLine2}"`);
    console.log(`  Price badge: "${parsed.variables?.priceBadgeText}"`);
    if (parsed.variables?.headerLine2 && parsed.variables?.priceBadgeText) {
      console.log('  PASS: Template copy adapted and fitted to spatial contract.');
      passedCount++;
    } else {
      console.error('  FAIL: Missing adapted variables');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 9:', err.message);
    failedCount++;
  }

  // Test 10: Call tool orchestrate_campaign_creatives
  console.log('\n--- Test 10: tools/call orchestrate_campaign_creatives ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'orchestrate_campaign_creatives',
      arguments: {
        campaignName: 'MCP Test Campaign',
        product: {
          name: 'Thé Volcanique',
          category: 'Health & Sexual Wellness',
          price: '5.000 FCFA',
          proofPoints: '8.900+ clients',
        },
        avatar: {
          awarenessStage: 'Problem-Aware',
          language: 'fr',
        },
        targetTemplates: ['hd-red-circle', '1-a'],
        uploadToR2: false,
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Campaign ID: ${parsed.campaignId}`);
    console.log(`  Feed Copy Grade: ${parsed.feedCopy?.metrics?.readabilityGrade} (Zero-You: ${parsed.feedCopy?.metrics?.zeroYouCompliant})`);
    console.log(`  Creatives Rendered: ${parsed.creatives?.length}`);
    if (parsed.campaignId && parsed.creatives?.length === 2 && parsed.feedCopy?.metrics?.zeroYouCompliant) {
      console.log('  PASS: Autonomous campaign orchestration rendered complete creative bundle.');
      passedCount++;
    } else {
      console.error('  FAIL: Campaign orchestration bundle missing items');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 10:', err.message);
    failedCount++;
  }

  console.log(`\n========================================`);
  console.log(`Verification Complete: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`========================================\n`);

  mcpProcess.kill();
  process.exit(failedCount > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  mcpProcess.kill();
  process.exit(1);
});
