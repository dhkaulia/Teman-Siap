import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getSuggestedAction, getWeeklyPracticeCount, renderHome } from '../public/js/screens/home.js';
import { renderOnboarding } from '../public/js/screens/onboarding.js';
import { createInitialState, migrate } from '../public/js/store.js';

describe('Home Screen & getSuggestedAction Rule-Based Logic', () => {
  it('suggests emotion check-in when user has no check-ins yet', () => {
    const state = {
      checkins: [],
      expenses: [],
      coupleConversations: {}
    };

    const action = getSuggestedAction(state);
    assert.equal(action.tab, 'emo');
    assert.equal(action.subView, 'checkin');
    assert.equal(action.title, 'Sapa perasaanmu 1 menit');
  });

  it('suggests conscious expense log when checkin exists but no expenses yet', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      expenses: [],
      coupleConversations: {}
    };

    const action = getSuggestedAction(state);
    assert.equal(action.tab, 'money');
    assert.equal(action.subView, 'log');
    assert.equal(action.title, 'Catat satu pengeluaran sadar');
  });

  it('suggests couple conversation when checkin & expenses exist but no conversation completed yet', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      expenses: [{ amount: 50000, category: 'Makanan', at: Date.now() }],
      coupleConversations: {},
      partnerA: {}
    };

    const action = getSuggestedAction(state);
    assert.equal(action.tab, 'us');
    assert.equal(action.title, 'Percakapan: Arti Rasa Aman');
  });

  it('suggests urge surfing pause when checkin, expense, and couple conversation exist', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      expenses: [{ amount: 50000, category: 'Makanan', at: Date.now() }],
      coupleConversations: {
        'c-security': { convoId: 'c-security', completedAt: Date.now(), status: 'completed' }
      }
    };

    const action = getSuggestedAction(state);
    assert.equal(action.tab, 'money');
    assert.equal(action.subView, 'urge');
    assert.equal(action.title, 'Latihan Jeda Belanja (Urge Surfing)');
  });

  it('supports legacy partnerA data in couple conversation check', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      expenses: [{ amount: 50000, category: 'Makanan', at: Date.now() }],
      partnerA: { 'c-security': { answer: 'Ada' } }
    };

    const action = getSuggestedAction(state);
    assert.equal(action.tab, 'money');
    assert.equal(action.subView, 'urge');
  });

  it('handles null or empty state safely', () => {
    const action = getSuggestedAction(null);
    assert.ok(action.title);
    assert.equal(action.tab, 'emo');
  });
});

describe('Weekly Practice Counter (No Streaks, Zero Shame)', () => {
  it('counts practices performed within the last 7 days only', () => {
    const now = Date.now();
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    const state = {
      checkins: [{ at: twoDaysAgo }, { at: tenDaysAgo }],
      expenses: [{ at: twoDaysAgo }],
      pauses: [{ at: tenDaysAgo }, { at: twoDaysAgo }],
      coupleConversations: {
        c1: { completedAt: twoDaysAgo },
        c2: { completedAt: tenDaysAgo }
      }
    };

    const count = getWeeklyPracticeCount(state);
    // 1 checkin + 1 expense + 1 pause + 1 convo = 4
    assert.equal(count, 4);
  });

  it('returns 0 safely without error or negative framing when no practices exist', () => {
    assert.equal(getWeeklyPracticeCount({}), 0);
    assert.equal(getWeeklyPracticeCount(null), 0);
  });
});

describe('Home Screen Rendering & 4 Soft Journey Nodes', () => {
  it('renders Langkah Hari Ini panel and 4 soft journey nodes without readiness scores or percentages', () => {
    const mockStore = {
      d: {
        stage: 'Mempersiapkan pernikahan',
        checkins: [{ at: Date.now() }],
        expenses: [],
        coupleConversations: {},
        goal: null,
        plans: []
      }
    };

    const html = renderHome(mockStore);

    // One primary panel
    assert.ok(html.includes('Langkah Hari Ini'));
    assert.ok(html.includes('heroActionBtn'));

    // Weekly practice framing
    assert.ok(html.includes('Minggu ini kamu sudah berlatih'));
    assert.equal(html.includes('Streak'), false, 'Home must NEVER show streak counters');
    assert.equal(html.includes('terputus'), false, 'Missing a week must show nothing negative');

    // 4 Soft Nodes
    assert.ok(html.includes('Mengenal diri'));
    assert.ok(html.includes('Percaya diri soal uang'));
    assert.ok(html.includes('Bicara berdua'));
    assert.ok(html.includes('Merencanakan masa depan'));

    // Zero readiness scores or percentages
    assert.equal(html.includes('%'), false, 'Must never show percentage of readiness');
    assert.equal(html.includes('skor'), false, 'Must never show readiness score');
    assert.equal(html.includes('Kematangan:'), false);

    // Completed node shows checkmark
    assert.ok(html.includes('journey-node completed'));
  });
});

describe('Onboarding Requirements (One Question Per Screen, No Dropdowns)', () => {
  it('renders Step 1: Welcome with privacy promise, Mulai in thumb zone, and guest mode', () => {
    const store = { d: { onboardingStep: 1 } };
    const html = renderOnboarding(store);

    assert.ok(html.includes('Privasi Penuh Tanpa Syarat'));
    assert.ok(html.includes('id="onboardStartBtn"'));
    assert.ok(html.includes('id="onboardGuestBtn"'));
    assert.ok(html.includes('Lihat-lihat dulu (Mode Tamu)'));
    assert.equal(html.includes('<select'), false, 'Must have no dropdowns');
  });

  it('renders Step 2: Stage with ChoiceTiles (5 options, no dropdowns)', () => {
    const store = { d: { onboardingStep: 2 } };
    const html = renderOnboarding(store);

    assert.ok(html.includes('Tahap hidupmu saat ini'));
    assert.ok(html.includes('id="stageChoiceTilesMount"'));
    assert.ok(html.includes('id="onboardStageNextBtn"'));
    assert.equal(html.includes('<select'), false, 'Must have no dropdowns');
  });

  it('renders Step 3: What Matters with multi-select ChoiceTiles and skippable option', () => {
    const store = { d: { onboardingStep: 3 } };
    const html = renderOnboarding(store);

    assert.ok(html.includes('Apa yang paling ingin kamu latih?'));
    assert.ok(html.includes('id="whatMattersTilesMount"'));
    assert.ok(html.includes('id="onboardMattersNextBtn"'));
    assert.ok(html.includes('id="onboardMattersSkipBtn"'));
    assert.ok(html.includes('Lewati untuk sekarang'));
    assert.equal(html.includes('<select'), false, 'Must have no dropdowns');
  });

  it('renders Step 4: First 60-second practice (the Breather) BEFORE any account prompt', () => {
    const store = { d: { onboardingStep: 4 } };
    const html = renderOnboarding(store);

    assert.ok(html.includes('Latihan Pertama: Napas Tenang'));
    assert.ok(html.includes('id="breatherWidgetMount"'));
    assert.ok(html.includes('id="onboardBreatherFinishBtn"'));
    assert.equal(html.includes('email'), false, 'Must NOT ask for email');
    assert.equal(html.includes('<select'), false, 'Must have no dropdowns');
  });

  it('renders Step 5: Warm closing line and pointer to Home without asking for email', () => {
    const store = { d: { onboardingStep: 5 } };
    const html = renderOnboarding(store);

    assert.ok(html.includes('Ruang tenangmu sudah siap.'));
    assert.ok(html.includes('id="onboardEnterHomeBtn"'));
    assert.ok(html.includes('Masuk ke Beranda'));
    assert.equal(html.includes('type="email"'), false, 'Must NOT prompt for email');
    assert.equal(html.includes('<select'), false, 'Must have no dropdowns');
  });

  it('persists progress between steps in store migration', () => {
    const initial = createInitialState();
    assert.equal(initial.onboardingStep, 1);
    assert.equal(initial.onboardingComplete, false);

    const inProgressState = {
      version: 4,
      onboardingStep: 3,
      onboardingComplete: false,
      stage: 'Mempersiapkan pernikahan'
    };

    const migrated = migrate(inProgressState);
    assert.equal(migrated.onboardingStep, 3);
    assert.equal(migrated.onboardingComplete, false);
    assert.equal(migrated.stage, 'Mempersiapkan pernikahan');
  });
});
