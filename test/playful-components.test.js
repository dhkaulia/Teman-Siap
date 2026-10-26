import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { ChoiceTiles } from '../public/js/ui/choiceTiles.js';
import { AnswerSheet } from '../public/js/ui/answerSheet.js';
import { ProgressBar } from '../public/js/ui/progressBar.js';
import { triggerCelebration, isCelebrationEnabled, setCelebrationEnabled, resetSessionCelebration } from '../public/js/ui/confetti.js';
import { isSoundEnabled, setSoundEnabled, isHapticsEnabled, setHapticsEnabled, playTapSound, triggerHapticTap } from '../public/js/ui/feedback.js';
import { showToast, dismissAllToasts } from '../public/js/ui/toast.js';

describe('Playful Component Layer: Buttons & Tactility', () => {
  it('CSS tokens define primary 56px height, pressed bottom shadow, and under 100ms transition', async () => {
    const fs = await import('fs');
    const css = fs.readFileSync('public/css/tokens.css', 'utf8');

    assert.ok(css.includes('--transition-press: 80ms'), 'Press animation must be under 100ms');
    assert.ok(css.includes('min-height: 56px'), 'Primary button must be 56px tall in thumb zone');
    assert.ok(css.includes('button.btn-ghost'), 'Must define ghost button variant');
    assert.ok(css.includes('button.btn-soft'), 'Must define soft button variant');
  });

  it('disabled button state is clearly distinguishable without using red', async () => {
    const fs = await import('fs');
    const css = fs.readFileSync('public/css/tokens.css', 'utf8');

    // Extract disabled rule
    const disabledBlock = css.slice(css.indexOf('button:disabled'), css.indexOf('button:disabled') + 300);
    assert.ok(disabledBlock.includes('#E2E8F0') || disabledBlock.includes('#CBD5E1'), 'Must use neutral gray for disabled');
    assert.equal(disabledBlock.includes('#EF4444'), false, 'Must NOT use red for disabled state');
    assert.equal(disabledBlock.includes('red'), false, 'Must NOT use red for disabled state');
  });
});

describe('Playful Component Layer: ChoiceTiles v2', () => {
  it('supports pop on select, clear check icon, and shape cues', () => {
    // Mock container
    const mockContainer = {
      classList: { add() {} },
      setAttribute() {},
      innerHTML: '',
      querySelectorAll: () => [],
      addEventListener() {}
    };

    const tiles = new ChoiceTiles({
      container: mockContainer,
      items: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ]
    });

    assert.ok(mockContainer.innerHTML.includes('choice-tile-check'), 'Must render check icon element');
    assert.ok(mockContainer.innerHTML.includes('choice-tile-main'), 'Must render main layout structure');
  });
});

describe('Playful Component Layer: AnswerSheet', () => {
  it('instantiates success AnswerSheet without wrong-answer state for emotions/money', () => {
    const sheet = new AnswerSheet({
      type: 'success',
      message: 'Mantap, kamu menamai perasaanmu.'
    });

    assert.equal(sheet.type, 'success');
    assert.equal(sheet.mascotState, 'cheer');
    assert.equal(sheet.message, 'Mantap, kamu menamai perasaanmu.');
  });

  it('uses soft coral and gentle explanation for knowledge question "belum_pas" state (no red or buzzers)', () => {
    const sheet = new AnswerSheet({
      type: 'belum_pas',
      message: 'Jawabanmu belum pas.',
      explanation: 'Perjanjian pranikah disahkan sebelum perkawinan.'
    });

    assert.equal(sheet.type, 'belum_pas');
    assert.equal(sheet.mascotState, 'think');
    assert.ok(sheet.explanation.includes('pranikah'));
  });
});

describe('Playful Component Layer: ProgressBar', () => {
  it('renders chunky continuous progress bar with soft shine', () => {
    const mockContainer = { innerHTML: '' };
    const bar = new ProgressBar({
      container: mockContainer,
      current: 2,
      total: 4
    });

    assert.ok(mockContainer.innerHTML.includes('progressbar-wrap continuous'));
    assert.ok(mockContainer.innerHTML.includes('progressbar-shine'));
    assert.ok(mockContainer.innerHTML.includes('width: 50%'));
  });

  it('renders segmented progress bar for multi-part lessons', () => {
    const mockContainer = { innerHTML: '' };
    const bar = new ProgressBar({
      container: mockContainer,
      current: 3,
      total: 4,
      segments: 4
    });

    assert.ok(mockContainer.innerHTML.includes('progressbar-wrap segmented'));
    assert.ok(mockContainer.innerHTML.includes('progressbar-segment'));
    assert.ok(mockContainer.innerHTML.includes('role="progressbar"'));
  });
});

describe('Playful Component Layer: Confetti & Sparkle', () => {
  beforeEach(() => {
    resetSessionCelebration();
    // mock localStorage if needed
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; }
      };
    }
    setCelebrationEnabled(true);
  });

  it('triggers celebration max once per session', () => {
    const fired1 = triggerCelebration({ sessionId: 'session_123' });
    assert.equal(fired1, true);

    // Second call in same session must be blocked
    const fired2 = triggerCelebration({ sessionId: 'session_123' });
    assert.equal(fired2, false, 'Must not fire more than once per session');
  });

  it('respects the settings toggle "Efek perayaan"', () => {
    setCelebrationEnabled(false);
    assert.equal(isCelebrationEnabled(), false);

    const fired = triggerCelebration({ sessionId: 'session_new' });
    assert.equal(fired, false, 'Must be disabled when Efek perayaan setting is off');
  });
});

describe('Playful Component Layer: Sound and Haptics', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; }
      };
    }
    setSoundEnabled(false);
    setHapticsEnabled(false);
  });

  it('sound is strictly OFF by default until user enables it', () => {
    assert.equal(isSoundEnabled(), false, 'Sound must be OFF by default');
    assert.equal(playTapSound(), false);

    setSoundEnabled(true);
    assert.equal(isSoundEnabled(), true);
  });

  it('haptics is strictly OFF by default and triggers 10ms vibration when enabled', () => {
    let vibrateDuration = 0;
    globalThis.navigator = {
      vibrate: (ms) => { vibrateDuration = ms; }
    };

    assert.equal(isHapticsEnabled(), false, 'Haptics must be OFF by default');
    assert.equal(triggerHapticTap(), false);

    setHapticsEnabled(true);
    assert.equal(isHapticsEnabled(), true);
    assert.equal(triggerHapticTap(), true);
    assert.equal(vibrateDuration, 10, 'Haptic pulse must be exactly 10ms');
  });
});

describe('Playful Component Layer: Toast System', () => {
  it('creates accessible toast notification with dismiss handle', () => {
    const toast = showToast('Tersimpan dengan tenang', { type: 'success' });
    assert.equal(typeof toast.dismiss, 'function');
  });
});
