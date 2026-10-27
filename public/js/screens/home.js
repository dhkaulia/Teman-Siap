/**
 * Screen: Home (Beranda) — Scrolling Vertical Path Map
 * 
 * Rules:
 * - 4 Units: "Mengenal Diri", "Tenang Soal Uang", "Bicara Berdua", "Merencanakan Masa Depan".
 * - Colored banner per unit with spot illustration and one-line goal.
 * - Gently curving S-path of round 64px nodes.
 * - Node states: selesai (check), tersedia (pulsing with MULAI bubble), terbuka-bebas (open), bonus (star).
 * - Never lock nodes; visually suggest order with sparkle and MULAI bubble.
 * - Mascot sits near current node, waves on first open each day.
 * - Tapping a node opens a bottom sheet: title, promise, duration, Mulai, and technical background.
 * - Sticky top bar: weekly practice count and Tunas growth stage (no hearts/gems/ranking).
 * - 1-tap start for first-time user via hero action button.
 */

import { esc, today } from '../ui/utils.js';
import { renderMascot, getMascotStage, getTotalPractices, renderSpotIllustration } from '../ui/mascot.js';
import {
  PATH_UNITS,
  getAllPathNodes,
  getNodeById,
  isNodeCompleted,
  getSuggestedNode,
  getNodeState,
  markNodeCompleted,
  createFlowForNode
} from '../flows/path.js';
import { sessionRunner } from '../session.js';
import { AnswerSheet } from '../ui/answerSheet.js';
import { triggerCelebration } from '../ui/confetti.js';
import { playTapSound, triggerHapticTap } from '../ui/feedback.js';
import { getSeeds, calculateRitme } from '../rewards.js';
import { COPY } from '../copy.js';
import { renderIcon } from '../ui/icons.js';
import { BottomSheet } from '../ui/bottomSheet.js';

export { PATH_UNITS, getAllPathNodes, getNodeById, isNodeCompleted, getSuggestedNode, getNodeState };

/**
 * Weekly practice counter
 * Computes practices in the last 7 days.
 */
export function getWeeklyPracticeCount(d) {
  if (!d) return 0;
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  let count = 0;
  if (Array.isArray(d.checkins)) {
    count += d.checkins.filter(c => (c.at || 0) >= oneWeekAgo).length;
  }
  if (Array.isArray(d.expenses)) {
    count += d.expenses.filter(e => (e.at || 0) >= oneWeekAgo).length;
  }
  if (Array.isArray(d.pauses)) {
    count += d.pauses.filter(p => (p.at || 0) >= oneWeekAgo).length;
  }
  if (d.coupleConversations && typeof d.coupleConversations === 'object') {
    count += Object.values(d.coupleConversations).filter(c => (c.completedAt || 0) >= oneWeekAgo).length;
  }

  return count;
}

/**
 * Suggested action for backward compatibility and quick action
 */
export function getSuggestedAction(d) {
  const suggested = getSuggestedNode(d);
  return {
    title: suggested ? suggested.title : 'Sapa perasaanmu 1 menit',
    desc: suggested ? suggested.promise : 'Mengenali apa yang kamu rasakan hari ini adalah langkah awal ketenangan.',
    tab: 'home',
    subView: null,
    btnText: suggested ? `Mulai ${suggested.duration}` : 'Mulai Sekarang',
    nodeId: suggested ? suggested.id : 'node-self-checkin'
  };
}

/**
 * Main Home Renderer
 */
export function renderHome(store) {
  const d = store.d || {};
  const weeklyCount = getWeeklyPracticeCount(d);
  const totalPractices = getTotalPractices(d);
  const mascotStage = getMascotStage(totalPractices);
  const suggestedNode = getSuggestedNode(d);
  const suggestedId = suggestedNode ? suggestedNode.id : '';
  const enableRitme = d.enableRitme !== false;
  const enableRewards = d.enableRewards !== false;
  const seeds = getSeeds(d);

  // Determine if mascot waves today
  let isWaveDay = false;
  try {
    const t = today();
    const lastDay = typeof localStorage !== 'undefined' ? localStorage.getItem('temansiap_wave_day') : null;
    if (lastDay !== t) {
      isWaveDay = true;
    }
  } catch (e) {}

  const mascotState = isWaveDay ? 'wave' : (weeklyCount > 0 ? 'cheer' : 'idle');

  // S-path curve rhythm positions: center -> right -> center -> left -> center
  const S_OFFSETS = ['offset-center', 'offset-right', 'offset-center', 'offset-left', 'offset-center', 'offset-right'];

  return `
    <!-- Sticky Top Bar: Weekly Practice Count, Seeds & Tunas Growth Stage -->
    <header class="path-sticky-header" id="pathStickyHeader">
      <div class="path-sticky-content">
        ${enableRitme ? `
          <div class="path-weekly-pill" role="status" aria-label="Latihan minggu ini: ${weeklyCount} kali">
            <span class="path-pill-icon" aria-hidden="true">${renderIcon('sprout')}</span>
            <span class="path-pill-text">${COPY.home.weeklyBadge} <b>${weeklyCount} kali</b></span>
          </div>
        ` : ''}
        ${enableRewards ? `
          <div class="path-seeds-pill" aria-label="Benih terkumpul: ${seeds} benih">
            <span class="path-pill-icon" aria-hidden="true">${renderIcon('sprout')}</span>
            <span class="path-pill-text"><b>${seeds}</b> ${COPY.home.seedsBadge}</span>
          </div>
        ` : ''}
        <div class="path-mascot-pill" aria-label="Pertumbuhan Tunas: ${esc(mascotStage.name)}">
          <span class="path-mascot-avatar" aria-hidden="true">
            ${renderMascot('idle', 26, { stage: mascotStage.id, inlineStyle: false })}
          </span>
          <span class="path-pill-text">${COPY.home.tunasBadge} <b>${esc(mascotStage.name)}</b></span>
        </div>
      </div>
    </header>

    <div class="path-map-container">
      <!-- 1-Tap Quick Action Hero: Langkah Hari Ini -->
      <div class="hero-action mb-3 mt-2">
        <div class="hero-label">
          ${COPY.home.heroTag}
        </div>
        <h2>${esc(suggestedNode ? suggestedNode.title : COPY.home.defaultTitle)}</h2>
        <p>${esc(suggestedNode ? suggestedNode.promise : COPY.home.defaultPromise)}</p>
        <button type="button" class="btn-chunky primary btn-thumb" id="heroActionBtn" data-node-id="${esc(suggestedId)}">
          <span>${COPY.home.heroBtn} (${esc(suggestedNode ? suggestedNode.duration : '1 menit')}) →</span>
        </button>
      </div>

      <!-- Weekly Encouragement Banner (No streaks, zero negative framing) -->
      ${enableRitme ? `
        <div class="weekly-practice-banner mb-3" role="status">
          <span class="weekly-icon" aria-hidden="true">${renderIcon('sprout')}</span>
          <span class="weekly-text">
            ${weeklyCount > 0
              ? COPY.home.weeklyEncouragementCount(weeklyCount)
              : COPY.home.weeklyEncouragementZero}
          </span>
        </div>
      ` : ''}

      <!-- Curriculum Units & Serpentine S-Path Nodes -->
      <div class="curriculum-path-list">
        ${PATH_UNITS.map((unit, unitIdx) => {
          return `
            <section class="unit-section mb-4" id="${unit.id}" aria-labelledby="heading-${unit.id}">
              <!-- Unit Colored Banner with Spot Illustration & Goal -->
              <div class="unit-banner banner-${unit.accent}">
                <div class="unit-spot-wrap" aria-hidden="true">
                  ${renderSpotIllustration(unit.spot, 48)}
                </div>
                <div class="unit-info">
                  <div class="flex items-center justify-between mb-1">
                    <span class="card-tag ${unit.accent}">Unit ${unitIdx + 1}</span>
                    <button type="button" class="unit-learn-btn" data-unit-id="${esc(unit.id)}" aria-label="Pelajari Unit ${unitIdx + 1}">
                      Pelajari
                    </button>
                  </div>
                  <h2 id="heading-${unit.id}" class="unit-title">${esc(unit.title)}</h2>
                  <div class="unit-subtitle mute text-xs">${esc(unit.subtitle)}</div>
                </div>
              </div>

              <!-- S-Path Nodes in Unit -->
              <div class="path-unit-nodes">
                <!-- S-curve background line -->
                <svg class="path-s-curve-svg" viewBox="0 0 360 400" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 180,30 C 180,70 230,70 230,110 C 230,150 180,150 180,190 C 180,230 130,230 130,270 C 130,310 180,310 180,350"
                    fill="none"
                    stroke="var(--border-card)"
                    stroke-width="5"
                    stroke-dasharray="8 6"
                    stroke-linecap="round" />
                </svg>

                ${unit.nodes.map((node, nodeIdx) => {
                  const state = getNodeState(node, d, suggestedId);
                  const isSuggested = node.id === suggestedId;
                  const offsetClass = S_OFFSETS[nodeIdx % S_OFFSETS.length];
                  const isDone = state === 'selesai';

                  // Mascot perches near the suggested next node
                  const showMascotHere = isSuggested;
                  const mascotPosClass = offsetClass === 'offset-left' ? 'pos-right' : 'pos-left';

                  return `
                    <div class="path-node-row ${offsetClass} ${isSuggested ? 'is-suggested-row' : ''}">
                      ${showMascotHere ? `
                        <div class="path-mascot-companion ${mascotPosClass}" aria-hidden="true">
                          ${renderMascot(mascotState, 58, { stage: mascotStage.id, label: 'Tunas', inlineStyle: false })}
                        </div>
                      ` : ''}

                      <button type="button"
                              class="path-node journey-node ${state} ${isDone ? 'completed' : ''} ${isSuggested ? 'is-suggested' : ''}"
                              data-node-id="${esc(node.id)}"
                              aria-label="${esc(node.title)} (${esc(node.duration)}): status ${state}">
                        ${isSuggested ? `<div class="node-mulai-bubble">MULAI</div>` : ''}
                        <div class="path-node-inner" aria-hidden="true">
                          ${isDone ? '✓' : (node.icon || '🌱')}
                        </div>
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Node Detail Bottom Sheet Container -->
    <div id="nodeModalRoot"></div>
  `;
}

/**
 * Binds Event Handlers for Home Screen
 */
export function bindHome(container, store, navigate) {
  // Mark wave day as seen
  try {
    localStorage.setItem('temansiap_wave_day', today());
  } catch (e) {}

  // 1-Tap Quick Action Button in Hero
  const heroBtn = container.querySelector('#heroActionBtn');
  if (heroBtn) {
    heroBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const nodeId = heroBtn.dataset.nodeId;
      const node = getNodeById(nodeId) || getAllPathNodes()[0];
      if (node) openNodeBottomSheet(node, store, navigate, container);
    };
  }

  // Tapping any node opens its bottom sheet
  container.querySelectorAll('.path-node').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const nodeId = btn.dataset.nodeId;
      const node = getNodeById(nodeId);
      if (node) {
        openNodeBottomSheet(node, store, navigate, container);
      }
    };
  });

  // Pelajari Unit Bottom Sheet
  container.querySelectorAll('.unit-learn-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const unitId = btn.dataset.unitId;
      const unit = PATH_UNITS.find(u => u.id === unitId);
      if (!unit) return;
      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-1">
          <div class="unit-spot-wrap mb-2" aria-hidden="true">
            ${renderSpotIllustration(unit.spot, 56)}
          </div>
          <span class="card-tag ${unit.accent} mb-1">Unit ${PATH_UNITS.indexOf(unit) + 1}</span>
          <h3 class="mt-1 mb-2">${esc(unit.title)}</h3>
          <p class="text-sm font-medium mb-3">${esc(unit.goal)}</p>
          <div class="neutral-guidance-box text-xs mb-3">
            <b>Fokus Pembelajaran:</b> ${esc(unit.subtitle)}
          </div>
          <button type="button" class="primary w-full btn-action-sm mt-2" id="closeUnitSheetBtn">
            Mengerti
          </button>
        </div>
      `;
      content.querySelector('#closeUnitSheetBtn').onclick = () => sheet.close();
      sheet.open({ title: `Pelajari: ${unit.title}`, content });
    };
  });

  // Auto-scroll the suggested next node into view on load
  const suggestedNodeEl = container.querySelector('.path-node.is-suggested, .path-node.tersedia');
  if (suggestedNodeEl) {
    setTimeout(() => {
      suggestedNodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  }
}

/**
 * Opens Node Bottom Sheet
 */
function openNodeBottomSheet(node, store, navigate, container) {
  const modalRoot = container.querySelector('#nodeModalRoot') || document.body;
  modalRoot.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'node-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', node.title);

  overlay.innerHTML = `
    <div class="node-modal-backdrop"></div>
    <div class="node-modal-sheet">
      <div class="answersheet-pill-handle" aria-hidden="true"></div>

      <div class="node-modal-header">
        <span class="node-modal-icon" aria-hidden="true">${node.icon || '🌱'}</span>
        <div>
          <span class="card-tag tunas mb-1">${node.type.toUpperCase()} • ${esc(node.duration)}</span>
          <h2 class="node-modal-title mt-1 mb-0">${esc(node.title)}</h2>
        </div>
      </div>

      <p class="node-modal-promise mt-2 mb-2">
        ${esc(node.promise)}
      </p>

      <!-- Expandable Technical & Scientific Background -->
      <details class="clinical-note mt-2 mb-3">
        <summary>Pelajari lebih lanjut (Latar Belakang)</summary>
        <p class="text-xs mute mt-1">${esc(node.technicalBg)}</p>
      </details>

      <div class="node-modal-actions">
        <button type="button" class="btn-chunky primary btn-thumb" id="nodeModalStartBtn">
          <span>Mulai Sekarang (${esc(node.duration)}) →</span>
        </button>
        <button type="button" class="btn-chunky btn-ghost btn-thumb mt-1" id="nodeModalCloseBtn">
          <span>Nanti Saja</span>
        </button>
      </div>
    </div>
  `;

  modalRoot.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    const startBtn = overlay.querySelector('#nodeModalStartBtn');
    if (startBtn) startBtn.focus();
  });

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 220);
  };

  overlay.querySelector('.node-modal-backdrop').onclick = close;
  overlay.querySelector('#nodeModalCloseBtn').onclick = close;

  overlay.querySelector('#nodeModalStartBtn').onclick = () => {
    playTapSound();
    triggerHapticTap();
    close();

    const onDone = () => {
      markNodeCompleted(node.id, store);
      triggerCelebration({ sessionId: node.id });
      AnswerSheet.show({
        message: `Mantap, langkah "${node.title}" telah kamu selesaikan!`,
        onContinue: () => {
          navigate('home');
        }
      });
    };

    const flow = createFlowForNode(node, onDone, store);
    sessionRunner.start(flow, {}, onDone);
  };
}
