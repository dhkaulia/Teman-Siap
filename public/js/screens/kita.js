/**
 * Screen: Kita & Komunikasi (Us)
 * 
 * Rules:
 * - Turn-based couple flow on one phone (replaces dual-perspective simulator).
 * - Remote partner invite behind a clearly labeled "Segera hadir" state.
 * - Private answers filtered with visibleTo().
 * - Safety exit screen with access to support hotlines and breathing pause.
 * - Gottman communication patterns (antidotes).
 */

import { CONTENT } from '../../content.js';
import { SUPPORT_DATA } from '../../support.js';
import { sessionRunner } from '../session.js';
import { createCoupleFlow, visibleTo, REMOTE_PARTNER_SYNC_SPEC } from '../flows/coupleFlow.js';
import { createBreathingFlow } from '../flows/breathingFlow.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { esc } from '../ui/utils.js';

let isSafetyExitActive = false;

export function setSafetyExit(active) {
  isSafetyExitActive = Boolean(active);
}

export function cleanupKita() {
  // Screen clean up
}

export function renderRelationship(store) {
  const d = store.d;
  const coupleConvos = d.coupleConversations || {};

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
          Sangat wajar jika sebuah pertanyaan memicu rasa cemas, lelah, atau tidak nyaman.
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
    <p class="mute mb-3">
      Persiapan pernikahan bukan memaksakan kesamaan instan, tapi melatih cara mendengar dan bernegosiasi secara aman di satu ponsel.
    </p>

    <!-- Remote Partner Sync ("Segera Hadir") Card -->
    <div class="card remote-invite-card mb-3">
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

    <!-- Conversation Catalog -->
    <div class="card-title-row mt-4 mb-2">
      <h2 class="text-md font-bold mb-0">Percakapan Berdua (Satu Ponsel)</h2>
      <span class="text-xs mute">~5 Menit Tiap Topik</span>
    </div>

    <div class="flex flex-col gap-3">
      ${CONTENT.conversations.map(c => {
        const convoData = coupleConvos[c.id];
        const isCompleted = convoData && convoData.status === 'completed';
        const visible = isCompleted ? visibleTo(convoData, 'shared') : { A: null, B: null };
        const bothShared = Boolean(visible.A && visible.B);

        return `
          <div class="card card-border-plum" data-convo-card="${esc(c.id)}">
            <div class="card-title-row">
              <h3 class="mb-0 text-base">${esc(c.title)}</h3>
              ${isCompleted ? (
                bothShared
                  ? `<span class="consent-badge shared">✓ Terbuka Berdua</span>`
                  : `<span class="consent-badge locked">🔒 Tersimpan Privat</span>`
              ) : `
                <span class="card-tag plum">5 Menit</span>
              `}
            </div>
            <p class="mute text-xs mt-1 mb-3">${esc(c.subtitle)}</p>

            ${isCompleted ? `
              <div class="flex gap-2">
                <button type="button" class="secondary w-full btn-action-sm" data-view-summary="${esc(c.id)}">
                  Lihat Catatan Sesi
                </button>
                <button type="button" class="plum-btn w-full btn-action-sm" data-start-turn-convo="${esc(c.id)}">
                  Ulangi Percakapan
                </button>
              </div>
            ` : `
              <button type="button" class="plum-btn w-full" data-start-turn-convo="${esc(c.id)}">
                Mulai Percakapan (Satu Ponsel) →
              </button>
            `}
          </div>
        `;
      }).join('')}
    </div>

    <!-- Gentle Communication Antidotes Sheet -->
    <div class="card mt-4 mb-3">
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
  // -------------------------------------------------------------
  // Safety Screen Actions
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Remote Partner Sync Modal ("Segera Hadir")
  // -------------------------------------------------------------
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
            <li><b>Buat Sesi & Kode Undangan:</b> Kamu membuat sesi di aplikasi dan menerima kode 6 digit (misal: <code>TS-4921</code>) untuk dikirim ke pasangan via WhatsApp.</li>
            <li><b>Isi Mandiri & Santai:</b> Masing-masing membuka aplikasi di ponsel sendiri, membaca prompt, dan mengisi refleksi secara privat tanpa saling mengintip.</li>
            <li><b>Enkripsi Ujung-ke-Ujung (E2EE):</b> Kunci enkripsi dibuat di perangkat masing-masing. Server Teman Siap hanya bertindak sebagai perantara data acak (zero-knowledge) dan tidak pernah bisa membaca isi jawaban.</li>
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

      sheet.open({
        title: 'Sinkronisasi Dua Ponsel',
        content
      });

      const closeBtn = content.querySelector('#closeRemoteSpecBtn');
      if (closeBtn) closeBtn.onclick = () => sheet.close();
    };
  }

  // -------------------------------------------------------------
  // Launch Turn-Based Conversation Flow
  // -------------------------------------------------------------
  container.querySelectorAll('[data-start-turn-convo]').forEach(btn => {
    btn.onclick = () => {
      const convoId = btn.dataset.startTurnConvo;
      const convo = CONTENT.conversations.find(c => c.id === convoId);
      if (!convo) return;

      const flow = createCoupleFlow(
        convo,
        store,
        () => {
          rerender();
        },
        () => {
          // Safety exit triggered
          setSafetyExit(true);
          rerender();
        }
      );

      sessionRunner.start(flow, {}, () => rerender());
    };
  });

  // -------------------------------------------------------------
  // View Completed Conversation Summary Modal
  // -------------------------------------------------------------
  container.querySelectorAll('[data-view-summary]').forEach(btn => {
    btn.onclick = () => {
      const convoId = btn.dataset.viewSummary;
      const convo = CONTENT.conversations.find(c => c.id === convoId);
      const convoData = store.d.coupleConversations ? store.d.coupleConversations[convoId] : null;
      if (!convo || !convoData) return;

      const visible = visibleTo(convoData, 'shared');
      const bothShared = Boolean(visible.A && visible.B);
      const agreement = convoData.agreement || {};

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
                <div class="partner-box-title">Sudut Pandang Partner A</div>
                <div class="partner-box-text">${esc(visible.A || '(Tidak ada catatan)')}</div>
              </div>
              <div class="partner-box">
                <div class="partner-box-title">Sudut Pandang Partner B</div>
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

      sheet.open({
        title: 'Hasil Percakapan Berdua',
        content
      });

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
