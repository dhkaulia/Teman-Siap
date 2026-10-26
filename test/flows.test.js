import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createCheckinFlow } from '../public/js/flows/checkinFlow.js';
import { createBreathingFlow } from '../public/js/flows/breathingFlow.js';
import { createGroundingFlow } from '../public/js/flows/groundingFlow.js';
import { sessionReducer } from '../public/js/session.js';
import { createInitialState } from '../public/js/store.js';

describe('Checkin Flow Requirements', () => {
  const flow = createCheckinFlow(false);

  it('has exactly 4 steps: feel, body, need, reflect', () => {
    assert.equal(flow.steps.length, 4);
    assert.equal(flow.steps[0].id, 'feel');
    assert.equal(flow.steps[1].id, 'body');
    assert.equal(flow.steps[2].id, 'need');
    assert.equal(flow.steps[3].id, 'reflect');
  });

  it('all steps are skippable except the first', () => {
    assert.equal(Boolean(flow.steps[0].optional), false, 'feel step must not be optional');
    assert.equal(Boolean(flow.steps[1].optional), true, 'body step must be optional');
    assert.equal(Boolean(flow.steps[2].optional), true, 'need step must be optional');
  });

  it('saves checkin data on completion only with emotion, regions, need, note, timestamp', () => {
    const mockStore = {
      saved: null,
      addCheckin(data) {
        this.saved = data;
      }
    };

    const answers = {
      feel: 'Cemas / Gelisah',
      body: ['chest'],
      need: 'Istirahat sejenak',
      note: 'Catatan pribadi yang aman'
    };

    flow.onComplete(answers, mockStore);
    assert.ok(mockStore.saved);
    assert.equal(mockStore.saved.emotion, 'Cemas / Gelisah');
    assert.deepEqual(mockStore.saved.sensations, ['chest']);
    assert.equal(mockStore.saved.need, 'Istirahat sejenak');
    assert.equal(mockStore.saved.note, 'Catatan pribadi yang aman');
    assert.ok(typeof mockStore.saved.at === 'number');
  });

  it('saves nothing if user exits mid-flow (CANCEL_SESSION)', () => {
    let session = sessionReducer(null, {
      type: 'START_FLOW',
      flow,
      initialAnswers: {}
    });

    session = sessionReducer(session, {
      type: 'SET_ANSWER',
      stepId: 'feel',
      value: 'Cemas / Gelisah'
    });

    assert.equal(session.answers.feel, 'Cemas / Gelisah');

    // User cancels / exits via ✕
    const canceled = sessionReducer(session, { type: 'CANCEL_SESSION' });
    assert.equal(canceled, null, 'Canceled session state must be null');
  });
});

describe('Breathing Session Flow Requirements', () => {
  const breathing = createBreathingFlow();

  it('defines 5-cycle breathing step followed by gentle feedback', () => {
    assert.equal(breathing.id, 'breathing');
    assert.equal(breathing.steps.length, 2);
    assert.equal(breathing.steps[0].id, 'breathe');
    assert.equal(breathing.steps[1].id, 'feedback');
  });

  it('records pause log on completion with non-judgmental feedback', () => {
    const mockStore = {
      paused: null,
      addPause(data) {
        this.paused = data;
      }
    };

    breathing.onComplete({ feedback: 'belum' }, mockStore);
    assert.ok(mockStore.paused);
    assert.equal(mockStore.paused.type, 'breathing');
    assert.equal(mockStore.paused.feedback, 'belum');
  });
});

describe('Grounding Session Flow Requirements', () => {
  const grounding = createGroundingFlow();

  it('defines 5 full-screen sensory steps (5-4-3-2-1)', () => {
    assert.equal(grounding.id, 'grounding');
    assert.equal(grounding.steps.length, 5);
    const ids = grounding.steps.map(s => s.id);
    assert.deepEqual(ids, ['look', 'touch', 'hear', 'smell', 'taste']);
  });
});
