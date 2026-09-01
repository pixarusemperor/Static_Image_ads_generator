# SYNPHONYS Creative Engine — Model Context Protocol (MCP) Integration Guide

This guide details how to connect the **Static Image Ads Creative Engine** as an official Model Context Protocol (MCP) Server to autonomous AI agents across **Antigravity**, **Claude Desktop**, **Cursor**, and the **SYNPHONYS** company operating system (`/home/stevenjossu/SYNPHONYS`).

---

## 1. Architecture Overview

```mermaid
graph TD
    subgraph SYNPHONYS Multi-Agent Layer
        Strategist[Creative Strategist Agent]
        Copywriter[Direct-Response Copywriter Agent]
        MediaBuyer[Media Buyer / Campaign Agent]
    end

    subgraph MCP Server Transport (Stdio JSON-RPC)
        MCP[Static Ads MCP Server<br/>scripts/mcp-server.mjs]
    end

    subgraph Available Tools
        T1["list_templates"]
        T2["get_template_details"]
        T3["validate_ad_copy"]
        T4["render_ad"]
        T5["batch_render_campaign"]
    end

    subgraph Creative Engine
        Renderer[Universal Satori + Resvg Rust Engine]
        R2[Cloudflare R2 Bucket / CDN Storage]
        Local[Local Disk Output]
    end

    Strategist -->|Discover templates & angles| MCP
    Copywriter -->|Audit headlines & copy score| MCP
    MediaBuyer -->|Render 10x creatives| MCP

    MCP --> T1 & T2 & T3 & T4 & T5
    T4 & T5 --> Renderer
    Renderer --> R2
    Renderer --> Local
```

---

## 2. MCP Server Configuration

### Claude Desktop Configuration
Add the server definition to your `claude_desktop_config.json` (`~/.config/Claude/claude_desktop_config.json` or `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "static-ads-generator": {
      "command": "node",
      "args": [
        "/home/stevenjossu/Static_Image_ads_generator/scripts/mcp-server.mjs"
      ],
      "env": {
        "ADS_API_URL": "https://superads.orizongroup.online"
      }
    }
  }
}
```

### Cursor IDE MCP Configuration
Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "static-ads": {
      "command": "node",
      "args": [
        "/home/stevenjossu/Static_Image_ads_generator/scripts/mcp-server.mjs"
      ]
    }
  }
}
```

### Antigravity / Agentic CLI Integration
Add to `/home/stevenjossu/.gemini/antigravity-cli/mcp/static-ads-generator/config.json`:

```json
{
  "command": "node",
  "args": ["/home/stevenjossu/Static_Image_ads_generator/scripts/mcp-server.mjs"],
  "env": {
    "ADS_API_URL": "https://superads.orizongroup.online"
  }
}
```

---

## 3. Tool Reference

### 1. `list_templates`
Discovers available ad templates, dimensions, categories, and editable variable fields.

- **Parameters**:
  - `category` (optional, string): Filter by `'all'`, `'direct-response'`, `'publisher'`, `'social'`, `'recruitment'`, `'typographic'`, or `'custom'`.

**Example Output**:
```json
{
  "count": 2,
  "templates": [
    {
      "id": "1-a",
      "name": "1-A: Niche Product (Default)",
      "category": "direct-response",
      "description": "Dual-banner header with subject photo, product mockup, yellow price badge...",
      "dimensions": { "width": 1080, "height": 1080 },
      "tags": ["Dual Banner", "Mockup", "Price Badge"],
      "fieldNames": ["headerLine1", "headerLine2", "subjectImage", "productImage", "priceBadgeText", "footerLine1", "footerLine2"]
    }
  ]
}
```

---

### 2. `get_template_details`
Provides in-depth schema, default copy, and direct-response formulas for a given template.

- **Parameters**:
  - `templateId` (string, required): e.g. `'1-a'`, `'1-b'`, `'2-a'`, `'3-a'`, `'3-b'`, `'4-a'`, `'5-a'`, `'custom'`.

---

### 3. `validate_ad_copy`
Audits headline length, pricing formatting, urgency triggers, and trust points against direct-response best practices.

- **Parameters**:
  - `headline` (string): Primary hook.
  - `subtitle` (string): Secondary explanation.
  - `priceBadge` (string): Offer / price text.
  - `body` (string): Body text.
  - `cta` (string): Call to action.

**Example Output**:
```json
{
  "copyScore": 90,
  "qualityGrade": "A (Excellent DR Ad)",
  "warnings": [],
  "suggestions": [
    "Add urgency elements (e.g. \"Offre valable aujourd'hui\", \"Stock limité\") to reduce purchase procrastination."
  ],
  "summary": {
    "headlineLength": 48,
    "hasPrice": true,
    "hasReassuranceTrigger": true,
    "hasUrgencyTrigger": false
  }
}
```

---

### 4. `render_ad`
Compiles and generates a 1080x1080 static image ad to local disk or Cloudflare R2 CDN.

- **Parameters**:
  - `templateId` (string, required): Template identifier.
  - `variables` (object, required): Text/image key-value overrides.
  - `uploadToR2` (boolean, optional): Uploads directly to Cloudflare R2 bucket.
  - `outputPath` (string, optional): Local file path to save rendered PNG.
  - `endpoint` (string, optional): Custom assembly API endpoint.

**Example Agent Call**:
```json
{
  "name": "render_ad",
  "arguments": {
    "templateId": "1-a",
    "variables": {
      "headerLine1": "INFUSION VOLCANIQUE 100% BIO",
      "headerLine2": "DUREZ PLUS DE 45 MINUTES NATURELLEMENT",
      "priceBadgeText": "PROMO : 5.000 FCFA",
      "footerLine1": "PAIEMENT À LA LIVRAISON PARTOUT À ABIDJAN"
    },
    "outputPath": "./campaign/volcano-tea-ad-1.png"
  }
}
```

---

### 5. `batch_render_campaign`
Executes multi-creative batch renders across varied angles, headlines, and templates for automated A/B testing.

- **Parameters**:
  - `manifest` (array, required): Array of creative definitions (`templateId`, `variables`, `outputName`, `uploadToR2`).
  - `outputDir` (string, optional): Destination directory (default: `./output`).

---

## 4. Testing & Verification

Run the automated verification suite to validate all tools over stdio:

```bash
node scripts/test-mcp-server.mjs
```

Or test via npm script:
```bash
npm run mcp
```
