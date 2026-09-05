import { extractContractFromAST } from './src/core/contracts/extractor.ts';
import { recordTokenUsage, getTokenAnalyticsSummary } from './src/utils/token-tracker.ts';
import { saveDynamicTemplate, getDynamicTemplate, listDynamicTemplates } from './src/core/templates/storage.ts';
import { renderAdToPng } from './src/core/renderer/engine.ts';
import fs from 'fs';

async function runTests() {
  console.log('=== STARTING AUTOMATED DYNAMIC PIPELINE VERIFICATION ===\n');

  // Test 1: Dynamic 3-Sigma Contract Extraction
  console.log('Test 1: Dynamic 3-Sigma Contract Extraction...');
  const mockAST = {
    canvasBgColor: '#0b0f19',
    layers: [
      {
        type: 'text',
        left: 80,
        top: 60,
        width: 920,
        height: 120,
        text: 'NOUVELLE FORMULE VOLCANIQUE NATURELLE',
        fontSize: 48,
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        left: 650,
        top: 800,
        width: 350,
        height: 80,
        text: 'PRIX : 5.000 FCFA',
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#facc15',
        rx: 16,
      },
      {
        type: 'image',
        left: 80,
        top: 220,
        width: 520,
        height: 600,
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      },
      {
        type: 'image',
        left: 660,
        top: 260,
        width: 340,
        height: 480,
        src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
      },
    ],
  };

  const extractionResult = extractContractFromAST(mockAST, 'test-template-v1', 'Volcano Tea Promo');
  console.log(`✓ Extracted contract with ${extractionResult.contract.elements.length} elements`);
  
  const headlineElement = extractionResult.contract.elements.find(e => e.type === 'text');
  console.log(`✓ Headline 3-Sigma Calculated Max Characters: ${headlineElement.textRules.maxCharacters}`);
  console.log(`✓ Diagnostics count: ${extractionResult.diagnostics.length}`);
  if (headlineElement.textRules.maxCharacters <= 0) {
    throw new Error('3-Sigma character limit calculation failed (returned <= 0)');
  }

  // Test 2: Dynamic Template Storage & Retrieval
  console.log('\nTest 2: Dynamic Template Storage & Retrieval...');
  const stored = await saveDynamicTemplate({
    id: extractionResult.contract.id,
    name: extractionResult.contract.name,
    category: extractionResult.contract.category,
    dimensions: extractionResult.contract.dimensions,
    contract: extractionResult.contract,
    defaultVariables: extractionResult.defaultVariables,
    layers: mockAST.layers.map((l, i) => ({ id: `layer_${i + 1}`, ...l })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log(`✓ Saved dynamic template "${stored.id}" to cache and disk`);

  const retrieved = await getDynamicTemplate('test-template-v1');
  if (!retrieved || retrieved.id !== 'test-template-v1') {
    throw new Error('Failed to retrieve dynamic template from storage');
  }
  console.log(`✓ Successfully retrieved stored template: ${retrieved.name}`);

  const allTemplates = await listDynamicTemplates();
  console.log(`✓ Stored templates total count: ${allTemplates.length}`);

  // Test 3: Dynamic Ad Headless Rendering via CustomTemplate
  console.log('\nTest 3: Headless Rendering via CustomTemplate...');
  const renderResult = await renderAdToPng('test-template-v1', {
    layers: [
      {
        id: 'layer_1',
        type: 'text',
        left: 80,
        top: 60,
        width: 920,
        height: 120,
        text: 'STOP L\'ÉJACULATION PRÉCOCE IMMÉDIATEMENT',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#facc15',
      },
      {
        id: 'layer_2',
        type: 'shape',
        shapeType: 'circle',
        left: 650,
        top: 800,
        width: 80,
        height: 80,
        backgroundColor: '#ef4444',
      },
    ],
  });
  console.log(`✓ Rendered PNG Buffer size: ${renderResult.pngBuffer.length} bytes`);
  if (renderResult.pngBuffer.length < 1000) {
    throw new Error('PNG buffer too small (rendering error)');
  }

  // Test 4: App-Wide Token Consumption & Cost Tracking
  console.log('\nTest 4: Token Consumption Ledger & Cost Tracking...');
  recordTokenUsage({
    model: 'gemini-2.5-flash',
    promptTokens: 1420,
    completionTokens: 380,
    task: 'contract_extraction',
    source: 'hermes',
    durationMs: 412,
  });

  recordTokenUsage({
    model: 'gemini-2.5-flash',
    promptTokens: 890,
    completionTokens: 210,
    task: 'image_analysis',
    source: 'mcp',
    durationMs: 310,
  });

  const summary = getTokenAnalyticsSummary();
  console.log(`✓ Total Tokens Tracked: ${summary.totals.totalTokens}`);
  console.log(`✓ Total Estimated Cost: $${summary.totals.totalCostUsd.toFixed(6)} USD`);
  console.log(`✓ Hermes Requests: ${summary.bySource['hermes']?.requests || 0}`);
  console.log(`✓ MCP Requests: ${summary.bySource['mcp']?.requests || 0}`);

  if (summary.totals.totalTokens < 2900 || summary.totals.totalCostUsd <= 0) {
    throw new Error('Token tracker aggregation failed');
  }

  console.log('\n=== ALL AUTOMATED DYNAMIC PIPELINE TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error('\n✗ TEST FAILED:', err);
  process.exit(1);
});
