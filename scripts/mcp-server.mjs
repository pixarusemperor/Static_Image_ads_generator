#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Server for SuperAds Creative Engine
 * Standalone Headless Static Ads Microservice
 * 
 * Exposes dynamic ad generation, dynamic template contract extraction,
 * image deconstruction into templates, payload validation, copy adaptation,
 * mystery object recommendation, and end-to-end campaign orchestration over stdio JSON-RPC
 * for external services (SYNPHONYS, Hermes, Claude Desktop, Cursor, Antigravity CLI).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

// Primary and fallback endpoints
const LOCAL_ENDPOINT = process.env.ADS_API_URL || 'http://localhost:3000';
const REMOTE_ENDPOINT = 'https://superads.orizongroup.online';
const LOCAL_TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

// Cache loaded contracts
let ALL_CONTRACTS = {};
try {
  const contractsPath = path.join(LOCAL_TEMPLATES_DIR, 'all_contracts.json');
  if (fs.existsSync(contractsPath)) {
    ALL_CONTRACTS = JSON.parse(fs.readFileSync(contractsPath, 'utf-8'));
  }
} catch {}

// Active live endpoint cache to avoid repeated timeout lags
let cachedLiveEndpoint = null;
let lastEndpointCheck = 0;

/**
 * Fast endpoint discovery with 1.2s timeout
 */
async function getLiveEndpoint(customEndpoint) {
  if (customEndpoint) return customEndpoint;
  const now = Date.now();
  if (cachedLiveEndpoint && (now - lastEndpointCheck < 30000)) {
    return cachedLiveEndpoint;
  }

  const candidates = [LOCAL_ENDPOINT, REMOTE_ENDPOINT];
  for (const ep of candidates) {
    try {
      const res = await fetch(`${ep.replace(/\/$/, '')}/api/templates`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        cachedLiveEndpoint = ep;
        lastEndpointCheck = now;
        return ep;
      }
    } catch {}
  }

  cachedLiveEndpoint = null;
  return null;
}

/**
 * Dynamically resolves a template contract:
 * Checks cached all_contracts -> local disk -> HTTP API.
 */
async function resolveContract(templateId, customEndpoint) {
  const cleanId = String(templateId || '').trim();

  if (ALL_CONTRACTS[cleanId]) {
    return ALL_CONTRACTS[cleanId];
  }

  // Check individual template file on disk
  try {
    const localFile = path.join(LOCAL_TEMPLATES_DIR, `${cleanId}.json`);
    if (fs.existsSync(localFile)) {
      const data = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      if (data.contract) return data.contract;
      if (data.id) return data;
    }
  } catch {}

  // Fetch from active API endpoint if live
  const endpoint = await getLiveEndpoint(customEndpoint);
  if (endpoint) {
    try {
      const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates/${cleanId}`, {
        headers: { 'X-SuperAds-Source': 'mcp' },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.contract) return data.contract;
        if (data.template?.contract) return data.template.contract;
      }
    } catch {}
  }

  return null;
}

/**
 * Executes a headless operation via npx tsx scripts/headless-runner.ts
 * Provides resilient offline/local execution when Next.js server is not running.
 */
function executeHeadlessRunner(options) {
  const runnerScript = path.join(process.cwd(), 'scripts', 'headless-runner.ts');
  const args = ['tsx', runnerScript, '--action', options.action];

  if (options.templateId) {
    args.push('--template', options.templateId);
  }
  if (options.variables) {
    args.push('--vars', JSON.stringify(options.variables));
  }
  if (options.payload) {
    args.push('--payload', JSON.stringify(options.payload));
  }
  if (options.outputPath) {
    args.push('--output', options.outputPath);
  }
  if (options.uploadToR2) {
    args.push('--upload-r2');
  }

  const output = execFileSync('npx', args, {
    cwd: process.cwd(),
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 60000,
  });

  return JSON.parse(output.trim());
}

/**
 * Execute HTTP assemble request with automatic local/remote failover and headless fallback
 */
async function executeAssembleRequest(payload, customEndpoint, outputPath) {
  const endpoint = await getLiveEndpoint(customEndpoint);

  if (endpoint) {
    try {
      const url = `${endpoint.replace(/\/$/, '')}/api/assemble`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-SuperAds-Source': 'mcp',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const json = await res.json();
        let localSavedPath = null;
        if (outputPath && json.imageBase64) {
          const targetDir = path.dirname(path.resolve(outputPath));
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const base64Data = json.imageBase64.replace(/^data:image\/\w+;base64,/, '');
          fs.writeFileSync(path.resolve(outputPath), Buffer.from(base64Data, 'base64'));
          localSavedPath = path.resolve(outputPath);
        }
        return {
          success: true,
          endpoint,
          data: { ...json, localSavedPath },
        };
      }
    } catch (httpErr) {
      console.error(`[mcp-server] Assemble HTTP failed, attempting headless runner:`, httpErr.message);
    }
  }

  // Resilient offline fallback using headless runner
  const headlessResult = executeHeadlessRunner({
    action: 'render',
    templateId: payload.templateId,
    variables: payload.variables || {},
    uploadToR2: Boolean(payload.uploadToR2),
    outputPath,
  });

  return {
    success: true,
    endpoint: 'headless-runner',
    data: headlessResult,
  };
}

// ==============================================================================
// Niche-to-Mystery-Object Transformation Matrix
// ==============================================================================
const NICHE_MYSTERY_OBJECT_MATRIX = {
  health_sexual_wellness: {
    nicheId: 'health_sexual_wellness',
    category: 'Health & Sexual Wellness',
    intangibleService: 'Endurance naturelle, vigueur masculine, régulation hormonale',
    tangibleMysteryObject: 'Unmarked Glass Dropper Vial / Volcanic Mineral Sachet',
    patternInterruptConcept: 'Candid kitchen counter shot; messy natural background; subject holding dropper vial or mineral sachet toward lens',
    tabloidBannerFormula: 'NUTRITIONISTS STUNNED: 1 spoonful of mystery extract resets stamina',
    visualFocalDirectives: 'Mineral sachet or dropper poised above glass; natural daylight; high ISO grain; shallow depth of field',
    recommendedTemplates: ['hd-red-circle', '1-a', 'hd-breaking-news', 'hd-native-alert'],
  },
  b2b_saas: {
    nicheId: 'b2b_saas',
    category: 'B2B SaaS / Automation',
    intangibleService: 'Workflow efficiency, API syncs, billing leakage recovery',
    tangibleMysteryObject: 'Black USB Stick with Glowing Amber LED',
    patternInterruptConcept: 'Subject in home office holding unmarked drive toward lens; blurred code on monitor behind',
    tabloidBannerFormula: 'DATA LEAK: Industry standard software replaced by $0 chip',
    visualFocalDirectives: 'Hold drive in top-right third; leave negative space for circular crop; macro focus on amber LED',
    recommendedTemplates: ['hd-red-circle', 'hd-breaking-news', '1-a'],
  },
  agency_client_acquisition: {
    nicheId: 'agency_client_acquisition',
    category: 'Agency / Client Acquisition',
    intangibleService: 'Inbound lead generation funnels, paid media optimization',
    tangibleMysteryObject: 'Redacted Black Binder with Neon Yellow Highlight',
    patternInterruptConcept: 'Subject pointing to confidential binder sheet with single neon yellow highlight',
    tabloidBannerFormula: 'REVEALED: Why top agencies are hiding this acquisition map',
    visualFocalDirectives: 'Binder held open at 45-degree angle; redacted black marker bars visible; macro crop on neon highlight',
    recommendedTemplates: ['hd-red-circle', 'hd-breaking-news', '2-a'],
  },
  mortgage_refinancing: {
    nicheId: 'mortgage_refinancing',
    category: 'Mortgage / Refinancing / Finance',
    intangibleService: 'Interest rate reductions, closing fee elimination',
    tangibleMysteryObject: 'Crumpled Bank Statement with Red Marker Circle on 1 Fee',
    patternInterruptConcept: 'Close-up selfie at kitchen table holding coffee mug and crumpled statement',
    tabloidBannerFormula: 'HOMEOWNERS ALARMED: Banks caught charging obsolete fee',
    visualFocalDirectives: 'Statement flattened on rustic wooden table; red felt-pen circle around specific $842 line item',
    recommendedTemplates: ['hd-red-circle', 'hd-breaking-news', '2-a'],
  },
  ecommerce_physical: {
    nicheId: 'ecommerce_physical',
    category: 'E-Commerce / Physical Goods',
    intangibleService: 'Superior material durability, stitch strength, build quality',
    tangibleMysteryObject: 'Ripped Seam vs. Intact Competitor Fabric Under Magnifier',
    patternInterruptConcept: 'Side-by-side split under magnifying lens; human finger tugging frayed thread',
    tabloidBannerFormula: 'EXPOSED: Big brands caught cutting factory quality by 40%',
    visualFocalDirectives: 'Extreme macro lens; contrasting thread colors; harsh side lighting to emphasize texture',
    recommendedTemplates: ['1-a', '3-a', 'hd-red-circle'],
  },
  executive_coaching: {
    nicheId: 'executive_coaching',
    category: 'Executive Coaching / Consulting',
    intangibleService: 'Mindset, burnout relief, operational focus',
    tangibleMysteryObject: 'Worn Moleskine Journal with Hand-Written 3-Item Rule',
    patternInterruptConcept: 'Subject outside airport terminal or boardroom looking at open pocket note',
    tabloidBannerFormula: 'CEOS WARNED: Do this 1 ritual before entering the family home',
    visualFocalDirectives: 'Notebook resting on leather briefcase; handwritten ink legible; authentic grain; overcast daylight',
    recommendedTemplates: ['3-b', 'hd-native-alert', '2-a'],
  },
  info_products_courses: {
    nicheId: 'info_products_courses',
    category: 'Info-Products / Online Courses',
    intangibleService: 'Educational blueprints, specialized curriculum',
    tangibleMysteryObject: 'Spiral-Bound Blueprint with Coffee Ring Stain',
    patternInterruptConcept: 'Desk cluttered with highlighters and printed manual open to single diagram',
    tabloidBannerFormula: 'LEAKED CURRICULUM: Top university quietly removes $4,000 module',
    visualFocalDirectives: 'Spiral wire visible; coffee ring provides authentic "used" look; finger pointing to flowchart box',
    recommendedTemplates: ['1-b', 'hd-red-circle', '5-a'],
  },
  real_estate_investing: {
    nicheId: 'real_estate_investing',
    category: 'Real Estate / Land Investing',
    intangibleService: 'Below-market acquisitions, zoning arbitrage',
    tangibleMysteryObject: 'Laminated County Zoning Map with Neon Perimeter',
    patternInterruptConcept: 'Investor standing by pickup truck hood reviewing physical property parcel map',
    tabloidBannerFormula: 'LOCAL SCANDAL: The unlisted parcel map beating institutional funds',
    visualFocalDirectives: 'Bright daylight; map pinned to truck hood; neon marker border around one unmarked lot',
    recommendedTemplates: ['2-a', 'hd-breaking-news', '4-a'],
  },
  local_home_services: {
    nicheId: 'local_home_services',
    category: 'Local Home Services (Plumbing/HVAC)',
    intangibleService: 'System efficiency, leak detection, preventive repair',
    tangibleMysteryObject: 'Corroded Copper Valve next to Shiny Brass Replacement',
    patternInterruptConcept: 'Tradesperson in clean uniform holding pitted, calcified valve in palm of hand',
    tabloidBannerFormula: 'HOMEOWNER ALERT: The $9 part causing $14,000 in hidden water rot',
    visualFocalDirectives: 'Macro shot of green/white pipe corrosion; workshop or basement background with toolbag',
    recommendedTemplates: ['1-a', 'hd-red-circle', 'hd-native-alert'],
  },
  legal_financial_claims: {
    nicheId: 'legal_financial_claims',
    category: 'Legal / Financial Claims',
    intangibleService: 'Unclaimed refunds, tax credits, class-action escrow',
    tangibleMysteryObject: 'Official Settlement Check Stub with Stamped "APPROVED"',
    patternInterruptConcept: 'Close-up of mail envelope being sliced open, revealing check amount',
    tabloidBannerFormula: 'PAYOUT NOTICE: State treasury releasing uncollected funds',
    visualFocalDirectives: 'Official bank font; check amount visible ($2,842.10); address and account redacted',
    recommendedTemplates: ['hd-breaking-news', '2-a', '4-a'],
  },
};

function lookupMysteryObject(query) {
  const q = String(query || '').toLowerCase();
  if (q.includes('sex') || q.includes('wellness') || q.includes('health') || q.includes('libido') || q.includes('tea') || q.includes('stamina') || q.includes('endurance') || q.includes('volcan')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.health_sexual_wellness;
  }
  if (q.includes('saas') || q.includes('software') || q.includes('automation') || q.includes('api') || q.includes('tech') || q.includes('b2b')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.b2b_saas;
  }
  if (q.includes('agency') || q.includes('client') || q.includes('acquisition') || q.includes('lead')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.agency_client_acquisition;
  }
  if (q.includes('mortgage') || q.includes('loan') || q.includes('refinanc') || q.includes('rate') || q.includes('bank')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.mortgage_refinancing;
  }
  if (q.includes('real estate') || q.includes('property') || q.includes('land') || q.includes('zoning')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.real_estate_investing;
  }
  if (q.includes('coach') || q.includes('consult') || q.includes('mindset') || q.includes('executive')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.executive_coaching;
  }
  if (q.includes('course') || q.includes('info') || q.includes('class') || q.includes('curriculum')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.info_products_courses;
  }
  if (q.includes('plumb') || q.includes('hvac') || q.includes('repair') || q.includes('contractor') || q.includes('home service')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.local_home_services;
  }
  if (q.includes('legal') || q.includes('tax') || q.includes('settlement') || q.includes('claim')) {
    return NICHE_MYSTERY_OBJECT_MATRIX.legal_financial_claims;
  }
  return NICHE_MYSTERY_OBJECT_MATRIX.health_sexual_wellness;
}

/**
 * Create the MCP Server instance
 */
const server = new Server(
  {
    name: 'superads-creative-engine',
    version: '3.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool Definition Schema Handler
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_templates',
        description: 'Returns all available SuperAds templates (built-in presets and dynamic) with descriptions, best use cases, mandatory elements, and editable fields.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Optional category filter (e.g. direct-response, publisher, social, recruitment, custom, all).',
            },
          },
        },
      },
      {
        name: 'get_template_details',
        description: 'Returns the complete contract for any template ID: element roles, mandatory flags, spatial coordinates, character capacity limits, and image composition rules.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Template identifier to inspect (e.g. "1-a", "hd-red-circle", "hd-breaking-news").',
            },
          },
          required: ['templateId'],
        },
      },
      {
        name: 'validate_template_payload',
        description: 'Validates an ad creative payload against its dynamic template contract before rendering, flagging missing mandatory fields, spatial composition rules, and character overflow warnings.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Target template ID.',
            },
            variables: {
              type: 'object',
              description: 'Key-value dictionary of variables to validate.',
            },
          },
          required: ['templateId', 'variables'],
        },
      },
      {
        name: 'validate_ad_copy',
        description: 'Audits headline length, pricing formatting, urgency triggers, and trust points against direct-response best practices and Sabri Suby formulas.',
        inputSchema: {
          type: 'object',
          properties: {
            headline: { type: 'string', description: 'Primary hook or headline.' },
            subtitle: { type: 'string', description: 'Secondary explanation.' },
            priceBadge: { type: 'string', description: 'Offer / price text.' },
            body: { type: 'string', description: 'Body text.' },
            cta: { type: 'string', description: 'Call to action banner.' },
          },
        },
      },
      {
        name: 'render_ad',
        description: 'Compiles and renders a static image ad to Base64 PNG preview, local file path, or Cloudflare R2 CDN URL.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'The template ID to render (preset or dynamic).',
            },
            variables: {
              type: 'object',
              description: 'Key-value object containing template text/image variables matching the contract.',
            },
            uploadToR2: {
              type: 'boolean',
              description: 'Whether to upload directly to Cloudflare R2 bucket and return public CDN URL.',
              default: false,
            },
            outputPath: {
              type: 'string',
              description: 'Optional local file path to save rendered PNG.',
            },
            endpoint: {
              type: 'string',
              description: 'Optional custom assembly API endpoint URL.',
            },
          },
          required: ['templateId'],
        },
      },
      {
        name: 'batch_render_campaign',
        description: 'Executes high-volume multivariate batch rendering of static ad creatives for A/B testing across angles, hooks, and templates.',
        inputSchema: {
          type: 'object',
          properties: {
            manifest: {
              type: 'array',
              description: 'Array of ad configurations to render: [{ templateId: "1-a", variables: {...}, outputName: "hook1.png", uploadToR2: true }].',
              items: {
                type: 'object',
                properties: {
                  templateId: { type: 'string' },
                  variables: { type: 'object' },
                  outputName: { type: 'string' },
                  uploadToR2: { type: 'boolean' },
                },
                required: ['templateId'],
              },
            },
            outputDir: {
              type: 'string',
              description: 'Local directory to save generated PNG images (default: "./output").',
            },
            endpoint: {
              type: 'string',
              description: 'Optional custom assembly API endpoint URL.',
            },
          },
          required: ['manifest'],
        },
      },
      {
        name: 'extract_template_contract',
        description: 'Dynamically extracts a formal ad contract from an uploaded image or raw layout AST on the fly without hardcoding, applying 3-Sigma Glyph Capacity theorems for text limits.',
        inputSchema: {
          type: 'object',
          properties: {
            sourceAst: {
              type: 'object',
              description: 'Optional raw layout AST or layers array to extract contract from.',
            },
            imageUrl: {
              type: 'string',
              description: 'Optional image URL or base64 data URL to analyze and extract contract from.',
            },
            templateId: {
              type: 'string',
              description: 'Optional template ID to extract contract from.',
            },
          },
        },
      },
      {
        name: 'create_template_from_image',
        description: 'Reverse-engineers an ad image into discrete visual layers, computes 3-sigma contracts, stores it in R2/cache, and returns the new template ready for headless rendering.',
        inputSchema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Base64 data URL or raw base64 string of the target flyer/ad to deconstruct.',
            },
            name: {
              type: 'string',
              description: 'Optional descriptive name for the new dynamic template.',
            },
            category: {
              type: 'string',
              description: 'Optional category classification.',
            },
          },
          required: ['image'],
        },
      },
      {
        name: 'orchestrate_campaign_creatives',
        description: 'Autonomous agent orchestration pipeline. Generates Sabri Suby compliant feed copy (Grade <= 5, Zero-You rule), post-click scent bridges, adapts template variables, renders PNGs to R2/disk, and persists records to database.',
        inputSchema: {
          type: 'object',
          properties: {
            campaignName: { type: 'string', description: 'Name of the campaign.' },
            product: {
              type: 'object',
              description: 'Product details (name, category, mechanism, price, proofPoints).',
              required: ['name', 'category'],
            },
            avatar: {
              type: 'object',
              description: 'Avatar details (awarenessStage, painPoints, language, role).',
            },
            targetTemplates: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target templates to render e.g. ["hd-red-circle", "1-a", "hd-breaking-news"].',
            },
            assets: {
              type: 'object',
              description: 'Asset image URLs (productMockupUrl, subjectImageUrl, mysteryImageUrl).',
            },
            channel: { type: 'string', default: 'meta' },
            uploadToR2: { type: 'boolean', default: true },
            endpoint: { type: 'string', description: 'Optional custom API endpoint URL.' },
          },
          required: ['campaignName', 'product', 'targetTemplates'],
        },
      },
      {
        name: 'get_mystery_object_recommendation',
        description: 'Looks up the product category/intangible service and returns physical tangible props from the Niche-to-Mystery-Object transformation matrix.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'The commercial niche or category (e.g. "Health & Sexual Wellness", "B2B SaaS", "Mortgage", "Agency").',
            },
          },
          required: ['category'],
        },
      },
      {
        name: 'adapt_copy_to_template',
        description: 'Adapts raw copy strings to template spatial contracts, enforcing character limits, word limits, and casing rules.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Target template ID (e.g. "1-a", "hd-red-circle").',
            },
            rawContent: {
              type: 'object',
              description: 'Raw copy dictionary containing headline, subtitle, body, price, etc.',
            },
            endpoint: {
              type: 'string',
              description: 'Optional custom API endpoint URL.',
            },
          },
          required: ['templateId', 'rawContent'],
        },
      },
    ],
  };
});

/**
 * Tool Execution Handler
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_templates': {
        const endpoint = await getLiveEndpoint();
        if (endpoint) {
          try {
            const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates`, {
              headers: { 'X-SuperAds-Source': 'mcp' },
              signal: AbortSignal.timeout(2500),
            });
            if (res.ok) {
              const data = await res.json();
              let templates = (data.templates || []).map((t) => ({
                ...t,
                mandatoryElements: (t.elements || []).filter((e) => e.mandatory).map((e) => e.key),
              }));
              if (args?.category && args.category !== 'all') {
                templates = templates.filter((t) => t.category === args.category);
              }
              return {
                content: [{ type: 'text', text: JSON.stringify({ count: templates.length, templates }, null, 2) }],
              };
            }
          } catch {}
        }

        // Local cache fallback
        let list = Object.values(ALL_CONTRACTS).map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          categoryLabel: t.categoryLabel || t.category,
          description: t.description || t.bestUseCase,
          bestUseCase: t.bestUseCase,
          recommendedNiches: t.recommendedNiches || [],
          funnelStage: t.funnelStage || 'All-Stages',
          dimensions: t.dimensions || { width: 1080, height: 1080 },
          mandatoryElements: (t.elements || []).filter((e) => e.mandatory).map((e) => e.key),
          fieldNames: (t.elements || []).map((e) => e.key),
          tags: (t.elements || []).map((e) => e.label || e.key).slice(0, 3),
        }));

        if (args?.category && args.category !== 'all') {
          list = list.filter((t) => t.category === args.category);
        }

        return {
          content: [{ type: 'text', text: JSON.stringify({ count: list.length, templates: list }, null, 2) }],
        };
      }

      case 'get_template_details': {
        const templateId = args?.templateId;
        const contract = await resolveContract(templateId);
        if (!contract) {
          throw new Error(`Template contract for "${templateId}" could not be resolved.`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(contract, null, 2) }],
        };
      }

      case 'validate_template_payload': {
        const { templateId, variables = {} } = args;
        const contract = await resolveContract(templateId);
        if (!contract) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                isValid: false,
                templateId,
                missingMandatory: [`Unknown templateId "${templateId}".`],
                warnings: [],
                compositionAdvice: [],
                resolvedVariables: variables,
              }, null, 2),
            }],
          };
        }

        const missingMandatory = [];
        const warnings = [];
        const compositionAdvice = [];
        const resolvedVariables = { ...variables };

        for (const elem of (contract.elements || [])) {
          const val = variables[elem.key];
          const isProvided = val !== undefined && val !== null && val !== '';

          if (elem.mandatory && !isProvided) {
            missingMandatory.push(`Missing mandatory element: "${elem.key}" (${elem.label || elem.key})`);
            resolvedVariables[elem.key] = elem.defaultValue;
          }

          if (elem.type === 'text' && isProvided && typeof val === 'string') {
            if (elem.textRules?.maxCharacters && val.length > elem.textRules.maxCharacters) {
              warnings.push(`Text for "${elem.key}" is ${val.length} chars (exceeds recommended max ${elem.textRules.maxCharacters} chars).`);
            }
          }

          if (elem.type === 'image' && elem.compositionRules?.subjectPlacement) {
            compositionAdvice.push(`[${elem.key}]: ${elem.compositionRules.subjectPlacement}`);
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              isValid: missingMandatory.length === 0,
              templateId,
              missingMandatory,
              warnings,
              compositionAdvice,
              resolvedVariables,
            }, null, 2),
          }],
        };
      }

      case 'validate_ad_copy': {
        const { headline = '', subtitle = '', priceBadge = '', body = '', cta = '' } = args || {};

        let copyScore = 70;
        const suggestions = [];
        const warnings = [];

        const hasPrice = Boolean(
          priceBadge && (
            priceBadge.includes('F') ||
            priceBadge.includes('€') ||
            priceBadge.includes('$') ||
            priceBadge.toLowerCase().includes('prix') ||
            priceBadge.toLowerCase().includes('fcfa')
          )
        );
        if (hasPrice) copyScore += 10;
        else suggestions.push('Include a prominent price pill to qualify buyer intent.');

        const hasReassuranceTrigger = /(livraison|garantie|rembours|gratuit|satisfait|sécur|confidential|audité|discrète)/i.test(
          `${cta} ${body} ${subtitle}`
        );
        if (hasReassuranceTrigger) copyScore += 10;
        else suggestions.push('Add trust/reassurance copy like "Paiement à la livraison" or guarantee.');

        const hasUrgencyTrigger = /(aujourd'hui|limité|urgent|48h|stock|dès|maintenant|immédiat|exclusif)/i.test(
          `${headline} ${subtitle} ${cta}`
        );
        if (hasUrgencyTrigger) copyScore += 10;
        else suggestions.push('Add urgency elements to reduce purchase procrastination.');

        let qualityGrade = 'B (Good DR Ad)';
        if (copyScore >= 90) qualityGrade = 'A+ (Elite High-Dopamine Ad)';
        else if (copyScore >= 80) qualityGrade = 'A (Excellent DR Ad)';

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              copyScore: Math.min(100, copyScore),
              qualityGrade,
              warnings,
              suggestions,
              summary: {
                headlineLength: headline.length,
                hasPrice,
                hasReassuranceTrigger,
                hasUrgencyTrigger,
              },
            }, null, 2),
          }],
        };
      }

      case 'render_ad': {
        const { templateId, variables = {}, uploadToR2, outputPath, endpoint: customEndpoint } = args;
        const payload = {
          templateId,
          variables,
          uploadToR2: Boolean(uploadToR2),
        };

        const result = await executeAssembleRequest(payload, customEndpoint, outputPath);
        const data = result.data;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  success: true,
                  templateId,
                  endpoint: result.endpoint,
                  r2Url: data.r2Url || null,
                  localSavedPath: data.localSavedPath || null,
                  localPath: data.localSavedPath || null,
                  dimensions: data.dimensions,
                  hasBase64Preview: Boolean(data.imageBase64),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'batch_render_campaign': {
        const { manifest, outputDir = './output', endpoint: customEndpoint } = args;
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const results = [];
        let successful = 0;

        for (let i = 0; i < manifest.length; i++) {
          const item = manifest[i];
          const outName = item.outputName || `ad-${item.templateId}-var${i + 1}.png`;
          const targetPath = path.join(outputDir, outName);

          try {
            const res = await executeAssembleRequest(
              {
                templateId: item.templateId,
                variables: item.variables || {},
                uploadToR2: Boolean(item.uploadToR2),
              },
              customEndpoint,
              targetPath
            );

            successful++;
            results.push({
              index: i + 1,
              templateId: item.templateId,
              status: 'rendered',
              localPath: targetPath,
              r2Url: res.data?.r2Url || null,
            });
          } catch (err) {
            results.push({
              index: i + 1,
              templateId: item.templateId,
              status: 'failed',
              error: err.message,
            });
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              successful,
              totalRequested: manifest.length,
              outputDirectory: path.resolve(outputDir),
              batch: results,
            }, null, 2),
          }],
        };
      }

      case 'extract_template_contract': {
        const endpoint = await getLiveEndpoint();
        if (endpoint) {
          const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-SuperAds-Source': 'mcp' },
            body: JSON.stringify(args || {}),
            signal: AbortSignal.timeout(15000),
          });
          if (res.ok) {
            const data = await res.json();
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
          }
        }
        throw new Error('extract_template_contract requires a running SuperAds API instance.');
      }

      case 'create_template_from_image': {
        const endpoint = await getLiveEndpoint();
        if (endpoint) {
          const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates/deconstruct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-SuperAds-Source': 'mcp' },
            body: JSON.stringify(args || {}),
            signal: AbortSignal.timeout(30000),
          });
          if (res.ok) {
            const data = await res.json();
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
          }
        }
        throw new Error('create_template_from_image requires a running SuperAds API instance.');
      }

      case 'orchestrate_campaign_creatives': {
        const endpoint = await getLiveEndpoint(args?.endpoint);

        if (endpoint) {
          try {
            const url = `${endpoint.replace(/\/$/, '')}/api/orchestrate`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-SuperAds-Source': 'mcp' },
              body: JSON.stringify(args),
              signal: AbortSignal.timeout(60000),
            });
            if (res.ok) {
              const data = await res.json();
              return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
            }
          } catch (err) {
            console.error('[mcp-server] /api/orchestrate fetch failed, falling back to headless runner:', err.message);
          }
        }

        // Headless fallback
        const result = executeHeadlessRunner({
          action: 'orchestrate',
          payload: args,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_mystery_object_recommendation': {
        const category = args?.category || '';
        const rec = lookupMysteryObject(category);
        return {
          content: [{ type: 'text', text: JSON.stringify({ query: category, ...rec }, null, 2) }],
        };
      }

      case 'adapt_copy_to_template': {
        const { templateId, rawContent = {}, endpoint: customEndpoint } = args;
        const endpoint = await getLiveEndpoint(customEndpoint);

        if (endpoint) {
          try {
            const url = `${endpoint.replace(/\/$/, '')}/api/adapt`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-SuperAds-Source': 'mcp' },
              body: JSON.stringify({ templateId, rawContent }),
              signal: AbortSignal.timeout(10000),
            });
            if (res.ok) {
              const data = await res.json();
              return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
            }
          } catch (err) {
            console.error('[mcp-server] /api/adapt fetch failed, falling back to headless runner:', err.message);
          }
        }

        // Headless runner fallback
        const result = executeHeadlessRunner({
          action: 'adapt',
          templateId,
          variables: rawContent,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown MCP tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Tool "${name}" failed: ${error.message}` }],
    };
  }
});

/**
 * Start Stdio JSON-RPC MCP Server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SuperAds Creative Engine MCP Server running over stdio JSON-RPC.');
}

main().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
