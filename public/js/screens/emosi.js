/**
 * Screen: Emosi (Me)
 * Calm hub + tiles:
 * - One large "Cek perasaan" button
 * - Two round exercise buttons (Napas, Grounding) with duration chips and NO descriptions
 * - Minimum 48px touch targets, zero clutter
 */
import { sessionRunner } from '../session.js';
import { createCheckinFlow } from '../flows/checkinFlow.js';
import { createBreathingFlow } from '../flows/breathingFlow.js';
import { createGroundingFlow } from '../flows/groundingFlow.js';
import { COPY } from '../copy.js';
import { renderIcon } from '../ui/icons.js';
import { playTapSound, triggerHapticTap } from '../ui/feedback.js';
import { esc } from '../ui/utils.js';

export function cleanupEmosi() {
  // Screen has no background timers
}

export function setEmotionSubView() {
  // Replaced with flow-driven session runner
}

export function renderEmotions(store) {
  const d = store.d;
  const recentCheckin = d.checkins && d.checkins.length ? d.checkins[d.checkins.length - 1] : null;

  return `
    <!-- Screen Header -->
    <div class="card-title-row mb-2">
      <h1 class="text-xl display font-bold mb-0">${COPY.emosi.title}</h1>
      <span class="card-tag saffron">${COPY.emosi.tag}</span>
    </div>

    <!-- One Large "Cek perasaan" Button -->
    <button type="button" class="emosi-checkin-btn mb-3" id="startCheckinBtn" aria-label="Cek perasaan (30 detik)">
      <div class="flex items-center gap-2">
        <span class="btn-icon" aria-hidden="true">${renderIcon('sprout')}</span>
        <span>Cek perasaan</span>
      </div>
      <span class="card-tag-subtle">30 detik →</span>
    </button>

    <!-- Recent Emotion Snapshot (only if entered) -->
    ${recentCheckin ? `
      <div class="card p-3 mb-3 flex items-center justify-between">
        <div>
          <span class="mute text-xs">Terakhir dicatat:</span>
          <div class="font-bold text-sm text-ink-primary">${esc(recentCheckin.emotion)}</div>
        </div>
        <span class="card-tag tunas">${recentCheckin.need ? esc(recentCheckin.need) : 'Selesai'}</span>
      </div>
    ` : ''}

    <!-- Two Round Exercise Buttons (Napas & Grounding) with Duration Chips and NO Descriptions -->
    <div class="card-title-row mb-1">
      <h2 class="text-sm font-bold text-ink-primary mb-0">Latihan Mandiri</h2>
    </div>

    <div class="emosi-round-grid mb-3">
      <!-- Round Exercise 1: Napas -->
      <button type="button" class="emosi-round-btn" id="startBreathingBtn" aria-label="Latihan Napas (1 Menit)">
        <div class="emosi-round-icon breath" aria-hidden="true">${renderIcon('breath')}</div>
        <div class="emosi-round-title">Napas</div>
        <span class="card-tag tunas">1 Menit</span>
      </button>

      <!-- Round Exercise 2: Grounding -->
      <button type="button" class="emosi-round-btn" id="startGroundingBtn" aria-label="Latihan Grounding (2 Menit)">
        <div class="emosi-round-icon grounding" aria-hidden="true">${renderIcon('grounding')}</div>
        <div class="emosi-round-title">Grounding</div>
        <span class="card-tag saffron">2 Menit</span>
      </button>
    </div>
  `;
}

export function bindEmotions(container, store, navigate, rerender) {
  // Large Hero Checkin Button
  const startCheckinBtn = container.querySelector('#startCheckinBtn');
  if (startCheckinBtn) {
    startCheckinBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const flow = createCheckinFlow(store.d.faithPerspective, (exerciseAction) => {
        if (exerciseAction === 'launch-breathing') {
          sessionRunner.start(createBreathingFlow(() => rerender()));
        } else if (exerciseAction === 'launch-grounding') {
          sessionRunner.start(createGroundingFlow(() => rerender()));
        }
      });
      sessionRunner.start(flow, {}, () => rerender());
    };
  }

  // Round Exercise 1: Napas
  const startBreathingBtn = container.querySelector('#startBreathingBtn');
  if (startBreathingBtn) {
    startBreathingBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createBreathingFlow(() => rerender()));
    };
  }

  // Round Exercise 2: Grounding
  const startGroundingBtn = container.querySelector('#startGroundingBtn');
  if (startGroundingBtn) {
    startGroundingBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createGroundingFlow(() => rerender()));
    };
  }
}
