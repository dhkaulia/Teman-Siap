/**
 * Screen: Kita & Komunikasi (Us) — Shared Garden & Game Layer
 * 
 * Rules:
 * - "Taman Kita": Shared garden scene with two small plants that grow when EACH partner
 *   completes their own practice (neither can speed up the other).
 * - Single-phone friendly: perspective switch between Partner A and Partner B.
 * - Future backend data model: couple, participantId, sharedItems.
 * - Conversation cards: swipeable/flippable card deck with "Giliran [nama]" banner.
 * - Reveal moment: two-card reveal with Tunas cheer when mutual; neutral screen when declined.
 * - "Kuis saling kenal" (Love Maps, Gottman Method): zero numerical scores, "Hal baru yang kamu pelajari" cards.
 * - Non-pushy "Colek" feature: opt-in single suggestion from app, never repeated, no guilt.
 * - Persistent "Ini terasa tidak nyaman" safety exit.
 * - Guardrails: no couple leaderboards, no compatibility percentage, no ranking of who contributes more.
 */

import { CONTENT } from '../../content.js';
import { SUPPORT_DATA } from '../../support.js';
import { sessionRunner } from '../session.js';
import { createCoupleFlow, visibleTo, REMOTE_PARTNER_SYNC_SPEC } from '../flows/coupleFlow.js';
import { createLoveMapsFlow } from '../flows/loveMapsFlow.js';
import { createBreathingFlow } from '../flows/breathingFlow.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { esc } from '../ui/utils.js';
import { getPlantStage } from '../store.js';

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
 * Renders SVG plant based on stage (1 to 4)
 */
function renderPlantSvg(x, y, stageNumber) {
  // Pot
  const pot = `
    <polygon points="${x - 14},${y} ${x + 14},${y} ${x + 10},${y + 18} ${x - 10},${y + 18}" fill="#BCAAA4" stroke="#8D6E63" stroke-width="1"/>
    <ellipse cx="${x}" cy="${y}" rx="14" ry="4" fill="#8D6E63"/>
  `;

  if (stageNumber === 1) {
    // Stage 1: Sprout
    return `
      ${pot}
      <path d="M ${x},${y} Q ${x + 4},${y - 12} ${x},${y - 16}" stroke="#4CAF50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x + 2}" cy="${y - 16}" rx="3.5" ry="5" fill="#4CAF50" transform="rotate(-20 ${x + 2} ${y - 16})"/>
    `;
  }

  if (stageNumber === 2) {
    // Stage 2: 2 Leaves
    return `
      ${pot}
      <path d="M ${x},${y} Q ${x},${y - 14} ${x},${y - 22}" stroke="#388E3C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x - 7}" cy="${y - 16}" rx="7" ry="4" fill="#4CAF50" transform="rotate(-30 ${x - 7} ${y - 16})"/>
      <ellipse cx="${x + 7}" cy="${y - 18}" rx="7" ry="4" fill="#4CAF50" transform="rotate(30 ${x + 7} ${y - 18})"/>
    `;
  }

  if (stageNumber === 3) {
    // Stage 3: Lush Plant
    return `
      ${pot}
      <path d="M ${x},${y} Q ${x},${y - 18} ${x},${y - 28}" stroke="#2E7D32" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x - 9}" cy="${y - 14}" rx="8" ry="5" fill="#388E3C" transform="rotate(-35 ${x - 9} ${y - 14})"/>
      <ellipse cx="${x + 9}" cy="${y - 16}" rx="8" ry="5" fill="#388E3C" transform="rotate(35 ${x + 9} ${y - 16})"/>
      <ellipse cx="${x - 8}" cy="${y - 24}" rx="7" ry="4.5" fill="#66BB6A" transform="rotate(-25 ${x - 8} ${y - 24})"/>
      <ellipse cx="${x + 8}" cy="${y - 26}" rx="7" ry="4.5" fill="#66BB6A" transform="rotate(25 ${x + 8} ${y - 26})"/>
    `;
  }

  // Stage 4: Blooming Blossom
  return `
    ${pot}
    <path d="M ${x},${y} Q ${x},${y - 20} ${x},${y - 30}" stroke="#2E7D32" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="${x - 9}" cy="${y - 16}" rx="8" ry="5" fill="#388E3C" transform="rotate(-35 ${x - 9} ${y - 16})"/>
    <ellipse cx="${x + 9}" cy="${y - 18}" rx="8" ry="5" fill="#388E3C" transform="rotate(35 ${x + 9} ${y - 18})"/>
    <ellipse cx="${x - 7}" cy="${y - 26}" rx="6" ry="4" fill="#66BB6A" transform="rotate(-20 ${x - 7} ${y - 26})"/>
    <ellipse cx="${x + 7}" cy="${y - 28}" rx="6" ry="4" fill="#66BB6A" transform="rotate(20 ${x + 7} ${y - 28})"/>
    <!-- Blossom -->
    <circle cx="${x}" cy="${y - 34}" r="5" fill="#F48FB1"/>
    <circle cx="${x - 5}" cy="${y - 38}" r="4.5" fill="#F06292"/>
    <circle cx="${x + 5}" cy="${y - 38}" r="4.5" fill="#F06292"/>
    <circle cx="${x}" cy="${y - 42}" r="4.5" fill="#EC407A"/>
    <circle cx="${x}" cy="${y - 36}" r="3" fill="#FFF59D"/>
  `;
}

/**
 * Shared Garden Scene (Taman Kita)
 */
function renderTamanKitaScene(couple) {
  const partnerA = couple?.partnerA || { name: 'Partner A', practicesCount: 0 };
  const partnerB = couple?.partnerB || { name: 'Partner B', practicesCount: 0 };

  const stageA = getPlantStage(partnerA.practicesCount);
  const stageB = getPlantStage(partnerB.practicesCount);

  return `
    <div class="taman-kita-card mb-3" role="region" aria-label="Taman Kita">
      <div class="card-title-row mb-2">
        <h2 class="text-sm font-bold mb-0">Taman Kita 🌸</h2>
        <span class="card-tag tunas">Ruang Bersama</span>
      </div>

      <svg class="taman-kita-svg" viewBox="0 0 340 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Taman dengan tanaman ${esc(partnerA.name)} dan ${esc(partnerB.name)}">
        <defs>
          <linearGradient id="tkSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#E0F2F1"/>
            <stop offset="60%" stop-color="#F1F8E9"/>
            <stop offset="100%" stop-color="#DCEDC8"/>
          </linearGradient>
          <linearGradient id="tkHillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#A5D6A7"/>
            <stop offset="100%" stop-color="#81C784"/>
          </linearGradient>
        </defs>

        <!-- Sky -->
        <rect width="340" height="170" fill="url(#tkSkyGrad)" rx="10"/>

        <!-- Soft Sun -->
        <circle cx="170" cy="35" r="22" fill="#FFF9C4" opacity="0.85"/>

        <!-- Distant Trees -->
        <circle cx="40" cy="110" r="24" fill="#C8E6C9" opacity="0.6"/>
        <circle cx="300" cy="105" r="26" fill="#C8E6C9" opacity="0.6"/>

        <!-- Rolling Hill Ground -->
        <path d="M 0,115 Q 85,102 170,110 T 340,105 L 340,170 L 0,170 Z" fill="url(#tkHillGrad)"/>

        <!-- Garden Wooden Bench in Center -->
        <rect x="142" y="112" width="56" height="7" rx="2" fill="#8D6E63"/>
        <rect x="147" y="119" width="5" height="13" fill="#5D4037"/>
        <rect x="188" y="119" width="5" height="13" fill="#5D4037"/>
        <path d="M 148,110 L 192,110" stroke="#795548" stroke-width="2"/>

        <!-- Stone Paver -->
        <ellipse cx="170" cy="133" rx="14" ry="4" fill="#B0BEC5"/>

        <!-- Plant A (Left: x=75, y=128) -->
        ${renderPlantSvg(75, 128, stageA.stage)}

        <!-- Plant B (Right: x=265, y=128) -->
        ${renderPlantSvg(265, 128, stageB.stage)}

        <!-- Name & Stage Labels below pots -->
        <text x="75" y="156" text-anchor="middle" font-size="10" font-weight="700" fill="#1B5E20">
          ${esc(partnerA.name)}
        </text>
        <text x="75" y="166" text-anchor="middle" font-size="8.5" fill="#2E7D32">
          ${esc(stageA.name)} (${partnerA.practicesCount}🌱)
        </text>

        <text x="265" y="156" text-anchor="middle" font-size="10" font-weight="700" fill="#1B5E20">
          ${esc(partnerB.name)}
        </text>
        <text x="265" y="166" text-anchor="middle" font-size="8.5" fill="#2E7D32">
          ${esc(stageB.name)} (${partnerB.practicesCount}🌱)
        </text>
      </svg>

      <p class="mute text-xs mt-2 mb-0 text-center">
        Taman tumbuh saat masing-masing berproses. Tidak ada yang lebih cepat atau lambat; kalian merawat ruang ini bersama-sama tanpa kompetisi.
      </p>
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
  const currentPartnerName = currentPerspective === 'B' ? couple.partnerB.name : couple.partnerA.name;

  // -------------------------------------------------------------
  // Safety Exit Screen (Triggered by "Ini terasa tidak nyaman")
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
          Hubungan yang sehat selalu memberi ruang untuk jeda. Kamu dan pasangan berhak berhenti kapan saja tanpa perlu merasa bersalah atau gagal.
        </p>

        <div class="safety-actions-grid mb-4">
          <div class="card card-border-plum p-3">
            <div class="font-bold text-sm mb-1 text-plum">🌿 Butuh Menenangkan Tubuh?</div>
            <p class="mute text-xs mb-3">Ambil jeda 1 menit dengan latihan pernapasan santai 4-4-6 untuk menstabilkan detak jantung.</p>
            <button type="button" class="primary w-full btn-action-sm" id="safetyBreathingBtn">
              Mulai Latihan Napas Tenang →
            </button>
          </div>

          <div class="card p-3">
            <div class="font-bold text-sm mb-1 text-ink-primary">📞 Butuh Dukungan Manusia?</div>
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
  // Standard Kita Hub View
  // -------------------------------------------------------------
  return `
    <!-- Header -->
    <div class="card-title-row mb-1">
      <div>
        <span class="card-tag plum">Pilar Relasi</span>
        <h1 class="mt-1 mb-1">Kita & Komunikasi</h1>
      </div>
    </div>
    <p class="mute text-sm mb-3">
      Persiapan pernikahan bukan memaksakan kesamaan instan, tapi melatih cara mendengar dan bernegosiasi secara aman di satu ponsel.
    </p>

    <!-- Taman Kita (Shared Garden Scene) -->
    ${renderTamanKitaScene(couple)}

    <!-- Perspective & Partner Bar -->
    <div class="taman-perspective-bar mb-3">
      <div class="text-xs">
        <span class="mute">Sedang mengisi sebagai:</span><br>
        <span class="turn-banner mt-1">👤 <b>${esc(currentPartnerName)}</b></span>
      </div>
      <div class="flex gap-2">
        <button type="button" class="perspective-switch-btn" id="switchPerspectiveBtn" aria-label="Ganti perspective partner">
          Ganti Giliran 🔄
        </button>
        <button type="button" class="perspective-switch-btn" id="editPartnerNamesBtn" aria-label="Ubah nama pasangan">
          Ubah Nama ✏️
        </button>
      </div>
    </div>

    <!-- Non-Pushy "Colek" Feature (Single Opt-in Suggestion, Never Repeated) -->
    ${!couple.colekDismissed ? `
      <div class="card colek-card mb-3" id="colekCard">
        <div class="card-title-row mb-1">
          <span class="card-tag saffron">Saran Santai Hari Ini</span>
          <button type="button" class="btn-dismiss" id="dismissColekBtn" aria-label="Tutup saran">✕</button>
        </div>
        <div class="font-bold text-sm text-ink-primary mb-1">
          Mau ajak ${esc(couple.partnerB.name)} mencoba satu percakapan berdua?
        </div>
        <p class="mute text-xs mb-3">
          Cukup 5 menit di satu ponsel santai saat kalian sedang duduk bersama. Tanpa paksaan dan tanpa tekanan.
        </p>
        <div class="flex gap-2">
          <button type="button" class="plum-btn w-full btn-action-sm" id="acceptColekBtn">
            Pilih Topik Percakapan ✨
          </button>
          <button type="button" class="secondary w-full btn-action-sm" id="laterColekBtn">
            Nanti saja
          </button>
        </div>
      </div>
    ` : ''}

    <!-- "Kuis Saling Kenal" (Love Maps - Gottman Method) -->
    <div class="card love-maps-launcher-card mb-4">
      <div class="card-title-row mb-1">
        <span class="card-tag tunas">Game Berdua • Love Maps</span>
        <span class="text-xs mute">~5 Menit</span>
      </div>
      <h2 class="text-base font-bold mt-1 mb-1">Kuis Saling Kenal (Peta Cinta) 🌸</h2>
      <p class="mute text-xs mb-3">
        Jawab pertanyaan tentang dirimu, lalu tebak jawaban pasanganmu! Tanpa penilaian atau perbandingan—hanya cara hangat menemukan hal-hal baru tentang dunia batin masing-masing.
      </p>
      <button type="button" class="plum-btn w-full" id="startLoveMapsBtn">
        Mulai Kuis Saling Kenal (Satu Ponsel) →
      </button>
    </div>

    <!-- Conversation Cards Deck (Flippable & Swipeable) -->
    <div class="card-title-row mt-4 mb-2">
      <div>
        <h2 class="text-md font-bold mb-0">Kartu Percakapan Berdua</h2>
        <span class="mute text-xs">Pilih topik dan balik kartu untuk melihat tips Gottman</span>
      </div>
      <span class="text-xs mute">${activeDeckIndex + 1} dari ${convos.length}</span>
    </div>

    <!-- Flippable Card Deck -->
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
          <p class="mute text-xs mb-3">${esc(currentConvo.subtitle)}</p>

          <div class="convo-prompt-box text-xs mb-3">
            "${esc(currentConvo.prompt)}"
          </div>

          <div class="flex items-center justify-between mt-auto pt-2">
            <button type="button" class="secondary btn-action-sm" id="flipToBackBtn" aria-label="Intip tips Gottman">
              Intip Tips Gottman 🔄
            </button>
            ${isCompleted ? `
              <button type="button" class="plum-btn btn-action-sm" data-start-turn-convo="${esc(currentConvo.id)}">
                Ulangi
              </button>
            ` : `
              <button type="button" class="plum-btn btn-action-sm" data-start-turn-convo="${esc(currentConvo.id)}">
                Mulai →
              </button>
            `}
          </div>
        </div>

        <!-- Back of Card (Gottman Tip & Clinical Insight) -->
        <div class="convo-card-back">
          <div>
            <div class="card-title-row mb-2">
              <span class="card-tag saffron">Tips Gottman</span>
              <span class="text-xs mute">Balik Kartu</span>
            </div>
            <div class="font-bold text-sm text-ink-primary mb-1">Kunci Komunikasi:</div>
            <p class="text-xs text-ink-secondary mb-3">
              💡 ${esc(currentConvo.gottmanTip || 'Dengarkan untuk memahami, bukan untuk mendebat.')}
            </p>
            <div class="neutral-guidance-box text-xs mb-3">
              <b>Prinsip Ilmiah:</b> ${esc(currentConvo.clinicalDetail || 'Fondasi komunikasi relasi sehat.')}
            </div>
          </div>

          <div class="flex gap-2 mt-auto">
            <button type="button" class="secondary w-full btn-action-sm" id="flipToFrontBtn">
              Kembali ke Topik 🔄
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
        <span class="text-xs font-bold mute">Topik ${activeDeckIndex + 1} / ${convos.length}</span>
        <button type="button" class="deck-nav-btn" id="nextDeckBtn" ${activeDeckIndex === convos.length - 1 ? 'disabled' : ''} aria-label="Kartu berikutnya">
          →
        </button>
      </div>
    </div>

    ${isCompleted ? `
      <div class="mb-3">
        <button type="button" class="secondary w-full btn-action-sm" data-view-summary="${esc(currentConvo.id)}">
          Lihat Catatan Sesi Topik Ini 📋
        </button>
      </div>
    ` : ''}

    <!-- Remote Partner Sync ("Segera Hadir") Card -->
    <div class="card remote-invite-card mb-3 mt-4">
      <div class="card-title-row">
        <h2 class="text-sm font-bold text-ink-primary mb-0">🔗 Hubungkan Dua Ponsel</h2>
        <span class="card-tag saffron">Segera Hadir</span>
      </div>
      <p class="mute text-xs mt-1 mb-2">
        Sedang LDR atau ingin mengisi dari ponsel masing-masing? Fitur sinkronisasi privat jarak jauh sedang disiapkan.
      </p>
      <div class="remote-invite-badge-info">
        <span class="text-xs text-ink-secondary">
          🔒 <b>Berbasis Enkripsi Ujung-ke-Ujung (E2EE)</b> — Server hanya meneruskan data terenkripsi dan tidak pernah bisa membaca isi percakapan kalian.
        </span>
      </div>
      <button type="button" class="secondary w-full btn-action-sm mt-2" id="viewRemoteSpecBtn">
        Lihat Cara Kerja & Desain Keamanan →
      </button>
    </div>

    <!-- Gentle Communication Antidotes Sheet -->
    <div class="card mt-3 mb-3">
      <div class="card-title-row">
        <h2 class="text-base font-bold mb-0">Pola Komunikasi Sehat</h2>
        <span class="card-tag">Riset Hubungan</span>
      </div>
      <p class="mute text-xs mt-1 mb-3">4 kebiasaan berbicara yang melelahkan dan penawar lembutnya (Gottman Method):</p>

      <div class="flex flex-col gap-2">
        ${CONTENT.communicationPatterns.map(p => `
          <div class="plan-item">
            <div class="font-bold text-sm text-ink-primary mb-1">${esc(p.name)}</div>
            <div class="mute text-xs mb-1">Contoh: ${esc(p.example)}</div>
            <div class="text-teal text-xs font-semibold">Penawar Lembut: ${esc(p.antidoteName)}</div>
            <div class="text-xs text-ink-secondary mt-1">${esc(p.antidoteExample)}</div>
          </div>
        `).join('')}
      </div>

      <details class="clinical-note mt-3">
        <summary>Prinsip Ilmiah: Gottman Sound Relationship House</summary>
        <p>Berdasarkan riset hubungan John Gottman selama 40 tahun. Pasangan yang stabil bukan pasangan tanpa perbedaan pendapat, melainkan yang mampu memulihkan diri dengan awalan lembut (softened startup) dan merawat rasio positif 5:1.</p>
      </details>
    </div>
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

  // Perspective Switcher
  const switchPerspectiveBtn = container.querySelector('#switchPerspectiveBtn');
  if (switchPerspectiveBtn) {
    switchPerspectiveBtn.onclick = () => {
      const current = store.d.currentPerspective === 'B' ? 'A' : 'B';
      store.setCurrentPerspective(current);
      rerender();
    };
  }

  // Edit Partner Names Modal
  const editNamesBtn = container.querySelector('#editPartnerNamesBtn');
  if (editNamesBtn) {
    editNamesBtn.onclick = () => {
      const couple = store.d.couple || {};
      const currentA = couple.partnerA?.name || 'Partner A';
      const currentB = couple.partnerB?.name || 'Partner B';

      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-2">
          <h3 class="mt-0 mb-2">Ubah Nama Panggilan</h3>
          <p class="mute text-xs mb-3">Atur nama panggilan santai untukmu dan pasangan:</p>

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

  // Love Maps Launcher
  const startLoveMapsBtn = container.querySelector('#startLoveMapsBtn');
  if (startLoveMapsBtn) {
    startLoveMapsBtn.onclick = () => {
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

  // Card Deck Controls & Flip
  const flipToBackBtn = container.querySelector('#flipToBackBtn');
  const flipToFrontBtn = container.querySelector('#flipToFrontBtn');
  const prevDeckBtn = container.querySelector('#prevDeckBtn');
  const nextDeckBtn = container.querySelector('#nextDeckBtn');

  if (flipToBackBtn) {
    flipToBackBtn.onclick = (e) => {
      e.stopPropagation();
      isCardFlipped = true;
      rerender();
    };
  }

  if (flipToFrontBtn) {
    flipToFrontBtn.onclick = (e) => {
      e.stopPropagation();
      isCardFlipped = false;
      rerender();
    };
  }

  if (prevDeckBtn) {
    prevDeckBtn.onclick = () => {
      activeDeckIndex = Math.max(0, activeDeckIndex - 1);
      isCardFlipped = false;
      rerender();
    };
  }

  if (nextDeckBtn) {
    nextDeckBtn.onclick = () => {
      const total = CONTENT.conversations.length;
      activeDeckIndex = Math.min(total - 1, activeDeckIndex + 1);
      isCardFlipped = false;
      rerender();
    };
  }

  // Remote Partner Spec Modal
  const viewRemoteSpecBtn = container.querySelector('#viewRemoteSpecBtn');
  if (viewRemoteSpecBtn) {
    viewRemoteSpecBtn.onclick = () => {
      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-2">
          <div class="card-title-row mb-2">
            <span class="card-tag saffron">Desain Fitur Jarak Jauh</span>
            <span class="text-xs mute">Status: Segera Hadir</span>
          </div>
          <h3 class="mt-0 mb-2">Bagaimana Fitur Ini Akan Bekerja?</h3>
          <p class="mute text-xs mb-3">
            Fitur ini dirancang khusus bagi pasangan yang sedang menjalani hubungan jarak jauh (LDR) atau lebih nyaman mengisi refleksi dari ponsel masing-masing:
          </p>

          <ol class="step-rule-list mb-3">
            <li><b>Buat Sesi & Kode Undangan:</b> Kamu membuat sesi di aplikasi dan menerima kode 6 digit untuk dikirim ke pasangan via WhatsApp.</li>
            <li><b>Isi Mandiri & Santai:</b> Masing-masing membuka aplikasi di ponsel sendiri, membaca prompt, dan mengisi refleksi secara privat tanpa saling mengintip.</li>
            <li><b>Enkripsi Ujung-ke-Ujung (E2EE):</b> Server Teman Siap hanya bertindak sebagai perantara data acak (zero-knowledge) dan tidak pernah bisa membaca isi jawaban.</li>
            <li><b>Pembukaan Berbasis Persetujuan Bersama:</b> Jawaban hanya terdekripsi dan terbuka jika kedua belah pihak sama-sama memilih tombol "Bagikan".</li>
          </ol>

          <details class="clinical-note mb-3">
            <summary>Lihat Spesifikasi Teknis & Skema Data (JSON)</summary>
            <div class="spec-code-box mt-2">
${esc(JSON.stringify(REMOTE_PARTNER_SYNC_SPEC, null, 2))}
            </div>
          </details>

          <button type="button" class="primary w-full btn-action-sm" id="closeRemoteSpecBtn">
            Mengerti & Tutup
          </button>
        </div>
      `;

      sheet.open({ title: 'Sinkronisasi Dua Ponsel', content });
      const closeBtn = content.querySelector('#closeRemoteSpecBtn');
      if (closeBtn) closeBtn.onclick = () => sheet.close();
    };
  }

  // Start Turn-Based Conversation Flow
  container.querySelectorAll('[data-start-turn-convo]').forEach(btn => {
    btn.onclick = () => {
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
