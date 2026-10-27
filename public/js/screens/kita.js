/**
 * Screen: Kita & Komunikasi (Us) — Visual Hub & Relational Practice
 * 
 * Rules:
 * - "Taman Kita": Shared garden visual scene (~200px) with two botanical stoneware plants
 *   that grow independently when each partner completes practice.
 * - Single-phone friendly: large partner chips under each pot switch turn directly.
 * - Renaming partner names via pencil icon button opening a bottom sheet.
 * - Three big tiles: "Kuis Saling Kenal" (Love Maps), "Percakapan" (4 stacked swipeable cards),
 *   and "Bicara Lembut" (Gottman Antidotes interactive 4-round game).
 * - No paragraphs before scrolling (strictly <= 40 words budget).
 * - Persistent "Ini terasa tidak nyaman" safety exit on every step.
 * - Zero comparison, no leaderboards, no compatibility percentage.
 */

import { CONTENT } from '../../content.js';
import { SUPPORT_DATA } from '../../support.js';
import { sessionRunner } from '../session.js';
import { createCoupleFlow, visibleTo } from '../flows/coupleFlow.js';
import { createLoveMapsFlow } from '../flows/loveMapsFlow.js';
import { createBicaraLembutFlow } from '../flows/bicaraLembutFlow.js';
import { createBreathingFlow } from '../flows/breathingFlow.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { esc } from '../ui/utils.js';
import { getPlantStage } from '../store.js';
import { renderPlant } from '../ui/plant.js';
import { COPY } from '../copy.js';
import { renderIcon } from '../ui/icons.js';
import { playTapSound, triggerHapticTap } from '../ui/feedback.js';

let isSafetyExitActive = false;
let activeDeckIndex = 0;
let isCardFlipped = false;

export function setSafetyExit(active) {
  isSafetyExitActive = Boolean(active);
}

export function cleanupKita() {
  activeDeckIndex = 0;
  isCardFlipped = false;
}

/**
 * Shared Garden Scene (Taman Kita)
 * Botanical Stoneware garden (~200px tall) with independent plants and turn chips.
 */
function renderTamanKitaScene(couple, currentPerspective) {
  const partnerA = couple?.partnerA || { name: 'Partner A', practicesCount: 0 };
  const partnerB = couple?.partnerB || { name: 'Partner B', practicesCount: 0 };

  const stageA = getPlantStage(partnerA.practicesCount);
  const stageB = getPlantStage(partnerB.practicesCount);

  const isAActive = currentPerspective === 'A';
  const isBActive = currentPerspective === 'B';

  return `
    <div class="taman-kita-card mb-3" role="region" aria-label="Taman Kita">
      <div class="card-title-row mb-1">
        <div class="flex items-center gap-2">
          <span class="card-tag tunas">Taman Kita</span>
        </div>
        <button type="button" class="icon-btn-round" id="editPartnerNamesBtn" aria-label="Ubah nama pasangan" title="Ubah Nama">
          ${renderIcon('pencil')}
        </button>
      </div>

      <div class="taman-scene-stage" role="img" aria-label="Taman Kita dengan tanaman ${esc(partnerA.name)} (${esc(stageA.name)}) dan ${esc(partnerB.name)} (${esc(stageB.name)})">
        <!-- Atmospheric Sun Halo -->
        <div class="taman-sky-halo" aria-hidden="true"></div>

        <!-- Center Botanical Wooden Bench & Stepping Stone -->
        <div class="taman-bench-wrap" aria-hidden="true">
          <div class="taman-bench-seat"></div>
          <div class="taman-bench-legs">
            <span></span>
            <span></span>
          </div>
          <div class="taman-stone-paver"></div>
        </div>

        <!-- Plants Row: Two small botanical plants in cream stoneware pots with turn chips -->
        <div class="taman-plants-row">
          <!-- Partner A Plant (Left) -->
          <div class="taman-plant-col plant-partner-a">
            ${renderPlant(stageA.stage, 85)}
            <button type="button" class="partner-turn-chip ${isAActive ? 'is-active' : ''}" data-switch-perspective="A" aria-label="Sedang mengisi sebagai: ${esc(partnerA.name)}">
              <span class="sr-only">Sedang mengisi sebagai: </span>
              <span class="partner-chip-name">${esc(partnerA.name)}</span>
              <span class="partner-chip-badge">${isAActive ? 'Giliranmu' : 'Ganti'}</span>
            </button>
          </div>

          <!-- Partner B Plant (Right) -->
          <div class="taman-plant-col plant-partner-b">
            ${renderPlant(stageB.stage, 85)}
            <button type="button" class="partner-turn-chip ${isBActive ? 'is-active' : ''}" data-switch-perspective="B" aria-label="Sedang mengisi sebagai: ${esc(partnerB.name)}">
              <span class="sr-only">Sedang mengisi sebagai: </span>
              <span class="partner-chip-name">${esc(partnerB.name)}</span>
              <span class="partner-chip-badge">${isBActive ? 'Giliranmu' : 'Ganti'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderRelationship(store) {
  const d = store.d || {};
  const couple = d.couple || {
    partnerA: { name: 'Partner A', practicesCount: 0 },
    partnerB: { name: 'Partner B', practicesCount: 0 },
    colekDismissed: false
  };
  const coupleConvos = d.coupleConversations || {};
  const currentPerspective = d.currentPerspective === 'B' ? 'B' : 'A';

  // -------------------------------------------------------------
  // Safety Exit Screen (Triggered by "Ini terasa tidak nyaman" or "Ruang Aman")
  // -------------------------------------------------------------
  if (isSafetyExitActive) {
    return `
      <div class="card safety-screen-card mb-4">
        <div class="card-title-row">
          <span class="card-tag saffron">Ruang Aman</span>
          <span class="text-xs mute">Latihan Opsional</span>
        </div>
        <h1 class="mt-2 mb-1">Tidak ada paksaan dalam percakapan ini.</h1>
        <p class="mute text-sm mb-4">
          Sangat wajar jika sebuah topik memicu rasa cemas, lelah, atau tidak nyaman.
          Hubungan yang sehat selalu memberi ruang untuk jeda. Kamu dan pasangan berhak berhenti kapan saja tanpa perlu merasa bersalah atau terbebani.
        </p>

        <div class="safety-actions-grid mb-4">
          <div class="card card-border-plum p-3">
            <div class="font-bold text-sm mb-1 text-plum">Butuh Menenangkan Tubuh?</div>
            <p class="mute text-xs mb-3">Ambil jeda 1 menit dengan latihan pernapasan santai 4-4-6 untuk menstabilkan detak jantung.</p>
            <button type="button" class="primary w-full btn-action-sm" id="safetyBreathingBtn">
              Mulai Latihan Napas Tenang →
            </button>
          </div>

          <div class="card p-3">
            <div class="font-bold text-sm mb-1 text-ink-primary">Butuh Dukungan Manusia?</div>
            <p class="mute text-xs mb-2">Jika kamu merasa tertekan atau butuh teman bicara yang netral, layanan profesional berikut dapat dihubungi:</p>
            <div class="support-hotline-list">
              ${(SUPPORT_DATA.hotlines || []).map(h => `
                <div class="support-hotline-item">
                  <div class="font-semibold text-xs text-ink-primary">${esc(h.name)}: <b>${esc(h.contact)}</b></div>
                  <div class="mute text-xs">${esc(h.desc)}</div>
                </div>
              `).join('')}
            </div>
            <p class="mute text-xs mt-3">${esc(SUPPORT_DATA.disclaimer)}</p>
          </div>
        </div>

        <button type="button" class="secondary w-full" id="safetyReturnBtn">
          ← Kembali ke Halaman Kita
        </button>
      </div>
    `;
  }

  // Active card in deck
  const convos = CONTENT.conversations || [];
  const currentConvo = convos[activeDeckIndex] || convos[0];
  const convoData = coupleConvos[currentConvo.id];
  const isCompleted = convoData && convoData.status === 'completed';
  const visible = isCompleted ? visibleTo(convoData, 'shared') : { A: null, B: null };
  const bothShared = Boolean(visible.A && visible.B);

  // -------------------------------------------------------------
  // Visual Hub Kita View (<= 40 words before scrolling, no paragraphs)
  // -------------------------------------------------------------
  return `
    <!-- Header: Single action / safety trigger -->
    <div class="card-title-row mb-2">
      <h1 class="text-xl display font-bold mb-0">${COPY.kita.title}</h1>
      <button type="button" class="safety-exit-link" id="triggerSafetyBtn" aria-label="Buka ruang aman">
        Ruang Aman
      </button>
    </div>

    <!-- Taman Kita (Shared Garden Scene, ~200px) -->
    ${renderTamanKitaScene(couple, currentPerspective)}

    <!-- Non-Pushy "Colek" Feature (Single Opt-in Suggestion, Never Repeated) -->
    ${!couple.colekDismissed ? `
      <div class="card colek-card mb-3" id="colekCard">
        <div class="card-title-row mb-1">
          <span class="card-tag saffron">${COPY.kita.colekTag}</span>
          <button type="button" class="btn-dismiss" id="dismissColekBtn" aria-label="Tutup saran">✕</button>
        </div>
        <div class="font-bold text-xs text-ink-primary mb-2">
          ${COPY.kita.colekPrompt(esc(couple.partnerB.name))}
        </div>
        <div class="flex gap-2">
          <button type="button" class="plum-btn w-full btn-action-sm" id="acceptColekBtn">
            Mulai
          </button>
          <button type="button" class="secondary w-full btn-action-sm" id="laterColekBtn">
            Nanti
          </button>
        </div>
      </div>
    ` : ''}

    <!-- Two Big Tiles: Kuis Saling Kenal & Bicara Lembut -->
    <div class="kita-tiles-grid">
      <!-- Tile 1: Kuis Saling Kenal -->
      <button type="button" class="kita-tile-btn" id="startLoveMapsBtn" aria-label="Mulai Kuis Saling Kenal (Peta Cinta)">
        <div class="kita-tile-header">
          <span class="kita-tile-icon plum" aria-hidden="true">${renderIcon('sparkle')}</span>
          <span class="card-tag">5 Menit</span>
        </div>
        <div>
          <div class="kita-tile-title">${COPY.kita.loveMapsTitle}</div>
          <div class="kita-tile-sub">Peta Cinta</div>
        </div>
      </button>

      <!-- Tile 2: Bicara Lembut -->
      <button type="button" class="kita-tile-btn" id="startBicaraLembutBtn" aria-label="Mulai Latihan Bicara Lembut">
        <div class="kita-tile-header">
          <span class="kita-tile-icon teal" aria-hidden="true">${renderIcon('chat')}</span>
          <span class="card-tag saffron">4 Ronde</span>
        </div>
        <div>
          <div class="kita-tile-title">Bicara Lembut</div>
          <div class="kita-tile-sub">Latihan</div>
        </div>
      </button>
    </div>

    <!-- Tile 3 / Section: Percakapan Stacked Cards Deck -->
    <div class="card-title-row mb-1">
      <h2 class="text-sm font-bold mb-0">Percakapan</h2>
      <span class="text-xs mute font-bold">${activeDeckIndex + 1} / ${convos.length}</span>
    </div>

    <div class="convo-deck-wrap mb-2" id="convoDeckMount">
      <div class="convo-deck-card ${isCardFlipped ? 'is-flipped' : ''}" id="activeConvoCard" tabindex="0" role="region" aria-label="Kartu percakapan: ${esc(currentConvo.title)}">
        <!-- Front of Card -->
        <div class="convo-card-front">
          <div class="card-title-row mb-1">
            <span class="card-tag plum">Topik ${activeDeckIndex + 1}</span>
            ${isCompleted ? (
              bothShared
                ? `<span class="consent-badge shared">✓ Terbuka Berdua</span>`
                : `<span class="consent-badge locked">🔒 Tersimpan Privat</span>`
            ) : `<span class="text-xs mute">5 Menit</span>`}
          </div>

          <h3 class="text-base font-bold mt-1 mb-1">${esc(currentConvo.title)}</h3>

          <div class="convo-prompt-box text-xs mb-3">
            "${esc(currentConvo.prompt)}"
          </div>

          <div class="flex items-center justify-between mt-auto pt-1">
            <button type="button" class="secondary btn-action-sm" id="flipToBackBtn" aria-label="Intip tips Gottman">
              Intip Tips Gottman
            </button>
            <button type="button" class="plum-btn btn-action-sm" data-start-turn-convo="${esc(currentConvo.id)}">
              ${isCompleted ? 'Ulangi' : 'Mulai →'}
            </button>
          </div>
        </div>

        <!-- Back of Card (Gottman Tip & Clinical Insight) -->
        <div class="convo-card-back">
          <div>
            <div class="card-title-row mb-1">
              <span class="card-tag saffron">Tips Gottman</span>
              <span class="text-xs mute">Balik Kartu</span>
            </div>
            <div class="font-bold text-xs text-ink-primary mb-1">Kunci Komunikasi:</div>
            <p class="text-xs text-ink-secondary mb-2">
              ${esc(currentConvo.gottmanTip || 'Dengarkan untuk memahami, bukan untuk mendebat.')}
            </p>
          </div>

          <div class="flex gap-2 mt-auto">
            <button type="button" class="secondary w-full btn-action-sm" id="flipToFrontBtn">
              Kembali
            </button>
            <button type="button" class="plum-btn w-full btn-action-sm" data-start-turn-convo="${esc(currentConvo.id)}">
              Mulai Percakapan →
            </button>
          </div>
        </div>
      </div>

      <!-- Card Deck Controls (Previous / Next) -->
      <div class="convo-deck-controls">
        <button type="button" class="deck-nav-btn" id="prevDeckBtn" ${activeDeckIndex === 0 ? 'disabled' : ''} aria-label="Kartu sebelumnya">
          ←
        </button>
        <span class="text-xs font-bold mute">${activeDeckIndex + 1} / ${convos.length}</span>
        <button type="button" class="deck-nav-btn" id="nextDeckBtn" ${activeDeckIndex === convos.length - 1 ? 'disabled' : ''} aria-label="Kartu berikutnya">
          →
        </button>
      </div>
    </div>

    ${isCompleted ? `
      <div class="mb-3">
        <button type="button" class="secondary w-full btn-action-sm" data-view-summary="${esc(currentConvo.id)}">
          Lihat Catatan Sesi Topik Ini
        </button>
      </div>
    ` : ''}
  `;
}

export function bindRelationship(container, store, navigate, rerender) {
  // Safety Screen Actions
  const safetyReturnBtn = container.querySelector('#safetyReturnBtn');
  if (safetyReturnBtn) {
    safetyReturnBtn.onclick = () => {
      setSafetyExit(false);
      rerender();
    };
  }

  const safetyBreathingBtn = container.querySelector('#safetyBreathingBtn');
  if (safetyBreathingBtn) {
    safetyBreathingBtn.onclick = () => {
      sessionRunner.start(createBreathingFlow(() => {
        setSafetyExit(false);
        rerender();
      }));
    };
  }

  const triggerSafetyBtn = container.querySelector('#triggerSafetyBtn');
  if (triggerSafetyBtn) {
    triggerSafetyBtn.onclick = () => {
      setSafetyExit(true);
      rerender();
    };
  }

  // Perspective Switch via Pot Chips
  container.querySelectorAll('[data-switch-perspective]').forEach(chip => {
    chip.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const target = chip.dataset.switchPerspective;
      store.setCurrentPerspective(target);
      rerender();
    };
  });

  // Edit Partner Names via Pencil Icon Button
  const editNamesBtn = container.querySelector('#editPartnerNamesBtn');
  if (editNamesBtn) {
    editNamesBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const couple = store.d.couple || {};
      const currentA = couple.partnerA?.name || 'Partner A';
      const currentB = couple.partnerB?.name || 'Partner B';

      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-2">
          <h3 class="mt-0 mb-2">Nama Pasangan</h3>
          <p class="mute text-xs mb-3">Atur nama panggilan santai untuk berdua:</p>

          <label for="inputNameA" class="font-bold text-xs">Nama Partner A:</label>
          <input type="text" id="inputNameA" class="w-full mb-3" value="${esc(currentA)}">

          <label for="inputNameB" class="font-bold text-xs">Nama Partner B:</label>
          <input type="text" id="inputNameB" class="w-full mb-4" value="${esc(currentB)}">

          <div class="flex gap-2">
            <button type="button" class="secondary w-full btn-action-sm" id="cancelNamesBtn">Batal</button>
            <button type="button" class="plum-btn w-full btn-action-sm" id="saveNamesBtn">Simpan</button>
          </div>
        </div>
      `;

      sheet.open({ title: 'Nama Pasangan', content });

      const cancelBtn = content.querySelector('#cancelNamesBtn');
      if (cancelBtn) cancelBtn.onclick = () => sheet.close();

      const saveBtn = content.querySelector('#saveNamesBtn');
      if (saveBtn) {
        saveBtn.onclick = () => {
          const valA = content.querySelector('#inputNameA').value.trim();
          const valB = content.querySelector('#inputNameB').value.trim();
          store.setPartnerNames(valA || 'Partner A', valB || 'Partner B');
          sheet.close();
          rerender();
        };
      }
    };
  }

  // Dismiss Colek (Nudge)
  const dismissColekBtn = container.querySelector('#dismissColekBtn');
  const laterColekBtn = container.querySelector('#laterColekBtn');
  const acceptColekBtn = container.querySelector('#acceptColekBtn');

  if (dismissColekBtn) {
    dismissColekBtn.onclick = () => {
      store.dismissColek();
      rerender();
    };
  }

  if (laterColekBtn) {
    laterColekBtn.onclick = () => {
      store.dismissColek();
      rerender();
    };
  }

  if (acceptColekBtn) {
    acceptColekBtn.onclick = () => {
      store.dismissColek();
      const mount = container.querySelector('#convoDeckMount');
      if (mount) mount.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Tile 1: Love Maps Launcher
  const startLoveMapsBtn = container.querySelector('#startLoveMapsBtn');
  if (startLoveMapsBtn) {
    startLoveMapsBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const flow = createLoveMapsFlow(
        store,
        () => rerender(),
        () => {
          setSafetyExit(true);
          rerender();
        }
      );
      sessionRunner.start(flow, {}, () => rerender());
    };
  }

  // Tile 2: Bicara Lembut Launcher
  const startBicaraLembutBtn = container.querySelector('#startBicaraLembutBtn');
  if (startBicaraLembutBtn) {
    startBicaraLembutBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const flow = createBicaraLembutFlow(
        store,
        () => rerender(),
        () => {
          setSafetyExit(true);
          rerender();
        }
      );
      sessionRunner.start(flow, {}, () => rerender());
    };
  }

  // Tile 3: Card Deck Controls & Flip
  const flipToBackBtn = container.querySelector('#flipToBackBtn');
  const flipToFrontBtn = container.querySelector('#flipToFrontBtn');
  const prevDeckBtn = container.querySelector('#prevDeckBtn');
  const nextDeckBtn = container.querySelector('#nextDeckBtn');

  if (flipToBackBtn) {
    flipToBackBtn.onclick = (e) => {
      e.stopPropagation();
      playTapSound();
      triggerHapticTap();
      isCardFlipped = true;
      rerender();
    };
  }

  if (flipToFrontBtn) {
    flipToFrontBtn.onclick = (e) => {
      e.stopPropagation();
      playTapSound();
      triggerHapticTap();
      isCardFlipped = false;
      rerender();
    };
  }

  if (prevDeckBtn) {
    prevDeckBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      activeDeckIndex = Math.max(0, activeDeckIndex - 1);
      isCardFlipped = false;
      rerender();
    };
  }

  if (nextDeckBtn) {
    nextDeckBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const total = CONTENT.conversations.length;
      activeDeckIndex = Math.min(total - 1, activeDeckIndex + 1);
      isCardFlipped = false;
      rerender();
    };
  }

  // Swipe gesture support on conversation card
  const activeCard = container.querySelector('#activeConvoCard');
  if (activeCard) {
    let touchStartX = 0;
    activeCard.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    activeCard.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0 && activeDeckIndex < CONTENT.conversations.length - 1) {
          playTapSound();
          triggerHapticTap();
          activeDeckIndex++;
          isCardFlipped = false;
          rerender();
        } else if (diff > 0 && activeDeckIndex > 0) {
          playTapSound();
          triggerHapticTap();
          activeDeckIndex--;
          isCardFlipped = false;
          rerender();
        }
      }
    }, { passive: true });
  }

  // Start Turn-Based Conversation Flow
  container.querySelectorAll('[data-start-turn-convo]').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const convoId = btn.dataset.startTurnConvo;
      const convo = CONTENT.conversations.find(c => c.id === convoId);
      if (!convo) return;

      const flow = createCoupleFlow(
        convo,
        store,
        () => rerender(),
        () => {
          setSafetyExit(true);
          rerender();
        }
      );
      sessionRunner.start(flow, {}, () => rerender());
    };
  });

  // View Completed Conversation Summary Modal
  container.querySelectorAll('[data-view-summary]').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const convoId = btn.dataset.viewSummary;
      const convo = CONTENT.conversations.find(c => c.id === convoId);
      const convoData = store.d.coupleConversations ? store.d.coupleConversations[convoId] : null;
      if (!convo || !convoData) return;

      const visible = visibleTo(convoData, 'shared');
      const bothShared = Boolean(visible.A && visible.B);
      const agreement = convoData.agreement || {};

      const nameA = store.d?.couple?.partnerA?.name || 'Partner A';
      const nameB = store.d?.couple?.partnerB?.name || 'Partner B';

      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-2">
          <div class="card-title-row mb-1">
            <span class="card-tag plum">Catatan Bersama</span>
            <span class="text-xs mute">${new Date(convoData.completedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
          </div>
          <h3 class="mt-1 mb-1">${esc(convo.title)}</h3>
          <p class="mute text-xs mb-3">${esc(convo.subtitle)}</p>

          ${bothShared ? `
            <div class="flex flex-col gap-2 mb-3">
              <div class="partner-box">
                <div class="partner-box-title">Sudut Pandang ${esc(nameA)}</div>
                <div class="partner-box-text">${esc(visible.A || '(Tidak ada catatan)')}</div>
              </div>
              <div class="partner-box">
                <div class="partner-box-title">Sudut Pandang ${esc(nameB)}</div>
                <div class="partner-box-text">${esc(visible.B || '(Tidak ada catatan)')}</div>
              </div>
            </div>
          ` : `
            <div class="neutral-guidance-box mb-3 text-center">
              🔒 <b>Satu jawaban tetap disimpan secara pribadi.</b><br>
              <span class="mute text-xs">Pilihan ini dihormati sepenuhnya demi kenyamanan bersama.</span>
            </div>
          `}

          ${agreement.nextStep ? `
            <div class="card card-border-plum p-3 mb-3">
              <div class="font-bold text-xs text-plum mb-1">🤝 Komitmen / Langkah Bersama:</div>
              <div class="text-sm">${esc(agreement.nextStep)}</div>
              ${agreement.reviewDate ? `
                <div class="text-xs mute mt-1">🗓️ Tanggal evaluasi santai: ${esc(agreement.reviewDate)}</div>
              ` : ''}
            </div>
          ` : ''}

          <div class="flex gap-2">
            <button type="button" class="secondary w-full btn-action-sm" id="closeSummarySheetBtn">
              Tutup
            </button>
            <button type="button" class="plum-btn w-full btn-action-sm" id="repeatConvoFromSummaryBtn">
              Ulangi Percakapan
            </button>
          </div>
        </div>
      `;

      sheet.open({ title: 'Hasil Percakapan Berdua', content });

      const closeBtn = content.querySelector('#closeSummarySheetBtn');
      if (closeBtn) closeBtn.onclick = () => sheet.close();

      const repeatBtn = content.querySelector('#repeatConvoFromSummaryBtn');
      if (repeatBtn) {
        repeatBtn.onclick = () => {
          sheet.close();
          const flow = createCoupleFlow(
            convo,
            store,
            () => rerender(),
            () => {
              setSafetyExit(true);
              rerender();
            }
          );
          sessionRunner.start(flow, {}, () => rerender());
        };
      }
    };
  });
}
