#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Server for SuperAds Creative Engine
 * Standalone Headless Static Ads Microservice
 * 
 * Exposes dynamic ad generation, dynamic template contract extraction,
 * image deconstruction into templates, and payload validation over stdio JSON-RPC
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

// Primary and fallback endpoints
const LOCAL_ENDPOINT = process.env.ADS_API_URL || 'http://localhost:3000';
const REMOTE_ENDPOINT = 'https://superads.orizongroup.online';
const LOCAL_TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

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

  cachedLiveEndpoint = LOCAL_ENDPOINT;
  return LOCAL_ENDPOINT;
}

/**
 * Built-in static preset fallbacks if network is completely unreachable
 */
const BUILTIN_FALLBACK_CONTRACTS = {
  '1-a': {
    id: '1-a',
    name: '1-A: Niche Product (Default Dual Banner)',
    category: 'direct-response',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'headerLine1', label: 'Top Qualification Banner', type: 'text', mandatory: false, spatial: { left: 0, top: 0, width: 1080, height: 100 } },
      { key: 'headerLine2', label: 'Visceral Problem Hook', type: 'text', mandatory: true, spatial: { left: 0, top: 100, width: 1080, height: 110 } },
      { key: 'subjectImage', label: 'Left Subject / Symptom Portrait', type: 'image', mandatory: true, spatial: { left: 80, top: 240, width: 520, height: 620 } },
      { key: 'productImage', label: 'Right 3D Product Mockup', type: 'image', mandatory: true, spatial: { left: 660, top: 300, width: 330, height: 460 } },
      { key: 'priceBadgeText', label: 'Offer / Price Pill', type: 'badge', mandatory: true, spatial: { left: 650, top: 780, width: 350, height: 70 } },
    ],
  },
  '1-b': {
    id: '1-b',
    name: '1-B: Authority / Social Proof',
    category: 'direct-response',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'topBackgroundImage', label: 'Top Background', type: 'image', mandatory: false },
      { key: 'productImage', label: 'Product Mockup', type: 'image', mandatory: true },
      { key: 'title', label: 'Main Headline', type: 'text', mandatory: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', mandatory: false },
      { key: 'priceBadgeText', label: 'Price Pill', type: 'badge', mandatory: true },
    ],
  },
  '2-a': {
    id: '2-a',
    name: '2-A: High Authority Publisher Editorial',
    category: 'publisher',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'backgroundImage', label: 'Background Image', type: 'image', mandatory: true },
      { key: 'logoUrl', label: 'Brand Logo', type: 'image', mandatory: false },
      { key: 'avatarUrl', label: 'Avatar Inset', type: 'image', mandatory: false },
      { key: 'headline', label: 'Editorial Headline', type: 'text', mandatory: true },
    ],
  },
  '3-a': {
    id: '3-a',
    name: '3-A: Visual Product Spotlight',
    category: 'direct-response',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'backgroundImage', label: 'Background Image', type: 'image', mandatory: true },
      { key: 'productImage', label: 'Product Image', type: 'image', mandatory: true },
      { key: 'headline', label: 'Headline', type: 'text', mandatory: true },
      { key: 'badgeText', label: 'Badge', type: 'badge', mandatory: false },
    ],
  },
  '3-b': {
    id: '3-b',
    name: '3-B: Social Post / Tweet Proof',
    category: 'social',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'postAuthor', label: 'Author Name', type: 'text', mandatory: true },
      { key: 'postHandle', label: 'Author Handle', type: 'text', mandatory: true },
      { key: 'postContent', label: 'Post Body', type: 'text', mandatory: true },
    ],
  },
  '4-a': {
    id: '4-a',
    name: '4-A: High-Impact Recruitment / Opportunity',
    category: 'recruitment',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'headerTitle', label: 'Header Title', type: 'text', mandatory: true },
      { key: 'bodyImage', label: 'Main Image', type: 'image', mandatory: true },
      { key: 'footerSalary', label: 'Salary Breakdown', type: 'text', mandatory: true },
    ],
  },
  '5-a': {
    id: '5-a',
    name: '5-A: Bold Typographic Statement',
    category: 'typographic',
    dimensions: { width: 1080, height: 1080 },
    elements: [
      { key: 'title', label: 'Main Title', type: 'text', mandatory: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', mandatory: false },
    ],
  },
};

/**
 * Dynamically resolves a template contract:
 * Checks local data/templates/ -> checks HTTP endpoint /api/templates/:id -> falls back to built-in.
 */
async function resolveContract(templateId, customEndpoint) {
  const cleanId = String(templateId || '').trim();

  // 1. Check local ephemeral template storage on disk
  try {
    const localFile = path.join(LOCAL_TEMPLATES_DIR, `${cleanId}.json`);
    if (fs.existsSync(localFile)) {
      const data = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      if (data.contract) return data.contract;
    }
  } catch {}

  // 2. Fetch from active API endpoint
  try {
    const endpoint = await getLiveEndpoint(customEndpoint);
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

  // 3. Built-in presets fallback
  return BUILTIN_FALLBACK_CONTRACTS[cleanId] || null;
}

/**
 * Execute HTTP assemble request with automatic local/remote failover
 */
async function executeAssembleRequest(payload, customEndpoint) {
  const endpoint = await getLiveEndpoint(customEndpoint);
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
    return { success: true, endpoint, data: json };
  } else {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status} from ${endpoint}: ${errText}`);
  }
}

/**
 * Create the MCP Server instance
 */
const server = new Server(
  {
    name: 'superads-creative-engine',
    version: '2.5.0',
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
        description: 'Returns all available SuperAds templates (both built-in presets and dynamically extracted custom templates) with descriptions, best use cases, and element contracts.',
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
        description: 'Returns the complete contract for any template ID: element roles, mandatory flags, spatial coordinates, 3-sigma character capacity limits, and image composition rules.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Template identifier to inspect (e.g. "1-a", "custom_172...").',
            },
          },
          required: ['templateId'],
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
        name: 'validate_template_payload',
        description: 'Validates an ad creative payload against its dynamic template contract before rendering, flagging missing mandatory fields and character overflow warnings.',
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
        try {
          const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates`, {
            headers: { 'X-SuperAds-Source': 'mcp' },
            signal: AbortSignal.timeout(2500),
          });
          if (res.ok) {
            const data = await res.json();
            let templates = data.templates || [];
            if (args?.category && args.category !== 'all') {
              templates = templates.filter(t => t.category === args.category);
            }
            return {
              content: [{ type: 'text', text: JSON.stringify({ count: templates.length, templates }, null, 2) }],
            };
          }
        } catch {}

        // Fallback
        const fallbackList = Object.values(BUILTIN_FALLBACK_CONTRACTS);
        return {
          content: [{ type: 'text', text: JSON.stringify({ count: fallbackList.length, templates: fallbackList }, null, 2) }],
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

      case 'extract_template_contract': {
        const endpoint = await getLiveEndpoint();
        const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SuperAds-Source': 'mcp',
          },
          body: JSON.stringify(args || {}),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Extraction failed: ${err}`);
        }

        const data = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'create_template_from_image': {
        const endpoint = await getLiveEndpoint();
        const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/templates/deconstruct`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SuperAds-Source': 'mcp',
          },
          body: JSON.stringify(args || {}),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Deconstruction failed: ${err}`);
        }

        const data = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'validate_template_payload': {
        const { templateId, variables } = args;
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
              }, null, 2),
            }],
          };
        }

        const missingMandatory = [];
        const warnings = [];
        for (const elem of (contract.elements || [])) {
          const val = variables?.[elem.key];
          const isProvided = val !== undefined && val !== null && val !== '';
          if (elem.mandatory && !isProvided) {
            missingMandatory.push(`Missing mandatory element: "${elem.key}" (${elem.label || elem.name || elem.role})`);
          }
          if (elem.type === 'text' && isProvided && typeof val === 'string') {
            if (elem.textRules?.maxCharacters && val.length > elem.textRules.maxCharacters) {
              warnings.push(`Text for "${elem.key}" is ${val.length} chars (exceeds recommended max ${elem.textRules.maxCharacters} chars).`);
            }
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
            }, null, 2),
          }],
        };
      }

      case 'render_ad': {
        const { templateId, variables, uploadToR2, outputPath, endpoint: customEndpoint } = args;
        const payload = {
          templateId,
          variables: variables || {},
          uploadToR2: Boolean(uploadToR2),
        };

        const result = await executeAssembleRequest(payload, customEndpoint);
        const data = result.data;

        let localSavedPath = null;
        if (outputPath && data.imageBase64) {
          const targetDir = path.dirname(outputPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
          fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
          localSavedPath = path.resolve(outputPath);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  templateId,
                  endpoint: result.endpoint,
                  r2Url: data.r2Url || null,
                  localPath: localSavedPath,
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
              customEndpoint
            );

            if (res.data?.imageBase64) {
              const cleanBase64 = res.data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
              fs.writeFileSync(targetPath, Buffer.from(cleanBase64, 'base64'));
            }

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
          content: [{ type: 'text', text: JSON.stringify({ count: results.length, batch: results }, null, 2) }],
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
