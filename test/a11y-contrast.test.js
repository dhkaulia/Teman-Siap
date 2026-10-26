import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * WCAG 2.1 Contrast Formula from antislop-human
 */
function hexToLuminance(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLin = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Accessibility: Contrast Ratio Measurements (WCAG 2.1 AA >= 4.5:1)', () => {
  // Light Theme Pairs
  describe('Light Theme Tokens', () => {
    const bgCanvas = '#F4F6F5';
    const bgCard = '#FFFFFF';
    const inkPrimary = '#12211F';
    const inkSecondary = '#485D5A';
    const primaryTeal = '#1B5E59';
    const relationalPlum = '#6B4E71';

    it('ink-primary on bg-card exceeds 4.5:1 (measures > 15:1)', () => {
      const ratio = contrastRatio(inkPrimary, bgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 15.0);
    });

    it('ink-primary on bg-canvas exceeds 4.5:1', () => {
      const ratio = contrastRatio(inkPrimary, bgCanvas);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('ink-secondary on bg-card exceeds 4.5:1', () => {
      const ratio = contrastRatio(inkSecondary, bgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 6.0);
    });

    it('white text on primary teal button exceeds 4.5:1', () => {
      const ratio = contrastRatio('#FFFFFF', primaryTeal);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 6.0);
    });

    it('white text on relational plum button exceeds 4.5:1', () => {
      const ratio = contrastRatio('#FFFFFF', relationalPlum);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });
  });

  // Dark Theme Pairs
  describe('Dark Theme Tokens', () => {
    const darkBgCanvas = '#101716';
    const darkBgCard = '#182322';
    const darkInkPrimary = '#F0F6F5';
    const darkInkSecondary = '#9EABA9';
    const darkTeal = '#4FB0A8';

    it('dark ink-primary on dark bg-card exceeds 4.5:1 (measures > 13:1)', () => {
      const ratio = contrastRatio(darkInkPrimary, darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('dark ink-primary on dark bg-canvas exceeds 4.5:1', () => {
      const ratio = contrastRatio(darkInkPrimary, darkBgCanvas);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('dark ink-secondary on dark bg-card exceeds 4.5:1', () => {
      const ratio = contrastRatio(darkInkSecondary, darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 6.0);
    });

    it('dark teal on dark bg-card exceeds 4.5:1 (for headings/accents)', () => {
      const ratio = contrastRatio(darkTeal, darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });
  });
});
