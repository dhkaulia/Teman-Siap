import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/3ac4a5ec-9211-45fb-952f-86b45ca4d384/screenshots';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }
  });
  const page = await context.newPage();

  // 1. Kita light & dark
  await page.goto('http://127.0.0.1:3000/?onboarded=1&tab=us&theme=light');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'kita-chips-360px-light.png') });

  await page.goto('http://127.0.0.1:3000/?onboarded=1&tab=us&theme=dark');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'kita-chips-360px-dark.png') });

  // 2. Saya light & dark
  await page.goto('http://127.0.0.1:3000/?onboarded=1&tab=me&theme=light');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'saya-compact-360px-light.png') });

  await page.goto('http://127.0.0.1:3000/?onboarded=1&tab=me&theme=dark');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'saya-compact-360px-dark.png') });

  // 3. Lesson direct URL
  await page.goto('http://127.0.0.1:3000/?lesson=lesson-naming-feelings');
  await page.waitForSelector('.session-overlay', { state: 'visible' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'lesson-direct-360px.png') });

  console.log('Screenshots captured successfully.');
  await browser.close();
}

capture().catch(console.error);
