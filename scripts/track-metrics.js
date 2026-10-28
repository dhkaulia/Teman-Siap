/**
 * Teman Siap — Playwright Tracking Script
 * Measures words, page height, partner chips spacing, and lesson steps at 360px
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 }
  });
  const page = await context.newPage();

  console.log('\n============================================================');
  console.log('TEMAN SIAP — TAB METRICS AUDIT (360px Mobile-First)');
  console.log('============================================================\n');

  const tabs = [
    { id: 'home', name: 'Beranda' },
    { id: 'emo', name: 'Emosi' },
    { id: 'money', name: 'Uang' },
    { id: 'us', name: 'Kita' },
    { id: 'me', name: 'Saya' }
  ];

  for (const tab of tabs) {
    await page.goto(`${BASE_URL}/?onboarded=1&tab=${tab.id}`, { waitUntil: 'networkidle' });
    
    // Evaluate word count and page height
    const metrics = await page.evaluate(() => {
      const view = document.getElementById('view');
      if (!view) return { totalWords: 0, firstScrollWords: 0, scrollHeight: 0 };

      // Helper to count words from visible text nodes
      function getVisibleText(root, viewportOnly = false) {
        let text = '';
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const style = window.getComputedStyle(parent);
            if (
              style.display === 'none' ||
              style.visibility === 'hidden' ||
              style.opacity === '0' ||
              parent.classList.contains('sr-only') ||
              parent.closest('.sr-only')
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            if (viewportOnly) {
              const rect = parent.getBoundingClientRect();
              if (rect.bottom < 0 || rect.top > window.innerHeight) {
                return NodeFilter.FILTER_REJECT;
              }
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        while (walker.nextNode()) {
          text += ' ' + walker.currentNode.textContent;
        }
        return text.trim().replace(/\s+/g, ' ');
      }

      const allText = getVisibleText(view, false);
      const firstScrollText = getVisibleText(view, true);

      const totalWords = allText.split(/\s+/).filter(Boolean).length;
      const firstScrollWords = firstScrollText.split(/\s+/).filter(Boolean).length;
      const scrollHeight = document.documentElement.scrollHeight;

      return { totalWords, firstScrollWords, scrollHeight, allText };
    });

    const screensTall = (metrics.scrollHeight / 740).toFixed(1);
    console.log(`[Tab: ${tab.name.padEnd(7)}] Words total: ${String(metrics.totalWords).padStart(3)} | Before 1st scroll: ${String(metrics.firstScrollWords).padStart(2)} words | Height: ${metrics.scrollHeight}px (${screensTall} screens)`);
  }

  console.log('\n============================================================');
  console.log('KITA: PARTNER CHIPS & GARDEN SPACING AUDIT');
  console.log('============================================================\n');

  for (const theme of ['light', 'dark']) {
    await page.goto(`${BASE_URL}/?onboarded=1&tab=us&theme=${theme}`, { waitUntil: 'networkidle' });

    const kitaCheck = await page.evaluate((currentTheme) => {
      // 1. Check if "Sedang mengisi sebagai" is visible
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
        return { error: 'Elements not found' };
      }

      const rectPlantA = plantA.getBoundingClientRect();
      const rectChipA = chipA.getBoundingClientRect();
      const rectPlantB = plantB.getBoundingClientRect();
      const rectChipB = chipB.getBoundingClientRect();

      const gapA = rectChipA.top - rectPlantA.bottom;
      const gapB = rectChipB.top - rectPlantB.bottom;

      const styleChipA = window.getComputedStyle(chipA);

      return {
        theme: currentTheme,
        foundVisibleSrText,
        gapA: Math.round(gapA),
        gapB: Math.round(gapB),
        isOverlappingA: rectChipA.top < rectPlantA.bottom,
        isOverlappingB: rectChipB.top < rectPlantB.bottom,
        borderRadius: styleChipA.borderRadius
      };
    }, theme);

    console.log(`[Theme: ${theme.padEnd(5)}] Gap A: ${kitaCheck.gapA}px | Gap B: ${kitaCheck.gapB}px | Overlap A: ${kitaCheck.isOverlappingA} | Overlap B: ${kitaCheck.isOverlappingB} | "Sedang mengisi..." visible: ${kitaCheck.foundVisibleSrText} | Chip radius: ${kitaCheck.borderRadius}`);
  }

  console.log('\n============================================================');
  console.log('LESSON PLAYER: DIRECT URL (?lesson=<id>) AUDIT (360px)');
  console.log('============================================================\n');

  const lessonIds = [
    'lesson-naming-feelings',
    'lesson-urge-surfing',
    'lesson-gottman-complaint'
  ];

  for (const lId of lessonIds) {
    await page.goto(`${BASE_URL}/?lesson=${lId}`, { waitUntil: 'networkidle' });

    // Wait for session overlay to appear
    await page.waitForSelector('.session-overlay', { state: 'visible', timeout: 5000 });

    const lessonData = await page.evaluate(() => {
      const overlay = document.querySelector('.session-overlay');
      if (!overlay) return { error: 'Overlay not found' };

      // Helper to count visible words inside step card
      const stepCard = overlay.querySelector('.session-step-container') || overlay;
      
      const walker = document.createTreeWalker(stepCard, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(parent);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            parent.classList.contains('sr-only')
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let text = '';
      while (walker.nextNode()) {
        text += ' ' + walker.currentNode.textContent;
      }
      text = text.trim().replace(/\s+/g, ' ');
      const words = text.split(/\s+/).filter(Boolean).length;
      const title = overlay.querySelector('h1, h2, .step-title')?.textContent?.trim() || '';

      return { title, words, text };
    });

    console.log(`[Lesson: ${lId}] Step 1 Title: "${lessonData.title}" | Word count: ${lessonData.words} words (Target < 40)`);
  }

  console.log('\n============================================================\n');

  await browser.close();
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
