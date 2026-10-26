import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sessionReducer } from '../public/js/session.js';

describe('Session Reducer', () => {
  const sampleFlow = {
    id: 'test-flow',
    title: 'Test Flow',
    steps: [
      { id: 'step-1', type: 'choice', optional: false },
      { id: 'step-2', type: 'text', optional: true },
      { id: 'step-3', type: 'reflection', optional: true }
    ]
  };

  it('initializes session with START_FLOW', () => {
    const state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow,
      initialAnswers: { existingKey: 'val' }
    });

    assert.equal(state.flowId, 'test-flow');
    assert.equal(state.stepIndex, 0);
    assert.equal(state.isComplete, false);
    assert.equal(state.answers.existingKey, 'val');
    assert.ok(typeof state.updatedAt === 'number');
  });

  it('updates answers with SET_ANSWER', () => {
    const initial = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });

    const updated = sessionReducer(initial, {
      type: 'SET_ANSWER',
      value: 'option-a'
    });

    assert.equal(updated.answers['step-1'], 'option-a');
  });

  it('supports explicit stepId in SET_ANSWER', () => {
    const initial = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });

    const updated = sessionReducer(initial, {
      type: 'SET_ANSWER',
      stepId: 'custom-key',
      value: 'custom-val'
    });

    assert.equal(updated.answers['custom-key'], 'custom-val');
  });

  it('moves to next and previous steps', () => {
    let state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });

    state = sessionReducer(state, { type: 'NEXT_STEP' });
    assert.equal(state.stepIndex, 1);

    state = sessionReducer(state, { type: 'PREV_STEP' });
    assert.equal(state.stepIndex, 0);

    // PREV_STEP at index 0 does nothing
    state = sessionReducer(state, { type: 'PREV_STEP' });
    assert.equal(state.stepIndex, 0);
  });

  it('marks isComplete when NEXT_STEP advances past last step', () => {
    let state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });

    state = sessionReducer(state, { type: 'NEXT_STEP' }); // to 1
    state = sessionReducer(state, { type: 'NEXT_STEP' }); // to 2
    assert.equal(state.stepIndex, 2);
    assert.equal(state.isComplete, false);

    state = sessionReducer(state, { type: 'NEXT_STEP' }); // completes
    assert.equal(state.isComplete, true);
  });

  it('SKIP_STEP advances optional steps only', () => {
    let state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });

    // Step 0 is not optional
    const triedSkip = sessionReducer(state, { type: 'SKIP_STEP' });
    assert.equal(triedSkip.stepIndex, 0); // Not changed

    // Advance to step 1 (which is optional)
    state = sessionReducer(state, { type: 'NEXT_STEP' });
    assert.equal(state.stepIndex, 1);

    state = sessionReducer(state, { type: 'SKIP_STEP' });
    assert.equal(state.stepIndex, 2);
  });

  it('SKIP_STEP on last step completes the flow if optional', () => {
    let state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });
    state = sessionReducer(state, { type: 'NEXT_STEP' }); // to 1
    state = sessionReducer(state, { type: 'NEXT_STEP' }); // to 2 (optional)

    state = sessionReducer(state, { type: 'SKIP_STEP' });
    assert.equal(state.isComplete, true);
  });

  it('cancels session with CANCEL_SESSION', () => {
    const state = sessionReducer(null, {
      type: 'START_FLOW',
      flow: sampleFlow
    });
    const canceled = sessionReducer(state, { type: 'CANCEL_SESSION' });
    assert.equal(canceled, null);
  });

  it('restores session with RESTORE_SESSION if flowId matches', () => {
    const saved = {
      flowId: 'test-flow',
      stepIndex: 1,
      answers: { 'step-1': 'done' },
      updatedAt: 12345
    };

    const restored = sessionReducer(null, {
      type: 'RESTORE_SESSION',
      flow: sampleFlow,
      saved
    });

    assert.ok(restored);
    assert.equal(restored.flowId, 'test-flow');
    assert.equal(restored.stepIndex, 1);
    assert.equal(restored.answers['step-1'], 'done');
  });

  it('returns null on RESTORE_SESSION if flowId does not match', () => {
    const saved = {
      flowId: 'another-flow',
      stepIndex: 1
    };

    const restored = sessionReducer(null, {
      type: 'RESTORE_SESSION',
      flow: sampleFlow,
      saved
    });

    assert.equal(restored, null);
  });
});
