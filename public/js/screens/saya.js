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
    <div class="card-title-row mb-1">
      <div>
        <span class="card-tag">${COPY.saya.tag}</span>
        <h1 class="mt-1 mb-1">${COPY.saya.title}</h1>
      </div>
    </div>
    <p class="mute text-sm mb-3">
      ${COPY.saya.subtitle}
    </p>

    <!-- Mascot Growth Companion Card -->
    <div class="card mb-3" style="display: flex; align-items: center; gap: var(--space-3);">
      <div style="flex-shrink: 0;">
        ${renderMascot('cheer', 64, { stage: mascotStage.id, label: `Tunas ${mascotStage.name}` })}
      </div>
      <div>
        <span class="card-tag tunas mb-1">Fase: ${esc(mascotStage.name)}</span>
        <h3 class="mt-1 mb-1">${COPY.saya.companionTitle}</h3>
        <span class="mute text-xs">${totalPractices} latihan selesai</span>
      </div>
    </div>

    <!-- Kebun Saya (Private Milestones Grid, No Sharing, No Ranking) -->
    <section class="card mb-3" aria-labelledby="kebunSayaHeading">
      <div class="card-title-row mb-2">
        <h3 id="kebunSayaHeading" class="mb-0">${COPY.saya.kebunTitle}</h3>
        <span class="card-tag tunas">${COPY.saya.kebunTag}</span>
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

    <!-- Target & Ritme Mingguan (Gentle, No Daily Streak, 2 Libur/Bulan) -->
    <section class="card mb-3" aria-labelledby="ritmeHeading">
      <div class="card-title-row mb-2">
        <h3 id="ritmeHeading" class="mb-0">${COPY.saya.ritmeTitle}</h3>
        <span class="card-tag saffron">${COPY.saya.ritmeTag}</span>
      </div>

      ${enableRitme ? `
        <!-- Current Status Box -->
        <div class="ritme-status-box mb-3">
          <div class="flex items-center justify-between mb-1">
            <div class="font-bold text-sm">${esc(ritme.statusText)}</div>
            <button type="button" class="unit-learn-btn" id="learnLiburBtn" aria-label="Pelajari Libur Otomatis">
              Pelajari
            </button>
          </div>
          <div class="flex gap-2 flex-wrap mt-2">
            <span class="card-tag tunas">${ritme.currentWeekPractices} dari ${ritme.weeklyGoal} langkah</span>
            <span class="card-tag saffron">Libur: ${ritme.liburRemainingThisMonth} pekan</span>
          </div>
        </div>

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
        <h3 id="koleksiHeading" class="mb-0">${COPY.saya.koleksiTitle}</h3>
        ${enableRewards ? `<span class="path-seeds-pill"><b>${seeds}</b> Benih</span>` : '<span class="card-tag">Nonaktif</span>'}
      </div>

      ${enableRewards ? `
        <!-- Cosmetic Categories -->
        <div class="cosmetics-section">
          <!-- Pots -->
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

          <!-- Outfits -->
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

          <!-- Backgrounds -->
          <h4 class="text-sm font-bold mt-2 mb-2">Latar</h4>
          <div class="cosmetics-grid mb-2">
            ${COSMETICS_CATALOG.filter(c => c.category === 'background').map(item => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = equipped.background === item.id;
              return `
                <div class="cosmetic-item-card ${isEquipped ? 'is-equipped' : ''}">
                  <div class="cosmetic-icon-wrap" aria-hidden="true">${item.icon}</div>
                  <div class="cosmetic-name">${esc(item.name)}</div>
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
      <div class="card-title-row mb-2">
        <h3 class="mb-0">${COPY.saya.historyTitle}</h3>
        <span class="card-tag saffron">${COPY.saya.historyTag}</span>
      </div>

      <ul class="profile-history-list">
        <li>Cek emosi tersimpan: <b>${d.checkins ? d.checkins.length : 0} kali</b></li>
        <li>Pengeluaran sadar tercatat: <b>${d.expenses ? d.expenses.length : 0} transaksi</b></li>
        <li>Jeda belanja (Urge Surfing): <b>${d.pauses ? d.pauses.length : 0} kali</b></li>
        <li>Rencana Jika-Maka aktif: <b>${d.plans ? d.plans.length : 0} rencana</b></li>
        <li>Topik percakapan terisi: <b>${Object.keys(d.partnerA || {}).length} topik</b></li>
        <li>Langkah kurikulum selesai: <b>${d.completedPathNodes ? d.completedPathNodes.length : 0} modul</b></li>
      </ul>
    </div>

    <!-- Preferences & Admin Controls Tile (Opens Bottom Sheet) -->
    <div class="card mb-4">
      <button type="button" class="exercise-row w-full text-left" id="openSettingsSheetBtn" aria-label="Buka Pengaturan & Privasi">
        <span class="exercise-icon" aria-hidden="true">${renderIcon('settings')}</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Pengaturan & Data</div>
        </div>
        <span class="card-tag saffron">Preferensi</span>
        <span class="exercise-row-arrow" aria-hidden="true">${renderIcon('arrowRight')}</span>
      </button>
    </div>
  `;
}

export function bindSelf(container, store, navigate, rerender) {
  // Weekly Goal Options Selection
  container.querySelectorAll('.weekly-goal-option').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const val = Number(btn.dataset.goalVal);
      store.setWeeklyGoal(val);
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

  // Cosmetic Buy Buttons
  container.querySelectorAll('.buy-cosmetic-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
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
      playTapSound();
      triggerHapticTap();
      const cat = btn.dataset.cat;
      const itemId = btn.dataset.id;
      equipCosmetic(store, cat, itemId);
      rerender();
    };
  });

  // Settings & Data Bottom Sheet Trigger
  const openSettingsSheetBtn = container.querySelector('#openSettingsSheetBtn');
  if (openSettingsSheetBtn) {
    openSettingsSheetBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      openSettingsBottomSheet(store, rerender);
    };
  }
}

/**
 * Settings & Data Bottom Sheet
 * Moves admin controls, preferences, and data sovereignty off primary view into bottom sheet.
 */
function openSettingsBottomSheet(store, rerender) {
  const d = store.d || {};
  const support = typeof SUPPORT_DATA !== 'undefined' ? SUPPORT_DATA : null;
  const enableRitme = d.enableRitme !== false;
  const enableRewards = d.enableRewards !== false;
  const enableEffects = d.enableEffects !== false && isCelebrationEnabled();
  const enableSound = Boolean(d.enableSound || isSoundEnabled());
  const enableHaptics = Boolean(d.enableHaptics || isHapticsEnabled());
  const currentThemeMode = d.themeMode || (typeof localStorage !== 'undefined' ? localStorage.getItem('temansiap_theme_mode') : null) || 'auto';

  const sheet = new BottomSheet();
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="p-1">
      <div class="card-title-row mb-2">
        <h3 class="mt-0 mb-0">Preferensi & Pengaturan</h3>
        <span class="card-tag">Pengaturan</span>
      </div>

      <!-- Manual Theme Choice (Otomatis / Terang / Gelap) -->
      <div class="mb-4">
        <div class="font-bold text-xs text-ink-primary mb-2">Tema Tampilan:</div>
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

      <!-- Ritme Tracker Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetEnableRitmeToggle" class="faith-toggle-input" ${enableRitme ? 'checked' : ''}>
        <span class="text-sm">
          <b>Lacak ritme mingguan</b><br>
          <span class="mute text-xs">Hitungan mingguan santai dengan perlindungan libur.</span>
        </span>
      </label>

      <!-- Rewards / Seeds Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetEnableRewardsToggle" class="faith-toggle-input" ${enableRewards ? 'checked' : ''}>
        <span class="text-sm">
          <b>Sistem Benih & kosmetik</b><br>
          <span class="mute text-xs">Kumpulkan benih dari latihan untuk Tunas.</span>
        </span>
      </label>

      <!-- Celebration & Animation Effects Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetEnableEffectsToggle" class="faith-toggle-input" ${enableEffects ? 'checked' : ''}>
        <span class="text-sm">
          <b>Efek perayaan & animasi</b><br>
          <span class="mute text-xs">Animasi konfeti saat menyelesaikan sesi.</span>
        </span>
      </label>

      <!-- Sound Effects Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetEnableSoundToggle" class="faith-toggle-input" ${enableSound ? 'checked' : ''}>
        <span class="text-sm">
          <b>Efek suara lembut</b><br>
          <span class="mute text-xs">Nada akustik lembut saat memilih opsi.</span>
        </span>
      </label>

      <!-- Haptics Toggle -->
      <label class="faith-toggle-label mb-3" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetEnableHapticsToggle" class="faith-toggle-input" ${enableHaptics ? 'checked' : ''}>
        <span class="text-sm">
          <b>Getaran sentuhan (Haptics)</b><br>
          <span class="mute text-xs">Getaran mikro 10ms saat menyentuh tombol.</span>
        </span>
      </label>

      <!-- Faith Perspective Toggle -->
      <label class="faith-toggle-label mb-4" style="display: flex; gap: var(--space-3); align-items: flex-start; cursor: pointer;">
        <input type="checkbox" id="sheetFaithPerspectiveToggle" class="faith-toggle-input" ${d.faithPerspective ? 'checked' : ''}>
        <span class="text-sm">
          <b>Sudut pandang nilai iman</b><br>
          <span class="mute text-xs">Sertakan perspektif sabar, syukur, dan qanaah.</span>
        </span>
      </label>

      <div class="card-title-row mb-2">
        <h3 class="mt-0 mb-0">Kedaulatan Data & Cadangan</h3>
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

      <div class="card card-border-teal p-3 mb-3">
        <h4 class="text-teal font-bold text-xs mt-0 mb-1">Bantuan & Dukungan Darurat</h4>
        <p class="mute text-xs mb-2">${support ? esc(support.disclaimer) : 'Aplikasi ini adalah sarana edukasi mandiri.'}</p>
        ${support && support.hotlines ? `
          <div class="support-hotline-list">
            ${support.hotlines.map(h => `
              <div class="support-hotline-item text-xs mb-1">
                <b>${esc(h.name)}:</b> ${esc(h.contact)}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <button type="button" class="primary w-full btn-action-sm" id="closeSettingsSheetBtn">
        Tutup Pengaturan
      </button>
    </div>
  `;

  sheet.open({ title: 'Pengaturan & Privasi', content });

  content.querySelector('#closeSettingsSheetBtn').onclick = () => sheet.close();

  // Manual Theme Selector (Otomatis / Terang / Gelap)
  content.querySelectorAll('.theme-choice-btn').forEach(btn => {
    btn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const mode = btn.dataset.themeVal;
      store.setThemeMode(mode);
      applyTheme(mode);
      content.querySelectorAll('.theme-choice-btn').forEach(b => {
        b.classList.toggle('is-active', b.dataset.themeVal === mode);
      });
      rerender();
    };
  });

  const ritmeToggle = content.querySelector('#sheetEnableRitmeToggle');
  if (ritmeToggle) {
    ritmeToggle.onchange = () => {
      store.setEnableRitme(ritmeToggle.checked);
      rerender();
    };
  }

  const rewardsToggle = content.querySelector('#sheetEnableRewardsToggle');
  if (rewardsToggle) {
    rewardsToggle.onchange = () => {
      store.setEnableRewards(rewardsToggle.checked);
      rerender();
    };
  }

  const effectsToggle = content.querySelector('#sheetEnableEffectsToggle');
  if (effectsToggle) {
    effectsToggle.onchange = () => {
      const active = effectsToggle.checked;
      store.setEnableEffects(active);
      setCelebrationEnabled(active);
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('effects-disabled', !active);
      }
      rerender();
    };
  }

  const soundToggle = content.querySelector('#sheetEnableSoundToggle');
  if (soundToggle) {
    soundToggle.onchange = () => {
      const active = soundToggle.checked;
      store.setEnableSound(active);
      setSoundEnabled(active);
      rerender();
    };
  }

  const hapticsToggle = content.querySelector('#sheetEnableHapticsToggle');
  if (hapticsToggle) {
    hapticsToggle.onchange = () => {
      const active = hapticsToggle.checked;
      store.setEnableHaptics(active);
      setHapticsEnabled(active);
      rerender();
    };
  }

  const faithToggle = content.querySelector('#sheetFaithPerspectiveToggle');
  if (faithToggle) {
    faithToggle.onchange = () => {
      store.setFaithPerspective(faithToggle.checked);
      rerender();
    };
  }

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
}
