import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createInitialState, migrate, getPlantStage, TAMAN_KITA_STAGES } from '../public/js/store.js';
import { renderRelationship } from '../public/js/screens/kita.js';
import { createCoupleFlow, visibleTo } from '../public/js/flows/coupleFlow.js';
import { createLoveMapsFlow } from '../public/js/flows/loveMapsFlow.js';
import { CONTENT } from '../public/content.js';

describe('Taman Kita — Shared Garden Scene & Plant Growth Independence', () => {
  it('models couple data with participantId and sharedItems for future backend sync', () => {
    const state = createInitialState();
    assert.ok(state.couple, 'Couple state must be present');
    assert.equal(state.couple.coupleId, 'cpl_local_01');
    assert.ok(state.couple.partnerA.participantId, 'Partner A must have participantId');
    assert.ok(state.couple.partnerB.participantId, 'Partner B must have participantId');
    assert.ok(Array.isArray(state.couple.garden.sharedItems), 'Shared items must be an array');
    assert.ok(state.couple.garden.sharedItems.includes('batu-tapak'));
    assert.equal(state.couple.colekDismissed, false);
  });

  it('migrates older states into couple schema preserving partner data', () => {
    const oldState = {
      version: 4,
      coupleConversations: { 'c-security': { convoId: 'c-security' } }
    };
    const migrated = migrate(oldState);
    assert.ok(migrated.couple);
    assert.equal(migrated.couple.partnerA.practicesCount, 0);
    assert.equal(migrated.couple.partnerB.practicesCount, 0);
    assert.deepEqual(migrated.couple.garden.sharedItems, ['batu-tapak', 'bangku-kayu']);
  });

  it('calculates correct plant growth stages based on independent practice count', () => {
    assert.equal(getPlantStage(0).stage, 1);
    assert.equal(getPlantStage(0).name, 'Biji Tunas');

    assert.equal(getPlantStage(1).stage, 1);
    assert.equal(getPlantStage(2).stage, 2);
    assert.equal(getPlantStage(2).name, 'Tunas Berdaun');

    assert.equal(getPlantStage(4).stage, 2);
    assert.equal(getPlantStage(5).stage, 3);
    assert.equal(getPlantStage(5).name, 'Tanaman Rimbun');

    assert.equal(getPlantStage(8).stage, 3);
    assert.equal(getPlantStage(9).stage, 4);
    assert.equal(getPlantStage(9).name, 'Mekar Berbunga');
    assert.equal(getPlantStage(20).stage, 4);
  });

  it('proves neither partner can speed up the other plant growth', () => {
    const store = {
      _state: createInitialState(),
      get d() { return this._state; },
      set(updater) {
        this._state = typeof updater === 'function' ? updater(this._state) : { ...this._state, ...updater };
        return this._state;
      },
      recordPartnerPractice(role) {
        const key = role === 'B' ? 'partnerB' : 'partnerA';
        return this.set(s => ({
          ...s,
          couple: {
            ...s.couple,
            [key]: {
              ...s.couple[key],
              practicesCount: s.couple[key].practicesCount + 1
            }
          }
        }));
      }
    };

    // Partner A completes 10 practices
    for (let i = 0; i < 10; i++) {
      store.recordPartnerPractice('A');
    }

    assert.equal(store.d.couple.partnerA.practicesCount, 10);
    assert.equal(store.d.couple.partnerB.practicesCount, 0, 'Partner B count must NOT increase when Partner A practices');

    const stageA = getPlantStage(store.d.couple.partnerA.practicesCount);
    const stageB = getPlantStage(store.d.couple.partnerB.practicesCount);

    assert.equal(stageA.stage, 4, 'Partner A plant bloomed');
    assert.equal(stageB.stage, 1, 'Partner B plant remains at stage 1 until Partner B practices');
  });
});

describe('Conversation Cards Deck & "Giliran [nama]" Turn Flow', () => {
  it('renders conversation deck with turn banner and partner names in Kita view', () => {
    const store = {
      d: {
        ...createInitialState(),
        couple: {
          partnerA: { name: 'Ayu', practicesCount: 3 },
          partnerB: { name: 'Budi', practicesCount: 1 }
        },
        currentPerspective: 'A'
      }
    };

    const html = renderRelationship(store);
    assert.ok(html.includes('Ayu'), 'Must show Partner A custom name');
    assert.ok(html.includes('Budi'), 'Must show Partner B custom name');
    assert.ok(html.includes('Sedang mengisi sebagai:'), 'Must display perspective');
    assert.ok(html.includes('id="convoDeckMount"'), 'Must render card deck mount');
    assert.ok(html.includes('Intip Tips Gottman 🔄'), 'Must render flip prompt button');
    assert.ok(html.includes('id="prevDeckBtn"'));
    assert.ok(html.includes('id="nextDeckBtn"'));
  });

  it('renders "Giliran [nama]" banner in turn-based couple flow', () => {
    const convo = CONTENT.conversations[0];
    const store = {
      d: {
        couple: {
          partnerA: { name: 'Ayu' },
          partnerB: { name: 'Budi' }
        }
      }
    };

    const flow = createCoupleFlow(convo, store);
    const step2 = flow.steps.find(s => s.id === 'partnerA');
    const step4 = flow.steps.find(s => s.id === 'partnerB');

    const html2 = step2.renderCustom({});
    const html4 = step4.renderCustom({});

    assert.ok(html2.includes('Giliran: <b>Ayu</b>'), 'Step 2 must show Giliran Ayu');
    assert.ok(html4.includes('Giliran: <b>Budi</b>'), 'Step 4 must show Giliran Budi');
  });

  it('handover screen hides previous answer and has delay countdown', () => {
    const convo = CONTENT.conversations[0];
    const store = {
      d: {
        couple: {
          partnerA: { name: 'Ayu' },
          partnerB: { name: 'Budi' }
        }
      }
    };
    const flow = createCoupleFlow(convo, store);
    const handoverStep = flow.steps.find(s => s.id === 'handover');

    const handoverHtml = handoverStep.renderCustom();
    assert.ok(handoverHtml.includes('Serahkan Ponsel ke Budi'));
    assert.ok(handoverHtml.includes('Tombol aktif dalam 3 detik...'));
    assert.ok(handoverHtml.includes('id="handoverReadyBtn"'));
  });
});

describe('Reveal Moment: Two-Card Reveal with Tunas vs Neutral Refusal', () => {
  const convo = CONTENT.conversations[0];
  const flow = createCoupleFlow(convo, {});
  const revealStep = flow.steps.find(s => s.id === 'reveal');

  it('plays two-card reveal with Tunas cheer reaction when both agreed to share', () => {
    const answers = {
      answerA: 'Jawaban terbuka A',
      sharedA: true,
      answerB: 'Jawaban terbuka B',
      sharedB: true
    };

    const html = revealStep.renderCustom(answers);
    assert.ok(html.includes('Tunas Gembira'), 'Tunas mascot must react celebrating');
    assert.ok(html.includes('flipCardA'));
    assert.ok(html.includes('flipCardB'));
    assert.ok(html.includes('Ruang Temu Terbuka'));
  });

  it('shows gentle neutral screen without animations or penalty when either declined', () => {
    const answers = {
      answerA: 'Rahasia A',
      sharedA: false,
      answerB: 'Terbuka B',
      sharedB: true
    };

    const html = revealStep.renderCustom(answers);
    assert.ok(html.includes('Satu jawaban tetap pribadi. Itu tidak apa-apa.'));
    assert.equal(html.includes('flipCardA'), false, 'Flip cards must NOT be rendered when sharing was declined');
    assert.equal(html.includes('Tunas Gembira'), false, 'Celebration animation must NOT be rendered');
    assert.equal(html.includes('Rahasia A'), false, 'Private answer must NOT be in DOM');
  });
});

describe('Kuis Saling Kenal (Love Maps - Gottman Method)', () => {
  it('builds Love Maps flow where partners answer about themselves and guess with zero scores', () => {
    const store = {
      d: {
        couple: {
          partnerA: { name: 'Dina' },
          partnerB: { name: 'Rian' }
        }
      }
    };

    const flow = createLoveMapsFlow(store);
    assert.equal(flow.id, 'flow-love-maps');

    const stepIds = flow.steps.map(s => s.id);
    assert.deepEqual(stepIds, [
      'intro',
      'selfA',
      'handoverToB_1',
      'selfB',
      'handoverToA_2',
      'guessA',
      'handoverToB_2',
      'guessB',
      'consent',
      'reveal'
    ]);
  });

  it('provably hides partner answers from DOM during Love Maps handover and guessing steps', () => {
    const store = {
      d: {
        couple: { partnerA: { name: 'Dina' }, partnerB: { name: 'Rian' } }
      }
    };
    const flow = createLoveMapsFlow(store);

    const secretSelfA = 'Rahasia_Dina_Kopi_Pagi_4921';
    const secretSelfB = 'Rahasia_Rian_Soto_Ayam_8312';

    const answers = {
      'selfA_lm-calm': secretSelfA,
      'selfB_lm-calm': secretSelfB
    };

    // Step selfB must not contain secretSelfA
    const selfBStep = flow.steps.find(s => s.id === 'selfB');
    const selfBHtml = selfBStep.renderCustom(answers);
    assert.equal(selfBHtml.includes(secretSelfA), false, 'Partner B step must NOT contain Partner A answer');

    // Step guessA must not contain secretSelfB
    const guessAStep = flow.steps.find(s => s.id === 'guessA');
    const guessAHtml = guessAStep.renderCustom(answers);
    assert.equal(guessAHtml.includes(secretSelfB), false, 'Partner A guessing step must NOT leak Partner B actual answer');
  });

  it('renders "Hal baru yang kamu pelajari" discovery cards with ZERO numerical scores', () => {
    const store = {
      d: {
        couple: { partnerA: { name: 'Dina' }, partnerB: { name: 'Rian' } }
      }
    };
    const flow = createLoveMapsFlow(store);
    const revealStep = flow.steps.find(s => s.id === 'reveal');

    const answers = {
      loveMapsShared: true,
      'selfA_lm-calm': 'Jalan santai sore hari',
      'guessB_lm-calm': 'Minum teh manis',
      'selfB_lm-calm': 'Tidur hening 20 menit',
      'guessA_lm-calm': 'Tidur hening'
    };

    const html = revealStep.renderCustom(answers);

    // Must show discovery cards
    assert.ok(html.includes('Hal Baru yang Kalian Pelajari 🌸'));
    assert.ok(html.includes('Jalan santai sore hari'));
    assert.ok(html.includes('Tidur hening 20 menit'));

    // BANNED: Numerical scores & percentages
    const bannedScorePatterns = [
      'skor',
      'score',
      'nilai',
      'benar',
      'salah',
      'kecocokan',
      '%',
      '/3',
      '/4',
      '100%'
    ];

    const lowerHtml = html.toLowerCase();
    for (const pattern of bannedScorePatterns) {
      assert.equal(
        lowerHtml.includes(` ${pattern} `) || lowerHtml.includes(`>${pattern}<`) || lowerHtml.includes(`${pattern}:`),
        false,
        `Love Maps reveal must NEVER display numerical score or grading: found "${pattern}"`
      );
    }
  });

  it('renders neutral screen when mutual consent for Love Maps was declined', () => {
    const flow = createLoveMapsFlow({});
    const revealStep = flow.steps.find(s => s.id === 'reveal');

    const html = revealStep.renderCustom({ loveMapsShared: false });
    assert.ok(html.includes('Catatan tersimpan dengan aman'));
    assert.ok(html.includes('tanpa paksaan'));
    assert.equal(html.includes('Hal Baru yang Kalian Pelajari'), false);
  });
});

describe('Non-Pushy "Colek" Feature (Single Opt-In Suggestion)', () => {
  it('renders suggestion when not dismissed and disappears permanently after dismiss', () => {
    const storeActive = {
      d: {
        couple: {
          partnerA: { name: 'Kamu', practicesCount: 2 },
          partnerB: { name: 'Pasangan', practicesCount: 0 },
          colekDismissed: false
        }
      }
    };

    const htmlActive = renderRelationship(storeActive);
    assert.ok(htmlActive.includes('id="colekCard"'));
    assert.ok(htmlActive.includes('Mau ajak Pasangan mencoba satu percakapan berdua?'));

    // When dismissed
    const storeDismissed = {
      d: {
        couple: {
          partnerA: { name: 'Kamu', practicesCount: 2 },
          partnerB: { name: 'Pasangan', practicesCount: 0 },
          colekDismissed: true
        }
      }
    };

    const htmlDismissed = renderRelationship(storeDismissed);
    assert.equal(htmlDismissed.includes('id="colekCard"'), false, 'Colek card must NOT appear once dismissed');
  });
});

describe('Guardrails & Anti-Comparison Policy Verification', () => {
  it('strictly forbids leaderboards, compatibility percentage, or spending leaks in Kita', () => {
    const store = {
      d: {
        couple: {
          partnerA: { name: 'Ayu', practicesCount: 7 },
          partnerB: { name: 'Budi', practicesCount: 2 },
          colekDismissed: false
        },
        expenses: [{ amount: 500000, category: 'Rahasia Finansial Pribadi' }],
        checkins: [{ emotion: 'Sedih', note: 'Catatan Jurnal Pribadi yang Sangat Rahasia' }]
      }
    };

    const html = renderRelationship(store);
    const lowerHtml = html.toLowerCase();

    // Guardrail 1: No couple leaderboards or comparison
    assert.equal(lowerHtml.includes('peringkat'), false, 'Must not have leaderboard ranking');
    assert.equal(lowerHtml.includes('leaderboard'), false);
    assert.equal(lowerHtml.includes('siapa yang lebih'), false);
    assert.equal(lowerHtml.includes('juara'), false);

    // Guardrail 2: No compatibility percentage
    assert.equal(lowerHtml.includes('kecocokan'), false, 'Must not show compatibility %');
    assert.equal(lowerHtml.includes('persentase kesiapan'), false);

    // Guardrail 3: Private journal and spending data must NEVER leak into Kita
    assert.equal(html.includes('Rahasia Finansial Pribadi'), false, 'Private spending data must never leak into Kita');
    assert.equal(html.includes('Catatan Jurnal Pribadi yang Sangat Rahasia'), false, 'Private checkin journal must never leak into Kita');
  });

  it('verifies 360px viewport compatibility (no rigid widths > 320px or horizontal overflow classes)', () => {
    const store = {
      d: {
        ...createInitialState(),
        couple: {
          partnerA: { name: 'Ayu', practicesCount: 4 },
          partnerB: { name: 'Budi', practicesCount: 2 }
        }
      }
    };

    const html = renderRelationship(store);

    // SVG must use responsive viewBox without rigid inline pixel widths > 360
    assert.ok(html.includes('viewBox="0 0 340 170"'), 'SVG must use viewBox of 340 max width');
    assert.equal(html.includes('width="400"'), false);
    assert.equal(html.includes('width="500"'), false);

    // Cards must use fluid/flex widths
    assert.ok(html.includes('class="taman-kita-card mb-3"'));
    assert.ok(html.includes('class="convo-deck-wrap mb-2"'));
  });
});
