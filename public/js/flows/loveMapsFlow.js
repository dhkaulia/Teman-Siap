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

export function createLoveMapsFlow(store, onComplete = null, onSafetyExit = null) {
  const nameA = store?.d?.couple?.partnerA?.name || 'Partner A';
  const nameB = store?.d?.couple?.partnerB?.name || 'Partner B';
  const questions = (CONTENT.loveMapsQuestions && CONTENT.loveMapsQuestions.length)
    ? CONTENT.loveMapsQuestions.slice(0, 3)
    : [
        {
          id: 'lm-calm',
          title: 'Ketenangan Diri',
          question: 'Apa hal sederhana yang paling cepat membuatmu merasa tenang setelah hari yang panjang?',
          hint: 'Misal: Seduhan teh hangat hening, jalan santai sore, atau rebahan tanpa suara.'
        },
        {
          id: 'lm-comfort-food',
          title: 'Comfort Food',
          question: 'Apa makanan atau minuman penghibur favoritmu saat sedang lelah?',
          hint: 'Misal: Soto ayam hangat, cokelat manis, martabak manis, atau es buah.'
        },
        {
          id: 'lm-dream',
          title: 'Impian Terpendam',
          question: 'Apa impian atau harapan masa depan yang paling jarang kamu ceritakan ke orang lain?',
          hint: 'Misal: Membuka usaha kecil bersama, punya ruang baca sendiri, atau keliling Indonesia.'
        }
      ];

  function renderSafetyTrigger() {
    return `
      <div class="safety-exit-row mt-3">
        <button type="button" class="safety-trigger-link" data-safety-exit="true" aria-label="Hentikan latihan jika terasa tidak nyaman">
          🛡️ Ini terasa tidak nyaman
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
                <span class="card-tag plum">Gottman Method</span>
                <span class="text-xs mute">~5 Menit</span>
              </div>
              <h1 class="text-xl font-bold mt-2 mb-1">Peta Dunia Batin (Love Maps)</h1>
              <p class="mute text-sm mb-3">
                Menurut riset Dr. John Gottman, pasangan yang paling tangguh bukanlah yang tidak pernah bertengkar, melainkan yang saling mengenali detail dunia batin pasangannya: hal yang menenangkan, kesukaan kecil, dan impian tersembunyi.
              </p>

              <div class="neutral-guidance-box mb-4">
                <b>Aturan Main:</b> Ini bukan ujian atau ajang penilaian. Tidak ada skor angka atau persentase kelulusan. Tujuannya adalah menemukan hal-hal baru yang menyenangkan tentang satu sama lain!
              </div>

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
          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameA)}</b> (Tentang Dirimu)</span>
              </div>
              <p class="mute text-xs mb-3">
                Jawab pertanyaan berikut tentang <b>dirimu sendiri</b> secara jujur:
              </p>

              ${questions.map((q, idx) => `
                <div class="mb-3">
                  <label for="qSelfA_${q.id}" class="font-bold text-sm block mb-1">
                    ${idx + 1}. ${esc(q.question)}
                  </label>
                  <p class="mute text-xs mb-1">💡 ${esc(q.hint)}</p>
                  <textarea id="qSelfA_${q.id}" class="w-full text-sm" placeholder="Tulis jawabanmu...">${esc(answers[`selfA_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitSelfABtn">
                  Simpan & Serahkan Ponsel ke ${esc(nameB)} →
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
              <p class="mute text-sm mb-4">
                Jawaban ${esc(nameA)} telah tersimpan aman dan tersembunyi.<br>
                Sekarang giliran ${esc(nameB)} menjawab tentang diri sendiri.
              </p>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="readyBBtn">
                  Saya ${esc(nameB)}, Siap Mulai →
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
          return `
            <div class="card card-border-plum p-4 mb-3">
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameB)}</b> (Tentang Dirimu)</span>
              </div>
              <p class="mute text-xs mb-3">
                Jawab pertanyaan berikut tentang <b>dirimu sendiri</b> secara jujur:
              </p>

              ${questions.map((q, idx) => `
                <div class="mb-3">
                  <label for="qSelfB_${q.id}" class="font-bold text-sm block mb-1">
                    ${idx + 1}. ${esc(q.question)}
                  </label>
                  <p class="mute text-xs mb-1">💡 ${esc(q.hint)}</p>
                  <textarea id="qSelfB_${q.id}" class="w-full text-sm" placeholder="Tulis jawabanmu...">${esc(answers[`selfB_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitSelfBBtn">
                  Simpan & Lanjut ke Fase Tebak Jawaban →
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
              <p class="mute text-sm mb-4">
                Sekarang saatnya ${esc(nameA)} menebak apa yang dijawab oleh ${esc(nameB)}!<br>
                Tidak perlu takut salah; ini adalah sarana belajar mengenal dunia pasangan.
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
                <span><b>${esc(nameA)}</b> menebak jawaban <b>${esc(nameB)}</b>:</span>
              </div>
              <p class="mute text-xs mb-3">
                Menurutmu, apa jawaban yang ditulis oleh ${esc(nameB)}?
              </p>

              ${questions.map((q, idx) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${idx + 1}. ${esc(q.question)}</div>
                  <textarea id="qGuessA_${q.id}" class="w-full text-sm" placeholder="Menurutku jawaban ${esc(nameB)} adalah...">${esc(answers[`guessA_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitGuessABtn">
                  Simpan & Serahkan Ponsel ke ${esc(nameB)} →
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
              <p class="mute text-sm mb-4">
                Sekarang giliran ${esc(nameB)} menebak apa yang dijawab oleh ${esc(nameA)}!
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
                <span><b>${esc(nameB)}</b> menebak jawaban <b>${esc(nameA)}</b>:</span>
              </div>
              <p class="mute text-xs mb-3">
                Menurutmu, apa jawaban yang ditulis oleh ${esc(nameA)}?
              </p>

              ${questions.map((q, idx) => `
                <div class="mb-3">
                  <div class="font-bold text-sm mb-1">${idx + 1}. ${esc(q.question)}</div>
                  <textarea id="qGuessB_${q.id}" class="w-full text-sm" placeholder="Menurutku jawaban ${esc(nameA)} adalah...">${esc(answers[`guessB_${q.id}`] || '')}</textarea>
                </div>
              `).join('')}

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitGuessBBtn">
                  Simpan & Masuk ke Penyingkapan Bersama →
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
          const isShared = answers.loveMapsShared !== false;

          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">🤝 ➔ 📱</div>
              <h2 class="text-xl font-bold mb-2">Duduk Berdua Bersama</h2>
              <p class="mute text-sm mb-4">
                Kalian sudah selesai mengisi dan menebak! Duduklah berdampingan untuk melihat hasilnya.
              </p>

              <div class="sharing-choice-box mb-4 text-left">
                <div class="font-bold text-sm mb-2 text-ink-primary">Pilihan Membuka:</div>
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Membuka Love Maps">
                  <button type="button" class="choice-tile ${isShared ? 'selected' : ''}" id="tileShareLM" role="radio" aria-checked="${isShared}">
                    <span class="tile-icon" aria-hidden="true">📖</span>
                    <div class="tile-col">
                      <div class="tile-label">Buka Kartu Penemuan Berdua</div>
                      <div class="tile-hint">Menampilkan jawaban asli dan tebakan untuk saling bercerita santai.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${!isShared ? 'selected' : ''}" id="tilePrivateLM" role="radio" aria-checked="${!isShared}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan Pribadi untuk Saat Ini</div>
                      <div class="tile-hint">Tidak menampilkan kartu saat ini, selesai dengan tenang.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="confirmConsentBtn">
                  Lanjut ke Hasil →
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

          let sharedVal = answers.loveMapsShared !== false;

          const updateSelection = (val) => {
            sharedVal = val;
            if (tileShare) {
              tileShare.classList.toggle('selected', sharedVal);
              tileShare.setAttribute('aria-checked', String(sharedVal));
            }
            if (tilePrivate) {
              tilePrivate.classList.toggle('selected', !sharedVal);
              tilePrivate.setAttribute('aria-checked', String(!sharedVal));
            }
          };

          if (tileShare) tileShare.onclick = () => updateSelection(true);
          if (tilePrivate) tilePrivate.onclick = () => updateSelection(false);

          if (confirmBtn) {
            confirmBtn.onclick = () => {
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
          const isShared = answers.loveMapsShared !== false;

          if (!isShared) {
            return `
              <div class="card card-border-plum text-center py-4 px-3 mb-3">
                <div class="text-3xl mb-2" aria-hidden="true">🔒</div>
                <h2 class="text-lg font-bold mb-1">Catatan tersimpan dengan aman.</h2>
                <p class="mute text-sm mb-3">
                  Saling mengenal adalah proses bertahap tanpa paksaan. Terima kasih sudah meluangkan waktu sejenak untuk memikirkan satu sama lain hari ini.
                </p>

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
              <div class="text-center mb-3">
                <div class="mb-2">
                  ${renderMascot('cheer', 64, { inlineStyle: false, label: 'Tunas Gembira' })}
                </div>
                <span class="card-tag tunas">Makin Dekat & Saling Memahami</span>
                <h2 class="mt-2 mb-1">Hal Baru yang Kalian Pelajari</h2>
                <p class="mute text-xs mb-3">
                  Gunakan kartu-kartu penemuan di bawah ini sebagai bahan obrolan hangat berdua:
                </p>
              </div>

              <!-- Discovery Cards (No numbers, no scores, no percentage) -->
              <div class="flex flex-col gap-3 mb-4">
                ${questions.map((q, idx) => {
                  const actualA = answers[`selfA_${q.id}`] || '(Belum diisi)';
                  const guessB = answers[`guessB_${q.id}`] || '(Belum ditebak)';
                  const actualB = answers[`selfB_${q.id}`] || '(Belum diisi)';
                  const guessA = answers[`guessA_${q.id}`] || '(Belum ditebak)';

                  return `
                    <div class="love-maps-discovery-card p-3">
                      <div class="font-bold text-sm text-plum mb-2">
                        Topik ${idx + 1}: ${esc(q.title)}
                      </div>
                      <p class="text-xs text-ink-primary mb-3"><i>"${esc(q.question)}"</i></p>

                      <!-- About Partner A -->
                      <div class="discovery-section mb-2">
                        <div class="text-xs font-bold text-ink-primary">Tentang ${esc(nameA)}:</div>
                        <div class="text-xs mute">Jawaban asli ${esc(nameA)}:</div>
                        <div class="discovery-answer-box mb-1">${esc(actualA)}</div>
                        <div class="text-xs mute">Tebakan ${esc(nameB)}:</div>
                        <div class="discovery-guess-box">${esc(guessB)}</div>
                      </div>

                      <!-- About Partner B -->
                      <div class="discovery-section">
                        <div class="text-xs font-bold text-ink-primary">Tentang ${esc(nameB)}:</div>
                        <div class="text-xs mute">Jawaban asli ${esc(nameB)}:</div>
                        <div class="discovery-answer-box mb-1">${esc(actualB)}</div>
                        <div class="text-xs mute">Tebakan ${esc(nameA)}:</div>
                        <div class="discovery-guess-box">${esc(guessA)}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="neutral-guidance-box mb-4 text-center">
                <b>Pesan Gottman:</b> Setiap kali kamu mengetahui detail baru tentang pasanganmu, peta cintamu semakin kaya dan fondasi rumah tanggamu semakin kokoh.
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
          shared: answers.loveMapsShared !== false,
          answers
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
