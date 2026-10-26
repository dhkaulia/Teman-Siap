import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createCoupleFlow, visibleTo, REMOTE_PARTNER_SYNC_SPEC } from '../public/js/flows/coupleFlow.js';
import { CONTENT } from '../public/content.js';
import { createInitialState, migrate } from '../public/js/store.js';

describe('Couple Flow Privacy & visibleTo() Access Control', () => {
  it('returns both answers when both partners explicitly chose to share', () => {
    const convoData = {
      convoId: 'c-security',
      completedAt: 1718000000000,
      participants: {
        A: { answer: 'Jawaban terbuka A', shared: true },
        B: { answer: 'Jawaban terbuka B', shared: true }
      }
    };

    assert.deepEqual(visibleTo(convoData, 'A'), { A: 'Jawaban terbuka A', B: 'Jawaban terbuka B' });
    assert.deepEqual(visibleTo(convoData, 'B'), { A: 'Jawaban terbuka A', B: 'Jawaban terbuka B' });
    assert.deepEqual(visibleTo(convoData, 'shared'), { A: 'Jawaban terbuka A', B: 'Jawaban terbuka B' });
  });

  it('never leaks Partner A private answer when Partner A chose not to share', () => {
    const convoData = {
      convoId: 'c-security',
      participants: {
        A: { answer: 'Rahasia pribadi Partner A', shared: false },
        B: { answer: 'Jawaban Partner B ingin berbagi', shared: true }
      }
    };

    const seenByB = visibleTo(convoData, 'B');
    assert.equal(seenByB.A, null, 'Partner B must NEVER see Partner A unshared answer');
    assert.equal(seenByB.B, 'Jawaban Partner B ingin berbagi');

    const seenByShared = visibleTo(convoData, 'shared');
    assert.deepEqual(seenByShared, { A: null, B: null }, 'Shared space must reveal nothing if mutual consent is not met');

    const seenByA = visibleTo(convoData, 'A');
    assert.equal(seenByA.A, 'Rahasia pribadi Partner A', 'Partner A can see own answer');
    assert.equal(seenByA.B, null, 'Partner A cannot see Partner B when mutual consent failed');
  });

  it('never leaks Partner B private answer when Partner B chose not to share', () => {
    const convoData = {
      convoId: 'c-security',
      participants: {
        A: { answer: 'Jawaban Partner A ingin berbagi', shared: true },
        B: { answer: 'Rahasia pribadi Partner B', shared: false }
      }
    };

    const seenByA = visibleTo(convoData, 'A');
    assert.equal(seenByA.B, null, 'Partner A must NEVER see Partner B unshared answer');
    assert.equal(seenByA.A, 'Jawaban Partner A ingin berbagi');

    const seenByShared = visibleTo(convoData, 'shared');
    assert.deepEqual(seenByShared, { A: null, B: null });
  });

  it('keeps both answers private when both declined to share', () => {
    const convoData = {
      convoId: 'c-security',
      participants: {
        A: { answer: 'Rahasia A', shared: false },
        B: { answer: 'Rahasia B', shared: false }
      }
    };

    assert.deepEqual(visibleTo(convoData, 'A'), { A: 'Rahasia A', B: null });
    assert.deepEqual(visibleTo(convoData, 'B'), { A: null, B: 'Rahasia B' });
    assert.deepEqual(visibleTo(convoData, 'shared'), { A: null, B: null });
  });

  it('returns nulls for unauthorized third-party callers or malformed data', () => {
    const convoData = {
      convoId: 'c-security',
      participants: {
        A: { answer: 'Ans A', shared: true },
        B: { answer: 'Ans B', shared: true }
      }
    };

    assert.deepEqual(visibleTo(convoData, 'stranger'), { A: null, B: null });
    assert.deepEqual(visibleTo(null, 'A'), { A: null, B: null });
    assert.deepEqual(visibleTo({}, 'shared'), { A: null, B: null });
  });
});

describe('Turn-Based Couple Flow Steps & DOM Privacy', () => {
  const sampleConvo = CONTENT.conversations[0];
  const flow = createCoupleFlow(sampleConvo, {});

  it('defines 6 turn-based steps', () => {
    assert.equal(flow.steps.length, 6);
    const stepIds = flow.steps.map(s => s.id);
    assert.deepEqual(stepIds, ['intro', 'partnerA', 'handover', 'partnerB', 'reveal', 'discuss']);
  });

  it('provably hides Partner A answer from DOM during Handover (Step 3)', () => {
    const handoverStep = flow.steps.find(s => s.id === 'handover');
    const privateAnswerA = 'Sensitif_Refleksi_Rahasia_A_12345';
    
    // Simulate answers object currently carrying Partner A's answer
    const answers = {
      answerA: privateAnswerA,
      sharedA: false
    };

    const handoverHtml = handoverStep.renderCustom(answers);
    assert.equal(handoverHtml.includes(privateAnswerA), false, 'Partner A answer must NOT be anywhere in Step 3 HTML');
    assert.ok(handoverHtml.includes('Serahkan Ponsel ke Partner B'));
    assert.ok(handoverHtml.includes('id="handoverReadyBtn"'));
  });

  it('provably hides Partner A answer from DOM during Partner B input (Step 4)', () => {
    const partnerBStep = flow.steps.find(s => s.id === 'partnerB');
    const privateAnswerA = 'Sensitif_Refleksi_Rahasia_A_12345';

    const answers = {
      answerA: privateAnswerA,
      sharedA: true
    };

    const partnerBHtml = partnerBStep.renderCustom(answers);
    assert.equal(partnerBHtml.includes(privateAnswerA), false, 'Partner A answer must NOT be anywhere in Step 4 HTML');
    assert.ok(partnerBHtml.includes('id="partnerBText"'));
  });

  it('provably omits private answers from Step 5 DOM when either partner declined', () => {
    const revealStep = flow.steps.find(s => s.id === 'reveal');
    const answerA = 'Jawaban_A_999';
    const answerB = 'Jawaban_B_888';

    // Partner B declined
    const answers = {
      answerA,
      sharedA: true,
      answerB,
      sharedB: false
    };

    const revealHtml = revealStep.renderCustom(answers);
    assert.equal(revealHtml.includes(answerA), false, 'Answer A must NOT be in DOM when sharing was declined');
    assert.equal(revealHtml.includes(answerB), false, 'Answer B must NOT be in DOM when sharing was declined');
    assert.ok(revealHtml.includes('Satu jawaban tetap pribadi. Itu tidak apa-apa.'));
  });

  it('renders interactive flip cards in Step 5 when both partners chose to share', () => {
    const revealStep = flow.steps.find(s => s.id === 'reveal');
    const answers = {
      answerA: 'Jawaban A',
      sharedA: true,
      answerB: 'Jawaban B',
      sharedB: true
    };

    const revealHtml = revealStep.renderCustom(answers);
    assert.ok(revealHtml.includes('id="flipCardA"'));
    assert.ok(revealHtml.includes('id="flipCardB"'));
    assert.ok(revealHtml.includes('id="revealNextBtn"'));
  });

  it('has persistent "Ini terasa tidak nyaman" safety exit on every step', () => {
    const mockAnswers = { answerA: '', sharedA: true, answerB: '', sharedB: true };
    flow.steps.forEach(step => {
      const html = step.renderCustom(mockAnswers);
      assert.ok(
        html.includes('data-safety-exit="true"') || html.includes('Ini terasa tidak nyaman'),
        `Step ${step.id} must include persistent safety trigger`
      );
    });
  });

  it('saves answers per participant with explicit shared boolean on completion', () => {
    let savedConvo = null;
    const mockStore = {
      saveCoupleConversation(id, data) {
        savedConvo = data;
      }
    };

    const answers = {
      answerA: 'Keuangan transparan',
      sharedA: true,
      answerB: 'Perlu pos jajan pribadi',
      sharedB: false,
      nextStep: 'Diskusi mingguan 15 menit',
      reviewDate: '2026-11-20'
    };

    flow.onComplete(answers, mockStore);

    assert.ok(savedConvo);
    assert.equal(savedConvo.convoId, sampleConvo.id);
    assert.equal(savedConvo.status, 'completed');
    assert.equal(savedConvo.participants.A.answer, 'Keuangan transparan');
    assert.equal(savedConvo.participants.A.shared, true);
    assert.equal(savedConvo.participants.B.answer, 'Perlu pos jajan pribadi');
    assert.equal(savedConvo.participants.B.shared, false);
    assert.equal(savedConvo.agreement.nextStep, 'Diskusi mingguan 15 menit');
    assert.equal(savedConvo.agreement.reviewDate, '2026-11-20');
  });
});

describe('Store Migration & Remote Partner Invite Specification', () => {
  it('creates initial state with empty coupleConversations and migrates legacy partner data', () => {
    const initial = createInitialState();
    assert.deepEqual(initial.coupleConversations, {});

    const legacyState = {
      version: 1,
      partnerA: { 'c-security': { answer: 'Legacy A', consentShare: true, updatedAt: 100 } },
      partnerB: { 'c-security': { answer: 'Legacy B', consentShare: false, updatedAt: 200 } },
      sharedNotes: { 'c-security': 'Catatan lama' }
    };

    const migrated = migrate(legacyState, 4);
    assert.ok(migrated.coupleConversations['c-security']);
    assert.equal(migrated.coupleConversations['c-security'].participants.A.answer, 'Legacy A');
    assert.equal(migrated.coupleConversations['c-security'].participants.A.shared, true);
    assert.equal(migrated.coupleConversations['c-security'].participants.B.answer, 'Legacy B');
    assert.equal(migrated.coupleConversations['c-security'].participants.B.shared, false);
    assert.equal(migrated.coupleConversations['c-security'].agreement.nextStep, 'Catatan lama');
  });

  it('defines remote partner sync data model with "Segera hadir" status and zero-knowledge guarantees', () => {
    assert.ok(REMOTE_PARTNER_SYNC_SPEC);
    assert.equal(REMOTE_PARTNER_SYNC_SPEC.status, 'upcoming');
    assert.ok(REMOTE_PARTNER_SYNC_SPEC.dataModel.sessionId);
    assert.ok(REMOTE_PARTNER_SYNC_SPEC.dataModel.inviteCode);
    assert.ok(REMOTE_PARTNER_SYNC_SPEC.dataModel.initiator.publicKey);
    assert.ok(REMOTE_PARTNER_SYNC_SPEC.dataModel.responder.publicKey);
    assert.ok(REMOTE_PARTNER_SYNC_SPEC.securityGuarantees.length >= 2);
  });
});
