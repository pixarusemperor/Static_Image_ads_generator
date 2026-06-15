import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST as analyzeHandler } from '../src/app/api/analyze/route';
import { POST as chatHandler } from '../src/app/api/chat/route';
import { POST as assembleHandler } from '../src/app/api/assemble/route';
import { POST as removeBgHandler } from '../src/app/api/remove-bg/route';
import { getGenAIClient, getGenAIModel } from '../src/utils/ai';
import { resolveImageToBase64 } from '../src/utils/image';

// Setup environment variables for Next/React imports
process.env.VERTEX_AI = process.env.VERTEX_AI || 'false';

async function runVerification() {
  console.log('==================================================');
  console.log('STARTING AUTOMATED CLOSED-LOOP AD GENERATOR TEST');
  console.log('==================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 1: TEST REFERENCE IMAGE VISION ANALYSIS
    // ----------------------------------------------------
    console.log('[Step 1] Classifying & extracting reference image using Gemini...');
    const testImageName = '32.png';
    const base64Image = await resolveImageToBase64(testImageName);
    
    if (!base64Image || !base64Image.startsWith('data:')) {
      throw new Error(`Could not resolve test image ${testImageName}`);
    }

    // Call the analyze route handler programmatically
    const analyzeReq = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, name: testImageName }),
    });
    
    const analyzeRes = await analyzeHandler(analyzeReq);
    if (!analyzeRes.ok) {
      throw new Error(`Analyze handler failed with status ${analyzeRes.status}`);
    }
    
    const analyzeData = await analyzeRes.json();
    console.log('-> Classification Result:', JSON.stringify(analyzeData, null, 2));
    
    if (!analyzeData.templateId || !analyzeData.variables) {
      throw new Error('Analyze response missing critical fields (templateId or variables)');
    }
    
    let currentVariables = analyzeData.variables;
    const templateId = analyzeData.templateId;

    // ----------------------------------------------------
    // STEP 2: TEST BACKGROUND REMOVAL ROUTE
    // ----------------------------------------------------
    console.log('\n[Step 2] Testing background remover route...');
    // We send a small mock pixel image to avoid heavy processing in tests
    const mockPixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const removeBgReq = new NextRequest('http://localhost/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: mockPixelBase64 }),
    });

    const removeBgRes = await removeBgHandler(removeBgReq);
    if (!removeBgRes.ok) {
      throw new Error(`Remove-bg handler failed with status ${removeBgRes.status}`);
    }
    console.log('-> Remove-bg Processed Status Header:', removeBgRes.headers.get('X-Rembg-Processed'));

    // ----------------------------------------------------
    // STEP 3: TEST CHAT MODIFICATION (ITERATION LOOP)
    // ----------------------------------------------------
    const editPrompt = "Changer le badge de prix en 'PROMO SPECIEUSE: 3.500F' et mettre le titre principal en majuscule.";
    console.log(`\n[Step 3] Applying natural language design update request: "${editPrompt}"`);

    const chatReq = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: editPrompt,
        templateId,
        variables: currentVariables,
      }),
    });

    const chatRes = await chatHandler(chatReq);
    if (!chatRes.ok) {
      throw new Error(`Chat handler failed with status ${chatRes.status}`);
    }
    
    const chatData = await chatRes.json();
    console.log('-> Chat Update Result (Variables):', JSON.stringify(chatData.variables, null, 2));
    currentVariables = chatData.variables;

    // ----------------------------------------------------
    // STEP 4: TEST PROGRAMMATIC ASSEMBLER RENDER
    // ----------------------------------------------------
    console.log('\n[Step 4] Compiling ad layout via Programmatic Assembler (Satori/Resvg)...');
    const assembleReq = new NextRequest('http://localhost/api/assemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        variables: currentVariables,
      }),
    });

    const assembleRes = await assembleHandler(assembleReq);
    if (!assembleRes.ok) {
      throw new Error(`Assemble handler failed with status ${assembleRes.status}`);
    }
    
    const imageBlob = await assembleRes.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    
    const outputDir = path.join(__dirname, '../public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'verified-output.png');
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`-> Output ad successfully compiled and saved to: ${outputPath}`);

    // ----------------------------------------------------
    // STEP 5: AUTOMATED VISION REVIEW & ITERATION
    // ----------------------------------------------------
    console.log('\n[Step 5] Triggering Gemini AI Vision Automated Reviewer...');
    const generatedBase64 = imageBuffer.toString('base64');
    
    let client;
    try {
      client = getGenAIClient();
    } catch (e) {
      console.warn('-> Skipping Gemini Vision review because GCP credentials/API key is not configured.', e);
      console.log('==================================================');
      console.log('VERIFICATION COMPLETE (PARTIAL PASS - LOCAL FLOWS)');
      console.log('==================================================');
      return;
    }

    const reviewerPrompt = `You are an expert design QA reviewer.
Analyze this compiled advertisement banner and verify:
1. Is the visual layout clean and professional? Check for text overlaps, font loading issues, or layout clipping.
2. Does the text content match the user's modifications (e.g. Price badge showing 'PROMO SPECIEUSE: 3.500F')?
3. Check overall alignment and aesthetics.

You MUST respond with a JSON object following this schema:
{
  "isValid": boolean,
  "visualGrade": "A" | "B" | "C" | "D" | "F",
  "discrepancies": string[],
  "feedbackForIteration": string
}`;

    const response = await client.models.generateContent({
      model: getGenAIModel(),
      contents: [
        {
          role: 'user',
          parts: [
            { text: reviewerPrompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: generatedBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            isValid: { type: 'BOOLEAN' },
            visualGrade: { type: 'STRING', enum: ['A', 'B', 'C', 'D', 'F'] },
            discrepancies: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            feedbackForIteration: { type: 'STRING' },
          },
          required: ['isValid', 'visualGrade', 'discrepancies', 'feedbackForIteration'],
        },
      },
    });

    const reviewText = response.text;
    if (!reviewText) {
      throw new Error('Gemini vision reviewer returned empty response');
    }

    const reviewResult = JSON.parse(reviewText);
    console.log('-> Gemini QA Review Output:', JSON.stringify(reviewResult, null, 2));

    if (reviewResult.isValid) {
      console.log('\n==================================================');
      console.log('VERIFICATION PASSED! Creative is design QA approved.');
      console.log('==================================================');
    } else {
      console.log('\n-> Visual discrepancies found. Starting correction iteration...');
      console.log(`-> Gemini feedback for adjustment: "${reviewResult.feedbackForIteration}"`);
      
      // Iterate: call chat route with Gemini's visual feedback
      const correctionReq = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `S'il vous plaît corriger les éléments suivants: ${reviewResult.feedbackForIteration}`,
          templateId,
          variables: currentVariables,
        }),
      });

      const correctionRes = await chatHandler(correctionReq);
      if (!correctionRes.ok) {
        throw new Error(`Correction chat handler failed with status ${correctionRes.status}`);
      }
      
      const correctionData = await correctionRes.json();
      console.log('-> Iterative correction updated variables successfully.');
      
      // Re-assemble corrected variant
      const finalAssembleReq = new NextRequest('http://localhost/api/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          variables: correctionData.variables,
        }),
      });

      const finalAssembleRes = await assembleHandler(finalAssembleReq);
      if (!finalAssembleRes.ok) {
        throw new Error(`Final assemble failed with status ${finalAssembleRes.status}`);
      }
      
      const finalBlob = await finalAssembleRes.blob();
      fs.writeFileSync(outputPath, Buffer.from(await finalBlob.arrayBuffer()));
      console.log(`-> Iterated creative compiled and saved at: ${outputPath}`);
      console.log('\n==================================================');
      console.log('VERIFICATION COMPLETE WITH 1 CORRECTION ITERATION');
      console.log('==================================================');
    }

  } catch (error) {
    console.error('\nVerification execution failed with error:', error);
    process.exit(1);
  }
}

runVerification();
