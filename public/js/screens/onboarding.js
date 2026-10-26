/**
 * Screen: Onboarding
 * 
 * Rules:
 * - One question per screen, NO dropdowns anywhere.
 * 1. Welcome (privacy promise, "Mulai" in thumb zone, "Lihat-lihat dulu" as guest).
 * 2. Stage: ChoiceTiles (5 options).
 * 3. What matters: multi-select ChoiceTiles, skippable.
 * 4. A first 60-second practice (the Breather) BEFORE any account or name prompt.
 * 5. Warm closing line and pointer to Home. Do not ask for email; accounts come later.
 * - Persist progress between steps.
 */

import { ChoiceTiles } from '../ui/choiceTiles.js';
import { Breather } from '../ui/breather.js';
import { esc } from '../ui/utils.js';
import { WEEKLY_GOAL_OPTIONS } from '../rewards.js';
import { COPY } from '../copy.js';

const STAGE_OPTIONS = [
  {
    value: 'Mempersiapkan pernikahan',
    label: 'Mempersiapkan pernikahan',
    icon: '💍',
    hint: 'Sedang merencanakan hari pernikahan bersama'
  },
  {
    value: 'Sudah bertunangan',
    label: 'Sudah bertunangan',
    icon: '✨',
    hint: 'Dalam proses lamaran atau pembicaraan keluarga'
  },
  {
    value: 'Pengantin baru (Newlyweds)',
    label: 'Pengantin baru (Newlyweds)',
    icon: '🏡',
    hint: 'Menjalani 1–3 tahun pertama rumah tangga'
  },
  {
    value: 'Menjelajah untuk diri sendiri',
    label: 'Menjelajah untuk diri sendiri',
    icon: '🌱',
    hint: 'Membangun kesiapan emosi & finansial mandiri'
  },
  {
    value: 'Lebih nyaman tidak menjawab',
    label: 'Lebih nyaman tidak menjawab',
    icon: '🔒',
    hint: 'Privat sepenuhnya'
  }
];

const WHAT_MATTERS_OPTIONS = [
  {
    value: 'Mengenali emosi & lapar mata',
    label: 'Mengenali emosi & lapar mata',
    icon: '⚡',
    hint: 'Jeda belanja impulsif saat stres'
  },
  {
    value: 'Mengatasi cemas cek saldo',
    label: 'Mengatasi cemas cek saldo',
    icon: '🪙',
    hint: 'Mencatat uang dengan tenang tanpa rasa bersalah'
  },
  {
    value: 'Bicara uang tanpa bertengkar',
    label: 'Bicara uang tanpa bertengkar',
    icon: '🤝',
    hint: 'Mendengarkan sudut pandang pasangan secara aman'
  },
  {
    value: 'Bantuan keluarga & sandwich gen',
    label: 'Bantuan keluarga & sandwich gen',
    icon: '🌿',
    hint: 'Menentukan batas berbakti yang adil'
  },
  {
    value: 'Membangun dana cadangan',
    label: 'Membangun dana cadangan',
    icon: '🎯',
    hint: 'Menabung sedikit demi sedikit untuk masa depan'
  }
];

export function renderOnboarding(store) {
  const d = store.d;
  const step = d.onboardingStep || 1;

  // -------------------------------------------------------------
  // Step 1: Welcome Screen
  // -------------------------------------------------------------
  if (step === 1) {
    return `
      <div class="card onboard-hero mb-3">
        <div class="onboard-icon" aria-hidden="true">🌱</div>
        <h1 class="mb-1">Teman Siap</h1>
        <p class="onboard-subtitle">
          Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.
        </p>
        <p class="mute onboard-desc">
          Menjelang pernikahan bukan hanya tentang membagi biaya resepsi. Ini tentang menyelaraskan emosi, kebiasaan belanja, ekspektasi keluarga besar, dan cara berbicara berdua.
        </p>

        <!-- Privacy Promise -->
        <div class="privacy-banner mb-4">
          <div class="privacy-banner-title">
            🔒 Privasi Penuh Tanpa Syarat
          </div>
          <div class="privacy-banner-text">
            Semua catatan tersimpan secara lokal di ponselmu. Tanpa akun, tanpa email, dan tanpa pelacak iklan.
          </div>
        </div>

        <!-- Thumb Zone Actions -->
        <div class="flex flex-col gap-2">
          <button type="button" class="primary w-full" id="onboardStartBtn">
            Mulai Langkah Pertama →
          </button>
          <button type="button" class="secondary w-full" id="onboardGuestBtn">
            Lihat-lihat dulu (Mode Tamu)
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Step 2: Stage Screen (ChoiceTiles, 5 options, NO dropdowns)
  // -------------------------------------------------------------
  if (step === 2) {
    return `
      <div class="card mb-3">
        <span class="card-tag saffron">Langkah 1 dari 4 • Tahap Hidup</span>
        <h2 class="mt-2 mb-1">Tahap hidupmu saat ini</h2>
        <p class="mute text-xs mb-3">
          Teman Siap menyesuaikan contoh latihan dan refleksi dengan situasimu saat ini:
        </p>

        <div id="stageChoiceTilesMount" class="mb-4"></div>

        <div class="sticky-bottom-action">
          <button type="button" class="primary w-full" id="onboardStageNextBtn">
            Lanjut ke Fokus Utama →
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Step 3: What Matters Screen (Multi-Select ChoiceTiles, Skippable)
  // -------------------------------------------------------------
  if (step === 3) {
    return `
      <div class="card mb-3">
        <span class="card-tag plum">Langkah 2 dari 4 • Fokus Utama</span>
        <h2 class="mt-2 mb-1">Apa yang paling ingin kamu latih?</h2>
        <p class="mute text-xs mb-3">
          Pilih satu atau lebih yang paling relevan bagimu saat ini. Langkah ini dapat dilewati:
        </p>

        <div id="whatMattersTilesMount" class="mb-4"></div>

        <div class="flex flex-col gap-2">
          <button type="button" class="primary w-full" id="onboardMattersNextBtn">
            Lanjut ke Latihan Pertama (60 Detik) →
          </button>
          <button type="button" class="secondary w-full btn-action-sm" id="onboardMattersSkipBtn">
            Lewati untuk sekarang
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Step 4: First 60-Second Practice (The Breather)
  // -------------------------------------------------------------
  if (step === 4) {
    return `
      <div class="card text-center mb-3">
        <span class="card-tag saffron">Langkah 3 dari 4 • Latihan Pertama</span>
        <h2 class="mt-2 mb-1">Latihan Pertama: Napas Tenang</h2>
        <p class="mute text-xs mb-3">
          Sebelum mulai menjelajah, mari beri tubuhmu jeda sejenak (60 detik).
        </p>

        <div id="breatherWidgetMount" class="mb-4"></div>

        <p class="mute text-xs mb-3">
          Latihan napas 4-4-6 membantu menstabilkan detak jantung dan merilekskan sistem sarafmu.
        </p>

        <div class="sticky-bottom-action">
          <button type="button" class="primary w-full" id="onboardBreatherFinishBtn">
            Lanjut ke Ringkasan Selesai →
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Step 5: Warm Closing Line & Pointer to Home (No email prompt)
  // -------------------------------------------------------------
  if (step === 5) {
    const currentGoal = Number(store.d.weeklyGoal) || 3;

    return `
      <div class="card onboard-hero text-center mb-3">
        <div class="onboard-icon" aria-hidden="true">✨</div>
        <h2 class="mt-1 mb-2">${COPY.onboarding.step5Title}</h2>
        <p class="onboard-subtitle mb-3">
          ${COPY.onboarding.step5Subtitle}
        </p>
        <p class="mute onboard-desc text-left mb-4">
          ${COPY.onboarding.step5Desc}
        </p>

        <!-- Weekly Goal Selector (No dropdowns) -->
        <div class="weekly-goal-card text-left mb-4">
          <span class="card-tag saffron mb-1">${COPY.onboarding.step5GoalTitle}</span>
          <h3 class="mt-1 mb-1">${COPY.onboarding.step5GoalQuestion}</h3>
          <p class="mute text-xs mb-3">
            ${COPY.onboarding.step5GoalHint}
          </p>
          <div class="weekly-goal-options" role="radiogroup" aria-label="Target ritme mingguan">
            ${WEEKLY_GOAL_OPTIONS.map(opt => {
              const isSelected = currentGoal === opt.value;
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

        <div class="neutral-guidance-box text-left mb-4">
          🔒 <b>Catatan Privasi:</b> Seluruh refleksi dan catatanmu disimpan aman di perangkatmu sendiri. Kami tidak meminta email atau kata sandi; akun sinkronisasi cloud bersifat opsional dan baru hadir nanti.
        </div>

        <div class="sticky-bottom-action">
          <button type="button" class="primary w-full" id="onboardEnterHomeBtn">
            Masuk ke Beranda ✨
          </button>
        </div>
      </div>
    `;
  }

  return '';
}

export function bindOnboarding(container, store, navigate, rerender) {
  const step = store.d.onboardingStep || 1;

  // -------------------------------------------------------------
  // Bind Step 1: Welcome
  // -------------------------------------------------------------
  if (step === 1) {
    const startBtn = container.querySelector('#onboardStartBtn');
    if (startBtn) {
      startBtn.onclick = () => {
        store.set({ onboardingStep: 2 });
        rerender();
      };
    }

    const guestBtn = container.querySelector('#onboardGuestBtn');
    if (guestBtn) {
      guestBtn.onclick = () => {
        store.set({
          stage: 'Menjelajah sebagai tamu',
          onboardingStep: 5,
          onboardingComplete: true
        });
        navigate('home');
      };
    }
  }

  // -------------------------------------------------------------
  // Bind Step 2: Stage (ChoiceTiles, 5 options)
  // -------------------------------------------------------------
  else if (step === 2) {
    const mountEl = container.querySelector('#stageChoiceTilesMount');
    let selectedStage = store.d.stage || STAGE_OPTIONS[0].value;

    if (mountEl) {
      new ChoiceTiles({
        container: mountEl,
        items: STAGE_OPTIONS,
        selected: selectedStage,
        multiple: false,
        onChange: (val) => {
          selectedStage = val;
          store.set({ stage: val });
        }
      });
    }

    const nextBtn = container.querySelector('#onboardStageNextBtn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        store.set({
          stage: selectedStage,
          onboardingStep: 3
        });
        rerender();
      };
    }
  }

  // -------------------------------------------------------------
  // Bind Step 3: What Matters (Multi-select ChoiceTiles)
  // -------------------------------------------------------------
  else if (step === 3) {
    const mountEl = container.querySelector('#whatMattersTilesMount');
    let selectedGoals = Array.isArray(store.d.goals) ? [...store.d.goals] : [];

    if (mountEl) {
      new ChoiceTiles({
        container: mountEl,
        items: WHAT_MATTERS_OPTIONS,
        selected: selectedGoals,
        multiple: true,
        onChange: (vals) => {
          selectedGoals = Array.isArray(vals) ? vals : [vals].filter(Boolean);
          store.set({ goals: selectedGoals });
        }
      });
    }

    const nextBtn = container.querySelector('#onboardMattersNextBtn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        store.set({
          goals: selectedGoals,
          onboardingStep: 4
        });
        rerender();
      };
    }

    const skipBtn = container.querySelector('#onboardMattersSkipBtn');
    if (skipBtn) {
      skipBtn.onclick = () => {
        store.set({
          goals: [],
          onboardingStep: 4
        });
        rerender();
      };
    }
  }

  // -------------------------------------------------------------
  // Bind Step 4: First 60-Second Practice (The Breather)
  // -------------------------------------------------------------
  else if (step === 4) {
    const mountEl = container.querySelector('#breatherWidgetMount');
    if (mountEl) {
      new Breather({
        container: mountEl,
        totalCycles: 4, // 4 cycles * 14s = 56s (~60s)
        onComplete: () => {
          store.addPause({
            type: 'breathing',
            durationSec: 60,
            feedback: 'selesai',
            at: Date.now()
          });
        }
      });
    }

    const finishBtn = container.querySelector('#onboardBreatherFinishBtn');
    if (finishBtn) {
      finishBtn.onclick = () => {
        store.set({ onboardingStep: 5 });
        rerender();
      };
    }
  }

  // -------------------------------------------------------------
  // Bind Step 5: Warm Closing Line & Enter Home
  // -------------------------------------------------------------
  else if (step === 5) {
    container.querySelectorAll('.weekly-goal-option').forEach(btn => {
      btn.onclick = () => {
        const val = Number(btn.dataset.goalVal);
        store.set({ weeklyGoal: val });
        rerender();
      };
    });

    const enterHomeBtn = container.querySelector('#onboardEnterHomeBtn');
    if (enterHomeBtn) {
      enterHomeBtn.onclick = () => {
        store.set({
          onboardingComplete: true,
          stage: store.d.stage || 'Persiapan Bersama'
        });
        navigate('home');
      };
    }
  }
}
