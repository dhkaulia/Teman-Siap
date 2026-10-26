/**
 * Teman Siap — Turn-Based Couple Conversation Flow (Single Phone)
 * 
 * Rules:
 * - Turn-based on one phone (~5 minutes): Partner A fills, 3s handover, Partner B fills.
 * - Private by default: answers stored per participant with explicit `shared` boolean.
 * - Provably hidden from DOM: Partner A's answer is never in the DOM during handover/Partner B.
 * - Mutual consent reveal: two flip cards reveal only if BOTH chose to share.
 * - Zero shame: if either declines, show gentle neutral reassurance.
 * - Safety on every step: persistent "Ini terasa tidak nyaman" button.
 */

import { CONTENT } from '../../content.js';
import { Bubble } from '../ui/bubble.js';
import { renderMascot } from '../ui/mascot.js';
import { awardSeeds } from '../rewards.js';
import { esc } from '../ui/utils.js';

/**
 * Technical Architecture & Data Model for Remote Partner Sync ("Segera Hadir")
 * Designed for zero-knowledge end-to-end encrypted partner pairing over a relay server.
 */
export const REMOTE_PARTNER_SYNC_SPEC = {
  version: '1.0-draft',
  status: 'upcoming', // Labeled "Segera hadir"
  endpoint: '/api/v1/couple-session',
  description: 'Zero-Knowledge End-to-End Encrypted Remote Couple Relay Protocol',
  dataModel: {
    sessionId: 'String (UUID v4) - Unique relay session identifier',
    inviteCode: 'String (6-character uppercase alphanumeric code, e.g. TS-4921)',
    createdAt: 'Number (Unix timestamp ms)',
    expiresAt: 'Number (Unix timestamp ms, default 24h lifetime)',
    status: 'pending | paired | revealed | expired',
    
    // Participants
    initiator: {
      participantId: 'String (UUID v4)',
      role: 'A',
      publicKey: 'String (Base64 X25519 public key)',
      hasAnswered: 'Boolean',
      encryptedPayload: 'String (Base64 AES-256-GCM ciphertext of reflection)',
      iv: 'String (Base64 12-byte initialization vector)',
      authTag: 'String (Base64 16-byte authentication tag)',
      consentShareEncrypted: 'String (Base64 encrypted boolean)'
    },
    responder: {
      participantId: 'String (UUID v4)',
      role: 'B',
      publicKey: 'String (Base64 X25519 public key)',
      hasAnswered: 'Boolean',
      encryptedPayload: 'String (Base64 AES-256-GCM ciphertext of reflection)',
      iv: 'String (Base64 12-byte initialization vector)',
      authTag: 'String (Base64 16-byte authentication tag)',
      consentShareEncrypted: 'String (Base64 encrypted boolean)'
    },
    
    // Joint agreement (Created post-reveal)
    agreement: {
      nextStepEncrypted: 'String (Base64)',
      reviewDate: 'String (YYYY-MM-DD or null)'
    }
  },
  
  securityGuarantees: [
    'Zero-Knowledge: The relay server only passes encrypted blobs and never has access to plaintext reflections.',
    'Mutual Consent: Client devices decrypt and display reflections only after both consentShare flags evaluate to true.',
    'No Account Requirement: Pairings use short-lived cryptographic keys generated entirely on user devices.'
  ]
};

/**
 * Access control function to ensure private answers never leak.
 * 
 * Rules:
 * - Partner A sees own answer, and sees B only if BOTH shared.
 * - Partner B sees own answer, and sees A only if BOTH shared.
 * - Shared reveal view sees answers only if BOTH shared.
 * - Any unauthorized participant or single refusal returns null for the unshared answer.
 * 
 * @param {object} conversationData - State of the couple conversation
 * @param {string} participant - 'A' | 'B' | 'shared' | 'both'
 * @returns {{ A: string|null, B: string|null }}
 */
export function visibleTo(conversationData, participant) {
  if (!conversationData || !conversationData.participants) {
    return { A: null, B: null };
  }

  const pA = conversationData.participants.A || { answer: null, shared: false };
  const pB = conversationData.participants.B || { answer: null, shared: false };
  const bothShared = Boolean(pA.shared && pB.shared);

  if (participant === 'A') {
    return {
      A: pA.answer ?? null,
      B: bothShared ? (pB.answer ?? null) : null
    };
  }

  if (participant === 'B') {
    return {
      A: bothShared ? (pA.answer ?? null) : null,
      B: pB.answer ?? null
    };
  }

  if (participant === 'shared' || participant === 'both') {
    return {
      A: bothShared ? (pA.answer ?? null) : null,
      B: bothShared ? (pB.answer ?? null) : null
    };
  }

  // Any unauthorized party or outsider
  return { A: null, B: null };
}

/**
 * Factory for the Turn-Based Couple Conversation Flow
 * 
 * @param {object} convo - Conversation definition from CONTENT.conversations
 * @param {object} store - Store instance
 * @param {function} onComplete - Optional completion callback
 * @param {function} onSafetyExit - Safety trigger callback
 */
export function createCoupleFlow(convo, store, onComplete = null, onSafetyExit = null) {
  const convoId = convo.id;
  const nameA = store?.d?.couple?.partnerA?.name || 'Partner A';
  const nameB = store?.d?.couple?.partnerB?.name || 'Partner B';
  const discussQuestions = (CONTENT.discussStarters && CONTENT.discussStarters.length)
    ? CONTENT.discussStarters
    : [
        'Hal apa yang baru kamu sadari tentang sudut pandang pasanganmu?',
        'Di bagian mana nilai dan harapan kalian berdua sudah selaras?',
        'Jika ada perbedaan harapan, jalan tengah kecil apa yang bisa kita coba bulan ini?'
      ];

  function renderSafetyTrigger() {
    return `
      <div class="safety-exit-row">
        <button type="button" class="safety-trigger-link" data-safety-exit="true" aria-label="Hentikan latihan jika terasa tidak nyaman">
          🛡️ Ini terasa tidak nyaman
        </button>
      </div>
    `;
  }

  function bindSafetyTrigger(container, runner) {
    container.querySelectorAll('[data-safety-exit]').forEach(btn => {
      btn.onclick = () => {
        if (typeof onSafetyExit === 'function') {
          runner.exit();
          onSafetyExit();
        } else {
          runner.exit();
        }
      };
    });
  }

  return {
    id: `couple-${convoId}`,
    title: convo.title,
    completeLabel: 'Selesai ✨',
    steps: [
      // -------------------------------------------------------------
      // Step 1: Intro (Gottman Tip Bubble + Turn-Based Rules)
      // -------------------------------------------------------------
      {
        id: 'intro',
        type: 'custom',
        hideFooter: true,
        title: convo.title,
        subtitle: convo.subtitle,
        renderCustom() {
          const tipText = convo.gottmanTip || 'Kita memahami, bukan menang.';
          const tipBubbleHTML = Bubble.renderHTML({
            sender: 'Prinsip Gottman',
            role: 'guide',
            icon: '🕊️',
            text: tipText
          });

          return `
            <div class="card card-border-plum mb-3">
              <div class="card-title-row">
                <span class="card-tag plum">Satu Ponsel Bergantian</span>
                <span class="text-xs mute">~5 Menit</span>
              </div>
              <h2 class="mt-2 mb-1">${esc(convo.title)}</h2>
              <p class="mute mb-3">${esc(convo.subtitle)}</p>

              <div class="mb-3">
                ${tipBubbleHTML}
              </div>

              <div class="convo-intro-explanation mb-4">
                <div class="font-bold text-sm mb-1 text-ink-primary">Bagaimana alur ini berjalan:</div>
                <ol class="step-rule-list">
                  <li><b>Partner A</b> mengisi jawaban refleksi secara rahasia.</li>
                  <li>Ponsel diserahkan ke <b>Partner B</b> (jawaban Partner A tidak terlihat sama sekali).</li>
                  <li><b>Partner B</b> mengisi refleksinya sendiri.</li>
                  <li>Jawaban hanya dibuka jika <b>kalian berdua sama-sama memilih untuk membagikannya</b>.</li>
                </ol>
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="startPartnerABtn">
                  Mulai: Giliran ${esc(nameA)} →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const btn = container.querySelector('#startPartnerABtn');
          if (btn) btn.onclick = () => runner.next();
          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 2: Partner A Answers Privately
      // -------------------------------------------------------------
      {
        id: 'partnerA',
        type: 'custom',
        hideFooter: true,
        title: `Refleksi ${nameA}`,
        renderCustom(answers) {
          const textVal = answers.answerA || '';
          const isShared = answers.sharedA !== false; // default share true

          return `
            <div class="card card-border-plum mb-3">
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameA)}</b></span>
              </div>
              <div class="card-title-row">
                <span class="card-tag plum">${esc(nameA)}</span>
                <span class="text-xs mute">Privat</span>
              </div>
              <h2 class="mt-1 mb-1">Pertanyaan Refleksi</h2>
              <div class="convo-prompt-box mb-2">
                ${esc(convo.prompt)}
              </div>
              ${convo.helperA ? `<p class="mute text-xs mb-3">💡 ${esc(convo.helperA)}</p>` : ''}

              <label for="partnerAText">Tuliskan refleksimu (${esc(nameA)}):</label>
              <textarea id="partnerAText" placeholder="Tuliskan isi hatimu secara jujur tanpa khawatir dihakimi...">${esc(textVal)}</textarea>

              <div class="sharing-choice-box mb-4">
                <div class="font-bold text-sm mb-2 text-ink-primary">Pilihan Berbagi:</div>
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Berbagi Jawaban ${esc(nameA)}">
                  <button type="button" class="choice-tile ${isShared ? 'selected' : ''}" id="tileShareA" role="radio" aria-checked="${isShared}">
                    <span class="tile-icon" aria-hidden="true">🤝</span>
                    <div class="tile-col">
                      <div class="tile-label">Bagikan ke Ruang Bersama</div>
                      <div class="tile-hint">Hanya terbuka jika ${esc(nameB)} juga setuju berbagi.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${!isShared ? 'selected' : ''}" id="tilePrivateA" role="radio" aria-checked="${!isShared}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan untuk Saya Saja</div>
                      <div class="tile-hint">Jawaban tetap rahasia untukmu, tidak akan ditampilkan ke pasangan.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitPartnerABtn">
                  Lanjut ke Serahkan Ponsel ke ${esc(nameB)} →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const textarea = container.querySelector('#partnerAText');
          const tileShare = container.querySelector('#tileShareA');
          const tilePrivate = container.querySelector('#tilePrivateA');
          const submitBtn = container.querySelector('#submitPartnerABtn');

          let sharedVal = answers.sharedA !== false;

          const updateSelection = (shared) => {
            sharedVal = shared;
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

          if (submitBtn) {
            submitBtn.onclick = () => {
              const text = textarea ? textarea.value.trim() : '';
              runner.setAnswer({
                answerA: text,
                sharedA: sharedVal
              });
              runner.next();
            };
          }

          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 3: Handover Screen ("Serahkan ponsel ke Partner B")
      // 3-second delay countdown before button enables
      // CRITICAL: Partner A's answer is PROVABLY NOT IN THE DOM!
      // -------------------------------------------------------------
      {
        id: 'handover',
        type: 'custom',
        hideFooter: true,
        title: 'Serahkan Ponsel',
        renderCustom() {
          // Note: answers.answerA is deliberately OMITTED from this entire template string!
          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="handover-visual mb-3" aria-hidden="true">
                📱 ➔ 🤝
              </div>
              <h2 class="text-xl font-bold mb-2">Serahkan Ponsel ke ${esc(nameB)}</h2>
              <p class="mute text-sm mb-4">
                Jawaban ${esc(nameA)} telah tersimpan aman dan dirahasiakan.<br>
                Beri ruang bagi ${esc(nameB)} untuk membaca dan menjawab secara mandiri.
              </p>

              <div class="handover-countdown-box mb-4">
                <span class="text-xs mute" id="handoverTimerText">Tombol aktif dalam 3 detik...</span>
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="secondary w-full" id="handoverReadyBtn" disabled>
                  Serahkan ponsel (3 dtk...)
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const readyBtn = container.querySelector('#handoverReadyBtn');
          const timerText = container.querySelector('#handoverTimerText');
          if (!readyBtn) return;

          let secondsLeft = 3;
          readyBtn.disabled = true;

          const interval = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft > 0) {
              readyBtn.textContent = `Serahkan ponsel (${secondsLeft} dtk...)`;
              if (timerText) timerText.textContent = `Tombol aktif dalam ${secondsLeft} detik...`;
            } else {
              clearInterval(interval);
              readyBtn.disabled = false;
              readyBtn.textContent = `Saya ${nameB}, Siap Mulai →`;
              readyBtn.classList.remove('secondary');
              readyBtn.classList.add('plum-btn');
              if (timerText) timerText.textContent = `Silakan sentuh tombol di bawah jika kamu ${nameB}.`;
            }
          }, 1000);

          readyBtn.onclick = () => {
            clearInterval(interval);
            runner.next();
          };

          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 4: Partner B Answers Privately
      // CRITICAL: Partner A's answer is PROVABLY NOT IN THE DOM!
      // -------------------------------------------------------------
      {
        id: 'partnerB',
        type: 'custom',
        hideFooter: true,
        title: `Refleksi ${nameB}`,
        renderCustom(answers) {
          // Note: answers.answerA is deliberately OMITTED from this entire template string!
          const textVal = answers.answerB || '';
          const isShared = answers.sharedB !== false; // default share true

          return `
            <div class="card card-border-plum mb-3">
              <div class="turn-banner mb-3">
                <span>👤</span>
                <span>Giliran: <b>${esc(nameB)}</b></span>
              </div>
              <div class="card-title-row">
                <span class="card-tag saffron">${esc(nameB)}</span>
                <span class="text-xs mute">Privat</span>
              </div>
              <h2 class="mt-1 mb-1">Pertanyaan Refleksi</h2>
              <div class="convo-prompt-box mb-2">
                ${esc(convo.prompt)}
              </div>
              ${convo.helperB ? `<p class="mute text-xs mb-3">💡 ${esc(convo.helperB)}</p>` : ''}

              <label for="partnerBText">Tuliskan refleksimu (${esc(nameB)}):</label>
              <textarea id="partnerBText" placeholder="Tuliskan isi hatimu secara jujur tanpa khawatir dihakimi...">${esc(textVal)}</textarea>

              <div class="sharing-choice-box mb-4">
                <div class="font-bold text-sm mb-2 text-ink-primary">Pilihan Berbagi:</div>
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Berbagi Jawaban ${esc(nameB)}">
                  <button type="button" class="choice-tile ${isShared ? 'selected' : ''}" id="tileShareB" role="radio" aria-checked="${isShared}">
                    <span class="tile-icon" aria-hidden="true">🤝</span>
                    <div class="tile-col">
                      <div class="tile-label">Bagikan ke Ruang Bersama</div>
                      <div class="tile-hint">Hanya terbuka jika ${esc(nameA)} juga setuju berbagi.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${!isShared ? 'selected' : ''}" id="tilePrivateB" role="radio" aria-checked="${!isShared}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan untuk Saya Saja</div>
                      <div class="tile-hint">Jawaban tetap rahasia untukmu, tidak akan ditampilkan ke pasangan.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitPartnerBBtn">
                  Lanjut ke Hasil Penyingkapan →
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const textarea = container.querySelector('#partnerBText');
          const tileShare = container.querySelector('#tileShareB');
          const tilePrivate = container.querySelector('#tilePrivateB');
          const submitBtn = container.querySelector('#submitPartnerBBtn');

          let sharedVal = answers.sharedB !== false;

          const updateSelection = (shared) => {
            sharedVal = shared;
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

          if (submitBtn) {
            submitBtn.onclick = () => {
              const text = textarea ? textarea.value.trim() : '';
              runner.setAnswer({
                answerB: text,
                sharedB: sharedVal
              });
              runner.next();
            };
          }

          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 5: Reveal Only If BOTH Chose to Share
      // If BOTH shared: Two cards that flip one at a time.
      // If EITHER declined: Gentle neutral reassurance, private answers omitted from DOM!
      // -------------------------------------------------------------
      {
        id: 'reveal',
        type: 'custom',
        hideFooter: true,
        title: 'Hasil Refleksi',
        renderCustom(answers) {
          const bothShared = Boolean(answers.sharedA && answers.sharedB);

          if (bothShared) {
            return `
              <div class="card card-border-plum mb-3">
                <div class="text-center mb-2">
                  ${renderMascot('cheer', 56, { inlineStyle: false, label: 'Tunas Gembira' })}
                </div>
                <div class="card-title-row">
                  <span class="card-tag tunas">🤝 Ruang Temu Terbuka</span>
                  <span class="text-xs mute">Keduanya Setuju</span>
                </div>
                <h2 class="mt-1 mb-1">Jawaban Siap Dibuka Berdua</h2>
                <p class="mute text-sm mb-3">
                  Kalian berdua memilih untuk saling berbagi. Duduklah berdampingan, lalu buka kartu satu per satu dengan tenang.
                </p>

                <div class="flip-cards-grid mb-3">
                  <!-- Card Partner A -->
                  <div class="flip-card" id="flipCardA" role="button" tabindex="0" aria-label="Buka jawaban ${esc(nameA)}">
                    <div class="flip-card-inner">
                      <div class="flip-card-front">
                        <span class="flip-icon" aria-hidden="true">🃏</span>
                        <div class="flip-title">Jawaban ${esc(nameA)}</div>
                        <p class="flip-hint">Ketuk untuk membuka kartu</p>
                      </div>
                      <div class="flip-card-back">
                        <div class="flip-header">
                          <span class="card-tag plum">${esc(nameA)}</span>
                        </div>
                        <div class="flip-content" id="flipContentA"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Card Partner B -->
                  <div class="flip-card" id="flipCardB" role="button" tabindex="0" aria-label="Buka jawaban ${esc(nameB)}">
                    <div class="flip-card-inner">
                      <div class="flip-card-front">
                        <span class="flip-icon" aria-hidden="true">🃏</span>
                        <div class="flip-title">Jawaban ${esc(nameB)}</div>
                        <p class="flip-hint">Ketuk untuk membuka kartu</p>
                      </div>
                      <div class="flip-card-back">
                        <div class="flip-header">
                          <span class="card-tag saffron">${esc(nameB)}</span>
                        </div>
                        <div class="flip-content" id="flipContentB"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="neutral-guidance-box mb-3">
                  💡 <b>Pengingat Gottman:</b> Dengarkan untuk memahami dunia batin pasanganmu, bukan untuk membantah atau mencari pemenang.
                </div>

                <div class="sticky-bottom-action">
                  <button type="button" class="plum-btn w-full" id="revealNextBtn">
                    Lanjut ke Pertanyaan Diskusi →
                  </button>
                </div>

                ${renderSafetyTrigger()}
              </div>
            `;
          }

          // Case: Either Partner A or Partner B declined to share
          // CRITICAL: Neither answer is in the DOM!
          return `
            <div class="card card-border-plum text-center py-4 px-3 mb-3">
              <div class="text-3xl mb-2" aria-hidden="true">🔒</div>
              <h2 class="text-lg font-bold mb-1">Satu jawaban tetap pribadi. Itu tidak apa-apa.</h2>
              <p class="mute text-sm mb-3">
                Menjaga batas kenyamanan dan rasa aman adalah bagian penting dari hubungan yang sehat.
                Jawaban yang disimpan untuk diri sendiri tetap dirahasiakan sepenuhnya.
              </p>

              <div class="neutral-guidance-box mb-4 text-left">
                Kalian tetap dapat melanjutkan ke pertanyaan diskusi bersama untuk melatih komunikasi terbuka secara santai.
              </div>

              <div class="flex flex-col gap-2">
                <button type="button" class="plum-btn w-full" id="revealContinueDiscussionBtn">
                  Lanjut ke Pertanyaan Diskusi →
                </button>
                <button type="button" class="secondary w-full" id="revealFinishEarlyBtn">
                  Selesai untuk Hari Ini
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const bothShared = Boolean(answers.sharedA && answers.sharedB);

          if (bothShared) {
            const cardA = container.querySelector('#flipCardA');
            const cardB = container.querySelector('#flipCardB');
            const contentA = container.querySelector('#flipContentA');
            const contentB = container.querySelector('#flipContentB');
            const nextBtn = container.querySelector('#revealNextBtn');

            if (cardA) {
              const flipA = () => {
                if (contentA && answers.answerA) {
                  contentA.textContent = answers.answerA || '(Tidak ada catatan)';
                }
                cardA.classList.add('flipped');
                cardA.setAttribute('aria-expanded', 'true');
              };
              cardA.onclick = flipA;
              cardA.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  flipA();
                }
              };
            }

            if (cardB) {
              const flipB = () => {
                if (contentB && answers.answerB) {
                  contentB.textContent = answers.answerB || '(Tidak ada catatan)';
                }
                cardB.classList.add('flipped');
                cardB.setAttribute('aria-expanded', 'true');
              };
              cardB.onclick = flipB;
              cardB.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  flipB();
                }
              };
            }

            if (nextBtn) nextBtn.onclick = () => runner.next();
          } else {
            const continueBtn = container.querySelector('#revealContinueDiscussionBtn');
            const finishEarlyBtn = container.querySelector('#revealFinishEarlyBtn');

            if (continueBtn) continueBtn.onclick = () => runner.next();
            if (finishEarlyBtn) {
              finishEarlyBtn.onclick = () => {
                // Save privately without discussion agreement
                runner.next(); // advances to discuss step or completes
              };
            }
          }

          bindSafetyTrigger(container, runner);
        }
      },

      // -------------------------------------------------------------
      // Step 6: Discussion (One question at a time from discussStarters)
      // + Optional shared next step and review date
      // -------------------------------------------------------------
      {
        id: 'discuss',
        type: 'custom',
        hideFooter: true,
        title: 'Pertanyaan Diskusi Berdua',
        renderCustom(answers) {
          return `
            <div class="card card-border-plum mb-3">
              <div class="card-title-row">
                <span class="card-tag plum">Langkah 6 dari 6</span>
                <span class="discuss-counter" id="discussCounter">1 dari ${discussQuestions.length}</span>
              </div>
              <h2 class="mt-1 mb-1">Pertanyaan Diskusi Bersama</h2>
              <p class="mute text-xs mb-3">Ambil waktu sejenak untuk saling mendengarkan:</p>

              <!-- Carousel / Stepper of Discussion Questions -->
              <div class="discuss-question-card mb-3">
                <div class="discuss-q-icon" aria-hidden="true">💬</div>
                <div class="discuss-q-text" id="discussQuestionText">${esc(discussQuestions[0])}</div>
              </div>

              <div class="discuss-nav-row mb-4">
                <button type="button" class="secondary btn-action-sm" id="discussPrevQBtn" disabled>
                  ← Pertanyaan Sebelumnya
                </button>
                <button type="button" class="secondary btn-action-sm" id="discussNextQBtn">
                  Pertanyaan Selanjutnya →
                </button>
              </div>

              <!-- Shared next step and review date -->
              <div class="joint-commitment-box mb-4">
                <div class="font-bold text-sm mb-1 text-ink-primary">Langkah Bersama (Opsional)</div>
                <p class="mute text-xs mb-2">Jika ada kesimpulan atau jalan tengah kecil yang ingin kalian sepakati:</p>

                <label for="convoNextStepInput">Satu komitmen atau langkah kecil:</label>
                <input type="text" id="convoNextStepInput" placeholder="Misal: Buat pos tabungan khusus Rp 500 rb/bulan" value="${esc(answers.nextStep || '')}">

                <label for="convoReviewDateInput">Tanggal evaluasi santai berdua (opsional):</label>
                <input type="date" id="convoReviewDateInput" value="${esc(answers.reviewDate || '')}">
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="completeCoupleConvoBtn">
                  Simpan & Selesaikan Sesi ✨
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          let currentQIndex = 0;
          const qTextEl = container.querySelector('#discussQuestionText');
          const counterEl = container.querySelector('#discussCounter');
          const prevBtn = container.querySelector('#discussPrevQBtn');
          const nextBtn = container.querySelector('#discussNextQBtn');
          const stepInput = container.querySelector('#convoNextStepInput');
          const dateInput = container.querySelector('#convoReviewDateInput');
          const completeBtn = container.querySelector('#completeCoupleConvoBtn');

          const updateQuestion = (idx) => {
            currentQIndex = idx;
            if (qTextEl) qTextEl.textContent = discussQuestions[currentQIndex];
            if (counterEl) counterEl.textContent = `${currentQIndex + 1} dari ${discussQuestions.length}`;
            if (prevBtn) prevBtn.disabled = currentQIndex === 0;
            if (nextBtn) nextBtn.disabled = currentQIndex === discussQuestions.length - 1;
          };

          if (prevBtn) {
            prevBtn.onclick = () => {
              if (currentQIndex > 0) updateQuestion(currentQIndex - 1);
            };
          }

          if (nextBtn) {
            nextBtn.onclick = () => {
              if (currentQIndex < discussQuestions.length - 1) updateQuestion(currentQIndex + 1);
            };
          }

          if (completeBtn) {
            completeBtn.onclick = () => {
              const nextStep = stepInput ? stepInput.value.trim() : '';
              const reviewDate = dateInput ? dateInput.value : '';

              runner.setAnswer({
                nextStep,
                reviewDate
              });

              runner.next(); // Marks isComplete and triggers onComplete
            };
          }

          bindSafetyTrigger(container, runner);
        }
      }
    ],

    // -------------------------------------------------------------
    // Store persistence on completion
    // -------------------------------------------------------------
    onComplete(answers, storeInstance) {
      const activeStore = storeInstance || store;
      const convoData = {
        convoId,
        completedAt: Date.now(),
        participants: {
          A: {
            answer: answers.answerA || '',
            shared: Boolean(answers.sharedA),
            updatedAt: Date.now()
          },
          B: {
            answer: answers.answerB || '',
            shared: Boolean(answers.sharedB),
            updatedAt: Date.now()
          }
        },
        agreement: {
          nextStep: answers.nextStep || '',
          reviewDate: answers.reviewDate || null
        },
        status: 'completed'
      };

      if (activeStore && typeof activeStore.saveCoupleConversation === 'function') {
        activeStore.saveCoupleConversation(convoId, convoData);
      }

      if (activeStore && typeof activeStore.recordPartnerPractice === 'function') {
        activeStore.recordPartnerPractice('A');
        activeStore.recordPartnerPractice('B');
      }

      awardSeeds(activeStore, 1, 'Percakapan berdua selesai');

      if (typeof onComplete === 'function') {
        onComplete(convoData);
      }
    }
  };
}
