import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

describe('Home Sticky Pills Single-Line Audit (360px, Light & Dark)', () => {
  let browser;
  let context;

  before(async () => {
    browser = await chromium.launch();
    context = await browser.newContext({
      viewport: { width: 360, height: 740 }
    });
  });

  after(async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  });

  ['light', 'dark'].forEach(theme => {
    it(`[${theme.toUpperCase()}] sticky pills stay on a single line with zero text wrap at 360px`, async () => {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/?onboarded=1&tab=home&theme=${theme}`, { waitUntil: 'networkidle' });

      const pillsData = await page.evaluate(() => {
        const header = document.querySelector('#pathStickyHeader');
        if (!header) return { foundHeader: false, pills: [] };

        const pillEls = Array.from(header.querySelectorAll('.path-weekly-pill, .path-seeds-pill, .path-mascot-pill'));
        return {
          foundHeader: true,
          headerScrollWidth: header.scrollWidth,
          headerClientWidth: header.clientWidth,
          pills: pillEls.map(pill => {
            const textEl = pill.querySelector('.path-pill-text') || pill;
            const textRects = Array.from(textEl.getClientRects());
            const textComputed = window.getComputedStyle(textEl);
            const pillComputed = window.getComputedStyle(pill);
            return {
              className: pill.className,
              text: pill.innerText.trim().replace(/\s+/g, ' '),
              pillScrollHeight: pill.scrollHeight,
              pillClientHeight: pill.clientHeight,
              textScrollHeight: textEl.scrollHeight,
              textClientHeight: textEl.clientHeight,
              rectCount: textRects.length,
              whiteSpace: pillComputed.whiteSpace,
              textWhiteSpace: textComputed.whiteSpace
            };
          })
        };
      });

      assert.ok(pillsData.foundHeader, 'Path sticky header must be present on home tab');
      assert.ok(pillsData.pills.length >= 2, 'Should have at least 2 sticky pills present');
      assert.ok(pillsData.headerScrollWidth <= pillsData.headerClientWidth + 1, 'Header must not have horizontal scrollbar');

      for (const p of pillsData.pills) {
        // Assert text is concise (e.g. "0 kali", "0 benih", "Biji Tunas")
        assert.ok(p.text.length < 25, `Pill text "${p.text}" must be concise`);
        
        // Assert exactly 1 client rect (means strictly single line, NO line wrapping)
        assert.equal(
          p.rectCount,
          1,
          `Pill (${p.className}) text "${p.text}" wrapped to multiple lines (rectCount: ${p.rectCount})`
        );

        // Assert scrollHeight matches clientHeight (no vertical wrapping)
        assert.ok(
          p.pillScrollHeight <= p.pillClientHeight + 2,
          `Pill (${p.className}) height overflow: scrollHeight ${p.pillScrollHeight} > clientHeight ${p.pillClientHeight}`
        );

        // Assert white-space is nowrap
        assert.equal(p.whiteSpace, 'nowrap', `Pill (${p.className}) must have white-space: nowrap`);
        assert.equal(p.textWhiteSpace, 'nowrap', `Pill text (${p.className}) must have white-space: nowrap`);
      }

      await page.close();
    });
  });
});
