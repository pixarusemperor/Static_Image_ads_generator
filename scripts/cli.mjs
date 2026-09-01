#!/usr/bin/env node

/**
 * Static Ads CLI Tool for AI Agents & Terminal Automations
 * Part of the SYNPHONYS AI-Native Creative Engine
 *
 * Usage:
 *   node scripts/cli.mjs list
 *   node scripts/cli.mjs render --template 1-a --vars '{"headerLine1": "..."}' --output ad.png
 *   node scripts/cli.mjs batch --input ./campaign-variations.json --output-dir ./dist/
 *   node scripts/cli.mjs sync-r2 [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
Static Image Ads Generator CLI (SYNPHONYS Engine)

Commands:
  list                                List all templates and available schemas
  render --template <id> [options]    Render a single static ad to PNG
  batch --input <file> [options]      Batch render ad variations from JSON manifest
  sync-r2 [--dry-run]                 Synchronize templates and assets to Cloudflare R2

Options for 'render':
  --template, -t <id>                 Template ID (e.g. 1-a, 1-b, 2-a, 3-a, 3-b, 4-a, 5-a, custom)
  --vars, -v <json>                   JSON string or file path containing template variable overrides
  --output, -o <path>                 Destination path for the rendered PNG (default: ./ad-<id>.png)
  --endpoint <url>                    API endpoint (default: http://localhost:3000 or $ADS_API_URL)
  --upload-r2                         Upload rendered ad to Cloudflare R2 and output public URL

Options for 'batch':
  --input, -i <file>                  JSON file containing array of { templateId, variables, outputName }
  --output-dir, -d <dir>              Directory to save generated PNGs (default: ./output)
`);
}

function getOption(flag, shortFlag) {
  const idx = args.findIndex(a => a === flag || (shortFlag && a === shortFlag));
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const defaultEndpoint = process.env.ADS_API_URL || 'http://localhost:3000';

async function listTemplates(endpoint) {
  try {
    const res = await fetch(`${endpoint}/api/templates`);
    if (!res.ok) {
      throw new Error(`Failed to fetch templates: ${res.statusText}`);
    }
    const data = await res.json();
    console.log(`\nAvailable Templates (${data.total}):\n`);
    for (const t of data.templates) {
      console.log(`• [${t.id}] ${t.name} (${t.categoryLabel})`);
      console.log(`  Description: ${t.description}`);
      console.log(`  Dimensions: ${t.dimensions.width}x${t.dimensions.height}`);
      console.log(`  Fields: ${t.fields.map(f => f.name).join(', ')}`);
      console.log('');
    }
  } catch (err) {
    console.error('Error fetching template list:', err.message);
    process.exit(1);
  }
}

async function renderAd() {
  const templateId = getOption('--template', '-t');
  if (!templateId) {
    console.error('Error: --template <id> is required.');
    printUsage();
    process.exit(1);
  }

  const varsRaw = getOption('--vars', '-v') || '{}';
  let variables = {};
  if (fs.existsSync(varsRaw)) {
    variables = JSON.parse(fs.readFileSync(varsRaw, 'utf-8'));
  } else {
    try {
      variables = JSON.parse(varsRaw);
    } catch {
      console.error('Error: --vars must be valid JSON or a path to a JSON file.');
      process.exit(1);
    }
  }

  const endpoint = getOption('--endpoint') || defaultEndpoint;
  const outputPath = getOption('--output', '-o') || `./ad-${templateId}-${Date.now()}.png`;
  const uploadToR2 = hasFlag('--upload-r2');

  console.log(`Rendering template "${templateId}" via ${endpoint}...`);

  try {
    const res = await fetch(`${endpoint}/api/assemble`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(uploadToR2 ? { 'Accept': 'application/json' } : {})
      },
      body: JSON.stringify({
        templateId,
        variables,
        uploadToR2,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error (${res.status}): ${errBody}`);
    }

    if (uploadToR2) {
      const json = await res.json();
      console.log(`✓ Rendered & uploaded to R2!`);
      console.log(`  R2 CDN URL: ${json.r2Url}`);
      if (json.dataUrl) {
        const base64Data = json.dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
        console.log(`  Saved local copy to: ${outputPath}`);
      }
    } else {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Ad rendered successfully (${(buffer.length / 1024).toFixed(1)} KB)`);
      console.log(`  Saved to: ${outputPath}`);
    }
  } catch (err) {
    console.error('Render failed:', err.message);
    process.exit(1);
  }
}

async function batchRender() {
  const inputFile = getOption('--input', '-i');
  if (!inputFile || !fs.existsSync(inputFile)) {
    console.error('Error: --input <file> is required and must exist.');
    process.exit(1);
  }

  const outputDir = getOption('--output-dir', '-d') || './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const items = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  if (!Array.isArray(items)) {
    console.error('Error: Input JSON must be an array of ad configurations.');
    process.exit(1);
  }

  const endpoint = getOption('--endpoint') || defaultEndpoint;
  console.log(`Starting batch render of ${items.length} ads...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const templateId = item.templateId || '1-a';
    const outputName = item.outputName || `ad-${i + 1}-${templateId}.png`;
    const dest = path.join(outputDir, outputName);

    console.log(`[${i + 1}/${items.length}] Rendering ${templateId} -> ${outputName}...`);
    try {
      const res = await fetch(`${endpoint}/api/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          variables: item.variables || {},
        }),
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`  ✓ Saved ${(buffer.length / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  ✗ Failed item ${i + 1}:`, err.message);
    }
  }

  console.log(`✓ Batch complete! Check ${outputDir}`);
}

async function main() {
  switch (command) {
    case 'list':
      await listTemplates(getOption('--endpoint') || defaultEndpoint);
      break;
    case 'render':
      await renderAd();
      break;
    case 'batch':
      await batchRender();
      break;
    case 'sync-r2':
      await import('./sync-assets-to-r2.mjs');
      break;
    default:
      printUsage();
      break;
  }
}

main().catch(err => {
  console.error('CLI Fatal Error:', err);
  process.exit(1);
});
