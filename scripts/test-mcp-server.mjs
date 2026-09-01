#!/usr/bin/env node

/**
 * Automated Verification Suite for Static Ads MCP Server
 * Tests JSON-RPC 2.0 stdio transport across all 5 exposed tools.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting MCP Server Verification Suite...\n');

const mcpProcess = spawn('node', ['scripts/mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let messageId = 1;
const pendingRequests = new Map();
let buffer = '';

mcpProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep remainder

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
    } catch (err) {
      console.warn('Failed to parse stdout line as JSON:', line);
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
      reject(new Error(`Request id ${id} (${method}) timed out after 30s`));
    }, 30000);

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
    if (tools.length === 5) {
      console.log('  PASS: All 5 tools registered correctly.');
      passedCount++;
    } else {
      console.error(`  FAIL: Expected 5 tools, got ${tools.length}`);
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
    if (parsed.count >= 2) {
      console.log('  PASS: Template listing works with category filters.');
      passedCount++;
    } else {
      console.error('  FAIL: Expected >= 2 direct-response templates');
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
    console.log(`  Fields: ${parsed.fields.map(f => f.name).join(', ')}`);
    if (parsed.fields.length >= 7) {
      console.log('  PASS: Template details inspection returned full schema and defaults.');
      passedCount++;
    } else {
      console.error('  FAIL: Missing expected fields');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 3:', err.message);
    failedCount++;
  }

  // Test 4: Call tool validate_ad_copy
  console.log('\n--- Test 4: tools/call validate_ad_copy ---');
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
    console.error('  FAIL Test 4:', err.message);
    failedCount++;
  }

  // Test 5: Call tool render_ad
  console.log('\n--- Test 5: tools/call render_ad ---');
  const testOutputPath = path.resolve('./output/test-mcp-ad.png');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'render_ad',
      arguments: {
        templateId: '1-a',
        variables: {
          headerLine1: 'MCP SERVER LIVE TEST CREATIVE',
          headerLine2: 'COMMANDEZ DIRECTEMENT PAR MCP',
          priceBadgeText: 'PRIX SPECIAL 5.000 FCFA',
        },
        outputPath: testOutputPath,
      },
    });
    const parsed = JSON.parse(res?.content?.[0]?.text);
    console.log(`✓ Render result: Success=${parsed.success}, Saved=${parsed.localSavedPath}, Size=${parsed.approxSizeKb} KB`);
    if (fs.existsSync(testOutputPath) && fs.statSync(testOutputPath).size > 10000) {
      console.log(`  PASS: Rendered ad written to disk (${(fs.statSync(testOutputPath).size / 1024).toFixed(1)} KB).`);
      passedCount++;
    } else {
      console.error('  FAIL: Rendered output file missing or empty');
      failedCount++;
    }
  } catch (err) {
    console.error('  FAIL Test 5:', err.message);
    failedCount++;
  }

  // Test 6: Call tool batch_render_campaign
  console.log('\n--- Test 6: tools/call batch_render_campaign ---');
  try {
    const res = await sendJsonRpc('tools/call', {
      name: 'batch_render_campaign',
      arguments: {
        manifest: [
          {
            templateId: '1-a',
            variables: { headerLine1: 'CAMPAIGN VARIATION 1' },
            outputName: 'mcp-batch-var-1.png',
          },
          {
            templateId: '3-a',
            variables: { headline: 'CAMPAIGN VARIATION 2 FLASH SALE' },
            outputName: 'mcp-batch-var-2.png',
          },
        ],
        outputDir: './output/mcp-batch-test',
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
    console.error('  FAIL Test 6:', err.message);
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
