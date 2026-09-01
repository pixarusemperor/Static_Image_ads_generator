#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Server for Static Image Ads Generator
 * Part of the SYNPHONYS AI-Native Creative Operating System
 *
 * Exposes tools over standard stdio JSON-RPC for Claude Desktop, Cursor, Antigravity,
 * and SYNPHONYS autonomous agents.
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

/**
 * Static template registry metadata with full schemas and defaults
 */
const TEMPLATE_REGISTRY = [
  {
    id: '1-a',
    name: '1-A: Niche Product (Default)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response',
    description: 'Dual-banner header with subject photo, product mockup, yellow price badge, and dual-tone bottom reassurance banners.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Dual Banner', 'Mockup', 'Price Badge', 'Reassurance'],
    recommendedFor: 'Health supplements, physical gadgets, teas, beauty products with clear problem/solution angles.',
    fields: [
      { name: 'headerLine1', type: 'string', description: 'Top black banner uppercase copy (e.g. "INFUSION VOLCANIQUE 100% NATURELLE")', defaultValue: 'INFUSION VOLCANIQUE 100% NATURELLE' },
      { name: 'headerLine2', type: 'string', description: 'Top red banner hook question (e.g. "SOUFFREZ-VOUS D\'ÉJACULATION PRÉCOCE ?")', defaultValue: 'SOUFFREZ-VOUS D\'ÉJACULATION PRÉCOCE ?' },
      { name: 'subjectImage', type: 'string', description: 'Left portrait/subject image URL or local asset path', defaultValue: '/templates/assets/MRESISTORFLYER1.png' },
      { name: 'productImage', type: 'string', description: 'Right 3D product mockup image URL or local asset path', defaultValue: '/templates/assets/PATSIMMSCFLYER1.png' },
      { name: 'priceBadgeText', type: 'string', description: 'Yellow pill price / offer badge text', defaultValue: 'PRIX : 5.000 FCFA' },
      { name: 'footerLine1', type: 'string', description: 'Bottom red banner direct call to action copy', defaultValue: 'COMMANDEZ AUJOURD\'HUI & PAYEZ À LA LIVRAISON' },
      { name: 'footerLine2', type: 'string', description: 'Bottom white banner reassurance & qualification copy', defaultValue: 'Livraison Rapide et Discrète Partout en Côte d\'Ivoire' },
    ],
  },
  {
    id: '1-b',
    name: '1-B: Niche Product (Split Copy)',
    category: 'direct-response',
    categoryLabel: 'Direct-Response',
    description: 'Hero photo top background with split sales copy, right-aligned product mockup, and bold yellow attention backdrop.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Split Copy', 'Book Cover', 'Green Badge', 'High Contrast'],
    recommendedFor: 'Digital guides, e-books, training programs, and boxed premium kits.',
    fields: [
      { name: 'topBackgroundImage', type: 'string', description: 'Top hero photograph background URL or local path', defaultValue: '/templates/assets/MRESISTORFLYER2.png' },
      { name: 'productImage', type: 'string', description: 'Right floating 3D product/book mockup', defaultValue: '/templates/assets/PATSIMMSCFLYER5.png' },
      { name: 'priceBadgeText', type: 'string', description: 'Green pill price badge text', defaultValue: 'OFFRE LIMITÉE : 5.000 F' },
      { name: 'title', type: 'string', description: 'Primary headline on yellow backdrop', defaultValue: 'SECRET VOLCANIQUE' },
      { name: 'subtitle', type: 'string', description: 'Secondary red highlighted subtitle', defaultValue: 'Retrouvez votre vigueur masculine' },
      { name: 'bodyParagraph', type: 'string', description: 'Middle body explanation and benefit copy', defaultValue: 'Une formule ancestrale aux herbes rares pour une endurance naturelle et durable.' },
      { name: 'footerText', type: 'string', description: 'Bottom red banner call to action', defaultValue: 'LIVRAISON GRATUITE + PAIEMENT À LA LIVRAISON' },
    ],
  },
  {
    id: '2-a',
    name: '2-A: Publisher Content Card',
    category: 'publisher',
    categoryLabel: 'Publisher',
    description: 'Editorial-style native ad with full-bleed background, dark bottom gradient, author avatar circle, and bracket-highlighted headline.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Full Bleed', 'Editorial', 'Dark Gradient', 'Avatar'],
    recommendedFor: 'Advertorial hooks, journalism-style curiosity angles, investigative stories, and case studies.',
    fields: [
      { name: 'backgroundImage', type: 'string', description: 'Full-bleed editorial background photo', defaultValue: '/templates/assets/MRESISTORFLYER4.png' },
      { name: 'logoUrl', type: 'string', description: 'Brand or publication logo URL', defaultValue: '/templates/assets/PATSIMMSCFLYER7.png' },
      { name: 'logoPosition', type: 'string', description: 'Logo alignment: "left" or "right"', defaultValue: 'left' },
      { name: 'hasAvatar', type: 'boolean', description: 'Whether to show circular author avatar', defaultValue: true },
      { name: 'avatarUrl', type: 'string', description: 'Author or reporter circular avatar image URL', defaultValue: '/templates/assets/images.jpeg' },
      { name: 'headline', type: 'string', description: 'Editorial headline with [bracketed] highlights', defaultValue: 'Comment cette [plante africaine] a sauvé plus de 10.000 couples' },
      { name: 'highlightColor', type: 'string', description: 'Color for bracketed text (e.g. "#E50914")', defaultValue: '#E50914' },
    ],
  },
  {
    id: '3-a',
    name: '3-A: Native Social Ad (Promo Card)',
    category: 'social',
    categoryLabel: 'Social Native',
    description: 'Dark-mode promo card with circular product badge, exclusive offer capsule, and glowing high-converting headline.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Product Circle', 'Capsule', 'Dark Mode', 'Glowing'],
    recommendedFor: 'Flash sales, limited-stock drops, impulse-buy consumer goods, and Instagram/TikTok feed ads.',
    fields: [
      { name: 'backgroundImage', type: 'string', description: 'Dark native social background image', defaultValue: '/templates/assets/MRESISTORFLYER5.png' },
      { name: 'productImage', type: 'string', description: 'Circular product inset image', defaultValue: '/templates/assets/PATSIMMSCFLYER8.png' },
      { name: 'headline', type: 'string', description: 'Bottom headline text inside translucent glass card', defaultValue: 'FINI LES DÉCEPTIONS AU LIT ! RÉSULTAT DÈS LE PREMIER JOUR' },
      { name: 'badgeText', type: 'string', description: 'Top-right floating offer badge', defaultValue: '-50% AUJOURD\'HUI' },
    ],
  },
  {
    id: '3-b',
    name: '3-B: Native Social (Tweet / Post Card)',
    category: 'social',
    categoryLabel: 'Social Native',
    description: 'Social post card layout with author profile avatar, verified handle, quoted testimonial text, and social proof metrics.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Post Card', 'Author', 'Social Proof', 'Viral Tweet'],
    recommendedFor: 'User testimonials, authentic UGC angles, founder stories, and review screenshots.',
    fields: [
      { name: 'backgroundImage', type: 'string', description: 'Background image underneath tweet card', defaultValue: '/templates/assets/The_dur_roi_lion_2.png' },
      { name: 'postAuthor', type: 'string', description: 'Twitter/X post author display name', defaultValue: 'Dr. Jean-Marc Koffi' },
      { name: 'postHandle', type: 'string', description: 'Twitter/X @handle', defaultValue: '@dr_koffi_sante' },
      { name: 'postAvatar', type: 'string', description: 'Author profile circular avatar', defaultValue: '/templates/assets/images_1.jpeg' },
      { name: 'postContent', type: 'string', description: 'The primary post/tweet text body', defaultValue: 'Après 3 semaines de test avec le thé volcanique, les résultats de mes patients sont stupéfiants. Aucune récidive constatée.' },
      { name: 'postStats', type: 'string', description: 'Likes and reposts social proof string', defaultValue: '1.4K Reposts · 8.9K Likes' },
    ],
  },
  {
    id: '4-a',
    name: '4-A: Recruitment & Opportunity Flyer',
    category: 'recruitment',
    categoryLabel: 'Recruitment',
    description: 'Urgent opportunity poster with black header, workplace photography, urgent badge, and dual-tier salary banners.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Office Photo', 'Salary', 'Urgent Badge', 'Hiring'],
    recommendedFor: 'Distributor recruitment, sales agent hiring, partner programs, and affiliate onboarding.',
    fields: [
      { name: 'headerTitle', type: 'string', description: 'Top black recruitment header title', defaultValue: 'RECRUTEMENT COMMERCIAL URGENT' },
      { name: 'bodyImage', type: 'string', description: 'Center workplace/office photo', defaultValue: '/templates/assets/Copie_de_AFFICHE_RECRUTEMENT_CALL_CENTER_.png' },
      { name: 'flagBadgeUrl', type: 'string', description: 'Country or urgency flag badge image', defaultValue: '/templates/assets/PATSIMMSCFLYER7.png' },
      { name: 'footerSalary', type: 'string', description: 'Primary salary tier text', defaultValue: 'SALAIRE : 250.000 FCFA / MOIS' },
      { name: 'footerCommissions', type: 'string', description: 'Secondary bonus/commissions text', defaultValue: '+ COMMISSIONS NON PLAFONNÉES' },
    ],
  },
  {
    id: '5-a',
    name: '5-A: Bold Typographic Flyer',
    category: 'typographic',
    categoryLabel: 'Typographic',
    description: 'High-contrast text flyer on vibrant green background with large headline, black subtitle, and pointer emoji.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Bold Text', 'Green BG', 'Arrows', 'Minimal'],
    recommendedFor: 'Direct WhatsApp click-to-chat ads, urgent announcements, and clear singular value props.',
    fields: [
      { name: 'backgroundColor', type: 'string', description: 'Background color hex (default: "#55B23B")', defaultValue: '#55B23B' },
      { name: 'title', type: 'string', description: 'Large bold typography headline', defaultValue: 'VOULEZ-VOUS DURER PLUS DE 45 MINUTES NATURELLEMENT ?' },
      { name: 'subtitle', type: 'string', description: 'Black subtitle reassurance & call to action', defaultValue: 'CLIQUEZ CI-DESSOUS POUR COMMANDER SUR WHATSAPP' },
      { name: 'emoji', type: 'string', description: 'Pointer emoji (e.g. "👇")', defaultValue: '👇' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Visual Canvas',
    category: 'custom',
    categoryLabel: 'Studio Canvas',
    description: 'Freeform visual canvas with multi-layer stacking for custom text, shape, and image compositions.',
    dimensions: { width: 1080, height: 1080 },
    tags: ['Custom Layers', 'Freeform', 'Fabric.js'],
    recommendedFor: 'Advanced creative designs with custom layer hierarchies.',
    fields: [
      { name: 'canvasBgColor', type: 'string', description: 'Canvas background color hex', defaultValue: '#0f172a' },
      { name: 'layers', type: 'array', description: 'Array of layer objects { id, type, content, x, y, width, height, ... }', defaultValue: [] },
    ],
  },
];

/**
 * Execute HTTP assemble request with automatic local/remote failover
 */
async function executeAssembleRequest(payload, customEndpoint) {
  const endpointsToTry = [];
  if (customEndpoint) {
    endpointsToTry.push(customEndpoint);
  }
  endpointsToTry.push(LOCAL_ENDPOINT);
  endpointsToTry.push(REMOTE_ENDPOINT);

  const uniqueEndpoints = [...new Set(endpointsToTry)];
  let lastError = null;

  for (const endpoint of uniqueEndpoints) {
    try {
      const url = `${endpoint.replace(/\/$/, '')}/api/assemble`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const json = await res.json();
        return { success: true, endpoint, data: json };
      } else {
        const errText = await res.text();
        lastError = new Error(`HTTP ${res.status} from ${endpoint}: ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All assemble endpoints failed');
}

/**
 * Create the MCP Server instance
 */
const server = new Server(
  {
    name: 'static-image-ads-generator',
    version: '1.0.0',
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
        description: 'Returns all available static image ad templates with dimensions, categories, descriptions, and editable variable fields.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['all', 'direct-response', 'publisher', 'social', 'recruitment', 'typographic', 'custom'],
              description: 'Optional filter by template category.',
            },
          },
        },
      },
      {
        name: 'get_template_details',
        description: 'Inspects a specific ad template in detail, returning all editable fields, default values, recommended copy formulas, and direct-response tips.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              enum: ['1-a', '1-b', '2-a', '3-a', '3-b', '4-a', '5-a', 'custom'],
              description: 'The template ID to inspect.',
            },
          },
          required: ['templateId'],
        },
      },
      {
        name: 'render_ad',
        description: 'Assembles and renders a high-converting static image ad from template ID and variable overrides. Can return a Base64 PNG data URL, save locally, or upload to Cloudflare R2.',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'The template ID to render (e.g. "1-a", "1-b", "2-a", "3-a", "3-b", "4-a", "5-a", "custom").',
            },
            variables: {
              type: 'object',
              description: 'Key-value object containing template text/image variables (e.g. { headerLine1: "...", priceBadgeText: "..." }).',
            },
            uploadToR2: {
              type: 'boolean',
              description: 'Whether to upload the rendered ad to Cloudflare R2 bucket and return a CDN URL.',
              default: false,
            },
            outputPath: {
              type: 'string',
              description: 'Optional local file path to save the rendered PNG image (e.g. "./output/ad-promo.png").',
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
        description: 'Batch renders multiple static ad creatives simultaneously for multivariate split-testing across hooks, angles, and templates.',
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
        name: 'validate_ad_copy',
        description: 'Audits and scores ad copy against direct-response best practices, mobile readability, word bounds, and African e-commerce conversion triggers (payment on delivery, reassurance, urgency).',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Target template ID (e.g. "1-a", "2-a", "5-a").',
            },
            headline: {
              type: 'string',
              description: 'Primary headline or top hook text.',
            },
            subtitle: {
              type: 'string',
              description: 'Secondary headline or curiosity subheader.',
            },
            priceBadge: {
              type: 'string',
              description: 'Price / offer text (e.g. "PRIX : 5.000 FCFA").',
            },
            body: {
              type: 'string',
              description: 'Body explanation or benefit text.',
            },
            cta: {
              type: 'string',
              description: 'Call to action or footer reassurance text.',
            },
          },
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
        const categoryFilter = args?.category;
        let templates = TEMPLATE_REGISTRY;
        if (categoryFilter && categoryFilter !== 'all') {
          templates = templates.filter(t => t.category === categoryFilter);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  count: templates.length,
                  templates: templates.map(t => ({
                    id: t.id,
                    name: t.name,
                    category: t.category,
                    description: t.description,
                    dimensions: t.dimensions,
                    tags: t.tags,
                    recommendedFor: t.recommendedFor,
                    fieldsCount: t.fields.length,
                    fieldNames: t.fields.map(f => f.name),
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_template_details': {
        const templateId = args?.templateId;
        const template = TEMPLATE_REGISTRY.find(t => t.id === templateId);
        if (!template) {
          throw new Error(`Template "${templateId}" not found. Valid IDs: ${TEMPLATE_REGISTRY.map(t => t.id).join(', ')}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(template, null, 2),
            },
          ],
        };
      }

      case 'render_ad': {
        const templateId = args?.templateId;
        const variables = args?.variables || {};
        const uploadToR2 = Boolean(args?.uploadToR2);
        const outputPath = args?.outputPath;
        const customEndpoint = args?.endpoint;

        const assembleResult = await executeAssembleRequest(
          {
            templateId,
            variables,
            uploadToR2,
          },
          customEndpoint
        );

        const resData = assembleResult.data;
        let localSavedPath = null;

        if (outputPath && resData.dataUrl) {
          const base64Clean = resData.dataUrl.replace(/^data:image\/png;base64,/, '');
          const buffer = Buffer.from(base64Clean, 'base64');
          const resolvedPath = path.resolve(outputPath);
          const parentDir = path.dirname(resolvedPath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          fs.writeFileSync(resolvedPath, buffer);
          localSavedPath = resolvedPath;
        }

        const approxSizeKb = resData.dataUrl
          ? (Math.round((resData.dataUrl.length * 0.75) / 1024 * 10) / 10)
          : null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  templateId,
                  dimensions: {
                    width: resData.width || 1080,
                    height: resData.height || 1080,
                  },
                  r2Url: resData.r2Url || null,
                  localSavedPath,
                  approxSizeKb,
                  endpointUsed: assembleResult.endpoint,
                  dataUrlPreview: resData.dataUrl ? resData.dataUrl.substring(0, 100) + '...' : null,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'batch_render_campaign': {
        const manifest = args?.manifest;
        if (!Array.isArray(manifest) || manifest.length === 0) {
          throw new Error('Manifest must be a non-empty array of ad configurations.');
        }

        const outputDir = path.resolve(args?.outputDir || './output');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const customEndpoint = args?.endpoint;
        const results = [];

        for (let i = 0; i < manifest.length; i++) {
          const item = manifest[i];
          const templateId = item.templateId || '1-a';
          const outputName = item.outputName || `campaign-ad-${i + 1}-${templateId}.png`;
          const uploadToR2 = Boolean(item.uploadToR2);
          const destPath = path.join(outputDir, outputName);

          try {
            const assembleResult = await executeAssembleRequest(
              {
                templateId,
                variables: item.variables || {},
                uploadToR2,
              },
              customEndpoint
            );

            const resData = assembleResult.data;
            if (resData.dataUrl) {
              const base64Clean = resData.dataUrl.replace(/^data:image\/png;base64,/, '');
              fs.writeFileSync(destPath, Buffer.from(base64Clean, 'base64'));
            }

            results.push({
              index: i + 1,
              templateId,
              outputName,
              success: true,
              savedTo: destPath,
              r2Url: resData.r2Url || null,
            });
          } catch (err) {
            results.push({
              index: i + 1,
              templateId,
              outputName,
              success: false,
              error: err.message,
            });
          }
        }

        const successCount = results.filter(r => r.success).length;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalRequested: manifest.length,
                  successful: successCount,
                  failed: manifest.length - successCount,
                  outputDirectory: outputDir,
                  creatives: results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'validate_ad_copy': {
        const { headline = '', subtitle = '', priceBadge = '', body = '', cta = '' } = args || {};

        const suggestions = [];
        const warnings = [];
        let score = 100;

        // Headline audit
        if (headline.length > 0) {
          const words = headline.trim().split(/\s+/).length;
          if (words > 12) {
            warnings.push(`Headline is ${words} words long. Recommended maximum for mobile readability is 8-10 words.`);
            score -= 15;
          }
          if (headline.toUpperCase() === headline && headline.length > 50) {
            suggestions.push('Long all-caps headlines can be hard to parse on small screens; consider sentence case with highlighted keywords.');
          }
        } else {
          warnings.push('Missing primary headline.');
          score -= 30;
        }

        // Price badge audit
        if (priceBadge.length > 0) {
          const hasCurrency = /(FCFA|F\b|CFA|XOF|\$|€|GNF)/i.test(priceBadge);
          if (!hasCurrency) {
            suggestions.push('Price badge is missing explicit currency (e.g. FCFA or CFA) which reduces instant clarity.');
            score -= 10;
          }
        }

        // Direct-response conversion triggers
        const fullText = `${headline} ${subtitle} ${body} ${cta}`.toLowerCase();
        const hasReassurance = /(livraison|paiement|discret|garanti|naturel|gratuit|remboursement)/i.test(fullText);
        if (!hasReassurance) {
          suggestions.push('Add trust/reassurance terms such as "Paiement à la livraison", "Livraison discrète", or "100% Naturel" to increase conversion.');
          score -= 15;
        }

        const hasUrgency = /(aujourd'hui|limité|stock|derniers|vite|promo|urgent)/i.test(fullText);
        if (!hasUrgency) {
          suggestions.push('Add urgency elements (e.g. "Offre valable aujourd\'hui", "Stock limité") to reduce purchase procrastination.');
          score -= 10;
        }

        score = Math.max(0, Math.min(100, score));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  copyScore: score,
                  qualityGrade: score >= 85 ? 'A (Excellent DR Ad)' : score >= 70 ? 'B (Good Copy)' : score >= 50 ? 'C (Needs Optimization)' : 'D (Weak Direct Response)',
                  warnings,
                  suggestions,
                  summary: {
                    headlineLength: headline.length,
                    hasPrice: priceBadge.length > 0,
                    hasReassuranceTrigger: hasReassurance,
                    hasUrgencyTrigger: hasUrgency,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing tool "${name}": ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

/**
 * Start the MCP Server using Standard I/O Transport
 */
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP Server] Static Ads Creative Engine MCP server running on stdio.');
}

runServer().catch(err => {
  console.error('[MCP Server] Fatal initialization error:', err);
  process.exit(1);
});
