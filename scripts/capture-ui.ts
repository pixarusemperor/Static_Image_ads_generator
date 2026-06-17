import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Listen to browser console and errors to diagnose UI rendering issues
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.error('[Browser Error] ', err);
  });
  
  console.log('Navigating to http://localhost:3002...');
  try {
    await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 60000 });
  } catch (gotoError) {
    console.warn('Navigation wait timed out, continuing anyway...', gotoError);
  }
  
  console.log('Waiting for preview component to compile...');
  try {
    // Wait for the subject image of the default template 1-A
    await page.waitForSelector('img[alt="Subject"]', { timeout: 30000 });
  } catch (e) {
    console.warn('Wait for img[alt="Subject"] timed out, saving page HTML and taking fallback screenshot.', e);
  }
  
  // Wait for rendering to settle
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Capturing viewport screenshot...');
  const outputDir = path.join(__dirname, '../public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const screenshotPath = path.join(outputDir, 'ui-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`UI screenshot successfully saved at: ${screenshotPath}`);
  
  await browser.close();
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
