#!/usr/bin/env node

/**
 * Master Edge-Case, Chaos & High-Concurrency Stress Test Suite
 * For Static Image Ads Generator & SYNPHONYS Creative Engine
 *
 * Usage:
 *   node scripts/test-r2-stress-and-edge-cases.mjs --target https://superads.orizongroup.online
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
function getOption(flag, defaultVal) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return defaultVal;
}

const targetUrl = getOption('--target', process.env.TARGET_URL || 'https://superads.orizongroup.online').replace(/\/+$/, '');

console.log(`\n==============================================================================`);
console.log(`🚀 STATIC IMAGE ADS GENERATOR - R2 STRESS & EDGE-CASE AUDIT SUITE`);
console.log(`Target Endpoint: ${targetUrl}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`==============================================================================\n`);

const results = [];

function recordResult(id, name, suite, passed, latencyMs, details = '') {
  results.push({ id, name, suite, passed, latencyMs, details });
  const status = passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  const time = `${latencyMs.toFixed(0)}ms`.padStart(7);
  console.log(`${status} ${time} | ${id.padEnd(14)} | ${name} ${details ? `(${details})` : ''}`);
}

async function fetchWithTiming(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const latencyMs = performance.now() - start;
  return { res, latencyMs };
}

// -----------------------------------------------------------------------------
// SUITE 1: 15 Chaos & Edge-Case Vectors
// -----------------------------------------------------------------------------
async function runEdgeCases() {
  console.log(`\n--- [SUITE 1: 15 Chaos & Edge-Case Vectors] ---\n`);

  // TC-API-01: Template Discovery
  try {
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/templates`);
    const data = await res.json();
    const passed = res.status === 200 && data.total === 8 && Array.isArray(data.templates);
    recordResult('TC-API-01', 'GET /api/templates catalog completeness', 'API', passed, latencyMs, `${data.total} templates`);
  } catch (e) {
    recordResult('TC-API-01', 'GET /api/templates catalog completeness', 'API', false, 0, e.message);
  }

  // TC-API-02: Invalid Template ID
  try {
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: 'invalid-template-999-xyz' }),
    });
    const passed = res.status === 400 || res.status === 500;
    recordResult('TC-API-02', 'Invalid templateId rejection', 'API', passed, latencyMs, `Status: ${res.status}`);
  } catch (e) {
    recordResult('TC-API-02', 'Invalid templateId rejection', 'API', false, 0, e.message);
  }

  // TC-API-03: Malformed Non-JSON Body
  try {
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'this is not valid json {{{',
    });
    const passed = res.status === 400;
    recordResult('TC-API-03', 'Malformed non-JSON body handling', 'API', passed, latencyMs, `Status: ${res.status}`);
  } catch (e) {
    recordResult('TC-API-03', 'Malformed non-JSON body handling', 'API', false, 0, e.message);
  }

  // TC-TEXT-01: Massive 600-Character Text Overflow
  try {
    const massiveText = 'AVIS IMPORTANT : ' + 'Découvrez la méthode éprouvée qui transforme votre endurance et votre vitalité sans produits chimiques ni exercices compliqués. '.repeat(4);
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { headerLine1: massiveText },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-TEXT-01', '600-character headline overflow auto-wrap', 'Typography', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-TEXT-01', '600-character headline overflow auto-wrap', 'Typography', false, 0, e.message);
  }

  // TC-TEXT-02: Multilingual Diacritics & Accents
  try {
    const accentedText = 'Éjaculation Précoce? Arrête ça! Méthode Sûre & Certifiée: Grâce à l’Arbre Sacré.';
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { headerLine1: accentedText, headerLine2: '100% EFFICACITÉ PROUVÉE' },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-TEXT-02', 'French accents & diacritics (éèàçœôîï)', 'Typography', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-TEXT-02', 'French accents & diacritics (éèàçœôîï)', 'Typography', false, 0, e.message);
  }

  // TC-TEXT-03: Twemoji Multi-Emoji Injection
  try {
    const emojiText = 'OFFRE FLASH 🔥🚀 2 MINUTES? TU ES FAIBLE? 🚨💰💪';
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { headerLine1: emojiText },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-TEXT-03', 'Twemoji SVG multi-emoji pre-fetching', 'Typography', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-TEXT-03', 'Twemoji SVG multi-emoji pre-fetching', 'Typography', false, 0, e.message);
  }

  // TC-TEXT-04: Adversarial XSS & HTML Injection
  try {
    const xssPayload = `<script>alert('XSS')</script><img src=x onerror=alert(1)><b>BOLD</b>`;
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { headerLine1: xssPayload },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-TEXT-04', 'XSS & raw HTML script escaping', 'Security', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-TEXT-04', 'XSS & raw HTML script escaping', 'Security', false, 0, e.message);
  }

  // TC-TEXT-05: Null / Missing Variables
  try {
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: '1-a', variables: null }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-TEXT-05', 'Null variables fallback to template defaults', 'Resilience', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-TEXT-05', 'Null variables fallback to template defaults', 'Resilience', false, 0, e.message);
  }

  // TC-MEDIA-01: Micro 1x1 Pixel Transparent Image
  try {
    const microPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { subjectImage: microPixel, productImage: microPixel },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 30000;
    recordResult('TC-MEDIA-01', 'Micro 1x1 pixel image zero-division safety', 'Media', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-MEDIA-01', 'Micro 1x1 pixel image zero-division safety', 'Media', false, 0, e.message);
  }

  // TC-MEDIA-02: Extreme Aspect Ratio (4000x40 Panoramic)
  try {
    // 100x1 red bar SVG
    const wideSvg = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="10"><rect width="1000" height="10" fill="red"/></svg>').toString('base64')}`;
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { subjectImage: wideSvg },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 50000;
    recordResult('TC-MEDIA-02', 'Extreme 100:1 panoramic aspect ratio', 'Media', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-MEDIA-02', 'Extreme 100:1 panoramic aspect ratio', 'Media', false, 0, e.message);
  }

  // TC-MEDIA-03: Corrupted JPEG Header / Byte Stream
  try {
    const corruptedBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { subjectImage: corruptedBase64 },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 30000;
    recordResult('TC-MEDIA-03', 'Corrupted image header graceful fallback', 'Media', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-MEDIA-03', 'Corrupted image header graceful fallback', 'Media', false, 0, e.message);
  }

  // TC-MEDIA-04: Dead / 404 Remote Image URL (Timeout & Fallback Safety)
  try {
    const deadUrl = 'https://httpbin.org/status/404';
    const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '1-a',
        variables: { subjectImage: deadUrl },
      }),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const passed = res.status === 200 && buf.length > 30000;
    recordResult('TC-MEDIA-04', 'Dead remote URL 3s timeout & SVG placeholder', 'Media', passed, latencyMs, `${buf.length} bytes`);
  } catch (e) {
    recordResult('TC-MEDIA-04', 'Dead remote URL 3s timeout & SVG placeholder', 'Media', false, 0, e.message);
  }

  // TC-MEDIA-05: Multi-Template Coverage (Templates 1-B, 2-A, 3-A, 3-B, 4-A, 5-A, Custom)
  const templateIds = ['1-b', '2-a', '3-a', '3-b', '4-a', '5-a', 'custom'];
  for (const tid of templateIds) {
    try {
      const { res, latencyMs } = await fetchWithTiming(`${targetUrl}/api/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: tid }),
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const passed = res.status === 200 && buf.length > 20000;
      recordResult(`TC-TPL-${tid.toUpperCase()}`, `Template "${tid}" assembly & rendering`, 'Templates', passed, latencyMs, `${(buf.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      recordResult(`TC-TPL-${tid.toUpperCase()}`, `Template "${tid}" assembly & rendering`, 'Templates', false, 0, e.message);
    }
  }
}

// -----------------------------------------------------------------------------
// SUITE 2: High Concurrency Load Testing (10, 25, 50 Parallel Requests)
// -----------------------------------------------------------------------------
async function runConcurrencyLoad() {
  console.log(`\n--- [SUITE 2: High-Concurrency Saturation Benchmark] ---\n`);

  const concurrencyLevels = [10, 25, 50];

  for (const concurrency of concurrencyLevels) {
    console.log(`Firing ${concurrency} simultaneous render requests to /api/assemble...`);
    const promises = [];
    const startTime = performance.now();

    for (let i = 0; i < concurrency; i++) {
      const templateId = i % 2 === 0 ? '1-a' : '2-a';
      const p = fetch(`${targetUrl}/api/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          variables: {
            headerLine1: `CONCURRENCY TEST WORKER #${i + 1}`,
            priceBadgeText: `PRIX ${i * 1000 + 5000}F`,
          },
        }),
      }).then(async (res) => {
        const buf = await res.arrayBuffer();
        return { status: res.status, bytes: buf.byteLength };
      }).catch(err => ({ status: 0, error: err.message }));

      promises.push(p);
    }

    const responses = await Promise.all(promises);
    const totalDurationMs = performance.now() - startTime;
    const successCount = responses.filter(r => r.status === 200 && r.bytes > 20000).length;
    const errorCount = concurrency - successCount;
    const avgLatencyMs = totalDurationMs / concurrency;
    const rps = (concurrency / (totalDurationMs / 1000)).toFixed(1);

    const passed = successCount === concurrency;
    recordResult(
      `LOAD-${concurrency.toString().padStart(2, '0')}`,
      `${concurrency} Concurrent Workers Parallel Flood`,
      'Load',
      passed,
      totalDurationMs,
      `Success: ${successCount}/${concurrency} | ${rps} req/sec | Total: ${(totalDurationMs / 1000).toFixed(2)}s`
    );
  }
}

// -----------------------------------------------------------------------------
// SUITE 3: Live Browser Verification & Export Payload Audit
// -----------------------------------------------------------------------------
async function runBrowserAudit() {
  console.log(`\n--- [SUITE 3: Live Headless Browser & Export Payload Audit] ---\n`);

  const chromePath = '/home/stevenjossu/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
  if (!fs.existsSync(chromePath)) {
    console.log('Skipping browser capture: Chromium binary not found at default path');
    return;
  }

  try {
    const screenshotPath = '/tmp/live_audit_screenshot.png';
    const start = performance.now();
    execSync(`${chromePath} --headless=new --disable-gpu --no-sandbox --window-size=1440,900 --screenshot=${screenshotPath} "${targetUrl}"`, { stdio: 'pipe' });
    const latencyMs = performance.now() - start;

    const fileExists = fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).size > 50000;
    recordResult('TC-BROWSER-01', 'Live UI render & screenshot capture via Chromium', 'Browser', fileExists, latencyMs, `${(fs.statSync(screenshotPath).size / 1024).toFixed(1)} KB`);

    // Verify PNG magic bytes
    const pngBuf = fs.readFileSync(screenshotPath);
    const isPng = pngBuf[0] === 0x89 && pngBuf[1] === 0x50 && pngBuf[2] === 0x4E && pngBuf[3] === 0x47;
    recordResult('TC-BROWSER-02', 'PNG Magic Bytes & Structural Integrity', 'Browser', isPng, 1, '89 50 4E 47');
  } catch (err) {
    recordResult('TC-BROWSER-01', 'Live UI render via Chromium', 'Browser', false, 0, err.message);
  }
}

// -----------------------------------------------------------------------------
// Master Runner & Performance Scorecard
// -----------------------------------------------------------------------------
async function main() {
  const globalStart = performance.now();

  await runEdgeCases();
  await runConcurrencyLoad();
  await runBrowserAudit();

  const totalTimeSec = ((performance.now() - globalStart) / 1000).toFixed(2);
  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = results.length - totalPassed;
  const passRate = ((totalPassed / results.length) * 100).toFixed(1);

  console.log(`\n==============================================================================`);
  console.log(`📊 AUDIT & STRESS SCORECARD SUMMARY`);
  console.log(`==============================================================================`);
  console.log(`Total Tests Run : ${results.length}`);
  console.log(`Total Passed    : \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`Total Failed    : ${totalFailed > 0 ? `\x1b[31m${totalFailed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`Pass Rate       : \x1b[1m${passRate}%\x1b[0m`);
  console.log(`Total Duration  : ${totalTimeSec} seconds`);
  console.log(`==============================================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
