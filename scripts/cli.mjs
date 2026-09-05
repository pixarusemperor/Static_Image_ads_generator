#!/usr/bin/env node

/**
 * SuperAds CLI Tool for AI Agents & Terminal Automations
 * Part of the SYNPHONYS & Hermes Multi-Agent Ecosystem
 *
 * Usage:
 *   superads list [--json]
 *   superads render --template 1-a --vars '{"headerLine1": "..."}' --output ad.png
 *   cat vars.json | superads render --template 1-a --output ad.png
 *   superads extract --image ./flyer.png
 *   superads deconstruct --image ./flyer.png --name "Summer Sale"
 *   superads batch --input ./campaign.json --output-dir ./dist/
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.error(`
SuperAds Headless Creative Engine CLI (SYNPHONYS / Hermes)

Commands:
  list                                List all templates (built-in and dynamic)
  render --template <id> [options]    Render a single static ad to PNG
  extract --image <path|url>          Extract dynamic contract from an image or AST
  deconstruct --image <path>          Reverse-engineer image into dynamic template
  batch --input <file> [options]      Batch render ad variations from JSON manifest

Options for 'render':
  --template, -t <id>                 Template ID (e.g. 1-a, 1-b, 2-a, 3-a, custom, or stored dynamic ID)
  --vars, -v <json|file|->            JSON string, file path, or "-" for stdin (default: reads stdin if piped)
  --output, -o <path>                 Destination path for the rendered PNG (default: ./ad-<id>.png)
  --endpoint <url>                    API endpoint (default: http://localhost:3000 or $ADS_API_URL)
  --upload-r2                         Upload rendered ad to Cloudflare R2 and output public URL
  --json                              Output machine-readable JSON result to stdout

Options for 'extract':
  --image, -i <path|url>              Image file path or URL to extract contract from
  --ast <file>                        JSON file containing layout AST / layers
  --template <id>                     Template ID to extract contract from

Options for 'deconstruct':
  --image, -i <path>                  Image file path to deconstruct into new template
  --name, -n <string>                 Human-readable name for the dynamic template
  --category, -c <string>             Category classification (default: 'direct-response')
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

const defaultEndpoint = (process.env.ADS_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Safely reads from STDIN with timeout if piped
 */
async function readStdinSafe(timeoutMs = 3000) {
  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => {
      resolve(data.trim() || null);
    }, timeoutMs);

    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(data.trim() || null);
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

/**
 * Convert local image file or URL to base64 Data URL
 */
function fileToBase64(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: "${filePath}"`);
  }
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext || 'png';
  const buffer = fs.readFileSync(filePath);
  return `data:image/${mime};base64,${buffer.toString('base64')}`;
}

async function listTemplates(endpoint) {
  try {
    const res = await fetch(`${endpoint}/api/templates`, {
      headers: { 'X-SuperAds-Source': 'cli' },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch templates: ${res.statusText}`);
    }
    const data = await res.json();

    if (hasFlag('--json')) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log(`\nAvailable SuperAds Templates (${data.total || data.templates?.length || 0}):\n`);
    for (const t of (data.templates || [])) {
      console.log(`• [${t.id}] ${t.name} (${t.categoryLabel || t.category})`);
      console.log(`  Description: ${t.description || 'N/A'}`);
      console.log(`  Dimensions: ${t.dimensions?.width || 1080}x${t.dimensions?.height || 1080}`);
      if (t.elements) {
        console.log(`  Elements: ${t.elements.map(e => e.key).join(', ')}`);
      } else if (t.fields) {
        console.log(`  Fields: ${t.fields.map(f => f.name).join(', ')}`);
      }
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

  let varsRaw = getOption('--vars', '-v');
  let variables = {};

  // Check stdin if --vars is '-' or omitted when piped
  if (!varsRaw || varsRaw === '-') {
    const stdinContent = await readStdinSafe();
    if (stdinContent) {
      varsRaw = stdinContent;
    }
  }

  if (varsRaw) {
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
  }

  const endpoint = getOption('--endpoint') || defaultEndpoint;
  const outputPath = getOption('--output', '-o') || `./ad-${templateId}-${Date.now()}.png`;
  const uploadR2 = hasFlag('--upload-r2');
  const asJson = hasFlag('--json');

  if (!asJson) {
    console.error(`Rendering ad [${templateId}] via ${endpoint}...`);
  }

  try {
    const res = await fetch(`${endpoint}/api/assemble`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, image/png',
        'X-SuperAds-Source': 'cli',
      },
      body: JSON.stringify({
        templateId,
        variables,
        uploadToR2: uploadR2,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Assemble error (${res.status}): ${err}`);
    }

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const contentType = res.headers.get('content-type') || '';
    let r2Url = null;
    let dimensions = { width: 1080, height: 1080 };

    if (contentType.includes('image/png')) {
      const arrayBuf = await res.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuf));
    } else {
      const data = await res.json();
      r2Url = data.r2Url || null;
      dimensions = data.dimensions || { width: data.width || 1080, height: data.height || 1080 };
      const rawB64 = data.imageBase64 || data.dataUrl || '';
      if (rawB64) {
        const base64Data = rawB64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
      }
    }

    if (asJson) {
      console.log(JSON.stringify({
        status: 'success',
        templateId,
        outputPath: path.resolve(outputPath),
        r2Url,
        dimensions,
      }, null, 2));
    } else {
      console.error(`✓ Rendered successfully: ${outputPath}`);
      if (r2Url) {
        console.error(`✓ Cloudflare R2 CDN: ${r2Url}`);
      }
    }
  } catch (err) {
    console.error('Render failed:', err.message);
    process.exit(1);
  }
}

async function extractContract() {
  const endpoint = getOption('--endpoint') || defaultEndpoint;
  const imagePath = getOption('--image', '-i');
  const astPath = getOption('--ast');
  const templateId = getOption('--template', '-t');

  let sourceAst = undefined;
  let imageUrl = undefined;

  if (astPath) {
    if (!fs.existsSync(astPath)) {
      console.error(`Error: AST file not found: "${astPath}"`);
      process.exit(1);
    }
    sourceAst = JSON.parse(fs.readFileSync(astPath, 'utf-8'));
  }

  if (imagePath) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      imageUrl = imagePath;
    } else {
      imageUrl = fileToBase64(imagePath);
    }
  }

  if (!sourceAst && !imageUrl && !templateId) {
    console.error('Error: specify at least one of --image, --ast, or --template.');
    process.exit(1);
  }

  try {
    const res = await fetch(`${endpoint}/api/templates/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SuperAds-Source': 'cli',
      },
      body: JSON.stringify({
        sourceAst,
        imageUrl,
        templateId,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Extraction failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Extract error:', err.message);
    process.exit(1);
  }
}

async function deconstructTemplate() {
  const endpoint = getOption('--endpoint') || defaultEndpoint;
  const imagePath = getOption('--image', '-i');
  const name = getOption('--name', '-n') || (imagePath ? path.basename(imagePath, path.extname(imagePath)) : 'dynamic-template');
  const category = getOption('--category', '-c') || 'direct-response';

  if (!imagePath) {
    console.error('Error: --image <path> is required.');
    process.exit(1);
  }

  let imageBase64;
  if (imagePath.startsWith('data:')) {
    imageBase64 = imagePath;
  } else {
    imageBase64 = fileToBase64(imagePath);
  }

  console.error(`Deconstructing image into dynamic template "${name}" via ${endpoint}...`);

  try {
    const res = await fetch(`${endpoint}/api/templates/deconstruct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SuperAds-Source': 'cli',
      },
      body: JSON.stringify({
        image: imageBase64,
        name,
        category,
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Deconstruct failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    if (hasFlag('--json')) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      const templateId = data.templateId || data.template?.id;
      const layerCount = data.template?.layers?.length || data.contract?.elements?.length || 0;
      const cost = data._telemetry?.estimatedCostUsd || data.tokenUsage?.estimatedCostUsd || 0;
      console.error(`✓ Successfully deconstructed into template ID: "${templateId}"`);
      console.error(`✓ Extracted ${layerCount} discrete visual layers`);
      console.error(`✓ Estimated token cost: $${cost.toFixed(4)}`);
      console.log(JSON.stringify(data.contract || data.template?.contract || {}, null, 2));
    }
  } catch (err) {
    console.error('Deconstruct error:', err.message);
    process.exit(1);
  }
}

async function batchRender() {
  const inputFile = getOption('--input', '-i');
  const outputDir = getOption('--output-dir', '-d') || './output';
  const endpoint = getOption('--endpoint') || defaultEndpoint;

  if (!inputFile || !fs.existsSync(inputFile)) {
    console.error('Error: --input <file> is required and must exist.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  if (!Array.isArray(manifest)) {
    console.error('Error: Input manifest must be a JSON array of variations.');
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.error(`Batch rendering ${manifest.length} variations to ${outputDir}...`);

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const outName = item.outputName || `ad-${item.templateId}-var${i + 1}.png`;
    const targetPath = path.join(outputDir, outName);

    try {
      const res = await fetch(`${endpoint}/api/assemble`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SuperAds-Source': 'cli',
        },
        body: JSON.stringify({
          templateId: item.templateId,
          variables: item.variables || {},
          uploadToR2: Boolean(item.uploadToR2),
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.imageBase64) {
        const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
      }
      console.error(`[${i + 1}/${manifest.length}] ✓ ${outName}`);
    } catch (err) {
      console.error(`[${i + 1}/${manifest.length}] ✗ ${outName}: ${err.message}`);
    }
  }
}

// Router
switch (command) {
  case 'list':
    listTemplates(getOption('--endpoint') || defaultEndpoint);
    break;
  case 'render':
    renderAd();
    break;
  case 'extract':
    extractContract();
    break;
  case 'deconstruct':
    deconstructTemplate();
    break;
  case 'batch':
    batchRender();
    break;
  default:
    printUsage();
    break;
}
