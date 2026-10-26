import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getSuggestedAction, getWeeklyPracticeCount, renderHome } from '../public/js/screens/home.js';
import {
  PATH_UNITS,
  getAllPathNodes,
  getNodeById,
  isNodeCompleted,
  getSuggestedNode,
  getNodeState,
  createFlowForNode
} from '../public/js/flows/path.js';
import { renderOnboarding } from '../public/js/screens/onboarding.js';
import { createInitialState, migrate } from '../public/js/store.js';

describe('Home Screen & getSuggestedAction Rule-Based Logic', () => {
  it('suggests first check-in node when user has no check-ins yet', () => {
    const state = {
      checkins: [],
      expenses: [],
      coupleConversations: {}
    };

    const action = getSuggestedAction(state);
    assert.equal(action.nodeId, 'node-self-checkin');
    assert.ok(action.title.toLowerCase().includes('perasaan'));
    assert.ok(action.btnText.includes('1 menit') || action.btnText.includes('Mulai'));
  });

  it('suggests breathing practice when checkin exists but no breathing pause yet', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      pauses: [],
      expenses: [],
      coupleConversations: {}
    };

    const action = getSuggestedAction(state);
    assert.equal(action.nodeId, 'node-self-breath');
    assert.ok(action.title.includes('Napas'));
  });

  it('suggests grounding practice when checkin & breath pause exist', () => {
    const state = {
      checkins: [{ emotion: 'Tenang', at: Date.now() }],
      pauses: [{ at: Date.now() }],
      expenses: []
    };

    const action = getSuggestedAction(state);
    assert.equal(action.nodeId, 'node-self-grounding');
    assert.ok(action.title.includes('Jangkar'));
  });

  it('suggests next curriculum node when earlier nodes are marked completed', () => {
    const state = {
      completedPathNodes: ['node-self-checkin', 'node-self-breath', 'node-self-grounding', 'node-self-lesson', 'node-self-bonus']
    };

    const action = getSuggestedAction(state);
    assert.equal(action.nodeId, 'node-money-log');
    assert.ok(action.title.includes('Catatan Sadar'));
  });

  it('supports legacy partnerA data in couple conversation check', () => {
    const state = {
      completedPathNodes: [
        'node-self-checkin', 'node-self-breath', 'node-self-grounding', 'node-self-lesson', 'node-self-bonus',
        'node-money-log', 'node-money-urge', 'node-money-lesson', 'node-money-goal', 'node-money-bonus'
      ],
      partnerA: { 'c-security': { answer: 'Ada' } }
    };

    const node = getNodeById('node-us-security');
    assert.equal(isNodeCompleted(node, state), true);
  });

  it('handles null or empty state safely', () => {
    const action = getSuggestedAction(null);
    assert.ok(action.title);
    assert.equal(action.nodeId, 'node-self-checkin');

    const emptyAction = getSuggestedAction({});
    assert.ok(emptyAction.title);
    assert.equal(emptyAction.nodeId, 'node-self-checkin');
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

describe('Curriculum Path Map Data Structure (path.js)', () => {
  it('defines exactly 4 units with titles, goals, and spot illustrations', () => {
    assert.equal(PATH_UNITS.length, 4);

    const expectedTitles = [
      'Mengenal Diri',
      'Tenang Soal Uang',
      'Bicara Berdua',
      'Merencanakan Masa Depan'
    ];

    PATH_UNITS.forEach((unit, idx) => {
      assert.equal(unit.title, expectedTitles[idx]);
      assert.ok(unit.goal && unit.goal.length > 10, 'Unit must have a clear one-line goal');
      assert.ok(unit.accent, 'Unit must define an accent color token');
      assert.ok(unit.spot, 'Unit must define a spot illustration identifier');
      assert.ok(Array.isArray(unit.nodes) && unit.nodes.length >= 4 && unit.nodes.length <= 6,
        `Unit ${unit.title} must contain 4 to 6 nodes`);
    });
  });

  it('flattens nodes and retrieves by ID correctly', () => {
    const all = getAllPathNodes();
    assert.equal(all.length, 20); // 5 + 5 + 5 + 5 = 20 nodes total

    const checkinNode = getNodeById('node-self-checkin');
    assert.ok(checkinNode);
    assert.equal(checkinNode.title, 'Sapa Perasaanmu');
    assert.equal(checkinNode.unitId, 'unit-self');

    const nonExistent = getNodeById('node-fake-id');
    assert.equal(nonExistent, null);
  });

  it('determines node states (selesai, tersedia, bonus, terbuka-bebas) with zero lockouts', () => {
    const d = {
      completedPathNodes: ['node-self-checkin']
    };
    const suggested = getSuggestedNode(d);
    assert.equal(suggested.id, 'node-self-breath');

    const doneNode = getNodeById('node-self-checkin');
    assert.equal(getNodeState(doneNode, d, suggested.id), 'selesai');

    const activeNode = getNodeById('node-self-breath');
    assert.equal(getNodeState(activeNode, d, suggested.id), 'tersedia');

    const bonusNode = getNodeById('node-self-bonus');
    assert.equal(getNodeState(bonusNode, d, suggested.id), 'bonus');

    const openNode = getNodeById('node-self-grounding');
    assert.equal(getNodeState(openNode, d, suggested.id), 'terbuka-bebas');
  });

  it('creates executable flow configuration for practice, checkin, and lesson nodes', () => {
    const onDone = () => {};
    const mockStore = { d: {} };

    const checkinNode = getNodeById('node-self-checkin');
    const checkinFlow = createFlowForNode(checkinNode, onDone, mockStore);
    assert.ok(checkinFlow.steps && checkinFlow.steps.length > 0);

    const breathNode = getNodeById('node-self-breath');
    const breathFlow = createFlowForNode(breathNode, onDone, mockStore);
    assert.ok(breathFlow.steps && breathFlow.steps.length > 0);

    const lessonNode = getNodeById('node-self-lesson');
    const lessonFlow = createFlowForNode(lessonNode, onDone, mockStore);
    assert.ok(lessonFlow.steps && lessonFlow.steps.length > 0);
  });
});

describe('Home Screen Rendering & Scrolling Vertical Path Map', () => {
  it('renders sticky top bar, hero action, 4 unit banners, and S-path nodes without scores or streaks', () => {
    const mockStore = {
      d: {
        stage: 'Mempersiapkan pernikahan',
        checkins: [{ at: Date.now() }],
        pauses: [],
        expenses: [],
        coupleConversations: {},
        goal: null,
        plans: []
      }
    };

    const html = renderHome(mockStore);

    // Sticky top bar with weekly practice count & Tunas stage (No hearts, no gems, no ranking)
    assert.ok(html.includes('path-sticky-header'));
    assert.ok(html.includes('Minggu ini:'));
    assert.ok(html.includes('Tunas:'));
    assert.equal(html.includes('gems'), false, 'Strictly no gems that run out');
    assert.equal(html.includes('hearts'), false, 'Strictly no lives or hearts');
    assert.equal(html.includes('ranking'), false, 'Strictly no leaderboards or rankings');

    // 1-Tap Quick Action Hero: Langkah Hari Ini
    assert.ok(html.includes('Langkah Hari Ini'));
    assert.ok(html.includes('id="heroActionBtn"'));
    assert.ok(html.includes('data-node-id="node-self-breath"'));

    // Weekly practice encouragement without streaks
    assert.ok(html.includes('Minggu ini kamu sudah berlatih'));
    assert.equal(html.includes('Streak'), false, 'Home must NEVER show streak counters');
    assert.equal(html.includes('terputus'), false, 'Missing a week must show nothing negative');

    // 4 Curriculum Units with Colored Banners & Goals
    assert.ok(html.includes('Mengenal Diri'));
    assert.ok(html.includes('Tenang Soal Uang'));
    assert.ok(html.includes('Bicara Berdua'));
    assert.ok(html.includes('Merencanakan Masa Depan'));

    // Unit Banners with Spot Illustrations
    assert.ok(html.includes('banner-teal'));
    assert.ok(html.includes('banner-saffron'));
    assert.ok(html.includes('banner-plum'));
    assert.ok(html.includes('banner-sunny'));
    assert.ok(html.includes('spot-emosi'));
    assert.ok(html.includes('spot-uang'));
    assert.ok(html.includes('spot-kita'));
    assert.ok(html.includes('spot-selesai'));

    // Serpentine S-path nodes with offsets
    assert.ok(html.includes('path-node'));
    assert.ok(html.includes('offset-center') || html.includes('offset-right') || html.includes('offset-left'));

    // Completed node shows checkmark and completed state
    assert.ok(html.includes('path-node'));
    assert.ok(html.includes('selesai completed'));
    assert.ok(html.includes('✓'));

    // Available node shows floating MULAI bubble
    assert.ok(html.includes('node-mulai-bubble'));
    assert.ok(html.includes('MULAI'));

    // Star bonus nodes
    assert.ok(html.includes('⭐'));

    // Modal root for node bottom sheet
    assert.ok(html.includes('id="nodeModalRoot"'));

    // Zero readiness scores or percentages
    assert.equal(html.includes('%'), false, 'Must never show percentage of readiness');
    assert.equal(html.includes('skor'), false, 'Must never show readiness score');
    assert.equal(html.includes('Kematangan:'), false);
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
