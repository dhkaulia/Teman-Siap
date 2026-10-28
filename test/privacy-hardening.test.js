import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SessionRunner, SESSION_STORAGE_KEY, sessionReducer } from '../public/js/session.js';
import { createCoupleFlow } from '../public/js/flows/coupleFlow.js';
import { createLoveMapsFlow } from '../public/js/flows/loveMapsFlow.js';
import { CONTENT } from '../public/content.js';

function createMockDocument() {
  const el = () => ({
    setAttribute: () => {},
    getAttribute: () => null,
    querySelector: () => el(),
    querySelectorAll: () => [],
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    },
    innerHTML: '',
    textContent: '',
    appendChild: () => {},
    remove: () => {}
  });

  return {
    createElement: el,
    getElementById: () => el(),
    querySelector: () => el(),
    querySelectorAll: () => [],
    body: {
      appendChild: () => {}
    }
  };
}

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('Privacy Hardening Unit Tests (In-Memory Privacy & Mid-Flow Refresh)', () => {
  beforeEach(() => {
    global.localStorage = new MockLocalStorage();
    global.document = createMockDocument();
    global.requestAnimationFrame = fn => fn();
  });

  it('never persists Partner A or B private answer text to localStorage mid-flow', () => {
    const convo = CONTENT.conversations[0];
    const flow = createCoupleFlow(convo, {});
    const runner = new SessionRunner();
    runner.registerFlow(flow);

    runner.start(flow, {
      answerA: 'RAHASIA-A-12345',
      sharedA: false,
      answerB: 'RAHASIA-B-67890',
      sharedB: true
    });

    // Advance to step 2 (handover)
    runner._state.stepIndex = 2;
    runner._persist();

    const raw = global.localStorage.getItem(SESSION_STORAGE_KEY);
    assert.ok(raw, 'Session payload should exist in localStorage');
    const parsed = JSON.parse(raw);

    // Private text must be stripped from persistence payload
    assert.equal(parsed.answers.answerA, undefined, 'answerA must never be persisted mid-flow');
    assert.equal(parsed.answers.answerB, undefined, 'answerB must never be persisted mid-flow');
    assert.equal(raw.includes('RAHASIA-A-12345'), false, 'Secret A must not be anywhere in localStorage JSON');
    assert.equal(raw.includes('RAHASIA-B-67890'), false, 'Secret B must not be anywhere in localStorage JSON');

    // In-memory runner state MUST still retain the answers for the active session
    assert.equal(runner._state.answers.answerA, 'RAHASIA-A-12345');
    assert.equal(runner._state.answers.answerB, 'RAHASIA-B-67890');
  });

  it('never persists Love Maps self or guess answers to localStorage mid-flow', () => {
    const flow = createLoveMapsFlow({});
    const runner = new SessionRunner();
    runner.registerFlow(flow);

    runner.start(flow, {
      'selfA_lm-calm': 'Rahasia_Kopi_Pagi',
      'selfB_lm-calm': 'Rahasia_Teh_Hangat',
      'guessA_lm-calm': 'Tebakan_A',
      'guessB_lm-calm': 'Tebakan_B',
      loveMapsShared: true
    });

    runner._state.stepIndex = 3;
    runner._persist();

    const raw = global.localStorage.getItem(SESSION_STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw);

    assert.equal(parsed.answers['selfA_lm-calm'], undefined);
    assert.equal(parsed.answers['selfB_lm-calm'], undefined);
    assert.equal(parsed.answers['guessA_lm-calm'], undefined);
    assert.equal(parsed.answers['guessB_lm-calm'], undefined);
    assert.equal(raw.includes('Rahasia_Kopi_Pagi'), false);
    assert.equal(raw.includes('Rahasia_Teh_Hangat'), false);
  });

  it('strict allowlist: unknown new fields are never persisted for couple and love-maps flows', () => {
    const convo = CONTENT.conversations[0];
    const coupleFlow = createCoupleFlow(convo, {});
    const runner = new SessionRunner();
    runner.registerFlow(coupleFlow);

    runner.start(coupleFlow, {
      sharedA: true,
      answerA: 'private text',
      secret_financial_detail: 'tabungan_emas_100gr',
      unknown_future_field: 'untested_custom_data',
      arbitraryPartnerSecret: 'super_secret_value'
    });

    runner._state.stepIndex = 1;
    runner._persist();

    const raw = global.localStorage.getItem(SESSION_STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw);

    // Allowlisted field is kept
    assert.equal(parsed.answers.sharedA, true, 'sharedA must be preserved by allowlist');

    // Unknown new fields must NOT be persisted
    assert.equal(parsed.answers.secret_financial_detail, undefined, 'unknown field must not be persisted');
    assert.equal(parsed.answers.unknown_future_field, undefined, 'unknown field must not be persisted');
    assert.equal(parsed.answers.arbitraryPartnerSecret, undefined, 'unknown field must not be persisted');
    assert.equal(raw.includes('tabungan_emas_100gr'), false, 'unknown field value must not be in raw storage');
    assert.equal(raw.includes('untested_custom_data'), false, 'unknown field value must not be in raw storage');
    assert.equal(raw.includes('super_secret_value'), false, 'unknown field value must not be in raw storage');
  });

  it('restarts at Partner A answer step with calm notice if page is refreshed mid-flow', () => {
    const convo = CONTENT.conversations[0];
    const flow = createCoupleFlow(convo, {});

    // Mock an in-progress session saved mid-flow at stepIndex 3 (Partner B)
    const midFlowPayload = {
      flowId: flow.id,
      stepIndex: 3,
      answers: {
        sharedA: false
      },
      updatedAt: Date.now()
    };
    global.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(midFlowPayload));

    // Simulate page refresh restoring session
    const freshRunner = new SessionRunner();
    freshRunner.registerFlow(flow);

    const restored = freshRunner.restoreIfAvailable();
    assert.equal(restored, true, 'Should successfully restore');
    assert.equal(freshRunner._state.stepIndex, 1, 'Must restart at Partner A answer step (stepIndex 1)');
    assert.equal(freshRunner._state.answers._refreshedNotice, true, 'Must flag calm notice to user');

    // Test that the rendered HTML contains calm notice
    const stepHtml = flow.steps[1].renderCustom(freshRunner._state.answers);
    assert.ok(stepHtml.includes('calm-notice-box'), 'Rendered step must include calm notice container');
    assert.ok(stepHtml.includes('Sesi dimulai ulang demi menjaga privasi jawabanmu'));
  });

  it('sharing choices start unselected and continue button is disabled until explicit choice', () => {
    const convo = CONTENT.conversations[0];
    const flow = createCoupleFlow(convo, {});

    // Partner A step without prior choice
    const htmlA = flow.steps[1].renderCustom({});
    assert.equal(htmlA.includes('choice-tile selected'), false, 'No choice tile should be selected initially');
    assert.ok(htmlA.includes('id="submitPartnerABtn" disabled'), 'Continue button must start disabled');

    // Partner B step without prior choice
    const htmlB = flow.steps[3].renderCustom({});
    assert.equal(htmlB.includes('choice-tile selected'), false, 'No choice tile should be selected initially');
    assert.ok(htmlB.includes('id="submitPartnerBBtn" disabled'), 'Continue button must start disabled');

    // Love Maps consent step without prior choice
    const lmFlow = createLoveMapsFlow({});
    const htmlLM = lmFlow.steps[8].renderCustom({});
    assert.equal(htmlLM.includes('choice-tile selected'), false, 'No choice tile should be selected initially in Love Maps');
    assert.ok(htmlLM.includes('id="confirmConsentBtn" disabled'), 'Love Maps continue button must start disabled');
  });

  it('displays the required privacy line on sharing choice and private screens', () => {
    const convo = CONTENT.conversations[0];
    const flow = createCoupleFlow(convo, {});
    const privacyLine = 'Di satu ponsel, jawaban pribadi hanya seaman ponselnya.';

    const htmlA = flow.steps[1].renderCustom({});
    assert.ok(htmlA.includes(privacyLine), 'Partner A step must include privacy line');

    const htmlB = flow.steps[3].renderCustom({});
    assert.ok(htmlB.includes(privacyLine), 'Partner B step must include privacy line');

    const htmlRevealPrivate = flow.steps[4].renderCustom({ sharedA: false, sharedB: true });
    assert.ok(htmlRevealPrivate.includes(privacyLine), 'Private reveal screen must include privacy line');

    const lmFlow = createLoveMapsFlow({});
    const htmlConsent = lmFlow.steps[8].renderCustom({});
    assert.ok(htmlConsent.includes(privacyLine), 'Love Maps consent step must include privacy line');

    const htmlLMRevealPrivate = lmFlow.steps[9].renderCustom({ loveMapsShared: false });
    assert.ok(htmlLMRevealPrivate.includes(privacyLine), 'Love Maps private reveal must include privacy line');
  });
});
