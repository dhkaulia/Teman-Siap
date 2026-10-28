/**
 * Teman Siap — Kuis Saling Kenal (Gottman Love Maps)
 * 
 * Rules:
 * - Evidence-based framework: John Gottman's "Love Maps" (Peta Cinta).
 * - Each partner answers questions about THEMSELVES first, then guesses the other's answer.
 * - Guesses and answers reveal ONLY with mutual consent.
 * - CRITICAL GUARDRAIL: Score is NEVER shown as a number or percentage (no "3/4 benar", no "Kecocokan 70%").
 * - Shows "Hal baru yang kamu pelajari" discovery cards instead.
 * - Single-phone handover hides previous answers provably from the DOM.
 * - Persistent "Ini terasa tidak nyaman" on every step.
 */

import { CONTENT } from '../../content.js';
import { renderMascot } from '../ui/mascot.js';
import { esc } from '../ui/utils.js';
import { awardSeeds } from '../rewards.js';
import { renderIcon } from '../ui/icons.js';

export function createLoveMapsFlow(store, onComplete = null, onSafetyExit = null) {
  const nameA = store?.d?.couple?.partnerA?.name || 'Partner A';
  const nameB = store?.d?.couple?.partnerB?.name || 'Partner B';
  const questions = (CONTENT.loveMapsQuestions && CONTENT.loveMapsQuestions.length)
    ? CONTENT.loveMapsQuestions.slice(0, 1)
    : [
        {
          id: 'lm-calm',
          title: 'Ketenangan Diri',
          question: 'Apa hal sederhana yang paling cepat membuatmu merasa tenang setelah hari yang panjang?',
          hint: 'Misal: Seduhan teh hangat, jalan sore, atau rebahan hening.'
        }
      ];

  function renderSafetyTrigger() {
    return `
      <div class="safety-exit-row mt-3">
        <button type="button" class="safety-trigger-link" data-safety-exit="true" aria-label="Hentikan latihan jika terasa tidak nyaman">
          ${renderIcon('shield')} Ini terasa tidak nyaman
        </button>
      </div>
    `;
  }

  function bindSafetyTrigger(container, runner) {
    const link = container.querySelector('[data-safety-exit="true"]');
    if (link) {
      link.onclick = () => {
        runner.forceExit();
        if (typeof onSafetyExit === 'function') {
          onSafetyExit();
        }
      };
    }
  }

  return {
    id: 'flow-love-maps',
    title: 'Kuis Saling Kenal (Love Maps)',
    steps: [
      // -------------------------------------------------------------
      // Step 1: Intro
      // -------------------------------------------------------------
      {
        id: 'intro',
        type: 'custom',
        hideFooter: true,
        title: 'Kuis Saling Kenal',
        renderCustom() {
          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="card-title-row">
                <span class="card-tag plum">Peta Cinta</span>
                <span class="text-xs mute">~5 Menit</span>
              </div>
              <h1 class="text-xl font-bold mt-2 mb-1">Kuis Saling Kenal</h1>
              <p class="mute text-sm mb-3">
                Kenali dunia batin pasanganmu tanpa penilaian atau skor.
              </p>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="startLoveMapsBtn">
                  Mulai: Giliran ${esc(nameA)} →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const btn = container.querySelector('#startLoveMapsBtn');
          if (btn) btn.onclick = () => runner.next();
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 2: Partner A Answers About THEMSELVES
      // -------------------------------------------------------------
      {
        id: 'selfA',
        type: 'custom',
        hideFooter: true,
        title: `Giliran ${nameA}`,
        renderCustom(answers) {
          const showNotice = Boolean(answers._refreshedNotice);

          return `
            <div class="card card-border-plum p-4 mb-3">
              ${showNotice ? `
                <div class="calm-notice-box mb-3">
                  ${renderIcon('info')}
                  <div>Sesi dimulai ulang demi menjaga privasi jawabanmu.</div>
                </div>
              ` : ''}
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameA)}</b></span>
              </div>

              ${questions.map((q) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${esc(q.question)}</div>
                  <textarea id="qSelfA_${q.id}" class="w-full text-sm" aria-label="${esc(q.question)}" placeholder="Tulis jawabanmu...">${esc(answers[`selfA_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitSelfABtn">
                  Lanjut ke ${esc(nameB)} →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const submitBtn = container.querySelector('#submitSelfABtn');
          if (submitBtn) {
            submitBtn.onclick = () => {
              const res = {};
              questions.forEach(q => {
                const el = container.querySelector(`#qSelfA_${q.id}`);
                res[`selfA_${q.id}`] = el ? el.value.trim() : '';
              });
              delete answers._refreshedNotice;
              runner.setAnswer(res);
              runner.next();
            };
          }
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 3: Handover to Partner B
      // (Answers of A are completely omitted from DOM)
      // -------------------------------------------------------------
      {
        id: 'handoverToB_1',
        type: 'custom',
        hideFooter: true,
        title: 'Serahkan Ponsel',
        renderCustom() {
          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">📱 ➔ 🤝</div>
              <h2 class="text-xl font-bold mb-2">Serahkan Ponsel ke ${esc(nameB)}</h2>
              <p class="mute text-sm mb-3">
                Jawaban ${esc(nameA)} tersimpan aman. Giliran ${esc(nameB)} menjawab.
              </p>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="readyBBtn">
                  Saya ${esc(nameB)}, Siap →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const btn = container.querySelector('#readyBBtn');
          if (btn) btn.onclick = () => runner.next();
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 4: Partner B Answers About THEMSELVES
      // (Answers of A are completely omitted from DOM)
      // -------------------------------------------------------------
      {
        id: 'selfB',
        type: 'custom',
        hideFooter: true,
        title: `Giliran ${nameB}`,
        renderCustom(answers) {
          const showNotice = Boolean(answers._refreshedNotice);

          return `
            <div class="card card-border-plum p-4 mb-3">
              ${showNotice ? `
                <div class="calm-notice-box mb-3">
                  ${renderIcon('info')}
                  <div>Sesi dimulai ulang demi menjaga privasi jawabanmu.</div>
                </div>
              ` : ''}
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameB)}</b></span>
              </div>

              ${questions.map((q) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${esc(q.question)}</div>
                  <textarea id="qSelfB_${q.id}" class="w-full text-sm" aria-label="${esc(q.question)}" placeholder="Tulis jawabanmu...">${esc(answers[`selfB_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitSelfBBtn">
                  Lanjut ke Tebakan →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const submitBtn = container.querySelector('#submitSelfBBtn');
          if (submitBtn) {
            submitBtn.onclick = () => {
              const res = {};
              questions.forEach(q => {
                const el = container.querySelector(`#qSelfB_${q.id}`);
                res[`selfB_${q.id}`] = el ? el.value.trim() : '';
              });
              delete answers._refreshedNotice;
              runner.setAnswer(res);
              runner.next();
            };
          }
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 5: Handover back to Partner A for GUESSING
      // -------------------------------------------------------------
      {
        id: 'handoverToA_2',
        type: 'custom',
        hideFooter: true,
        title: 'Serahkan Ponsel',
        renderCustom() {
          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">🎯 ➔ 📱</div>
              <h2 class="text-xl font-bold mb-2">Fase Tebak: Serahkan ke ${esc(nameA)}</h2>
              <p class="mute text-sm mb-3">
                Saatnya ${esc(nameA)} menebak jawaban ${esc(nameB)}.
              </p>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="readyGuessABtn">
                  Saya ${esc(nameA)}, Siap Menebak →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const btn = container.querySelector('#readyGuessABtn');
          if (btn) btn.onclick = () => runner.next();
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 6: Partner A GUESSES Partner B's answers
      // (Actual selfB answers are omitted from DOM!)
      // -------------------------------------------------------------
      {
        id: 'guessA',
        type: 'custom',
        hideFooter: true,
        title: `${nameA} Menebak ${nameB}`,
        renderCustom(answers) {
          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="turn-banner mb-3">
                <span>💭</span>
                <span><b>${esc(nameA)}</b> menebak <b>${esc(nameB)}</b>:</span>
              </div>

              ${questions.map((q) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${esc(q.question)}</div>
                  <textarea id="qGuessA_${q.id}" class="w-full text-sm" aria-label="Tebakan jawaban ${esc(nameB)}" placeholder="Menurutku jawaban ${esc(nameB)}...">${esc(answers[`guessA_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitGuessABtn">
                  Lanjut ke ${esc(nameB)} →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const submitBtn = container.querySelector('#submitGuessABtn');
          if (submitBtn) {
            submitBtn.onclick = () => {
              const res = {};
              questions.forEach(q => {
                const el = container.querySelector(`#qGuessA_${q.id}`);
                res[`guessA_${q.id}`] = el ? el.value.trim() : '';
              });
              runner.setAnswer(res);
              runner.next();
            };
          }
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 7: Handover to Partner B for GUESSING
      // -------------------------------------------------------------
      {
        id: 'handoverToB_2',
        type: 'custom',
        hideFooter: true,
        title: 'Serahkan Ponsel',
        renderCustom() {
          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">🎯 ➔ 📱</div>
              <h2 class="text-xl font-bold mb-2">Fase Tebak: Serahkan ke ${esc(nameB)}</h2>
              <p class="mute text-sm mb-3">
                Giliran ${esc(nameB)} menebak jawaban ${esc(nameA)}.
              </p>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="readyGuessBBtn">
                  Saya ${esc(nameB)}, Siap Menebak →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const btn = container.querySelector('#readyGuessBBtn');
          if (btn) btn.onclick = () => runner.next();
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 8: Partner B GUESSES Partner A's answers
      // (Actual selfA answers are omitted from DOM!)
      // -------------------------------------------------------------
      {
        id: 'guessB',
        type: 'custom',
        hideFooter: true,
        title: `${nameB} Menebak ${nameA}`,
        renderCustom(answers) {
          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="turn-banner mb-3">
                <span>💭</span>
                <span><b>${esc(nameB)}</b> menebak <b>${esc(nameA)}</b>:</span>
              </div>

              ${questions.map((q) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${esc(q.question)}</div>
                  <textarea id="qGuessB_${q.id}" class="w-full text-sm" aria-label="Tebakan jawaban ${esc(nameA)}" placeholder="Menurutku jawaban ${esc(nameA)}...">${esc(answers[`guessB_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitGuessBBtn">
                  Lanjut ke Hasil →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const submitBtn = container.querySelector('#submitGuessBBtn');
          if (submitBtn) {
            submitBtn.onclick = () => {
              const res = {};
              questions.forEach(q => {
                const el = container.querySelector(`#qGuessB_${q.id}`);
                res[`guessB_${q.id}`] = el ? el.value.trim() : '';
              });
              runner.setAnswer(res);
              runner.next();
            };
          }
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 9: Mutual Consent to Reveal
      // -------------------------------------------------------------
      {
        id: 'consent',
        type: 'custom',
        hideFooter: true,
        title: 'Persetujuan Membuka Hasil',
        renderCustom(answers) {
          const hasChoice = answers.loveMapsShared === true || answers.loveMapsShared === false;
          const isShareSelected = answers.loveMapsShared === true;
          const isPrivateSelected = answers.loveMapsShared === false;

          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">🤝 ➔ 📱</div>
              <h2 class="text-xl font-bold mb-2">Duduk Berdua</h2>
              <p class="mute text-sm mb-3">
                Duduklah berdampingan untuk melihat hasil:
              </p>

              <div class="sharing-choice-box mb-3 text-left">
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Membuka Love Maps">
                  <button type="button" class="choice-tile ${isShareSelected ? 'selected' : ''}" id="tileShareLM" role="radio" aria-checked="${isShareSelected}">
                    <span class="tile-icon" aria-hidden="true">📖</span>
                    <div class="tile-col">
                      <div class="tile-label">Buka kartu berdua</div>
                      <div class="tile-hint">Lihat tebakan bersama.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${isPrivateSelected ? 'selected' : ''}" id="tilePrivateLM" role="radio" aria-checked="${isPrivateSelected}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan pribadi</div>
                      <div class="tile-hint">Selesai tanpa membuka.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="mute text-xs mb-3 text-center">Di satu ponsel, jawaban pribadi hanya seaman ponselnya.</div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="confirmConsentBtn" ${!hasChoice ? 'disabled' : ''}>
                  Lanjut →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const tileShare = container.querySelector('#tileShareLM');
          const tilePrivate = container.querySelector('#tilePrivateLM');
          const confirmBtn = container.querySelector('#confirmConsentBtn');

          let sharedVal = (answers.loveMapsShared === true || answers.loveMapsShared === false) ? answers.loveMapsShared : null;

          const updateSelection = (val) => {
            sharedVal = val;
            if (tileShare) {
              tileShare.classList.toggle('selected', sharedVal === true);
              tileShare.setAttribute('aria-checked', String(sharedVal === true));
            }
            if (tilePrivate) {
              tilePrivate.classList.toggle('selected', sharedVal === false);
              tilePrivate.setAttribute('aria-checked', String(sharedVal === false));
            }
            if (confirmBtn) {
              confirmBtn.disabled = sharedVal === null;
            }
          };

          if (tileShare) tileShare.onclick = () => updateSelection(true);
          if (tilePrivate) tilePrivate.onclick = () => updateSelection(false);

          if (confirmBtn) {
            confirmBtn.onclick = () => {
              if (sharedVal === null) return;
              runner.setAnswer({ loveMapsShared: sharedVal });
              runner.next();
            };
          }
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 10: Reveal Moment ("Hal Baru yang Kamu Pelajari")
      // CRITICAL: NEVER SHOW NUMERICAL SCORES OR PERCENTAGES!
      // -------------------------------------------------------------
      {
        id: 'reveal',
        type: 'custom',
        hideFooter: true,
        title: 'Penemuan Saling Kenal',
        renderCustom(answers) {
          const isShared = answers.loveMapsShared === true;

          if (!isShared) {
            return `
              <div class="card card-border-plum text-center py-4 px-3 mb-3">
                <div class="text-3xl mb-2" aria-hidden="true">🔒</div>
                <h2 class="text-lg font-bold mb-1">Catatan tersimpan dengan aman.</h2>
                <p class="mute text-sm mb-3">
                  Saling mengenal adalah proses bertahap tanpa paksaan.
                </p>

                <div class="mute text-xs mb-3 text-center">Di satu ponsel, jawaban pribadi hanya seaman ponselnya.</div>

                <div class="sticky-bottom-action">
                  <button type="button" class="plum-btn w-full" id="finishLMBtn">
                    Selesai & Kembali ke Kita
                  </button>
                </div>

                ${renderSafetyTrigger()}
              </div>
            `;
          }

          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="text-center mb-2">
                ${renderMascot('cheer', 48, { inlineStyle: false, label: '' })}
              </div>
              <h2 class="text-lg font-bold mb-1 text-center">Hal Baru yang Kalian Pelajari</h2>

              <div class="flex flex-col gap-2 mb-3">
                ${questions.map((q) => {
                  const actualA = answers[`selfA_${q.id}`] || '(Belum diisi)';
                  const guessB = answers[`guessB_${q.id}`] || '(Belum ditebak)';
                  const actualB = answers[`selfB_${q.id}`] || '(Belum diisi)';
                  const guessA = answers[`guessA_${q.id}`] || '(Belum ditebak)';

                  return `
                    <div class="love-maps-discovery-card p-2 text-xs">
                      <div class="font-bold text-plum mb-1">${esc(q.title)}</div>
                      <div class="mb-1"><b>${esc(nameA)}:</b> ${esc(actualA)} <span class="mute">(tebak: ${esc(guessB)})</span></div>
                      <div><b>${esc(nameB)}:</b> ${esc(actualB)} <span class="mute">(tebak: ${esc(guessA)})</span></div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="finishLMBtn">
                  Simpan ke Taman Kita
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const finishBtn = container.querySelector('#finishLMBtn');
          if (finishBtn) {
            finishBtn.onclick = () => runner.next();
          }
          bindSafetyTrigger(container, runner);
        }
      }
    ],

    onComplete(answers, storeRef) {
      if (!storeRef) return;

      const sessionId = `lm-${Date.now()}`;
      if (typeof storeRef.saveLoveMapsSession === 'function') {
        storeRef.saveLoveMapsSession(sessionId, {
          at: Date.now(),
          shared: answers.loveMapsShared === true,
          answers: answers.loveMapsShared === true ? answers : {}
        });
      }

      // Increment both partner practices equally in Taman Kita!
      if (typeof storeRef.recordPartnerPractice === 'function') {
        storeRef.recordPartnerPractice('A');
        storeRef.recordPartnerPractice('B');
      }

      // Mindful practice rewards 1 seed
      awardSeeds(storeRef, 1, 'Kuis saling kenal selesai');

      if (typeof onComplete === 'function') {
        onComplete(answers);
      }
    }
  };
}
