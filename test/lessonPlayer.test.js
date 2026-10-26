import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  LESSON_NAMING_FEELINGS,
  LESSON_URGE_SURFING,
  LESSON_GOTTMAN_COMPLAINT,
  SAMPLE_LESSONS,
  getLessonById
} from '../public/js/flows/lessons.js';

import {
  createLessonFlow,
  buildTeachStep,
  buildChooseStep,
  buildMatchStep,
  buildOrderStep,
  buildReflectStep,
  buildDoitStep,
  buildSummaryStep,
  showLessonExitModal
} from '../public/js/flows/lessonPlayer.js';

describe('Lesson Content Definition & Clinical Review Tagging (DRAFT)', () => {
  it('defines 3 sample lessons tagged DRAFT for clinical review', () => {
    assert.equal(SAMPLE_LESSONS.length, 3);

    SAMPLE_LESSONS.forEach(lesson => {
      assert.ok(lesson.id);
      assert.ok(lesson.title);
      assert.equal(lesson.clinicalStatus, 'DRAFT', 'All sample lessons must be tagged DRAFT for clinical review');
      assert.ok(lesson.clinicalReviewer, 'Must identify clinical reviewer role');
      assert.ok(lesson.clinicalNotes, 'Must document scientific/clinical basis');
      assert.ok(Array.isArray(lesson.skills) && lesson.skills.length >= 2, 'Must list at least 2 skills practiced');
      assert.ok(lesson.steps.length >= 6 && lesson.steps.length <= 10,
        `Lesson ${lesson.id} has ${lesson.steps.length} steps (must be 6 to 10 tiny steps)`);
    });
  });

  it('retrieves lessons by ID or nodeId', () => {
    const l1 = getLessonById('lesson-naming-feelings');
    assert.ok(l1);
    assert.equal(l1.title, 'Menamai Perasaan & Sinyal Tubuh');

    const l2 = getLessonById('node-money-lesson');
    assert.ok(l2);
    assert.equal(l2.id, 'lesson-urge-surfing');

    const l3 = getLessonById('lesson-gottman-complaint');
    assert.ok(l3);
    assert.equal(l3.title, 'Mengubah Kritik Jadi Keluhan Lembut');
  });

  it('covers all 6 required step types across the curriculum', () => {
    const allStepTypes = new Set();
    SAMPLE_LESSONS.forEach(l => {
      l.steps.forEach(s => allStepTypes.add(s.type));
    });

    assert.ok(allStepTypes.has('teach'), 'Must have teach step');
    assert.ok(allStepTypes.has('choose'), 'Must have choose step');
    assert.ok(allStepTypes.has('match'), 'Must have match step');
    assert.ok(allStepTypes.has('order'), 'Must have order step');
    assert.ok(allStepTypes.has('reflect'), 'Must have reflect step');
    assert.ok(allStepTypes.has('doit'), 'Must have doit step');
  });
});

describe('Lesson Player Flow Construction (createLessonFlow)', () => {
  it('creates executable flow object on top of session runner with summary step appended', () => {
    const onDone = () => {};
    const mockStore = { d: { pauses: [], completedPathNodes: [] }, save: () => {} };

    const flow = createLessonFlow(LESSON_NAMING_FEELINGS, onDone, mockStore);

    assert.equal(flow.id, LESSON_NAMING_FEELINGS.id);
    assert.equal(flow.title, LESSON_NAMING_FEELINGS.title);
    // Initial steps + 1 summary step
    assert.equal(flow.steps.length, LESSON_NAMING_FEELINGS.steps.length + 1);

    const lastStep = flow.steps[flow.steps.length - 1];
    assert.equal(lastStep.id, 'lesson-step-summary');

    assert.equal(typeof flow.onExit, 'function', 'Must support custom non-guilting onExit');
    assert.equal(typeof flow.onComplete, 'function');
  });
});

describe('Step Type: teach (One Idea, Spot Illustration, 2 Sentences Max)', () => {
  it('renders spot illustration, title, concise concept text, and Lanjut button', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'teach');
    const flowStep = buildTeachStep(stepDef);

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom();

    assert.ok(html.includes('lesson-teach-wrap'));
    assert.ok(html.includes('spot-illustration'));
    assert.ok(html.includes('lesson-teach-text'));
    assert.ok(html.includes('Lanjut →'));

    // Check sentence count limit (2 sentences max)
    const sentenceCount = stepDef.text.split(/[.!?]+/).filter(Boolean).length;
    assert.ok(sentenceCount <= 2, `Text must be 2 sentences max, got ${sentenceCount}`);
  });
});

describe('Step Type: choose (Scenario, 3 Options, Periksa, AnswerSheet Feedback)', () => {
  it('renders scenario box, 3 radio options with letter badges, and disabled Periksa button', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'choose');
    const flowStep = buildChooseStep(stepDef, () => {});

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom({});

    assert.ok(html.includes('lesson-choose-wrap'));
    assert.ok(html.includes('lesson-scenario-box'));
    assert.ok(html.includes('role="radiogroup"'));
    assert.ok(html.includes('lesson-choice-tile'));
    assert.ok(html.includes('choice-tile-badge')); // A, B, C
    assert.ok(html.includes('id="lessonChooseCheckBtn"'));
    assert.ok(html.includes('disabled'), 'Periksa must be disabled initially');
  });
});

describe('Step Type: match (Tap-to-Pair, Zero Dragging Required)', () => {
  it('renders 2 columns of interactive cards with status counter', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'match');
    const flowStep = buildMatchStep(stepDef, () => {});

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom();

    assert.ok(html.includes('match-board'));
    assert.ok(html.includes('match-col-left'));
    assert.ok(html.includes('match-col-right'));
    assert.ok(html.includes('match-card-left'));
    assert.ok(html.includes('match-card-right'));
    assert.ok(html.includes('matchStatusNotice'));
    assert.ok(html.includes('dari 3 pasangan terhubung'));
  });
});

describe('Step Type: order (Arrange 3-4 Steps with Tap-to-Add from Bank to Slots)', () => {
  it('renders numbered target slots and shuffled bank of chips', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'order');
    const flowStep = buildOrderStep(stepDef, () => {});

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom();

    assert.ok(html.includes('order-slots'));
    assert.ok(html.includes('order-slot'));
    assert.ok(html.includes('order-bank'));
    assert.ok(html.includes('order-bank-chip'));
    assert.ok(html.includes('id="lessonOrderCheckBtn"'));
    assert.ok(html.includes('disabled'), 'Check button must be disabled until all slots are filled');
  });
});

describe('Step Type: reflect (Pick One Tile or Skip with Zero Wrong Answers)', () => {
  it('renders choice tiles and explicit "Lewati untuk sekarang" skip option', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'reflect');
    const flowStep = buildReflectStep(stepDef);

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom({});

    assert.ok(html.includes('lesson-reflect-wrap'));
    assert.ok(html.includes('lesson-choice-tile'));
    assert.ok(html.includes('id="lessonReflectSkipBtn"'));
    assert.ok(html.includes('Lewati untuk sekarang'));
  });
});

describe('Step Type: doit (Micro-Action with "Nanti saja" Always Available)', () => {
  it('renders micro-action with action button and prominent "Nanti saja" link', () => {
    const stepDef = LESSON_NAMING_FEELINGS.steps.find(s => s.type === 'doit');
    const flowStep = buildDoitStep(stepDef);

    assert.equal(flowStep.id, stepDef.id);
    const html = flowStep.renderCustom({});

    assert.ok(html.includes('lesson-doit-wrap'));
    assert.ok(html.includes('id="lessonDoitActionBtn"'));
    assert.ok(html.includes('id="lessonDoitLaterBtn"'));
    assert.ok(html.includes('Nanti saja'), 'Nanti saja must always be available');
  });
});

describe('End Screen Summary: Cheering Mascot, Skills, Animated Counter (NO % Score)', () => {
  it('renders cheering Tunas mascot, skills practiced, and animated weekly counter without % scores', () => {
    const mockStore = {
      d: {
        pauses: [{ at: Date.now() }],
        completedPathNodes: []
      }
    };

    const summaryStep = buildSummaryStep(LESSON_NAMING_FEELINGS, () => {}, mockStore);
    const html = summaryStep.renderCustom();

    // Cheering Tunas mascot
    assert.ok(html.includes('lesson-summary-mascot'));
    assert.ok(html.includes('Tunas'));

    // Skills summary
    assert.ok(html.includes('Hari ini kamu berlatih:'));
    assert.ok(html.includes('Menamai emosi'));
    assert.ok(html.includes('Membaca sinyal tubuh'));

    // Weekly counter update
    assert.ok(html.includes('lesson-weekly-badge'));
    assert.ok(html.includes('id="lessonWeeklyCountNum"'));
    assert.ok(html.includes('+1 bermakna ✨'));

    // STRICTLY NO percentage score
    assert.equal(html.includes('%'), false, 'Summary screen must NEVER show a percentage score');
    assert.equal(html.includes('skor'), false, 'Must not show a score');
    assert.equal(html.includes('nilai'), false);
  });
});

describe('Top Bar & Exit Dialog ("Simpan dan keluar?" - Zero Guilt Copy)', () => {
  it('renders calm exit dialog with Save & Discard options and NO guilting text', () => {
    // Mock document.body for Node.js test environment
    const createdElements = [];
    global.document = {
      querySelector: () => null,
      createElement: (tag) => {
        const el = {
          tagName: tag,
          className: '',
          innerHTML: '',
          attributes: {},
          setAttribute: (k, v) => { el.attributes[k] = v; },
          classList: {
            add: (c) => { el.className += ` ${c}`; },
            remove: () => {}
          },
          querySelector: (sel) => {
            return {
              onclick: null,
              focus: () => {}
            };
          }
        };
        createdElements.push(el);
        return el;
      },
      body: {
        appendChild: (el) => createdElements.push(el)
      }
    };
    global.requestAnimationFrame = (cb) => cb();

    const mockRunner = {
      pauseAndExit: () => {},
      forceExit: () => {}
    };

    showLessonExitModal(mockRunner);

    const dialogEl = createdElements.find(e => e.className && e.className.includes('lesson-exit-overlay'));
    assert.ok(dialogEl, 'Must create lesson-exit-overlay');

    const html = dialogEl.innerHTML;

    // Required title & actions
    assert.ok(html.includes('Simpan dan keluar?'));
    assert.ok(html.includes('Simpan & Lanjutkan Nanti'));
    assert.ok(html.includes('Keluar Saja'));
    assert.ok(html.includes('Tetap di Sini'));

    // Strictly NO guilting copy
    assert.equal(html.includes('hampir selesai'), false, 'Must NOT guilt with "hampir selesai"');
    assert.equal(html.includes('menyerah'), false, 'Must NOT shame with "menyerah"');
    assert.equal(html.includes('rugi'), false, 'Must NOT use loss framing');
  });
});
