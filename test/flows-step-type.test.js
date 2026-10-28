import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SessionRunner } from '../public/js/session.js';
import { Store, createInitialState } from '../public/js/store.js';

import { createCheckinFlow } from '../public/js/flows/checkinFlow.js';
import { createBreathingFlow } from '../public/js/flows/breathingFlow.js';
import { createGroundingFlow } from '../public/js/flows/groundingFlow.js';
import { createExpenseFlow } from '../public/js/flows/expenseFlow.js';
import { createUrgeFlow } from '../public/js/flows/urgeFlow.js';
import { createGoalFlow } from '../public/js/flows/goalFlow.js';
import { createPlanFlow } from '../public/js/flows/planFlow.js';
import { createCoupleFlow } from '../public/js/flows/coupleFlow.js';
import { createLoveMapsFlow } from '../public/js/flows/loveMapsFlow.js';
import { createBicaraLembutFlow } from '../public/js/flows/bicaraLembutFlow.js';
import {
  SAMPLE_LESSONS,
  LESSON_NAMING_FEELINGS,
  LESSON_URGE_SURFING,
  LESSON_GOTTMAN_COMPLAINT
} from '../public/js/flows/lessons.js';
import { createLessonFlow } from '../public/js/flows/lessonPlayer.js';

describe('Flow Step Types & Fallback Prevention Audit', () => {
  // Setup minimal DOM mocks required for step rendering
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        className: '',
        style: {},
        innerHTML: '',
        innerText: '',
        dataset: {},
        children: [],
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        addEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {}
      }
    };
  }

  const store = new Store(createInitialState());
  const runner = new SessionRunner();

  const flowFactories = [
    { name: 'checkinFlow', factory: () => createCheckinFlow(store) },
    { name: 'breathingFlow', factory: () => createBreathingFlow(store) },
    { name: 'groundingFlow', factory: () => createGroundingFlow(store) },
    { name: 'expenseFlow', factory: () => createExpenseFlow(store) },
    { name: 'urgeFlow', factory: () => createUrgeFlow(store) },
    { name: 'goalFlow', factory: () => createGoalFlow(store) },
    { name: 'planFlow', factory: () => createPlanFlow(store) },
    { name: 'coupleFlow', factory: () => createCoupleFlow(store) },
    { name: 'loveMapsFlow', factory: () => createLoveMapsFlow(store) },
    { name: 'bicaraLembutFlow', factory: () => createBicaraLembutFlow(store) },
    { name: 'lesson-naming-feelings', factory: () => createLessonFlow(LESSON_NAMING_FEELINGS, null, store) },
    { name: 'lesson-urge-surfing', factory: () => createLessonFlow(LESSON_URGE_SURFING, null, store) },
    { name: 'lesson-gottman-complaint', factory: () => createLessonFlow(LESSON_GOTTMAN_COMPLAINT, null, store) }
  ];

  SAMPLE_LESSONS.forEach(sampleLesson => {
    if (!flowFactories.some(f => f.name === sampleLesson.id)) {
      flowFactories.push({
        name: `sample-lesson-${sampleLesson.id}`,
        factory: () => createLessonFlow(sampleLesson, null, store)
      });
    }
  });

  flowFactories.forEach(({ name, factory }) => {
    it(`renders every step in ${name} without "Langkah tanpa tipe input" fallback`, () => {
      const flow = factory();
      assert.ok(flow, `Flow ${name} should be successfully constructed`);
      assert.ok(Array.isArray(flow.steps) && flow.steps.length > 0, `Flow ${name} must have steps`);

      const mockAnswers = {
        feel: 'Senang / Tenang',
        body: ['chest'],
        need: 'Ruang aman',
        amount: 25000,
        category: 'makan',
        note: 'Makan siang berdua',
        targetAmount: 5000000,
        monthlyTarget: 500000,
        sharedA: true,
        sharedB: true,
        loveMapsShared: true,
        round_1: true,
        round_2: true,
        round_3: true,
        round_4: true
      };

      flow.steps.forEach((step, idx) => {
        assert.ok(step.type, `Step ${step.id || idx} in ${name} must define a step.type`);
        
        const html = runner._buildStepHTML(step, mockAnswers);
        assert.equal(
          html.includes('Langkah tanpa tipe input.'),
          false,
          `Flow ${name} step #${idx} (${step.id}) rendered missing input fallback!`
        );
      });
    });
  });

  it('bicaraLembutFlow has type: "custom" on all steps including complete step', () => {
    const bicaraFlow = createBicaraLembutFlow(store);
    assert.equal(bicaraFlow.steps.length, 5, 'Bicara Lembut must have 4 rounds + 1 complete step');
    bicaraFlow.steps.forEach((step, idx) => {
      assert.equal(step.type, 'custom', `Step #${idx} (${step.id}) in bicaraLembutFlow must have type: 'custom'`);
      assert.equal(typeof step.renderCustom, 'function', `Step #${idx} must provide renderCustom`);
    });
  });

  it('session.js default case logs console.error in dev when step type is unknown or missing', () => {
    let loggedError = null;
    const originalConsoleError = console.error;
    console.error = (...args) => {
      loggedError = args;
    };

    try {
      const invalidStep = { id: 'test-invalid-step' }; // no type
      const rendered = runner._buildStepHTML(invalidStep, {});
      assert.ok(rendered.includes('Langkah tanpa tipe input.'));
      assert.ok(loggedError, 'console.error must be called when step type is unknown/missing');
      assert.ok(
        loggedError.some(arg => String(arg).includes('[SessionRunner] Unknown or missing step type')),
        'Error log should clearly mention unknown or missing step type'
      );
    } finally {
      console.error = originalConsoleError;
    }
  });
});
