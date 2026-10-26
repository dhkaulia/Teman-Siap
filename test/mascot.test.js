import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  renderMascot,
  getMascotStage,
  getTotalPractices,
  renderSpotIllustration,
  MASCOT_STATES,
  GROWTH_STAGES,
  SPOT_ILLUSTRATIONS
} from '../public/js/ui/mascot.js';

describe('Tunas Mascot & Spot Illustration Kit', () => {
  it('exports all 7 states, 4 growth stages, and 8 spot illustrations', () => {
    assert.deepEqual(MASCOT_STATES, ['idle', 'wave', 'cheer', 'think', 'calm', 'hug', 'sleepy']);
    assert.deepEqual(GROWTH_STAGES, ['tunas', '2 daun', '4 daun', 'berbunga']);
    assert.deepEqual(SPOT_ILLUSTRATIONS, ['emosi', 'uang', 'kita', 'tabungan', 'jeda', 'napas', 'percakapan', 'selesai']);
  });

  describe('Growth Stages (Tied to Total Practices, Never Money or Streaks)', () => {
    it('maps 0-2 practices to "tunas"', () => {
      assert.equal(getMascotStage(0).id, 'tunas');
      assert.equal(getMascotStage(1).id, 'tunas');
      assert.equal(getMascotStage(2).id, 'tunas');
    });

    it('maps 3-7 practices to "2 daun"', () => {
      assert.equal(getMascotStage(3).id, '2 daun');
      assert.equal(getMascotStage(7).id, '2 daun');
    });

    it('maps 8-14 practices to "4 daun"', () => {
      assert.equal(getMascotStage(8).id, '4 daun');
      assert.equal(getMascotStage(14).id, '4 daun');
    });

    it('maps 15+ practices to "berbunga"', () => {
      assert.equal(getMascotStage(15).id, 'berbunga');
      assert.equal(getMascotStage(50).id, 'berbunga');
    });

    it('getTotalPractices accurately tallies practices across modules without judgment', () => {
      const mockState = {
        checkins: [{ id: 1 }, { id: 2 }],
        expenses: [{ id: 1 }],
        pauses: [{ id: 1 }, { id: 2 }, { id: 3 }],
        coupleConversations: { topic1: { completed: true } }
      };
      assert.equal(getTotalPractices(mockState), 7);
      assert.equal(getTotalPractices(null), 0);
    });
  });

  describe('Mascot SVG Requirements & File Size (< 4KB)', () => {
    for (const state of MASCOT_STATES) {
      for (const stage of GROWTH_STAGES) {
        it(`renders state "${state}" with stage "${stage}" under 4096 bytes`, () => {
          const svg = renderMascot(state, 160, { stage });
          const byteLength = Buffer.byteLength(svg, 'utf8');
          assert.ok(byteLength < 4096, `Expected < 4096 bytes, got ${byteLength} bytes for state ${state}/${stage}`);
          assert.ok(svg.includes('<svg'), 'Must produce valid svg tag');
          assert.ok(svg.includes('viewBox="0 0 120 120"'), 'Must specify 120x120 viewBox');
          assert.ok(svg.includes('width="160"'), 'Must have requested width');
          assert.ok(svg.includes('height="160"'), 'Must have requested height');
          assert.ok(svg.includes('aria-hidden="true"'), 'Decorative by default');
        });
      }
    }

    it('renders cleanly at 48px avatar chip size', () => {
      const chipSvg = renderMascot('idle', 48);
      assert.ok(chipSvg.includes('width="48"'));
      assert.ok(chipSvg.includes('height="48"'));
      assert.ok(Buffer.byteLength(chipSvg, 'utf8') < 4096);
    });

    it('renders cleanly at 160px hero size with accessible label', () => {
      const heroSvg = renderMascot('wave', 160, {
        stage: 'berbunga',
        label: 'Tunas menyapa ramah dengan bunga mekar',
        decorative: false
      });
      assert.ok(heroSvg.includes('role="img"'));
      assert.ok(heroSvg.includes('aria-label="Tunas menyapa ramah dengan bunga mekar"'));
      assert.ok(heroSvg.includes('<title>Tunas menyapa ramah dengan bunga mekar</title>'));
      assert.ok(Buffer.byteLength(heroSvg, 'utf8') < 4096);
    });
  });

  describe('Motion Constraints & Reduced-Motion Fallback', () => {
    it('all animation loops are under 3s and have prefers-reduced-motion fallback', () => {
      const svg = renderMascot('idle', 160);
      
      // Match all animation durations (e.g., 2.4s, 1.2s, 1.5s)
      const durationMatches = svg.match(/\b\d+(\.\d+)?s\b/g) || [];
      assert.ok(durationMatches.length > 0, 'Must have CSS animation durations');
      for (const dur of durationMatches) {
        const seconds = parseFloat(dur);
        assert.ok(seconds < 3.0, `Animation loop ${dur} must be strictly under 3s`);
      }

      // Check prefers-reduced-motion fallback
      assert.ok(svg.includes('@media (prefers-reduced-motion: reduce)'));
      assert.ok(svg.includes('animation: none !important'));
    });
  });

  describe('8 Spot Illustrations Requirements & File Size (< 4KB)', () => {
    for (const name of SPOT_ILLUSTRATIONS) {
      it(`renders spot illustration "${name}" under 4096 bytes with CSS variables`, () => {
        const svg = renderSpotIllustration(name, 64);
        const byteLength = Buffer.byteLength(svg, 'utf8');
        assert.ok(byteLength < 4096, `Expected < 4096 bytes, got ${byteLength} bytes for illustration ${name}`);
        assert.ok(svg.includes('<svg'), 'Must produce valid svg tag');
        assert.ok(svg.includes('viewBox="0 0 64 64"'), 'Must specify 64x64 viewBox');
        assert.ok(svg.includes('width="64"'), 'Must specify width 64');
        assert.ok(svg.includes('height="64"'), 'Must specify height 64');
        assert.ok(svg.includes('var(--'), 'Must use CSS variables for theme and dark mode compatibility');
      });
    }

    it('supports custom accessibility label for spot illustrations', () => {
      const svg = renderSpotIllustration('emosi', 48, { label: 'Ikon Emosi Sadar' });
      assert.ok(svg.includes('role="img"'));
      assert.ok(svg.includes('aria-label="Ikon Emosi Sadar"'));
      assert.ok(svg.includes('<title>Ikon Emosi Sadar</title>'));
    });
  });
});
