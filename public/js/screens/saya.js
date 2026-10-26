/**
 * Screen: Ruang Saya (Self, Privacy & Settings)
 * Personal practice logs, faith framing opt-in toggle, local-first backup/wipe, unverified support gate.
 */
import { SUPPORT_DATA } from '../../support.js';
import { DEV_MODE, esc, today } from '../ui/utils.js';
import { renderMascot, getMascotStage, getTotalPractices } from '../ui/mascot.js';

export function renderSelf(store) {
  const d = store.d;
  const support = typeof SUPPORT_DATA !== 'undefined' ? SUPPORT_DATA : null;
  const totalPractices = getTotalPractices(d);
  const mascotStage = getMascotStage(totalPractices);

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Privasi & Pengaturan</span>
        <h1 class="mt-1 mb-1">Ruang Saya</h1>
      </div>
    </div>
    <p class="mute">Teman Siap tidak memberi nilai atau label "kelayakan menikah". Setiap latihan adalah proses belajar mandiri.</p>

    <!-- Mascot Growth Companion Card -->
    <div class="card mb-3" style="display: flex; align-items: center; gap: var(--space-3);">
      <div style="flex-shrink: 0;">
        ${renderMascot('cheer', 72, { stage: mascotStage.id, label: `Tunas ${mascotStage.name}` })}
      </div>
      <div>
        <span class="card-tag tunas">Fase: ${esc(mascotStage.name)}</span>
        <h3 class="mt-1 mb-1">Teman Belajar: Tunas</h3>
        <p class="mute text-xs mb-0">${esc(mascotStage.desc)} (${totalPractices} latihan selesai)</p>
      </div>
    </div>

    <!-- Habit Log Summary -->
    <div class="card">
      <div class="card-title-row">
        <h3>Riwayat Latihan Pribadi</h3>
        <span class="card-tag saffron">Proses Nyata</span>
      </div>

      <ul class="profile-history-list">
        <li>Cek emosi tersimpan: <b>${d.checkins ? d.checkins.length : 0} kali</b></li>
        <li>Pengeluaran sadar tercatat: <b>${d.expenses ? d.expenses.length : 0} transaksi</b></li>
        <li>Jeda belanja (Urge Surfing): <b>${d.pauses ? d.pauses.length : 0} kali</b></li>
        <li>Rencana Jika-Maka aktif: <b>${d.plans ? d.plans.length : 0} rencana</b></li>
        <li>Topik percakapan terisi: <b>${Object.keys(d.partnerA || {}).length} topik</b></li>
      </ul>
    </div>

    <!-- Faith Perspective Opt-In Setting (Default Off) -->
    <div class="card">
      <div class="card-title-row">
        <h3>Preferensi Konten</h3>
        <span class="card-tag">Pengaturan</span>
      </div>
      <label class="faith-toggle-label">
        <input type="checkbox" id="faithPerspectiveToggle" class="faith-toggle-input" ${d.faithPerspective ? 'checked' : ''}>
        <span class="text-sm">
          <b>Tampilkan sudut pandang nilai iman</b><br>
          <span class="mute text-xs">
            Menyertakan perspektif nilai keimanan (seperti sabar, syukur, dan qana'ah) di dalam latihan dan refleksi. Default non-aktif.
          </span>
        </span>
      </label>
    </div>

    <!-- Privacy Management -->
    <div class="card">
      <div class="card-title-row">
        <h3>Kedaulatan Data & Privasi</h3>
        <span class="card-tag">Local-First</span>
      </div>
      <p class="mute">
        Semua catatan jurnal, nominal uang, dan refleksi batinmu tersimpan secara lokal di browsermu. Tidak ada data yang dikirim ke server pihak ketiga.
      </p>

      <div class="btn-group">
        <button type="button" class="secondary" id="exportDataJsonBtn">Unduh Cadangan (JSON) 📥</button>
        <button type="button" class="secondary text-danger" id="wipeAllDataBtn">
          Hapus Semua Data 🗑️
        </button>
      </div>
    </div>

    <!-- Crisis Support Section -->
    <div class="card card-border-teal">
      <div class="card-title-row">
        <h3 class="text-teal mb-0">Bantuan & Dukungan Darurat</h3>
      </div>
      <p class="mute text-sm mt-2">
        ${support ? esc(support.disclaimer) : 'Aplikasi ini adalah sarana edukasi mandiri, bukan layanan diagnosis psikologis klinis atau penasihat keuangan.'}
      </p>
      <p class="text-sm text-ink-secondary mb-3">
        Jika kamu atau pasangan sedang mengalami tekanan batin berat, kekerasan dalam relasi, atau situasi krisis darurat, selalu hubungi layanan bantuan darurat setempat atau tenaga profesional manusia.
      </p>

      ${DEV_MODE && support && support.hotlines ? `
        <div class="dev-banner">
          ⚠️ <b>Mode Pengembang (DEV_MODE):</b> ${esc(support.reviewNote)}
          <br><span class="text-xs">Status peninjauan: ${support.verified ? 'Selesai Diperiksa' : 'Draf (lastVerified: null)'}</span>
        </div>

        ${support.hotlines.map(h => `
          <div class="hotline-card">
            <div class="hotline-name">${esc(h.name)}</div>
            <div class="hotline-number">${esc(h.contact)}</div>
            <div class="mute text-xs">${esc(h.desc)}</div>
          </div>
        `).join('')}
      ` : `
        <div class="text-subtle mt-2">
          Daftar nomor kontak darurat lokal disembunyikan dalam versi publik hingga melewati verifikasi resmi.
        </div>
      `}
    </div>
  `;
}

export function bindSelf(container, store, navigate, rerender) {
  const faithToggle = container.querySelector('#faithPerspectiveToggle');
  if (faithToggle) {
    faithToggle.onchange = () => {
      store.setFaithPerspective(faithToggle.checked);
      rerender();
    };
  }

  const exportBtn = container.querySelector('#exportDataJsonBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(store.exportJson());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'teman-siap-backup-' + today() + '.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  const wipeBtn = container.querySelector('#wipeAllDataBtn');
  if (wipeBtn) {
    wipeBtn.onclick = () => {
      if (confirm('Apakah kamu yakin ingin menghapus seluruh data di perangkat ini? Tindakan ini tidak dapat dibatalkan.')) {
        store.wipe();
        location.reload();
      }
    };
  }
}
