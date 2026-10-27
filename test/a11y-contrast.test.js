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

    it('white text on tunas green button exceeds 4.5:1', () => {
      const ratio = contrastRatio('#FFFFFF', '#15803D');
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 5.0);
    });

    it('white text on soft coral button exceeds 4.5:1 (not red)', () => {
      const ratio = contrastRatio('#FFFFFF', '#C84825');
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('dark ink on sunny yellow button exceeds 4.5:1', () => {
      const ratio = contrastRatio(inkPrimary, '#F59E0B');
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 7.0);
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

    it('dark tunas green on dark bg-card exceeds 4.5:1', () => {
      const ratio = contrastRatio('#4ADE80', darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 9.0);
    });

    it('dark soft coral on dark bg-card exceeds 4.5:1', () => {
      const ratio = contrastRatio('#FB923C', darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 7.0);
    });

    it('dark sunny yellow on dark bg-card exceeds 4.5:1', () => {
      const ratio = contrastRatio('#FCD34D', darkBgCard);
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 11.0);
    });

    // Layered Dark Mode Surfaces & Dark Button Fills
    it('primary text #E8F0EE on surface-1 (#182221) exceeds 12:1 (measures > 14:1)', () => {
      const ratio = contrastRatio('#E8F0EE', '#182221');
      assert.ok(ratio >= 12.0, `Expected >= 12.0, got ${ratio.toFixed(2)}`);
      assert.ok(ratio >= 14.0);
    });

    it('secondary text #A8B8B4 on surface-1 (#182221) exceeds 7:1', () => {
      const ratio = contrastRatio('#A8B8B4', '#182221');
      assert.ok(ratio >= 7.0, `Expected >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('muted text #829591 on surface-1 (#182221) exceeds 4.5:1', () => {
      const ratio = contrastRatio('#829591', '#182221');
      assert.ok(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    });

    it('dark text on light teal button exceeds 7:1 (measures > 9:1)', () => {
      const ratio = contrastRatio('#0A1C1A', '#6CD0C6');
      assert.ok(ratio >= 7.0, `Expected >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('dark text on light plum button exceeds 7:1 (measures > 9:1)', () => {
      const ratio = contrastRatio('#221226', '#D4B8DE');
      assert.ok(ratio >= 7.0, `Expected >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('dark text on light saffron button exceeds 7:1 (measures > 11:1)', () => {
      const ratio = contrastRatio('#261803', '#FCD34D');
      assert.ok(ratio >= 7.0, `Expected >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('dark text on light tunas button exceeds 7:1 (measures > 11:1)', () => {
      const ratio = contrastRatio('#092612', '#86EFAC');
      assert.ok(ratio >= 7.0, `Expected >= 7.0, got ${ratio.toFixed(2)}`);
    });

    it('garden dusk scene partner chip names and status badges exceed 7:1', () => {
      const nameRatio = contrastRatio('#E8F0EE', '#222E2C');
      const activeBadgeRatio = contrastRatio('#78D2CA', '#15312E');
      const inactiveBadgeRatio = contrastRatio('#B8C8C4', '#222E2C');

      assert.ok(nameRatio >= 7.0, `Expected name >= 7.0, got ${nameRatio.toFixed(2)}`);
      assert.ok(activeBadgeRatio >= 7.0, `Expected active badge >= 7.0, got ${activeBadgeRatio.toFixed(2)}`);
      assert.ok(inactiveBadgeRatio >= 7.0, `Expected inactive badge >= 7.0, got ${inactiveBadgeRatio.toFixed(2)}`);
    });
  });
});
