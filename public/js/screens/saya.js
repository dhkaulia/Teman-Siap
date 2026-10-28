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
import { COPY } from '../copy.js';
import { renderIcon } from '../ui/icons.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { setCelebrationEnabled, isCelebrationEnabled } from '../ui/confetti.js';
import { setSoundEnabled, isSoundEnabled, setHapticsEnabled, isHapticsEnabled, playTapSound, triggerHapticTap } from '../ui/feedback.js';
import { applyTheme } from '../main.js';

export function renderSelf(store) {
  const d = store.d || {};
  const totalPractices = getTotalPractices(d);
  const mascotStage = getMascotStage(totalPractices);

  const enableRitme = d.enableRitme !== false;
  const enableRewards = d.enableRewards !== false;
  const seeds = getSeeds(d);
  const ritme = calculateRitme(d);
  const milestones = checkMilestones(d);

  const currentThemeMode = d.themeMode || (typeof localStorage !== 'undefined' ? localStorage.getItem('temansiap_theme_mode') : null) || 'auto';

  return `
    <div class="card-title-row mb-2">
      <h1 class="text-xl display font-bold mb-0">${COPY.saya.title}</h1>
      <span class="card-tag tunas">${esc(mascotStage.name)}</span>
    </div>

    <!-- Kebun Saya (Private Milestones Grid, Under 90 Words Budget) -->
    <section class="card mb-3" aria-labelledby="kebunSayaHeading">
      <div class="card-title-row mb-2">
        <h3 id="kebunSayaHeading" class="mb-0">${COPY.saya.kebunTitle}</h3>
      </div>

      <div class="kebun-grid">
        ${milestones.map((ms, idx) => `
          <button type="button" class="kebun-milestone-card ${ms.unlocked ? 'unlocked' : 'locked'}" data-ms-idx="${idx}" role="button" aria-label="${esc(ms.title)}: ${esc(ms.statusLabel)}">
            <div class="milestone-icon" aria-hidden="true">${ms.icon}</div>
            <div class="milestone-title">${esc(ms.title)}</div>
            <span class="milestone-badge ${ms.unlocked ? 'unlocked' : 'locked'}">
              ${esc(ms.statusLabel)}
            </span>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- Target & Ritme Mingguan (Gentle Count & Libur Row) -->
    <section class="card mb-3" aria-labelledby="ritmeHeading">
      <div class="card-title-row mb-2">
        <h3 id="ritmeHeading" class="mb-0">${COPY.saya.ritmeTitle}</h3>
      </div>

      ${enableRitme ? `
        <div class="ritme-status-box mb-2">
          <div class="font-bold text-xs mb-1">${esc(ritme.statusText)}</div>
          <div class="flex gap-2 flex-wrap items-center justify-between">
            <span class="mute text-xs">${ritme.currentWeekPractices} dari ${ritme.weeklyGoal} langkah</span>
            <span class="card-tag saffron">Libur: ${ritme.liburRemainingThisMonth} pekan</span>
          </div>
        </div>

        <button type="button" class="exercise-row w-full text-left" id="learnLiburBtn" aria-label="Pelajari Libur Otomatis">
          <span class="exercise-icon" aria-hidden="true">${renderIcon('info')}</span>
          <div class="exercise-row-content">
            <div class="exercise-row-title">Tentang Libur Otomatis</div>
          </div>
          <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
        </button>
      ` : `
        <div class="ritme-status-box">
          <div class="mute text-sm">
            Pelacak ritme mingguan sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.
          </div>
        </div>
      `}
    </section>

    <!-- Rows that open bottom sheets: Riwayat Latihan & Koleksi Taman -->
    <div class="card mb-3">
      <button type="button" class="exercise-row w-full text-left mb-2" id="openHistorySheetBtn" aria-label="Buka Riwayat Latihan">
        <span class="exercise-icon" aria-hidden="true">${renderIcon('plan')}</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Riwayat Latihan</div>
        </div>
        <span class="card-tag">${totalPractices}</span>
        <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
      </button>

      ${enableRewards ? `
        <button type="button" class="exercise-row w-full text-left" id="openKoleksiSheetBtn" aria-label="Buka Koleksi Taman">
          <span class="exercise-icon" aria-hidden="true">${renderIcon('sprout')}</span>
          <div class="exercise-row-content">
            <div class="exercise-row-title">Koleksi Taman</div>
          </div>
          <span class="path-seeds-pill"><b>${seeds}</b> Benih</span>
          <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
        </button>
      ` : `
        <div class="mute text-xs">
          Sistem hadiah Benih dan kosmetik taman sedang dinonaktifkan.
        </div>
      `}
    </div>

    <!-- Short Settings List on Main Screen -->
    <div class="card mb-4">
      <div class="card-title-row mb-2">
        <h3 class="mb-0">Pengaturan</h3>
      </div>

      <!-- Manual Theme Switch (Otomatis / Terang / Gelap) -->
      <div class="mb-3">
        <div class="text-xs font-bold mb-2">Tema:</div>
        <div class="theme-choice-group flex gap-2">
          <button type="button" class="theme-choice-btn ${currentThemeMode === 'auto' ? 'is-active' : ''}" data-theme-val="auto">
            Otomatis
          </button>
          <button type="button" class="theme-choice-btn ${currentThemeMode === 'light' ? 'is-active' : ''}" data-theme-val="light">
            Terang
          </button>
          <button type="button" class="theme-choice-btn ${currentThemeMode === 'dark' ? 'is-active' : ''}" data-theme-val="dark">
            Gelap
          </button>
        </div>
      </div>

      <!-- Data Backup & Delete Row (Opens Bottom Sheet) -->
      <button type="button" class="exercise-row w-full text-left mb-2" id="openDataSheetBtn" aria-label="Buka Cadangan & Hapus Data">
        <span class="exercise-icon" aria-hidden="true">${renderIcon('settings')}</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Cadangan & Data</div>
        </div>
        <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
      </button>

      <!-- Support Row (Opens Bottom Sheet) -->
      <button type="button" class="exercise-row w-full text-left" id="openSupportSheetBtn" aria-label="Buka Kontak Bantuan">
        <span class="exercise-icon" aria-hidden="true">${renderIcon('info')}</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Kontak Bantuan</div>
        </div>
        <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
      </button>
    </div>
  `;
}

export function bindSelf(container, store, navigate, rerender) {
  // Manual Theme Selector on Main Screen
  container.querySelectorAll('.theme-choice-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const mode = btn.dataset.themeVal;
      store.setThemeMode(mode);
      applyTheme(mode);
      container.querySelectorAll('.theme-choice-btn').forEach(b => {
        b.classList.toggle('is-active', b.dataset.themeVal === mode);
      });
      rerender();
    };
  });

  // Milestone Card Bottom Sheet Tap
  container.querySelectorAll('.kebun-milestone-card').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const idx = Number(btn.dataset.msIdx);
      const milestones = checkMilestones(store.d);
      const ms = milestones[idx];
      if (!ms) return;
      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-1">
          <div class="flex items-center gap-2 mb-2">
            <span style="font-size: 2rem;">${ms.icon}</span>
            <div>
              <h3 class="mt-0 mb-0">${esc(ms.title)}</h3>
              <span class="milestone-badge ${ms.unlocked ? 'unlocked' : 'locked'} mt-1">
                ${esc(ms.statusLabel)}
              </span>
            </div>
          </div>
          <p class="text-sm font-medium mb-3">${esc(ms.desc)}</p>
          <button type="button" class="primary w-full btn-action-sm mt-2" id="closeMilestoneSheetBtn">
            Mengerti
          </button>
        </div>
      `;
      content.querySelector('#closeMilestoneSheetBtn').onclick = () => sheet.close();
      sheet.open({ title: ms.title, content });
    };
  });

  // Pelajari Libur Otomatis Sheet
  const learnLiburBtn = container.querySelector('#learnLiburBtn');
  if (learnLiburBtn) {
    learnLiburBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const ritme = calculateRitme(store.d);
      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-1">
          <span class="card-tag saffron mb-2">Perlindungan Ritme</span>
          <h3 class="mt-1 mb-2">Tentang Libur Otomatis</h3>
          <p class="text-sm font-medium mb-3">
            Jika suatu pekan terasa padat, 2 libur otomatis per bulan akan menjaga ritmemu tetap aman.
          </p>
          <div class="neutral-guidance-box text-xs mb-3">
            Bila terlewat, ritme beristirahat secara netral: <i>"${esc(ritme.neutralMessage)}"</i> tanpa mengurangi benih atau fase pertumbuhan.
          </div>
          <button type="button" class="primary w-full btn-action-sm mt-2" id="closeLiburSheetBtn">
            Mengerti
          </button>
        </div>
      `;
      content.querySelector('#closeLiburSheetBtn').onclick = () => sheet.close();
      sheet.open({ title: 'Libur Otomatis', content });
    };
  }

  // Riwayat Latihan Bottom Sheet
  const openHistorySheetBtn = container.querySelector('#openHistorySheetBtn');
  if (openHistorySheetBtn) {
    openHistorySheetBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const d = store.d || {};
      const sheet = new BottomSheet();
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="p-1">
          <div class="card-title-row mb-2">
            <h3 class="mt-0 mb-0">Riwayat Latihan Pribadi</h3>
            <span class="card-tag saffron">Catatan</span>
          </div>
          <ul class="profile-history-list mb-3">
            <li>Cek emosi tersimpan: <b>${d.checkins ? d.checkins.length : 0} kali</b></li>
            <li>Pengeluaran sadar tercatat: <b>${d.expenses ? d.expenses.length : 0} transaksi</b></li>
            <li>Jeda belanja (Urge Surfing): <b>${d.pauses ? d.pauses.length : 0} kali</b></li>
            <li>Rencana Jika-Maka aktif: <b>${d.plans ? d.plans.length : 0} rencana</b></li>
            <li>Topik percakapan terisi: <b>${Object.keys(d.partnerA || {}).length} topik</b></li>
            <li>Langkah kurikulum selesai: <b>${d.completedPathNodes ? d.completedPathNodes.length : 0} modul</b></li>
          </ul>
          <button type="button" class="primary w-full btn-action-sm" id="closeHistorySheetBtn">
            Tutup
          </button>
        </div>
      `;
      content.querySelector('#closeHistorySheetBtn').onclick = () => sheet.close();
      sheet.open({ title: 'Riwayat Latihan', content });
    };
  }

  // Koleksi Taman Bottom Sheet
  const openKoleksiSheetBtn = container.querySelector('#openKoleksiSheetBtn');
  if (openKoleksiSheetBtn) {
    openKoleksiSheetBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      openKoleksiBottomSheet(store, rerender);
    };
  }

  // Data Backup & Delete Bottom Sheet
  const openDataSheetBtn = container.querySelector('#openDataSheetBtn');
  if (openDataSheetBtn) {
    openDataSheetBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      openDataBottomSheet(store, rerender);
    };
  }

  // Support Hotlines Bottom Sheet
  const openSupportSheetBtn = container.querySelector('#openSupportSheetBtn');
  if (openSupportSheetBtn) {
    openSupportSheetBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      openSupportBottomSheet();
    };
  }
}

/**
 * Koleksi Taman Bottom Sheet (Pots, Outfits, Backgrounds)
 */
function openKoleksiBottomSheet(store, rerender) {
  const d = store.d || {};
  const seeds = getSeeds(d);
  const inventory = Array.isArray(d.inventory) ? d.inventory : ['pot-clay', 'outfit-default', 'bg-default'];
  const equipped = d.equippedCosmetics || { pot: 'pot-clay', outfit: 'outfit-default', background: 'bg-default' };

  const sheet = new BottomSheet();
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="p-1">
      <div class="card-title-row mb-2">
        <h3 class="mt-0 mb-0">Koleksi Taman & Benih</h3>
        <span class="path-seeds-pill"><b>${seeds}</b> Benih</span>
      </div>

      <div class="cosmetics-section mb-3">
        <h4 class="text-sm font-bold mt-2 mb-2">Pilihan Pot</h4>
        <div class="cosmetics-grid mb-3">
          ${COSMETICS_CATALOG.filter(c => c.category === 'pot').map(item => {
            const isOwned = inventory.includes(item.id);
            const isEquipped = equipped.pot === item.id;
            return `
              <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                <div class="cosmetic-name">${esc(item.name)}</div>
                <div class="cosmetic-action-row">
                  ${!isOwned ? `<span class="cosmetic-price-pill">${item.price} Benih</span>` : ''}
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

        <h4 class="text-sm font-bold mt-2 mb-2">Aksesoris</h4>
        <div class="cosmetics-grid mb-3">
          ${COSMETICS_CATALOG.filter(c => c.category === 'outfit').map(item => {
            const isOwned = inventory.includes(item.id);
            const isEquipped = equipped.outfit === item.id;
            return `
              <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                <div class="cosmetic-name">${esc(item.name)}</div>
                <div class="cosmetic-action-row">
                  ${!isOwned ? `<span class="cosmetic-price-pill">${item.price} Benih</span>` : ''}
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
      </div>

      <button type="button" class="primary w-full btn-action-sm" id="closeKoleksiSheetBtn">
        Selesai
      </button>
    </div>
  `;

  content.querySelector('#closeKoleksiSheetBtn').onclick = () => sheet.close();

  content.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const itemId = btn.dataset.id;
      const res = purchaseCosmetic(store, itemId);
      if (res.success) {
        sheet.close();
        rerender();
      } else {
        alert(res.message);
      }
    };
  });

  content.querySelectorAll('.equip-cosmetic-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const cat = btn.dataset.cat;
      const itemId = btn.dataset.id;
      equipCosmetic(store, cat, itemId);
      sheet.close();
      rerender();
    };
  });

  sheet.open({ title: 'Koleksi Taman', content });
}

/**
 * Data Sovereignty Bottom Sheet (Backup & Delete)
 */
function openDataBottomSheet(store, rerender) {
  const sheet = new BottomSheet();
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="p-1">
      <div class="card-title-row mb-2">
        <h3 class="mt-0 mb-0">Cadangan & Hapus Data</h3>
        <span class="card-tag saffron">Lokal</span>
      </div>
      <p class="mute text-xs mb-3">Seluruh catatan tersimpan aman di browsermu.</p>

      <div class="flex gap-2 mb-3">
        <button type="button" class="secondary w-full btn-action-sm" id="sheetExportDataJsonBtn">Unduh Cadangan</button>
        <button type="button" class="secondary text-danger w-full btn-action-sm" id="sheetWipeAllDataBtn">Hapus Semua</button>
      </div>

      <div class="mute text-xs mb-4">
        Sinkronisasi privat dua ponsel jarak jauh (E2EE) sedang disiapkan.
      </div>

      <button type="button" class="primary w-full btn-action-sm" id="closeDataSheetBtn">
        Tutup
      </button>
    </div>
  `;

  content.querySelector('#closeDataSheetBtn').onclick = () => sheet.close();

  const exportBtn = content.querySelector('#sheetExportDataJsonBtn');
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

  const wipeBtn = content.querySelector('#sheetWipeAllDataBtn');
  if (wipeBtn) {
    wipeBtn.onclick = () => {
      if (confirm('Apakah kamu yakin ingin menghapus seluruh data di perangkat ini? Tindakan ini tidak dapat dibatalkan.')) {
        store.wipe();
        location.reload();
      }
    };
  }

  sheet.open({ title: 'Cadangan & Data', content });
}

/**
 * Professional Support Bottom Sheet
 */
function openSupportBottomSheet() {
  const support = typeof SUPPORT_DATA !== 'undefined' ? SUPPORT_DATA : null;
  const sheet = new BottomSheet();
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="p-1">
      <h3 class="mt-0 mb-2">Kontak Bantuan & Dukungan</h3>
      <p class="mute text-xs mb-3">${support ? esc(support.disclaimer) : 'Aplikasi ini adalah sarana edukasi mandiri.'}</p>
      ${support && support.hotlines ? `
        <div class="support-hotline-list mb-3">
          ${support.hotlines.map(h => `
            <div class="support-hotline-item text-xs mb-2">
              <b>${esc(h.name)}:</b> ${esc(h.contact)}
              <div class="mute">${esc(h.desc)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <button type="button" class="primary w-full btn-action-sm" id="closeSupportSheetBtn">
        Tutup
      </button>
    </div>
  `;

  content.querySelector('#closeSupportSheetBtn').onclick = () => sheet.close();
  sheet.open({ title: 'Kontak Bantuan', content });
}
