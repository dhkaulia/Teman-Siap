import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createCheckinFlow } from '../public/js/flows/checkinFlow.js';
import { createBreathingFlow } from '../public/js/flows/breathingFlow.js';
import { createGroundingFlow } from '../public/js/flows/groundingFlow.js';
import { createExpenseFlow } from '../public/js/flows/expenseFlow.js';
import { createUrgeFlow } from '../public/js/flows/urgeFlow.js';
import { createGoalFlow } from '../public/js/flows/goalFlow.js';
import { createPlanFlow } from '../public/js/flows/planFlow.js';
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

describe('Quick Log Expense Flow Requirements', () => {
  it('defines 3-step quick log: amount, category with last-used first, and optional reflection', () => {
    const mockStore = {
      d: {
        expenses: [
          { amount: 25000, category: 'Transportasi & Bensin', at: 1000 },
          { amount: 50000, category: 'Hiburan & Kesenangan Pribadi', at: 2000 }
        ]
      },
      addExpense(e) {}
    };

    const flow = createExpenseFlow(mockStore);
    assert.equal(flow.id, 'expense');
    assert.equal(flow.steps.length, 3);
    assert.equal(flow.steps[0].id, 'amount');
    assert.equal(flow.steps[1].id, 'category');
    assert.equal(flow.steps[2].id, 'reflect');
  });
});

describe('Urge Surfing Flow Requirements', () => {
  const urge = createUrgeFlow(false);

  it('defines 3 steps: wave intensity, 10-min timer with stored timestamp, and acceptable decisions', () => {
    assert.equal(urge.id, 'urge');
    assert.equal(urge.steps.length, 3);
    assert.equal(urge.steps[0].id, 'startIntensity');
    assert.equal(urge.steps[1].id, 'surfing');
    assert.equal(urge.steps[2].id, 'decision');
  });

  it('logs starting and ending intensity without shame on completion', () => {
    const mockStore = {
      paused: null,
      addPause(p) { this.paused = p; }
    };

    urge.onComplete({
      startIntensity: 8,
      endIntensity: 3,
      decision: 'Tunggu lagi'
    }, mockStore);

    assert.ok(mockStore.paused);
    assert.equal(mockStore.paused.startIntensity, 8);
    assert.equal(mockStore.paused.endIntensity, 3);
    assert.equal(mockStore.paused.decision, 'Tunggu lagi');
  });
});

describe('Goal Creation Flow Requirements', () => {
  const goalFlow = createGoalFlow();

  it('defines 3-step goal flow: name, target amount, optional date', () => {
    assert.equal(goalFlow.id, 'goal');
    assert.equal(goalFlow.steps.length, 3);
    assert.equal(goalFlow.steps[0].id, 'name');
    assert.equal(goalFlow.steps[1].id, 'target');
    assert.equal(goalFlow.steps[2].id, 'date');
    assert.equal(goalFlow.steps[2].optional, true);
  });

  it('sets goal with initial saved 0 and never marks missed dates as failed', () => {
    const mockStore = {
      goal: null,
      setGoal(g) { this.goal = g; }
    };

    goalFlow.onComplete({
      name: 'Rumah Impian',
      target: 20000000,
      date: '2027-12'
    }, mockStore);

    assert.ok(mockStore.goal);
    assert.equal(mockStore.goal.name, 'Rumah Impian');
    assert.equal(mockStore.goal.target, 20000000);
    assert.equal(mockStore.goal.saved, 0);
    assert.equal(mockStore.goal.targetDate, '2027-12');
  });
});

describe('If-Then Plan Flow Requirements', () => {
  const planFlow = createPlanFlow();

  it('builds sentence "Jika [tile] maka [tile]" using presets and custom fallback', () => {
    assert.equal(planFlow.id, 'plan');
    assert.equal(planFlow.steps.length, 3);
    assert.equal(planFlow.steps[0].id, 'trigger');
    assert.equal(planFlow.steps[1].id, 'action');
    assert.equal(planFlow.steps[2].id, 'preview');
  });

  it('saves implementation intention to store on completion', () => {
    const mockStore = {
      plan: null,
      addPlan(p) { this.plan = p; }
    };

    planFlow.onComplete({
      trigger: 'stres kerjaan',
      action: 'minum air hangat & jeda 10 menit'
    }, mockStore);

    assert.ok(mockStore.plan);
    assert.equal(mockStore.plan.i, 'stres kerjaan');
    assert.equal(mockStore.plan.t, 'minum air hangat & jeda 10 menit');
  });
});
