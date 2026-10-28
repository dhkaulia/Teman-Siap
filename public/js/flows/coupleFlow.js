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
import { renderIcon } from '../ui/icons.js';

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
  const bothShared = Boolean(pA.shared === true && pB.shared === true);

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
      <div class="safety-exit-row mt-2">
        <button type="button" class="safety-trigger-link" data-safety-exit="true" aria-label="Hentikan latihan jika terasa tidak nyaman">
          ${renderIcon('shield')} Ini terasa tidak nyaman
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
    completeLabel: 'Selesai',
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
                <span class="card-tag plum">Satu Ponsel</span>
                <span class="text-xs mute">~5 Menit</span>
              </div>
              <h2 class="mt-2 mb-1">${esc(convo.title)}</h2>

              <div class="mb-3">
                ${tipBubbleHTML}
              </div>

              <div class="convo-intro-explanation mb-4">
                <ol class="step-rule-list">
                  <li>Isi refleksi bergantian di satu ponsel.</li>
                  <li>Jawaban dirahasiakan kecuali berdua setuju berbagi.</li>
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
          const textVal = answers.answerA || answers.partnerA?.answerA || '';
          const sharedAVal = (answers.sharedA !== undefined) ? answers.sharedA : answers.partnerA?.sharedA;
          const hasChoice = sharedAVal === true || sharedAVal === false;
          const isShareSelected = sharedAVal === true;
          const isPrivateSelected = sharedAVal === false;
          const showNotice = Boolean(answers._refreshedNotice);

          return `
            <div class="card card-border-plum mb-3">
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
              <div class="convo-prompt-box mb-2">
                ${esc(convo.prompt)}
              </div>

              <textarea id="partnerAText" aria-label="Tuliskan refleksimu (${esc(nameA)})" placeholder="Tuliskan refleksimu di sini...">${esc(textVal)}</textarea>

              <div class="sharing-choice-box mb-3">
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Berbagi Jawaban ${esc(nameA)}">
                  <button type="button" class="choice-tile ${isShareSelected ? 'selected' : ''}" id="tileShareA" role="radio" aria-checked="${isShareSelected}">
                    <span class="tile-icon" aria-hidden="true">🤝</span>
                    <div class="tile-col">
                      <div class="tile-label">Bagikan</div>
                      <div class="tile-hint">Jika berdua setuju.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${isPrivateSelected ? 'selected' : ''}" id="tilePrivateA" role="radio" aria-checked="${isPrivateSelected}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan pribadi</div>
                      <div class="tile-hint">Rahasia untukmu saja.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="mute text-xs mb-3 text-center">Di satu ponsel, jawaban pribadi hanya seaman ponselnya.</div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitPartnerABtn" ${!hasChoice ? 'disabled' : ''}>
                  Lanjut →
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

          let initialChoice = (answers.sharedA !== undefined) ? answers.sharedA : answers.partnerA?.sharedA;
          let sharedVal = (initialChoice === true || initialChoice === false) ? initialChoice : null;

          const updateSelection = (shared) => {
            sharedVal = shared;
            if (tileShare) {
              tileShare.classList.toggle('selected', sharedVal === true);
              tileShare.setAttribute('aria-checked', String(sharedVal === true));
            }
            if (tilePrivate) {
              tilePrivate.classList.toggle('selected', sharedVal === false);
              tilePrivate.setAttribute('aria-checked', String(sharedVal === false));
            }
            if (submitBtn) {
              submitBtn.disabled = sharedVal === null;
            }
          };

          if (tileShare) tileShare.onclick = () => updateSelection(true);
          if (tilePrivate) tilePrivate.onclick = () => updateSelection(false);

          if (submitBtn) {
            submitBtn.onclick = () => {
              if (sharedVal === null) return;
              const text = textarea ? textarea.value.trim() : '';
              delete answers._refreshedNotice;
              answers.answerA = text;
              answers.sharedA = sharedVal;
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
              <p class="mute text-sm mb-3">
                Jawaban ${esc(nameA)} tersimpan aman. Beri ruang bagi ${esc(nameB)} menjawab mandiri.
              </p>

              <div class="handover-countdown-box mb-3">
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
              if (timerText) timerText.textContent = `Silakan sentuh tombol untuk mulai.`;
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
          const textVal = answers.answerB || answers.partnerB?.answerB || '';
          const sharedBVal = (answers.sharedB !== undefined) ? answers.sharedB : answers.partnerB?.sharedB;
          const hasChoice = sharedBVal === true || sharedBVal === false;
          const isShareSelected = sharedBVal === true;
          const isPrivateSelected = sharedBVal === false;
          const showNotice = Boolean(answers._refreshedNotice);

          return `
            <div class="card card-border-plum mb-3">
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
              <div class="convo-prompt-box mb-2">
                ${esc(convo.prompt)}
              </div>

              <textarea id="partnerBText" aria-label="Tuliskan refleksimu (${esc(nameB)})" placeholder="Tuliskan refleksimu di sini...">${esc(textVal)}</textarea>

              <div class="sharing-choice-box mb-3">
                <div class="choice-tiles-vertical" role="radiogroup" aria-label="Pilihan Berbagi Jawaban ${esc(nameB)}">
                  <button type="button" class="choice-tile ${isShareSelected ? 'selected' : ''}" id="tileShareB" role="radio" aria-checked="${isShareSelected}">
                    <span class="tile-icon" aria-hidden="true">🤝</span>
                    <div class="tile-col">
                      <div class="tile-label">Bagikan</div>
                      <div class="tile-hint">Jika berdua setuju.</div>
                    </div>
                  </button>

                  <button type="button" class="choice-tile ${isPrivateSelected ? 'selected' : ''}" id="tilePrivateB" role="radio" aria-checked="${isPrivateSelected}">
                    <span class="tile-icon" aria-hidden="true">🔒</span>
                    <div class="tile-col">
                      <div class="tile-label">Simpan pribadi</div>
                      <div class="tile-hint">Rahasia untukmu saja.</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="mute text-xs mb-3 text-center">Di satu ponsel, jawaban pribadi hanya seaman ponselnya.</div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="submitPartnerBBtn" ${!hasChoice ? 'disabled' : ''}>
                  Lanjut →
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

          let initialChoice = (answers.sharedB !== undefined) ? answers.sharedB : answers.partnerB?.sharedB;
          let sharedVal = (initialChoice === true || initialChoice === false) ? initialChoice : null;

          const updateSelection = (shared) => {
            sharedVal = shared;
            if (tileShare) {
              tileShare.classList.toggle('selected', sharedVal === true);
              tileShare.setAttribute('aria-checked', String(sharedVal === true));
            }
            if (tilePrivate) {
              tilePrivate.classList.toggle('selected', sharedVal === false);
              tilePrivate.setAttribute('aria-checked', String(sharedVal === false));
            }
            if (submitBtn) {
              submitBtn.disabled = sharedVal === null;
            }
          };

          if (tileShare) tileShare.onclick = () => updateSelection(true);
          if (tilePrivate) tilePrivate.onclick = () => updateSelection(false);

          if (submitBtn) {
            submitBtn.onclick = () => {
              if (sharedVal === null) return;
              const text = textarea ? textarea.value.trim() : '';
              delete answers._refreshedNotice;
              answers.answerB = text;
              answers.sharedB = sharedVal;
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
          const sharedA = (answers.sharedA !== undefined) ? answers.sharedA : answers.partnerA?.sharedA;
          const sharedB = (answers.sharedB !== undefined) ? answers.sharedB : answers.partnerB?.sharedB;
          const bothShared = sharedA === true && sharedB === true;

          if (bothShared) {
            return `
              <div class="card card-border-plum mb-3">
                <div class="text-center mb-2">
                  ${renderMascot('cheer', 56, { inlineStyle: false, label: 'Tunas Gembira' })}
                </div>
                <div class="card-title-row">
                  <span class="card-tag tunas">Ruang Temu Terbuka</span>
                </div>
                <h2 class="mt-1 mb-1">Jawaban Siap Dibuka</h2>
                <p class="mute text-xs mb-3">
                  Buka kartu satu per satu:
                </p>

                <div class="flip-cards-grid mb-3">
                  <!-- Card Partner A -->
                  <div class="flip-card" id="flipCardA" role="button" tabindex="0" aria-label="Buka jawaban ${esc(nameA)}">
                    <div class="flip-card-inner">
                      <div class="flip-card-front">
                        <span class="flip-icon" aria-hidden="true">🃏</span>
                        <div class="flip-title">${esc(nameA)}</div>
                        <p class="flip-hint">Buka</p>
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
                        <div class="flip-title">${esc(nameB)}</div>
                        <p class="flip-hint">Buka</p>
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

                <div class="neutral-guidance-box mb-3 text-xs">
                  💡 Dengarkan untuk saling memahami.
                </div>

                <div class="sticky-bottom-action">
                  <button type="button" class="plum-btn w-full" id="revealNextBtn">
                    Lanjut ke Diskusi →
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
                Ruang aman tetap terjaga. Jawaban pribadi dirahasiakan.
              </p>

              <div class="mute text-xs mb-3 text-center">Di satu ponsel, jawaban pribadi hanya seaman ponselnya.</div>

              <div class="flex flex-col gap-2">
                <button type="button" class="plum-btn w-full" id="revealContinueDiscussionBtn">
                  Lanjut ke Diskusi →
                </button>
                <button type="button" class="secondary w-full" id="revealFinishEarlyBtn">
                  Selesai Hari Ini
                </button>
              </div>

              ${renderSafetyTrigger()}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const sharedA = (answers.sharedA !== undefined) ? answers.sharedA : answers.partnerA?.sharedA;
          const sharedB = (answers.sharedB !== undefined) ? answers.sharedB : answers.partnerB?.sharedB;
          const bothShared = sharedA === true && sharedB === true;

          if (bothShared) {
            const cardA = container.querySelector('#flipCardA');
            const cardB = container.querySelector('#flipCardB');
            const contentA = container.querySelector('#flipContentA');
            const contentB = container.querySelector('#flipContentB');
            const nextBtn = container.querySelector('#revealNextBtn');

            if (cardA) {
              const flipA = () => {
                const ansA = answers.answerA || answers.partnerA?.answerA;
                if (contentA && ansA) {
                  contentA.textContent = ansA;
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
                const ansB = answers.answerB || answers.partnerB?.answerB;
                if (contentB && ansB) {
                  contentB.textContent = ansB;
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
                runner.next();
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
        title: 'Diskusi Berdua',
        renderCustom(answers) {
          return `
            <div class="card card-border-plum mb-3">
              <div class="card-title-row">
                <span class="card-tag plum">Langkah 6 dari 6</span>
                <span class="discuss-counter" id="discussCounter">1 dari ${discussQuestions.length}</span>
              </div>
              <h2 class="mt-1 mb-1">Diskusi Berdua</h2>

              <!-- Carousel / Stepper of Discussion Questions -->
              <div class="discuss-question-card mb-3">
                <div class="discuss-q-text" id="discussQuestionText">${esc(discussQuestions[0])}</div>
              </div>

              <div class="discuss-nav-row mb-3">
                <button type="button" class="secondary btn-action-sm" id="discussPrevQBtn" disabled>
                  ← Sebelumnya
                </button>
                <button type="button" class="secondary btn-action-sm" id="discussNextQBtn">
                  Selanjutnya →
                </button>
              </div>

              <!-- Shared next step and review date -->
              <div class="joint-commitment-box mb-3">
                <label for="convoNextStepInput" class="font-bold text-xs block mb-1">Langkah bersama (opsional):</label>
                <input type="text" id="convoNextStepInput" placeholder="Misal: Pos tabungan baru" value="${esc(answers.nextStep || '')}">
                <input type="date" id="convoReviewDateInput" class="mt-2" value="${esc(answers.reviewDate || '')}" aria-label="Tanggal evaluasi santai berdua">
              </div>

              <div class="sticky-bottom-action">
                <button type="button" class="plum-btn w-full" id="completeCoupleConvoBtn">
                  Simpan & Selesai
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
      const ansA = answers.answerA || answers.partnerA?.answerA || '';
      const shA = (answers.sharedA !== undefined) ? answers.sharedA : answers.partnerA?.sharedA;
      const ansB = answers.answerB || answers.partnerB?.answerB || '';
      const shB = (answers.sharedB !== undefined) ? answers.sharedB : answers.partnerB?.sharedB;

      const convoData = {
        convoId,
        completedAt: Date.now(),
        participants: {
          A: {
            answer: ansA,
            shared: shA === true,
            updatedAt: Date.now()
          },
          B: {
            answer: ansB,
            shared: shB === true,
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
