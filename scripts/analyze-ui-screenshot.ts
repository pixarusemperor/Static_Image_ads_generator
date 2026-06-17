import fs from 'fs';
import path from 'path';
import { getGenAIClient, getGenAIModel } from '../src/utils/ai';

// Set up default env vars for GCP Vertex AI if not set
process.env.VERTEX_AI = process.env.VERTEX_AI || 'false';

async function analyze() {
  console.log('Reading screenshot...');
  const screenshotPath = path.join(__dirname, '../public/ui-screenshot.png');
  if (!fs.existsSync(screenshotPath)) {
    throw new Error('Screenshot file not found! Please run the capture-ui script first.');
  }
  
  const base64Image = fs.readFileSync(screenshotPath).toString('base64');
  
  console.log('Initializing Gen AI client...');
  const client = getGenAIClient();
  
  console.log('Calling Gemini Vision API to analyze UI...');
  const prompt = `You are a professional QA designer and web developer.
Analyze this screenshot of the Static Image Ads Generator editor UI page.
Verify and report on:
1. Is the central ad preview canvas visible? What template and content are rendered inside it?
2. Are all panels (left template chooser, center preview canvas, right layer settings panel, rightmost AI chat assistant) rendered correctly?
3. Are there any broken images (e.g. placeholder icons or missing image blocks), layout misalignment, styling overflow, or overlapping texts?
4. Rate the overall visual layout and confirm if the ad preview renders properly.
Be thorough and objective.`;

  const response = await client.models.generateContent({
    model: getGenAIModel(),
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
        ],
      },
    ],
  });
  
  console.log('\n==================================================');
  console.log('GEMINI MULTIMODAL UI QUALITY REVIEW');
  console.log('==================================================\n');
  console.log(response.text);
  console.log('\n==================================================');
}

analyze().catch(err => {
  console.error('Analysis failed:', err);
  process.exit(1);
});
