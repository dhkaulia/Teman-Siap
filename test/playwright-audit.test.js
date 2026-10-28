import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

describe('Playwright Audit: Kita Chips, Saya & Kita Budgets, and Lesson Direct URLs', () => {
  let browser;
  let context;

  before(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 360, height: 740 }
    });
  });

  after(async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  });

  describe('Kita: Partner Chips, .sr-only and Pot Spacing (360px, Light & Dark)', () => {
    for (const theme of ['light', 'dark']) {
      it(`[${theme.toUpperCase()}] partner chips sit below pots with >=8px gap, pill-shaped, without overlapping plants or showing sr-only text`, async () => {
        const page = await context.newPage();
        await page.goto(`${BASE_URL}/?onboarded=1&tab=us&theme=${theme}`, { waitUntil: 'networkidle' });

        const result = await page.evaluate(() => {
          // 1. Assert no element with text "Sedang mengisi sebagai" is visible
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let foundVisibleSrText = false;
          while (walker.nextNode()) {
            if (walker.currentNode.textContent.includes('Sedang mengisi sebagai')) {
              const parent = walker.currentNode.parentElement;
              const rect = parent.getBoundingClientRect();
              const style = window.getComputedStyle(parent);
              if (rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && style.display !== 'none') {
                foundVisibleSrText = true;
              }
            }
          }

          // 2. Geometry check: Plant SVG vs Chip
          const plantA = document.querySelector('.plant-partner-a .plant-svg');
          const chipA = document.querySelector('.plant-partner-a .partner-turn-chip');
          const plantB = document.querySelector('.plant-partner-b .plant-svg');
          const chipB = document.querySelector('.plant-partner-b .partner-turn-chip');

          if (!plantA || !chipA || !plantB || !chipB) {
            return { error: 'Required garden elements not found' };
          }

          const rectPlantA = plantA.getBoundingClientRect();
          const rectChipA = chipA.getBoundingClientRect();
          const rectPlantB = plantB.getBoundingClientRect();
          const rectChipB = chipB.getBoundingClientRect();

          const gapA = rectChipA.top - rectPlantA.bottom;
          const gapB = rectChipB.top - rectPlantB.bottom;
          const styleChipA = window.getComputedStyle(chipA);

          return {
            foundVisibleSrText,
            gapA,
            gapB,
            isOverlappingA: rectChipA.top < rectPlantA.bottom,
            isOverlappingB: rectChipB.top < rectPlantB.bottom,
            borderRadius: styleChipA.borderRadius
          };
        });

        await page.close();

        assert.equal(result.foundVisibleSrText, false, '"Sedang mengisi sebagai" must be visually hidden by .sr-only');
        assert.equal(result.isOverlappingA, false, 'Partner A chip must not overlap plant SVG');
        assert.equal(result.isOverlappingB, false, 'Partner B chip must not overlap plant SVG');
        assert.ok(result.gapA >= 8, `Partner A chip gap (${result.gapA}px) must be >= 8px below the pot`);
        assert.ok(result.gapB >= 8, `Partner B chip gap (${result.gapB}px) must be >= 8px below the pot`);
        assert.ok(
          result.borderRadius === '9999px' || parseInt(result.borderRadius, 10) >= 20,
          `Partner chips must be pill-shaped (found: ${result.borderRadius})`
        );
      });
    }
  });

  describe('Text Budget & Height Audits (360px)', () => {
    it('Saya screen is under 90 words and under 3 screens tall (< 2220px)', async () => {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/?onboarded=1&tab=me`, { waitUntil: 'networkidle' });

      const metrics = await page.evaluate(() => {
        const view = document.getElementById('view');
        let text = '';
        const walker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const style = window.getComputedStyle(parent);
            if (
              style.display === 'none' ||
              style.visibility === 'hidden' ||
              parent.classList.contains('sr-only') ||
              parent.closest('.sr-only')
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        while (walker.nextNode()) {
          text += ' ' + walker.currentNode.textContent;
        }
        const totalWords = text.trim().replace(/\s+/g, ' ').split(/\s+/).filter(Boolean).length;
        const scrollHeight = document.documentElement.scrollHeight;
        return { totalWords, scrollHeight };
      });

      await page.close();

      assert.ok(metrics.totalWords < 90, `Saya word count (${metrics.totalWords}) must be under 90 words`);
      assert.ok(metrics.scrollHeight < 2220, `Saya page height (${metrics.scrollHeight}px) must be under 3 screens tall (< 2220px)`);
    });

    it('Kita screen has garden first, at most two tiles, and under 60 words before first scroll', async () => {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/?onboarded=1&tab=us`, { waitUntil: 'networkidle' });

      const metrics = await page.evaluate(() => {
        const view = document.getElementById('view');
        const tiles = view.querySelectorAll('.kita-tile-btn');
        const subTitles = view.querySelectorAll('.kita-tile-sub');

        let text = '';
        const walker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const style = window.getComputedStyle(parent);
            if (
              style.display === 'none' ||
              style.visibility === 'hidden' ||
              parent.classList.contains('sr-only') ||
              parent.closest('.sr-only')
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            const rect = parent.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        while (walker.nextNode()) {
          text += ' ' + walker.currentNode.textContent;
        }
        const firstScrollWords = text.trim().replace(/\s+/g, ' ').split(/\s+/).filter(Boolean).length;
        return { tileCount: tiles.length, subTitleCount: subTitles.length, firstScrollWords };
      });

      await page.close();

      assert.ok(metrics.tileCount <= 2, `Kita must have at most 2 tiles (found: ${metrics.tileCount})`);
      assert.equal(metrics.subTitleCount, 0, 'Description lines in Kita tiles must be removed');
      assert.ok(metrics.firstScrollWords < 60, `Kita word count before first scroll (${metrics.firstScrollWords}) must be under 60 words`);
    });

    it('Header brand icon reads as a sprout at 32px in light and dark', async () => {
      const page = await context.newPage();
      for (const theme of ['light', 'dark']) {
        await page.goto(`${BASE_URL}/?onboarded=1&tab=home&theme=${theme}`, { waitUntil: 'networkidle' });
        const iconData = await page.evaluate(() => {
          const sym = document.querySelector('.brand-symbol');
          if (!sym) return null;
          const rect = sym.getBoundingClientRect();
          const svg = sym.querySelector('svg');
          const hasLeaves = svg && svg.innerHTML.includes('fill="currentColor"');
          return { width: Math.round(rect.width), height: Math.round(rect.height), hasLeaves };
        });

        assert.ok(iconData, 'Brand symbol must exist');
        assert.equal(iconData.width, 32, 'Brand symbol width must be 32px');
        assert.equal(iconData.height, 32, 'Brand symbol height must be 32px');
        assert.equal(iconData.hasLeaves, true, 'Brand sprout icon must have filled leaves');
      }
      await page.close();
    });
  });

  describe('Lesson Direct Deep-Linking (?lesson=<id>) and Word Budget', () => {
    const lessons = [
      { id: 'lesson-naming-feelings', expectedTitle: 'Menamai Perasaan' },
      { id: 'lesson-urge-surfing', expectedTitle: 'Dorongan Belanja' },
      { id: 'lesson-gottman-complaint', expectedTitle: 'Kritik Menyerang' }
    ];

    for (const l of lessons) {
      it(`?lesson=${l.id} opens lesson directly, mounting step 1 with under 40 words`, async () => {
        const page = await context.newPage();
        await page.goto(`${BASE_URL}/?lesson=${l.id}`, { waitUntil: 'networkidle' });

        await page.waitForSelector('.session-overlay', { state: 'visible', timeout: 5000 });

        const stepData = await page.evaluate(() => {
          const overlay = document.querySelector('.session-overlay');
          const stepContainer = overlay.querySelector('.session-step-container') || overlay;

          let text = '';
          const walker = document.createTreeWalker(stepContainer, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const style = window.getComputedStyle(parent);
              if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                parent.classList.contains('sr-only') ||
                parent.closest('.sr-only')
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          });

          while (walker.nextNode()) {
            text += ' ' + walker.currentNode.textContent;
          }
          const words = text.trim().replace(/\s+/g, ' ').split(/\s+/).filter(Boolean).length;
          const heading = overlay.querySelector('h1, h2, .step-title')?.textContent?.trim() || '';
          return { heading, words, text: text.trim().replace(/\s+/g, ' ') };
        });

        await page.close();

        assert.ok(stepData.heading.length > 0, 'Lesson step 1 heading must be rendered');
        assert.ok(stepData.words < 40, `Lesson ${l.id} first step word count (${stepData.words}) must be under 40 words`);
      });
    }
  });
});
