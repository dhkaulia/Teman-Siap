/**
 * Screen: Emosi (Me)
 * Calm hero "Lagi terasa apa hari ini?" + single button "Cek perasaan (30 detik)"
 * Short list of exercises as large rows. Zero forms on this screen.
 */
import { sessionRunner } from '../session.js';
import { createCheckinFlow } from '../flows/checkinFlow.js';
import { createBreathingFlow } from '../flows/breathingFlow.js';
import { createGroundingFlow } from '../flows/groundingFlow.js';

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
    <!-- Calm Hero -->
    <div class="card emosi-hero">
      <div class="emosi-hero-badge">🌱 Ruang Diri</div>
      <h1 class="emosi-hero-title">Lagi terasa apa hari ini?</h1>
      <p class="mute emosi-hero-desc">Kenali sinyal tubuh dan beri ruang untuk perasaanmu tanpa menghakimi.</p>
      <button type="button" class="primary w-full emosi-start-btn" id="startCheckinBtn">
        Cek perasaan (30 detik) →
      </button>
    </div>

    <!-- Recent Emotion Snapshot (only if entered) -->
    ${recentCheckin ? `
      <div class="card mt-3">
        <div class="card-title-row">
          <h2 class="text-sm font-bold text-ink-primary mb-0">Kondisi Terakhirmu</h2>
          <span class="mute text-xs">${new Date(recentCheckin.at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="recent-emotion-box">
          <span class="recent-emotion-icon" aria-hidden="true">🌱</span>
          <div>
            <div class="font-bold text-sm">${recentCheckin.emotion}</div>
            ${recentCheckin.need ? `<div class="mute text-xs">Kebutuhan: ${recentCheckin.need}</div>` : ''}
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Exercise Rows (Large rows, min 48px targets) -->
    <div class="card mt-3">
      <h2 class="text-sm font-bold text-ink-primary mb-3">Latihan Mandiri</h2>

      <div class="exercise-rows">
        <!-- Row 1: Napas Tenang 4-4-6 -->
        <button type="button" class="exercise-row" id="startBreathingBtn" aria-label="Buka Latihan Napas Tenang 4-4-6">
          <span class="exercise-icon" aria-hidden="true">🌬️</span>
          <div class="exercise-row-content">
            <div class="exercise-row-title">Latihan Napas Tenang (4-4-6)</div>
            <div class="exercise-row-desc">5 siklus napas rileks untuk menenangkan detak jantung</div>
          </div>
          <span class="exercise-row-arrow" aria-hidden="true">→</span>
        </button>

        <!-- Row 2: Grounding 5-4-3-2-1 -->
        <button type="button" class="exercise-row" id="startGroundingBtn" aria-label="Buka Teknik Grounding 5-4-3-2-1">
          <span class="exercise-icon" aria-hidden="true">👁️</span>
          <div class="exercise-row-content">
            <div class="exercise-row-title">Teknik Grounding (5-4-3-2-1)</div>
            <div class="exercise-row-desc">5 langkah indra untuk kembali ke momen saat ini</div>
          </div>
          <span class="exercise-row-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <!-- Accordion: Latihan Lain -->
      <details class="other-exercises-accordion mt-3">
        <summary class="other-exercises-summary">Latihan Lain (Teknik Khusus)</summary>
        <div class="other-exercises-panel">
          <div class="font-bold text-sm mb-1 text-ink-primary">Basuh Wajah dengan Air Dingin (TIPP)</div>
          <p class="mute text-xs mb-2">
            Membasuh wajah dengan air dingin atau kompres dingin di sekitar mata selama 15–30 detik memicu refleks penyelam alami tubuh untuk meredakan emosi intens seketika.
          </p>
          <div class="warning-alert-box">
            ⚠️ Hentikan jika terasa tidak nyaman atau kamu punya kondisi jantung.
          </div>
        </div>
      </details>
    </div>
  `;
}

export function bindEmotions(container, store, navigate, rerender) {
  const startCheckinBtn = container.querySelector('#startCheckinBtn');
  if (startCheckinBtn) {
    startCheckinBtn.onclick = () => {
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

  const startBreathingBtn = container.querySelector('#startBreathingBtn');
  if (startBreathingBtn) {
    startBreathingBtn.onclick = () => {
      sessionRunner.start(createBreathingFlow(() => rerender()));
    };
  }

  const startGroundingBtn = container.querySelector('#startGroundingBtn');
  if (startGroundingBtn) {
    startGroundingBtn.onclick = () => {
      sessionRunner.start(createGroundingFlow(() => rerender()));
    };
  }
}
