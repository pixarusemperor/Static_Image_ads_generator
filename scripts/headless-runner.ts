#!/usr/bin/env tsx
/**
 * Headless CLI Runner for SuperAds Engine
 * Allows MCP Server, Symphony agents, and offline test runners to execute
 * rendering, adaptation, and orchestration directly without requiring a live HTTP server.
 */

import fs from 'fs';
import path from 'path';
import { renderAdToPng } from '../src/core/renderer/engine';
import { adaptContentToTemplate } from '../src/core/templates/adapter';
import { orchestrateCampaign, OrchestrationPayload } from '../src/core/orchestration';

async function main() {
  const args = process.argv.slice(2);
  let action = 'render';
  let templateId = '1-a';
  let varsJson = '{}';
  let payloadJson = '{}';
  let outputPath = '';
  let uploadToR2 = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--action' && args[i + 1]) action = args[++i];
    else if (args[i] === '--template' && args[i + 1]) templateId = args[++i];
    else if (args[i] === '--vars' && args[i + 1]) varsJson = args[++i];
    else if (args[i] === '--payload' && args[i + 1]) payloadJson = args[++i];
    else if (args[i] === '--output' && args[i + 1]) outputPath = args[++i];
    else if (args[i] === '--upload-r2') uploadToR2 = true;
  }

  try {
    if (action === 'render') {
      let variables = {};
      try {
        variables = JSON.parse(varsJson);
      } catch {}

      const result = await renderAdToPng(templateId, variables, { uploadToR2 });
      const base64Url = `data:image/png;base64,${result.pngBuffer.toString('base64')}`;

      if (outputPath) {
        const dir = path.dirname(path.resolve(outputPath));
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.resolve(outputPath), result.pngBuffer);
      }

      console.log(
        JSON.stringify({
          success: true,
          templateId,
          width: result.width,
          height: result.height,
          dimensions: { width: result.width, height: result.height },
          r2Url: result.r2Url || null,
          imageBase64: base64Url,
          localSavedPath: outputPath ? path.resolve(outputPath) : null,
        })
      );
    } else if (action === 'adapt') {
      let content = {};
      try {
        content = JSON.parse(varsJson);
      } catch {}

      const adapted = adaptContentToTemplate(templateId, content);
      console.log(JSON.stringify({ success: true, ...adapted }));
    } else if (action === 'orchestrate') {
      let payload: OrchestrationPayload;
      try {
        payload = JSON.parse(payloadJson);
      } catch (err: any) {
        throw new Error(`Invalid JSON payload: ${err.message}`);
      }

      const result = await orchestrateCampaign(payload);
      console.log(JSON.stringify(result));
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error(JSON.stringify({ success: false, error: error.message || String(error) }));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
});
