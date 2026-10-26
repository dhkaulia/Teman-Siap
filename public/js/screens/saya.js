/**
 * Screen: Ruang Saya (Self, Privacy, Garden Milestones & Rewards)
 * Personal practice logs, anti-pressure ritme tracker, private garden milestones,
 * cosmetic garden collection, local-first data backup, and unverified support gate.
 */
import { SUPPORT_DATA } from '../../support.js';
import { DEV_MODE, esc, today } from '../ui/utils.js';
import { renderMascot, getMascotStage, getTotalPractices } from '../ui/mascot.js';
import {
  calculateRitme,
  getSeeds,
  purchaseCosmetic,
  equipCosmetic,
  checkMilestones,
  COSMETICS_CATALOG,
  WEEKLY_GOAL_OPTIONS
} from '../rewards.js';

export function renderSelf(store) {
  const d = store.d || {};
  const support = typeof SUPPORT_DATA !== 'undefined' ? SUPPORT_DATA : null;
  const totalPractices = getTotalPractices(d);
  const mascotStage = getMascotStage(totalPractices);

  const enableRitme = d.enableRitme !== false;
  const enableRewards = d.enableRewards !== false;
  const seeds = getSeeds(d);
  const ritme = calculateRitme(d);
  const milestones = checkMilestones(d);

  const inventory = Array.isArray(d.inventory) ? d.inventory : ['pot-clay', 'outfit-default', 'bg-default'];
  const equipped = d.equippedCosmetics || { pot: 'pot-clay', outfit: 'outfit-default', background: 'bg-default' };

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Privasi & Perjalanan</span>
        <h1 class="mt-1 mb-1">Ruang Saya</h1>
      </div>
    </div>
    <p class="mute text-sm">
      Teman Siap tidak memberi nilai atau label "kelayakan menikah". Setiap latihan adalah proses belajar mandiri yang damai.
    </p>

    <!-- Mascot Growth Companion Card -->
    <div class="card mb-3" style="display: flex; align-items: center; gap: var(--space-3);">
      <div style="flex-shrink: 0;">
        ${renderMascot('cheer', 72, { stage: mascotStage.id, label: `Tunas ${mascotStage.name}` })}
      </div>
      <div>
        <span class="card-tag tunas">Fase: ${esc(mascotStage.name)}</span>
        <h3 class="mt-1 mb-1">Teman Belajar: Tunas</h3>
        <p class="mute text-xs mb-0">${esc(mascotStage.desc)} (${totalPractices} latihan bermakna selesai)</p>
      </div>
    </div>

    <!-- Kebun Saya (Private Milestones Grid, No Sharing, No Ranking) -->
    <section class="card mb-3" aria-labelledby="kebunSayaHeading">
      <div class="card-title-row mb-2">
        <h3 id="kebunSayaHeading" class="mb-0">Kebun Saya 🌸</h3>
        <span class="card-tag tunas">Privat</span>
      </div>
      <p class="mute text-xs mb-3">
        Tanda jejak proses pribadimu. Tidak ada fitur berbagi ke publik atau papan peringkat; ini adalah ruang aman bagi proses belajarmu sendiri.
      </p>

      <div class="kebun-grid">
        ${milestones.map(ms => `
          <div class="kebun-milestone-card ${ms.unlocked ? 'unlocked' : 'locked'}" role="article" aria-label="${esc(ms.title)}: ${esc(ms.statusLabel)}">
            <div class="milestone-icon" aria-hidden="true">${ms.icon}</div>
            <div class="milestone-title">${esc(ms.title)}</div>
            <div class="milestone-desc">${esc(ms.desc)}</div>
            <span class="milestone-badge ${ms.unlocked ? 'unlocked' : 'locked'}">
              ${esc(ms.statusLabel)}
            </span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Target & Ritme Mingguan (Gentle, No Daily Streak, 2 Libur/Bulan) -->
    <section class="card mb-3" aria-labelledby="ritmeHeading">
      <div class="card-title-row mb-2">
        <h3 id="ritmeHeading" class="mb-0">Target & Ritme Mingguan 🌿</h3>
        <span class="card-tag saffron">Tanpa Tekanan</span>
      </div>

      ${enableRitme ? `
        <p class="mute text-xs mb-3">
          Teman Siap melacak ritme mingguan santai, bukan streak harian yang membebani. Kamu dapat memilih target pekanan yang paling sesuai.
        </p>

        <!-- Current Status Box -->
        <div class="ritme-status-box mb-3">
          <div class="font-bold text-sm mb-1">${esc(ritme.statusText)}</div>
          <div class="mute text-xs mb-2">
            Pekan ini: <b>${ritme.currentWeekPractices}</b> dari <b>${ritme.weeklyGoal}</b> langkah selesai.
          </div>
          <div class="ritme-libur-badge">
            <span>🛡️</span>
            <span>Perlindungan libur otomatis: <b>${ritme.liburRemainingThisMonth} pekan tersisa</b> bulan ini.</span>
          </div>
        </div>

        <p class="mute text-xs mb-3">
          <b>Tentang Libur Otomatis:</b> Jika suatu pekan terasa padat, 2 libur otomatis per bulan akan menjaga ritmemu tetap aman. Bila terlewat, ritme beristirahat secara netral: <i>"${esc(ritme.neutralMessage)}"</i> tanpa mengurangi benih atau fase pertumbuhan.
        </p>

        <!-- Weekly Goal Selector Chips -->
        <div class="weekly-goal-card mb-2">
          <div class="text-xs font-bold mb-2">Ubah Target Pekanan:</div>
          <div class="weekly-goal-options" role="radiogroup" aria-label="Pilih target ritme mingguan">
            ${WEEKLY_GOAL_OPTIONS.map(opt => {
              const isSelected = (Number(d.weeklyGoal) || 3) === opt.value;
              return `
                <button type="button"
                        class="weekly-goal-option ${isSelected ? 'active' : ''}"
                        data-goal-val="${opt.value}"
                        role="radio"
                        aria-checked="${isSelected}">
                  <div class="flex items-center justify-between w-full">
                    <div>
                      <div class="weekly-goal-label"><b>${esc(opt.label)}</b></div>
                      <div class="mute text-xs">${esc(opt.hint)}</div>
                    </div>
                    <div class="goal-radio-circle" aria-hidden="true">${isSelected ? '✓' : ''}</div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : `
        <div class="ritme-status-box">
          <div class="mute text-sm">
            Pelacak ritme mingguan sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.
          </div>
        </div>
      `}
    </section>

    <!-- Koleksi Taman & Benih (Cosmetics for Tunas & Garden) -->
    <section class="card mb-3" aria-labelledby="koleksiHeading">
      <div class="card-title-row mb-2">
        <h3 id="koleksiHeading" class="mb-0">Koleksi Taman & Benih 🌱</h3>
        ${enableRewards ? `<span class="path-seeds-pill"><b>${seeds}</b> Benih</span>` : '<span class="card-tag">Nonaktif</span>'}
      </div>

      ${enableRewards ? `
        <p class="mute text-xs mb-3">
          Benih diperoleh dari menyelesaikan latihan, khusus untuk merawat Tunas dan mempercantik taman. Benih tidak pernah kedaluwarsa dan tidak pernah dibutuhkan untuk membuka materi belajar.
        </p>

        <!-- Cosmetic Categories -->
        <div class="cosmetics-section">
          <!-- Pots -->
          <h4 class="text-sm font-bold mt-3 mb-2">Pilihan Pot Tunas 🏺</h4>
          <div class="cosmetics-grid mb-3">
            ${COSMETICS_CATALOG.filter(c => c.category === 'pot').map(item => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = equipped.pot === item.id;
              return `
                <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                  <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                  <div class="cosmetic-name">${esc(item.name)}</div>
                  <div class="cosmetic-desc">${esc(item.desc)}</div>
                  <div class="cosmetic-action-row">
                    ${!isOwned ? `<span class="cosmetic-price-pill">${item.price} 🌱</span>` : ''}
                    ${isEquipped ? `
                      <button type="button" class="btn-sm soft w-full" disabled>Dipakai ✓</button>
                    ` : isOwned ? `
                      <button type="button" class="btn-sm secondary w-full equip-cosmetic-btn" data-cat="pot" data-id="${esc(item.id)}">Pakai</button>
                    ` : `
                      <button type="button" class="btn-sm primary w-full buy-cosmetic-btn" data-id="${esc(item.id)}" ${seeds < item.price ? 'disabled' : ''}>Dapatkan</button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Outfits -->
          <h4 class="text-sm font-bold mt-3 mb-2">Aksesoris Tunas 🎀</h4>
          <div class="cosmetics-grid mb-3">
            ${COSMETICS_CATALOG.filter(c => c.category === 'outfit').map(item => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = equipped.outfit === item.id;
              return `
                <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                  <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                  <div class="cosmetic-name">${esc(item.name)}</div>
                  <div class="cosmetic-desc">${esc(item.desc)}</div>
                  <div class="cosmetic-action-row">
                    ${!isOwned ? `<span class="cosmetic-price-pill">${item.price} 🌱</span>` : ''}
                    ${isEquipped ? `
                      <button type="button" class="btn-sm soft w-full" disabled>Dipakai ✓</button>
                    ` : isOwned ? `
                      <button type="button" class="btn-sm secondary w-full equip-cosmetic-btn" data-cat="outfit" data-id="${esc(item.id)}">Pakai</button>
                    ` : `
                      <button type="button" class="btn-sm primary w-full buy-cosmetic-btn" data-id="${esc(item.id)}" ${seeds < item.price ? 'disabled' : ''}>Dapatkan</button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Backgrounds -->
          <h4 class="text-sm font-bold mt-3 mb-2">Latar Beranda 🏡</h4>
          <div class="cosmetics-grid mb-2">
            ${COSMETICS_CATALOG.filter(c => c.category === 'background').map(item => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = equipped.background === item.id;
              return `
                <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                  <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                  <div class="cosmetic-name">${esc(item.name)}</div>
                  <div class="cosmetic-desc">${esc(item.desc)}</div>
                  <div class="cosmetic-action-row">
                    ${!isOwned ? `<span class="cosmetic-price-pill">${item.price} 🌱</span>` : ''}
                    ${isEquipped ? `
                      <button type="button" class="btn-sm soft w-full" disabled>Dipakai ✓</button>
                    ` : isOwned ? `
                      <button type="button" class="btn-sm secondary w-full equip-cosmetic-btn" data-cat="background" data-id="${esc(item.id)}">Pakai</button>
                    ` : `
                      <button type="button" class="btn-sm primary w-full buy-cosmetic-btn" data-id="${esc(item.id)}" ${seeds < item.price ? 'disabled' : ''}>Dapatkan</button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : `
        <div class="ritme-status-box">
          <div class="mute text-sm">
            Sistem hadiah Benih dan kosmetik taman sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.
          </div>
        </div>
      `}
    </section>

    <!-- Habit Log Summary -->
    <div class="card mb-3">
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
        <li>Langkah materi kurikulum selesai: <b>${d.completedPathNodes ? d.completedPathNodes.length : 0} modul</b></li>
      </ul>
    </div>

    <!-- Preferences & Settings (Toggles) -->
    <div class="card mb-3">
      <div class="card-title-row">
        <h3>Preferensi & Pengaturan</h3>
        <span class="card-tag">Pengaturan</span>
      </div>

      <!-- Ritme Tracker Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="enableRitmeToggle" class="faith-toggle-input" ${enableRitme ? 'checked' : ''}>
        <span class="text-sm">
          <b>Lacak ritme mingguan</b><br>
          <span class="mute text-xs">
            Menampilkan hitungan ritme mingguan santai dengan perlindungan libur otomatis. Matikan jika kamu memilih belajar tanpa pelacak ritme sama sekali.
          </span>
        </span>
      </label>

      <!-- Rewards / Seeds Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="enableRewardsToggle" class="faith-toggle-input" ${enableRewards ? 'checked' : ''}>
        <span class="text-sm">
          <b>Sistem Benih & kosmetik taman</b><br>
          <span class="mute text-xs">
            Mengumpulkan benih dari latihan untuk merawat Tunas dan mempercantik taman. Matikan jika kamu memilih pengalaman minimalis tanpa sistem hadiah.
          </span>
        </span>
      </label>

      <!-- Faith Perspective Opt-In Setting (Default Off) -->
      <label class="faith-toggle-label" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
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
    <div class="card mb-3">
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
  // Weekly Goal Options Selection
  container.querySelectorAll('.weekly-goal-option').forEach(btn => {
    btn.onclick = () => {
      const val = Number(btn.dataset.goalVal);
      store.setWeeklyGoal(val);
      rerender();
    };
  });

  // Cosmetic Buy Buttons
  container.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
    btn.onclick = () => {
      const itemId = btn.dataset.id;
      const res = purchaseCosmetic(store, itemId);
      if (res.success) {
        rerender();
      } else {
        alert(res.message);
      }
    };
  });

  // Cosmetic Equip Buttons
  container.querySelectorAll('.equip-cosmetic-btn').forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.cat;
      const itemId = btn.dataset.id;
      equipCosmetic(store, cat, itemId);
      rerender();
    };
  });

  // Settings Toggles
  const ritmeToggle = container.querySelector('#enableRitmeToggle');
  if (ritmeToggle) {
    ritmeToggle.onchange = () => {
      store.setEnableRitme(ritmeToggle.checked);
      rerender();
    };
  }

  const rewardsToggle = container.querySelector('#enableRewardsToggle');
  if (rewardsToggle) {
    rewardsToggle.onchange = () => {
      store.setEnableRewards(rewardsToggle.checked);
      rerender();
    };
  }

  const faithToggle = container.querySelector('#faithPerspectiveToggle');
  if (faithToggle) {
    faithToggle.onchange = () => {
      store.setFaithPerspective(faithToggle.checked);
      rerender();
    };
  }

  // Backup & Wipe Data
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
