import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: '360px', width: 360, height: 740 },
  { name: '412px', width: 412, height: 915 }
];
const THEMES = ['light', 'dark'];

describe('Playwright Overflow & Text Clipping Audit (360px & 412px, Light & Dark)', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch();
  });

  after(async () => {
    if (browser) await browser.close();
  });

  async function checkPageOverflow(page, contextLabel) {
    const overflowReport = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const innerW = window.innerWidth;
      
      const pageOverflow = {
        docScrollWidth: docEl.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        innerW,
        hasPageHScroll: docEl.scrollWidth > innerW + 1 || body.scrollWidth > innerW + 1
      };

      // Check all visible containers, cards, buttons, text blocks for clipped overflow
      const elements = Array.from(document.querySelectorAll('.session-overlay, .session-body, .card, .harsh-quote-card, .bicara-option-btn, .urge-scene-box, .urge-reframe-card, button, h1, h2, h3, p'));
      const clippedElements = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        // An element has internal horizontal clipping if its scrollWidth exceeds clientWidth by more than 1px
        // (ignoring multiline vertical scrolling containers whose overflow-y is scroll/auto)
        if (el.scrollWidth > el.clientWidth + 1.5 && style.overflowX !== 'auto' && style.overflowX !== 'scroll') {
          clippedElements.push({
            tag: el.tagName.toLowerCase(),
            className: el.className,
            textSnippet: (el.innerText || '').slice(0, 30).trim(),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            diff: el.scrollWidth - el.clientWidth
          });
        }
      }

      return { pageOverflow, clippedElements };
    });

    assert.equal(
      overflowReport.pageOverflow.hasPageHScroll,
      false,
      `[${contextLabel}] Page has horizontal overflow: docScroll=${overflowReport.pageOverflow.docScrollWidth}, bodyScroll=${overflowReport.pageOverflow.bodyScrollWidth}, innerW=${overflowReport.pageOverflow.innerW}`
    );

    assert.deepEqual(
      overflowReport.clippedElements,
      [],
      `[${contextLabel}] Found elements with clipped text: ${JSON.stringify(overflowReport.clippedElements)}`
    );
  }

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const contextLabel = `${vp.name} ${theme.toUpperCase()}`;

      it(`[${contextLabel}] Lesson step has zero horizontal overflow and no clipped text`, async () => {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/?lesson=lesson-naming-feelings&theme=${theme}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.session-overlay', { state: 'visible' });
        await checkPageOverflow(page, `Lesson ${contextLabel}`);
        await page.close();
      });

      it(`[${contextLabel}] Bicara Lembut game has zero horizontal overflow and no clipped text`, async () => {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/?onboarded=1&tab=us&theme=${theme}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#startBicaraLembutBtn', { state: 'visible' });
        await page.click('#startBicaraLembutBtn');
        await page.waitForSelector('.session-overlay', { state: 'visible' });
        await page.waitForSelector('.harsh-quote-card', { state: 'visible' });
        await checkPageOverflow(page, `Bicara Lembut ${contextLabel}`);
        await page.close();
      });

      it(`[${contextLabel}] Urge step ("Jeda Sadar 10 Menit") has zero horizontal overflow and no clipped text`, async () => {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/?onboarded=1&tab=money&theme=${theme}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('#hubUrgeRow', { state: 'visible' });
        await page.click('#hubUrgeRow');
        await page.waitForSelector('.session-overlay', { state: 'visible' });
        
        // Advance from step 1 (intensity) to step 2 ("Jeda Sadar 10 Menit")
        await page.waitForSelector('#sessionNextBtn', { state: 'visible' });
        await page.click('#sessionNextBtn');
        await page.waitForSelector('.step-leaving', { state: 'detached' });
        await page.waitForSelector('.urge-scene-box', { state: 'visible' });
        
        // Verify title on the active step container
        const titleText = await page.evaluate(() => {
          const activeContainer = document.querySelector('.session-step-container:not(.step-leaving)');
          return activeContainer?.innerText || '';
        });
        assert.ok(titleText.includes('Jeda Sadar 10 Menit'), 'Should be on the "Jeda Sadar 10 Menit" step');

        await checkPageOverflow(page, `Urge Surfing ${contextLabel}`);
        await page.close();
      });
    }
  }
});
