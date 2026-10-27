/**
 * Teman Siap — Lesson Player (Duolingo-like Short-Session Experience)
 * 
 * Rules:
 * - Runs on top of the session runner.
 * - 6 to 10 tiny steps per lesson, completing in under 2-3 minutes at 360px.
 * - Step types:
 *     teach   : One idea, spot illustration, 2 sentences max, "Lanjut" button.
 *     choose  : Scenario, 3 options, "Periksa", AnswerSheet feedback ("Coba lagi" / "Lanjut").
 *     match   : Tap-to-pair (feelings with sensations, Gottman Four Horsemen with antidotes), fully tappable.
 *     order   : Arrange 3 to 4 steps with tap-to-add from bank to slots, tap to remove.
 *     reflect : No right answer; pick one tile or skip.
 *     doit    : Real micro-action (breathe, sentence, amount), "Nanti saja" always available.
 * - Feedback:
 *     Correct   : Celebratory but brief AnswerSheet.
 *     Not quite : Kind, shows why, offers "Coba lagi" (retry now) or "Lanjut" (queues for end review).
 *     Review    : Mistakes are queued once more before the summary screen as gentle review.
 * - End screen:
 *     Summary with Tunas cheering, "Hari ini kamu berlatih: [2 skills]", weekly count updating with animation.
 *     NOT a percentage score (strictly zero %).
 * - Top bar:
 *     X button triggers non-guilting dialog ("Simpan dan keluar?" with Save/Discard).
 *     Progress bar tracks progress smoothly.
 */

import { esc, announce } from '../ui/utils.js';
import { renderMascot, getMascotStage, getTotalPractices, renderSpotIllustration } from '../ui/mascot.js';
import { AnswerSheet } from '../ui/answerSheet.js';
import { triggerCelebration } from '../ui/confetti.js';
import { playTapSound, playSuccessSound, triggerHapticTap, triggerHapticSuccess } from '../ui/feedback.js';
import { sessionRunner } from '../session.js';
import { getWeeklyPracticeCount } from '../screens/home.js';
import { markNodeCompleted } from './path.js';
import { getLessonById, SAMPLE_LESSONS } from './lessons.js';

export { getLessonById, SAMPLE_LESSONS };

/**
 * Creates a declarative Flow object configured for the Lesson Player on top of SessionRunner
 * 
 * @param {object} lesson - Lesson definition from lessons.js
 * @param {Function} [onDone] - Callback when lesson completes
 * @param {object} [store] - Application reactive store
 * @returns {object} Declarative flow object for sessionRunner.start(flow)
 */
export function createLessonFlow(lesson, onDone, store) {
  if (!lesson || !Array.isArray(lesson.steps)) {
    throw new Error('Invalid lesson definition provided to createLessonFlow');
  }

  // Internal review queue for missed steps
  const reviewQueue = [];
  const reviewedIds = new Set();

  /**
   * Queues a missed step for gentle review at the end
   */
  function queueReview(step) {
    if (!step) return;
    const reviewId = `review-${step.id}`;
    if (reviewedIds.has(reviewId)) return;
    reviewedIds.add(reviewId);

    // Deep clone step and tag as review
    const reviewStep = {
      ...step,
      id: reviewId,
      isReview: true,
      originalId: step.id
    };

    reviewQueue.push(reviewStep);

    // Dynamically insert review step right before the summary step in sessionRunner
    const activeSession = sessionRunner.getActiveSession();
    if (activeSession && activeSession.flow && Array.isArray(activeSession.flow.steps)) {
      const currentSteps = activeSession.flow.steps;
      const summaryIdx = currentSteps.length - 1;
      if (summaryIdx >= 0 && !currentSteps.some(s => s.id === reviewId)) {
        currentSteps.splice(summaryIdx, 0, buildStepFromDefinition(reviewStep, queueReview, lesson, onDone, store));
      }
    }
  }

  // Map initial lesson steps
  const flowSteps = lesson.steps.map(stepDef =>
    buildStepFromDefinition(stepDef, queueReview, lesson, onDone, store)
  );

  // Append End Summary Step as the final step
  flowSteps.push(buildSummaryStep(lesson, onDone, store));

  return {
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration || '2 menit',
    steps: flowSteps,
    hideProgress: false,
    completeLabel: 'Selesai',
    // Custom non-guilting exit confirmation
    onExit: (runner) => {
      showLessonExitModal(runner);
    },
    onComplete: (answers, appStore) => {
      const targetStore = store || appStore;
      if (targetStore && targetStore.d) {
        if (lesson.nodeId) {
          markNodeCompleted(lesson.nodeId, targetStore);
        }
        // Record practice entry
        if (!Array.isArray(targetStore.d.pauses)) targetStore.d.pauses = [];
        targetStore.d.pauses.push({
          id: lesson.id,
          at: Date.now(),
          type: 'lesson',
          skills: lesson.skills || []
        });
        if (typeof targetStore.save === 'function') {
          targetStore.save();
        }
      }
      if (typeof onDone === 'function') {
        onDone();
      }
    }
  };
}

/**
 * Builds an individual flow step from a lesson step definition
 */
function buildStepFromDefinition(stepDef, queueReview, lesson, onDone, store) {
  switch (stepDef.type) {
    case 'teach':
      return buildTeachStep(stepDef);
    case 'choose':
      return buildChooseStep(stepDef, queueReview);
    case 'match':
      return buildMatchStep(stepDef, queueReview);
    case 'order':
      return buildOrderStep(stepDef, queueReview);
    case 'reflect':
      return buildReflectStep(stepDef);
    case 'doit':
      return buildDoitStep(stepDef);
    default:
      return buildTeachStep(stepDef);
  }
}

/* ==========================================================================
   1. TEACH STEP BUILDER
   One idea, spot illustration, two sentences max, "Lanjut" button.
   ========================================================================== */
export function buildTeachStep(step) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: () => {
      const isReview = Boolean(step.isReview);
      return `
        <div class="lesson-step-wrap lesson-teach-wrap">
          <div class="lesson-step-header mb-3">
            <span class="card-tag ${isReview ? 'saffron' : 'teal'} mb-1">
              ${isReview ? 'Ulasan Lembut' : 'Pelajari Konsep'}
            </span>
            <h2 class="lesson-step-title mt-1 mb-0">${esc(step.title)}</h2>
          </div>

          <div class="lesson-teach-spot-wrap my-3" aria-hidden="true">
            ${renderSpotIllustration(step.spot || 'emosi', 76)}
          </div>

          <div class="lesson-teach-card mb-4">
            <p class="lesson-teach-text mb-0">${esc(step.text)}</p>
          </div>

          <div class="lesson-action-bar">
            <button type="button" class="btn-chunky primary btn-thumb" id="lessonTeachNextBtn">
              <span>Lanjut →</span>
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      const nextBtn = container.querySelector('#lessonTeachNextBtn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          playTapSound();
          triggerHapticTap();
          sessionRunner.next();
        };
      }
    }
  };
}

/* ==========================================================================
   2. CHOOSE STEP BUILDER
   Multiple-choice scenario, 3 options, tap to select, "Periksa".
   Feedback via AnswerSheet ("Coba lagi" / "Lanjut" with mistake queuing).
   ========================================================================== */
export function buildChooseStep(step, queueReview) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: (answers) => {
      const isReview = Boolean(step.isReview);
      const chosenId = answers[step.id] || null;

      return `
        <div class="lesson-step-wrap lesson-choose-wrap">
          <div class="lesson-step-header mb-2">
            <span class="card-tag ${isReview ? 'saffron' : 'sunny'} mb-1">
              ${isReview ? 'Ulasan Lembut' : 'Pilih Respons'}
            </span>
            <h2 class="lesson-step-title mt-1 mb-1">${esc(step.title)}</h2>
            ${isReview ? `<p class="mute text-xs mb-2">Mari coba sekali lagi dengan tenang.</p>` : ''}
          </div>

          <div class="lesson-scenario-box mb-3">
            <p class="scenario-text mb-0">${esc(step.scenario)}</p>
          </div>

          <div class="lesson-choices-list mb-4" role="radiogroup" aria-label="${esc(step.title)}">
            ${(step.options || []).map((opt, idx) => {
              const isSelected = chosenId === opt.id;
              const letter = ['A', 'B', 'C'][idx] || String(idx + 1);
              return `
                <button type="button"
                        class="lesson-choice-tile ${isSelected ? 'is-selected' : ''}"
                        data-option-id="${esc(opt.id)}"
                        role="radio"
                        aria-checked="${isSelected}"
                        tabindex="0">
                  <span class="choice-tile-badge" aria-hidden="true">${letter}</span>
                  <span class="choice-tile-label">${esc(opt.label)}</span>
                  <span class="choice-tile-check" aria-hidden="true">${isSelected ? '✓' : ''}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="lesson-action-bar">
            <button type="button"
                    class="btn-chunky primary btn-thumb"
                    id="lessonChooseCheckBtn"
                    ${chosenId ? '' : 'disabled aria-disabled="true"'}>
              <span>Periksa</span>
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container, answers) => {
      let selectedId = answers[step.id] || null;
      const checkBtn = container.querySelector('#lessonChooseCheckBtn');

      container.querySelectorAll('.lesson-choice-tile').forEach(tile => {
        const optId = tile.dataset.optionId;

        tile.onclick = () => {
          playTapSound();
          triggerHapticTap();
          selectedId = optId;
          sessionRunner.setAnswer(selectedId);

          container.querySelectorAll('.lesson-choice-tile').forEach(t => {
            const isMatch = t.dataset.optionId === selectedId;
            t.classList.toggle('is-selected', isMatch);
            t.setAttribute('aria-checked', isMatch ? 'true' : 'false');
            const checkIcon = t.querySelector('.choice-tile-check');
            if (checkIcon) checkIcon.textContent = isMatch ? '✓' : '';
          });

          if (checkBtn) {
            checkBtn.removeAttribute('disabled');
            checkBtn.removeAttribute('aria-disabled');
          }
        };
      });

      if (checkBtn) {
        checkBtn.onclick = () => {
          if (!selectedId) return;
          const chosenOpt = (step.options || []).find(o => o.id === selectedId);
          const isCorrect = Boolean(chosenOpt && chosenOpt.isCorrect);

          if (isCorrect) {
            playSuccessSound();
            triggerHapticSuccess();
            AnswerSheet.show({
              type: 'success',
              message: 'Tepat sekali!',
              explanation: step.correctExplanation || 'Pemahamanmu sangat tajam.',
              buttonText: 'Lanjut',
              onContinue: () => {
                sessionRunner.next();
              }
            });
          } else {
            AnswerSheet.show({
              type: 'belum_pas',
              message: 'Belum pas, mari pelajari alasannya.',
              explanation: step.incorrectExplanation || 'Tiap respon otomatis adalah proses belajar yang wajar.',
              buttonText: 'Lanjut',
              secondaryButtonText: 'Coba Lagi',
              onSecondary: () => {
                // Reset selection for immediate retry
                selectedId = null;
                sessionRunner.setAnswer(null);
                container.querySelectorAll('.lesson-choice-tile').forEach(t => {
                  t.classList.remove('is-selected');
                  t.setAttribute('aria-checked', 'false');
                  const checkIcon = t.querySelector('.choice-tile-check');
                  if (checkIcon) checkIcon.textContent = '';
                });
                if (checkBtn) {
                  checkBtn.setAttribute('disabled', 'true');
                  checkBtn.setAttribute('aria-disabled', 'true');
                }
              },
              onContinue: () => {
                if (typeof queueReview === 'function' && !step.isReview) {
                  queueReview(step);
                }
                sessionRunner.next();
              }
            });
          }
        };
      }
    }
  };
}

/* ==========================================================================
   3. MATCH STEP BUILDER
   Tap-to-pair (feelings with sensations, or Gottman 4 horsemen with antidotes).
   Tappable on mobile with 48px touch targets, zero dragging required.
   ========================================================================== */
export function buildMatchStep(step, queueReview) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: () => {
      const isReview = Boolean(step.isReview);
      const pairs = step.pairs || [];

      // Deterministic shuffle for right items
      const rightItems = pairs.map((p, idx) => ({ text: p.right, pairIdx: idx }));
      rightItems.sort((a, b) => (a.text.length % 2 === 0 ? 1 : -1));

      return `
        <div class="lesson-step-wrap lesson-match-wrap">
          <div class="lesson-step-header mb-2">
            <span class="card-tag ${isReview ? 'saffron' : 'plum'} mb-1">
              ${isReview ? 'Ulasan Lembut' : 'Pasangkan'}
            </span>
            <h2 class="lesson-step-title mt-1 mb-1">${esc(step.title)}</h2>
            <p class="mute text-xs mb-3">${esc(step.subtitle || 'Ketuk kartu di kiri, lalu ketuk pasangannya di kanan.')}</p>
          </div>

          <div class="match-board mb-3" role="group" aria-label="Papan Mencocokkan Pasangan">
            <!-- Left Column -->
            <div class="match-col match-col-left" aria-label="Kolom Kiri">
              ${pairs.map((p, idx) => `
                <button type="button"
                        class="match-card match-card-left"
                        data-side="left"
                        data-pair-idx="${idx}"
                        aria-pressed="false">
                  <span class="match-card-text">${esc(p.left)}</span>
                  <span class="match-check-icon" aria-hidden="true"></span>
                </button>
              `).join('')}
            </div>

            <!-- Right Column -->
            <div class="match-col match-col-right" aria-label="Kolom Kanan">
              ${rightItems.map((r) => `
                <button type="button"
                        class="match-card match-card-right"
                        data-side="right"
                        data-pair-idx="${r.pairIdx}"
                        aria-pressed="false">
                  <span class="match-card-text">${esc(r.text)}</span>
                  <span class="match-check-icon" aria-hidden="true"></span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="match-status-bar mb-3">
            <div id="matchStatusNotice" class="text-xs mute text-center" role="status">
              0 dari ${pairs.length} pasangan terhubung
            </div>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      const pairs = step.pairs || [];
      const totalPairs = pairs.length;
      let matchedCount = 0;
      let selectedLeftCard = null;
      let selectedRightCard = null;
      let isMismatchProcessing = false;

      const statusNotice = container.querySelector('#matchStatusNotice');

      const updateStatus = () => {
        if (statusNotice) {
          statusNotice.textContent = `${matchedCount} dari ${totalPairs} pasangan terhubung`;
        }
      };

      const checkMatch = () => {
        if (!selectedLeftCard || !selectedRightCard || isMismatchProcessing) return;

        const leftIdx = selectedLeftCard.dataset.pairIdx;
        const rightIdx = selectedRightCard.dataset.pairIdx;

        if (leftIdx === rightIdx) {
          // Success Match!
          playSuccessSound();
          triggerHapticSuccess();

          selectedLeftCard.classList.remove('is-selected');
          selectedRightCard.classList.remove('is-selected');

          selectedLeftCard.classList.add('is-matched');
          selectedRightCard.classList.add('is-matched');

          selectedLeftCard.setAttribute('disabled', 'true');
          selectedRightCard.setAttribute('disabled', 'true');

          const leftCheck = selectedLeftCard.querySelector('.match-check-icon');
          if (leftCheck) leftCheck.textContent = '✓';
          const rightCheck = selectedRightCard.querySelector('.match-check-icon');
          if (rightCheck) rightCheck.textContent = '✓';

          selectedLeftCard = null;
          selectedRightCard = null;
          matchedCount++;
          updateStatus();

          announce(`Cocok! ${matchedCount} dari ${totalPairs} selesai.`);

          if (matchedCount >= totalPairs) {
            setTimeout(() => {
              AnswerSheet.show({
                type: 'success',
                message: 'Semua Pasangan Cocok!',
                explanation: step.explanation || 'Menghubungkan konsep secara aktif memperkuat jalur memori di otak.',
                buttonText: 'Lanjut',
                onContinue: () => sessionRunner.next()
              });
            }, 300);
          }
        } else {
          // Mismatch
          isMismatchProcessing = true;
          selectedLeftCard.classList.add('is-mismatch');
          selectedRightCard.classList.add('is-mismatch');

          setTimeout(() => {
            if (selectedLeftCard) {
              selectedLeftCard.classList.remove('is-selected', 'is-mismatch');
              selectedLeftCard.setAttribute('aria-pressed', 'false');
            }
            if (selectedRightCard) {
              selectedRightCard.classList.remove('is-selected', 'is-mismatch');
              selectedRightCard.setAttribute('aria-pressed', 'false');
            }
            selectedLeftCard = null;
            selectedRightCard = null;
            isMismatchProcessing = false;
          }, 450);
        }
      };

      container.querySelectorAll('.match-card').forEach(card => {
        card.onclick = () => {
          if (isMismatchProcessing || card.classList.contains('is-matched')) return;

          playTapSound();
          triggerHapticTap();

          const side = card.dataset.side;

          if (side === 'left') {
            if (selectedLeftCard) {
              selectedLeftCard.classList.remove('is-selected');
              selectedLeftCard.setAttribute('aria-pressed', 'false');
            }
            selectedLeftCard = card;
            selectedLeftCard.classList.add('is-selected');
            selectedLeftCard.setAttribute('aria-pressed', 'true');
            checkMatch();
          } else {
            if (selectedRightCard) {
              selectedRightCard.classList.remove('is-selected');
              selectedRightCard.setAttribute('aria-pressed', 'false');
            }
            selectedRightCard = card;
            selectedRightCard.classList.add('is-selected');
            selectedRightCard.setAttribute('aria-pressed', 'true');
            checkMatch();
          }
        };
      });
    }
  };
}

/* ==========================================================================
   4. ORDER STEP BUILDER
   Arrange 3 to 4 steps with tap-to-add into slots, tap to remove.
   Feedback with AnswerSheet ("Coba lagi" / "Lanjut" with mistake queuing).
   ========================================================================== */
export function buildOrderStep(step, queueReview) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: () => {
      const isReview = Boolean(step.isReview);
      const targetSteps = step.steps || [];

      // Shuffled pool of items
      const poolItems = targetSteps.map((text, idx) => ({ text, originalIdx: idx }));
      poolItems.sort((a, b) => (a.text.length % 2 === 0 ? -1 : 1));

      return `
        <div class="lesson-step-wrap lesson-order-wrap">
          <div class="lesson-step-header mb-2">
            <span class="card-tag ${isReview ? 'saffron' : 'saffron'} mb-1">
              ${isReview ? 'Ulasan Lembut' : 'Urutkan Langkah'}
            </span>
            <h2 class="lesson-step-title mt-1 mb-1">${esc(step.title)}</h2>
            <p class="mute text-xs mb-3">${esc(step.subtitle || 'Ketuk item di bawah untuk menyusun urutan yang ideal.')}</p>
          </div>

          <!-- Target Slots Container -->
          <div class="order-slots mb-3" role="list" aria-label="Urutan Langkah">
            ${targetSteps.map((_, idx) => `
              <button type="button"
                      class="order-slot"
                      data-slot-idx="${idx}"
                      aria-label="Slot langkah ${idx + 1}: kosong">
                <span class="order-slot-num">${idx + 1}</span>
                <span class="order-slot-content mute text-xs">Ketuk item di bawah...</span>
                <span class="order-slot-remove" aria-hidden="true"></span>
              </button>
            `).join('')}
          </div>

          <!-- Item Bank Container -->
          <div class="order-bank-label text-xs mute font-bold mb-1">Pilihan Langkah:</div>
          <div class="order-bank mb-4" role="group" aria-label="Bank Pilihan Langkah">
            ${poolItems.map((item) => `
              <button type="button"
                      class="order-bank-chip"
                      data-original-idx="${item.originalIdx}">
                <span>${esc(item.text)}</span>
              </button>
            `).join('')}
          </div>

          <div class="lesson-action-bar">
            <button type="button"
                    class="btn-chunky primary btn-thumb"
                    id="lessonOrderCheckBtn"
                    disabled aria-disabled="true">
              <span>Periksa Urutan</span>
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      const targetSteps = step.steps || [];
      const totalCount = targetSteps.length;
      // Array holding items placed in slots: [ { originalIdx, text } | null ]
      const placedSlots = new Array(totalCount).fill(null);
      const checkBtn = container.querySelector('#lessonOrderCheckBtn');

      const refreshUI = () => {
        container.querySelectorAll('.order-slot').forEach(slot => {
          const idx = Number(slot.dataset.slotIdx);
          const placed = placedSlots[idx];
          const contentEl = slot.querySelector('.order-slot-content');
          const removeEl = slot.querySelector('.order-slot-remove');

          if (placed) {
            slot.classList.add('is-filled');
            slot.setAttribute('aria-label', `Slot ${idx + 1}: ${placed.text}. Ketuk untuk mengembalikan.`);
            if (contentEl) {
              contentEl.textContent = placed.text;
              contentEl.classList.remove('mute');
            }
            if (removeEl) removeEl.textContent = '✕';
          } else {
            slot.classList.remove('is-filled');
            slot.setAttribute('aria-label', `Slot ${idx + 1}: kosong.`);
            if (contentEl) {
              contentEl.textContent = 'Ketuk item di bawah...';
              contentEl.classList.add('mute');
            }
            if (removeEl) removeEl.textContent = '';
          }
        });

        // Hide/show chips in bank
        container.querySelectorAll('.order-bank-chip').forEach(chip => {
          const origIdx = Number(chip.dataset.originalIdx);
          const isPlaced = placedSlots.some(p => p && p.originalIdx === origIdx);
          chip.classList.toggle('is-placed', isPlaced);
          chip.style.visibility = isPlaced ? 'hidden' : 'visible';
        });

        const allFilled = placedSlots.every(p => p !== null);
        if (checkBtn) {
          if (allFilled) {
            checkBtn.removeAttribute('disabled');
            checkBtn.removeAttribute('aria-disabled');
          } else {
            checkBtn.setAttribute('disabled', 'true');
            checkBtn.setAttribute('aria-disabled', 'true');
          }
        }
      };

      // Tapping item in bank adds to next open slot
      container.querySelectorAll('.order-bank-chip').forEach(chip => {
        chip.onclick = () => {
          const origIdx = Number(chip.dataset.originalIdx);
          const nextEmptyIdx = placedSlots.indexOf(null);
          if (nextEmptyIdx === -1) return;

          playTapSound();
          triggerHapticTap();

          placedSlots[nextEmptyIdx] = {
            originalIdx: origIdx,
            text: targetSteps[origIdx]
          };

          refreshUI();
        };
      });

      // Tapping filled slot returns item to bank
      container.querySelectorAll('.order-slot').forEach(slot => {
        slot.onclick = () => {
          const idx = Number(slot.dataset.slotIdx);
          if (!placedSlots[idx]) return;

          playTapSound();
          triggerHapticTap();

          placedSlots[idx] = null;
          refreshUI();
        };
      });

      if (checkBtn) {
        checkBtn.onclick = () => {
          const allFilled = placedSlots.every(p => p !== null);
          if (!allFilled) return;

          // Check if sequence matches target 0, 1, 2...
          const isCorrect = placedSlots.every((p, idx) => p && p.originalIdx === idx);

          if (isCorrect) {
            playSuccessSound();
            triggerHapticSuccess();
            AnswerSheet.show({
              type: 'success',
              message: 'Urutan Tepat!',
              explanation: step.explanation || 'Langkah berurutan membuat otak bekerja secara teratur tanpa beban panik.',
              buttonText: 'Lanjut',
              onContinue: () => sessionRunner.next()
            });
          } else {
            AnswerSheet.show({
              type: 'belum_pas',
              message: 'Urutan Belum Pas',
              explanation: 'Urutan yang ideal: ' + targetSteps.map((s, i) => `${i + 1}. ${s}`).join(' → '),
              buttonText: 'Lanjut',
              secondaryButtonText: 'Coba Lagi',
              onSecondary: () => {
                // Clear all slots for retry
                for (let i = 0; i < placedSlots.length; i++) placedSlots[i] = null;
                refreshUI();
              },
              onContinue: () => {
                if (typeof queueReview === 'function' && !step.isReview) {
                  queueReview(step);
                }
                sessionRunner.next();
              }
            });
          }
        };
      }
    }
  };
}

/* ==========================================================================
   5. REFLECT STEP BUILDER
   No right answer; pick one tile or skip. Warm validation AnswerSheet.
   ========================================================================== */
export function buildReflectStep(step) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: (answers) => {
      const chosenId = answers[step.id] || null;

      return `
        <div class="lesson-step-wrap lesson-reflect-wrap">
          <div class="lesson-step-header mb-2">
            <span class="card-tag tunas mb-1">Refleksi Pribadi</span>
            <h2 class="lesson-step-title mt-1 mb-1">${esc(step.title)}</h2>
            <p class="mute text-xs mb-3">${esc(step.subtitle)}</p>
          </div>

          <div class="lesson-choices-list mb-3" role="radiogroup" aria-label="${esc(step.title)}">
            ${(step.options || []).map((opt) => {
              const isSelected = chosenId === opt.id;
              return `
                <button type="button"
                        class="lesson-choice-tile ${isSelected ? 'is-selected' : ''}"
                        data-option-id="${esc(opt.id)}"
                        role="radio"
                        aria-checked="${isSelected}">
                  ${opt.icon ? `<span class="choice-tile-badge" aria-hidden="true">${opt.icon}</span>` : ''}
                  <span class="choice-tile-label">${esc(opt.label)}</span>
                  <span class="choice-tile-check" aria-hidden="true">${isSelected ? '✓' : ''}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="text-center mt-3">
            <button type="button" class="session-skip-link" id="lessonReflectSkipBtn">
              Lewati untuk sekarang
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      const handleSelect = (msg) => {
        playSuccessSound();
        triggerHapticSuccess();
        AnswerSheet.show({
          type: 'success',
          message: msg || step.message || 'Terima kasih sudah merefleksikan diri.',
          explanation: 'Mengenali kebiasaan diri adalah langkah awal kedewasaan berelasi.',
          buttonText: 'Lanjut',
          onContinue: () => sessionRunner.next()
        });
      };

      container.querySelectorAll('.lesson-choice-tile').forEach(tile => {
        tile.onclick = () => {
          const optId = tile.dataset.optionId;
          sessionRunner.setAnswer(optId);
          handleSelect(step.message);
        };
      });

      const skipBtn = container.querySelector('#lessonReflectSkipBtn');
      if (skipBtn) {
        skipBtn.onclick = () => {
          playTapSound();
          triggerHapticTap();
          sessionRunner.next();
        };
      }
    }
  };
}

/* ==========================================================================
   6. DOIT STEP BUILDER
   Real micro-action (breathe, sentence, amount), "Nanti saja" always available.
   ========================================================================== */
export function buildDoitStep(step) {
  return {
    id: step.id,
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: step.title,
    renderCustom: (answers) => {
      const isBreathe = step.actionType === 'breathe';
      const existingVal = answers[step.id] || '';

      return `
        <div class="lesson-step-wrap lesson-doit-wrap">
          <div class="lesson-step-header mb-2">
            <span class="card-tag coral mb-1">Praktik Mikro</span>
            <h2 class="lesson-step-title mt-1 mb-1">${esc(step.title)}</h2>
            <p class="mute text-xs mb-3">${esc(step.subtitle)}</p>
          </div>

          ${isBreathe ? `
            <div class="doit-breathe-container my-3">
              <div class="doit-breathe-circle" id="doitBreatherCircle" aria-hidden="true">
                <span class="doit-circle-core">🫁</span>
              </div>
              <p class="doit-breath-text mt-3 mb-0" id="doitBreathText">Ketuk tombol di bawah untuk mulai</p>
            </div>
          ` : `
            <div class="doit-input-container my-3">
              <label for="doitSentenceInput" class="text-xs mute mb-1">${esc(step.instruction || 'Ketik catatanmu:')}</label>
              <textarea id="doitSentenceInput"
                        class="doit-textarea"
                        rows="3"
                        placeholder="${esc(step.placeholder || 'Tuliskan satu kalimat...')}"
                        aria-label="${esc(step.title)}">${esc(existingVal)}</textarea>
            </div>
          `}

          <div class="lesson-action-bar mt-4">
            <button type="button" class="btn-chunky primary btn-thumb" id="lessonDoitActionBtn">
              <span>${isBreathe ? 'Selesai Bernapas →' : 'Simpan & Selesai →'}</span>
            </button>
            <button type="button" class="btn-chunky btn-ghost btn-thumb mt-2" id="lessonDoitLaterBtn">
              <span>Nanti saja</span>
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      const isBreathe = step.actionType === 'breathe';
      const circleEl = container.querySelector('#doitBreatherCircle');
      const textEl = container.querySelector('#doitBreathText');
      const sentenceInput = container.querySelector('#doitSentenceInput');

      let breathTimer = null;
      if (isBreathe && circleEl && textEl) {
        // Simple 4-4-6 visual cue loop
        let phase = 0;
        const phases = [
          { text: 'Tarik napas lembut... (4s)', cls: 'breathe-in', dur: 4000 },
          { text: 'Tahan napas sejenak... (4s)', cls: 'breathe-hold', dur: 4000 },
          { text: 'Hembuskan perlahan... (6s)', cls: 'breathe-out', dur: 6000 }
        ];

        const tickPhase = () => {
          const current = phases[phase % phases.length];
          textEl.textContent = current.text;
          circleEl.className = `doit-breathe-circle ${current.cls}`;
          phase++;
          breathTimer = setTimeout(tickPhase, current.dur);
        };
        tickPhase();
      }

      const advance = () => {
        if (breathTimer) clearTimeout(breathTimer);
        playTapSound();
        triggerHapticTap();
        if (sentenceInput && sentenceInput.value) {
          sessionRunner.setAnswer(sentenceInput.value);
        }
        sessionRunner.next();
      };

      const actionBtn = container.querySelector('#lessonDoitActionBtn');
      if (actionBtn) actionBtn.onclick = advance;

      const laterBtn = container.querySelector('#lessonDoitLaterBtn');
      if (laterBtn) laterBtn.onclick = advance;
    }
  };
}

/* ==========================================================================
   7. SUMMARY STEP BUILDER (End Screen)
   Mascot cheering, "Hari ini kamu berlatih: [2 skills]", animated weekly counter.
   NOT a percentage score (strictly zero %).
   ========================================================================== */
export function buildSummaryStep(lesson, onDone, store) {
  return {
    id: 'lesson-step-summary',
    type: 'custom',
    noCard: true,
    hideFooter: true,
    title: 'Latihan Selesai',
    renderCustom: () => {
      const currentPractices = store ? getTotalPractices(store.d) : 0;
      const mascotStage = getMascotStage(currentPractices);
      const currentWeeklyCount = store ? getWeeklyPracticeCount(store.d) : 0;

      return `
        <div class="lesson-step-wrap lesson-summary-wrap text-center">
          <div class="lesson-summary-mascot mb-3" aria-hidden="true">
            ${renderMascot('cheer', 96, { stage: mascotStage.id, label: 'Tunas Gembira', inlineStyle: false })}
          </div>

          <h2 class="lesson-summary-title mb-1">Latihan Selesai!</h2>
          <p class="mute text-xs mb-3">Langkah kecil yang konsisten membangun rumah tangga yang kokoh.</p>

          <!-- Skills Practiced -->
          <div class="lesson-skills-box card p-3 mb-3 text-left">
            <span class="text-xs mute font-bold uppercase mb-2 d-block">Hari ini kamu berlatih:</span>
            <div class="lesson-skills-chips">
              ${(lesson.skills || []).map(skill => `
                <span class="card-tag tunas mb-1">${esc(skill)}</span>
              `).join(' ')}
            </div>
          </div>

          <!-- Animated Weekly Practice Counter (NO percentage score) -->
          <div class="lesson-weekly-badge card p-3 mb-4" id="lessonWeeklyBadge">
            <span class="badge-label text-xs mute font-bold d-block mb-1">Latihan Minggu Ini:</span>
            <div class="badge-counter-row">
              <span class="badge-count-num" id="lessonWeeklyCountNum">${currentWeeklyCount}</span>
              <span class="badge-count-unit">kali</span>
              <span class="badge-increment-pill" id="lessonWeeklyPill">+1 bermakna</span>
            </div>
          </div>

          <div class="lesson-action-bar">
            <button type="button" class="btn-chunky primary btn-thumb" id="lessonSummaryFinishBtn">
              <span>Kembali ke Beranda →</span>
            </button>
          </div>
        </div>
      `;
    },
    bindCustom: (container) => {
      // Trigger Confetti Celebration (max once per session)
      triggerCelebration({ sessionId: lesson.id });
      playSuccessSound();
      triggerHapticSuccess();

      // Animate weekly counter tick up by 1 without percentage score
      const badgeEl = container.querySelector('#lessonWeeklyBadge');
      const countNumEl = container.querySelector('#lessonWeeklyCountNum');
      const baseCount = store ? getWeeklyPracticeCount(store.d) : 0;

      setTimeout(() => {
        if (countNumEl) {
          countNumEl.textContent = String(baseCount + 1);
        }
        if (badgeEl) {
          badgeEl.classList.add('animate-tick');
        }
      }, 400);

      const finishBtn = container.querySelector('#lessonSummaryFinishBtn');
      if (finishBtn) {
        finishBtn.onclick = () => {
          playTapSound();
          triggerHapticTap();
          sessionRunner.next(); // Advances past last step -> triggers flow.onComplete
        };
      }
    }
  };
}

/* ==========================================================================
   8. EXIT CONFIRMATION MODAL ("Simpan dan keluar?")
   No confirmation text that guilts; just "Simpan dan keluar?" with Save/Discard.
   ========================================================================== */
export function showLessonExitModal(runner) {
  const existing = document.querySelector('.lesson-exit-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lesson-exit-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Simpan dan keluar?');

  overlay.innerHTML = `
    <div class="lesson-exit-backdrop"></div>
    <div class="lesson-exit-sheet">
      <div class="answersheet-pill-handle" aria-hidden="true"></div>
      <div class="lesson-exit-icon" aria-hidden="true">🌱</div>
      <h2 class="lesson-exit-title">Simpan dan keluar?</h2>
      <p class="lesson-exit-desc mute text-xs">
        Kemajuanmu akan tersimpan sehingga kamu bisa melanjutkan kapan saja.
      </p>

      <div class="lesson-exit-actions">
        <button type="button" class="btn-chunky primary btn-thumb" id="lessonExitSaveBtn">
          <span>Simpan & Lanjutkan Nanti</span>
        </button>
        <button type="button" class="btn-chunky btn-ghost btn-thumb mt-2" id="lessonExitDiscardBtn">
          <span>Keluar Saja</span>
        </button>
        <button type="button" class="session-skip-link mt-2" id="lessonExitResumeBtn">
          Tetap di Sini
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    const saveBtn = overlay.querySelector('#lessonExitSaveBtn');
    if (saveBtn) saveBtn.focus();
  });

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 200);
  };

  overlay.querySelector('.lesson-exit-backdrop').onclick = close;
  overlay.querySelector('#lessonExitResumeBtn').onclick = close;

  overlay.querySelector('#lessonExitSaveBtn').onclick = () => {
    playTapSound();
    triggerHapticTap();
    close();
    announce('Kemajuan latihanmu telah tersimpan.');
    if (runner && typeof runner.pauseAndExit === 'function') {
      runner.pauseAndExit();
    } else if (runner && typeof runner.exit === 'function') {
      runner.exit();
    }
  };

  overlay.querySelector('#lessonExitDiscardBtn').onclick = () => {
    playTapSound();
    triggerHapticTap();
    close();
    if (runner && typeof runner.forceExit === 'function') {
      runner.forceExit();
    } else if (runner && typeof runner.exit === 'function') {
      runner.exit();
    }
  };
}

/**
 * Convenience method to start a lesson by ID or object
 */
export function startLesson(lessonOrId, onDone = null, store = null) {
  const lesson = typeof lessonOrId === 'string' ? getLessonById(lessonOrId) : lessonOrId;
  if (!lesson) {
    console.error('Lesson not found for startLesson:', lessonOrId);
    return;
  }
  const flow = createLessonFlow(lesson, onDone, store);
  sessionRunner.start(flow, {}, onDone);
}
