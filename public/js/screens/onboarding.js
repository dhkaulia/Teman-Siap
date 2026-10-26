/**
 * Screen: Onboarding
 * 3-step gentle setup: Stage -> Priority Goals -> 1-Min Checkin
 * Rules: Zero fake data, private by default.
 */
import { CONTENT } from '../../content.js';
import { esc } from '../ui/utils.js';

let tempOnboarding = {
  stage: null,
  goals: [],
  emotion: null,
  need: null
};

export function renderOnboarding(store) {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    return `
      <div class="card onboard-hero">
        <div class="onboard-icon" aria-hidden="true">🌱</div>
        <h1 class="mb-1">Teman Siap</h1>
        <p class="onboard-subtitle">
          Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.
        </p>
        <p class="mute onboard-desc">
          Menjelang pernikahan bukan hanya tentang membagi biaya resepsi. Ini tentang menyelaraskan emosi, kebiasaan belanja, ekspektasi keluarga besar, dan cara berbicara berdua.
        </p>

        <div class="privacy-banner">
          <div class="privacy-banner-title">
            🔒 Privasi Penuh Tanpa Syarat
          </div>
          <div class="privacy-banner-text">
            Tidak perlu akun atau email. Semua data tersimpan aman di browsermu dan tidak pernah dibagikan tanpa izinmu.
          </div>
        </div>

        <button type="button" class="primary w-full" id="startOnboardBtn">
          Mulai Langkah Pertama (3 Menit) →
        </button>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <div class="card">
        <span class="card-tag">Langkah 1 dari 3</span>
        <h2>Tahap hidupmu saat ini</h2>
        <p class="mute">Teman Siap menyesuaikan contoh latihan dengan situasi aslimu.</p>

        <label for="onboardStageSelect">Pilih tahap hidup:</label>
        <select id="onboardStageSelect">
          <option value="" disabled ${!tempOnboarding.stage ? 'selected' : ''}>-- Pilih salah satu --</option>
          <option value="Mempersiapkan pernikahan" ${tempOnboarding.stage === 'Mempersiapkan pernikahan' ? 'selected' : ''}>Mempersiapkan pernikahan (Calon Pengantin)</option>
          <option value="Sudah bertunangan" ${tempOnboarding.stage === 'Sudah bertunangan' ? 'selected' : ''}>Sudah bertunangan / Dalam proses lamaran</option>
          <option value="Pengantin baru / Newlyweds" ${tempOnboarding.stage === 'Pengantin baru / Newlyweds' ? 'selected' : ''}>Pengantin baru (1–3 tahun pertama)</option>
          <option value="Menjelajah untuk diri sendiri" ${tempOnboarding.stage === 'Menjelajah untuk diri sendiri' ? 'selected' : ''}>Menjelajah untuk pemahaman diri sendiri</option>
          <option value="Tidak ingin menjawab" ${tempOnboarding.stage === 'Tidak ingin menjawab' ? 'selected' : ''}>Lebih nyaman tidak menjawab</option>
        </select>

        <h3 class="mt-3">Tujuan yang ingin kamu utamakan:</h3>
        <p class="mute">Boleh pilih atau dilewati:</p>

        <div class="pill-list">
          ${[
            'Mengenali emosi & pemicu belanja',
            'Kurangi belanja impulsif / lapar mata',
            'Mengatasi rasa takut mengecek saldo',
            'Komunikasi uang tanpa pertengkaran',
            'Bantuan keluarga / sandwich generation',
            'Membangun tabungan dana cadangan'
          ].map(g => `
            <button type="button" class="pill-item ${tempOnboarding.goals.includes(g) ? 'active' : ''}" data-onboard-goal="${esc(g)}">
              ${esc(g)}
            </button>
          `).join('')}
        </div>

        <div class="btn-group mt-3">
          <button type="button" class="primary w-full" id="onboardStep2Next">Lanjut ke Cek Diri Sejenak →</button>
        </div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="card">
        <span class="card-tag saffron">Langkah 2 dari 3 • Cek Awal</span>
        <h2>Sapa perasaanmu 1 menit</h2>
        <p class="mute">Sebelum mulai, mari berhenti sejenak. Apa yang paling dominan kamu rasakan sekarang?</p>

        <div class="chip-grid">
          ${CONTENT.emotions.slice(0, 6).map(e => `
            <button type="button" class="chip ${tempOnboarding.emotion === e.label ? 'active' : ''}" data-onboard-emo="${esc(e.label)}" aria-pressed="${tempOnboarding.emotion === e.label}">
              <span class="chip-icon">${e.icon}</span>
              <div class="chip-col">
                <span class="chip-label">${esc(e.label)}</span>
                <span class="chip-hint">${store.d.faithPerspective && e.faithHint ? esc(e.faithHint) : esc(e.hint)}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <label for="onboardNeedSelect" class="mt-3">Apa satu hal yang paling kamu butuhkan hari ini? (Boleh lewati)</label>
        <select id="onboardNeedSelect">
          <option value="">-- Lewati jika belum tahu --</option>
          ${CONTENT.needs.map(n => `
            <option value="${esc(n)}" ${tempOnboarding.need === n ? 'selected' : ''}>${esc(n)}</option>
          `).join('')}
        </select>

        <div class="btn-group mt-3">
          <button type="button" class="primary w-full" id="onboardFinishBtn">Selesaikan & Masuk ke Beranda ✨</button>
        </div>
      </div>
    `;
  }

  return '';
}

export function bindOnboarding(container, store, navigate, rerender) {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    const btn = container.querySelector('#startOnboardBtn');
    if (btn) {
      btn.onclick = () => {
        store.set({ onboardingStep: 2 });
        rerender();
      };
    }
  } else if (step === 2) {
    container.querySelectorAll('[data-onboard-goal]').forEach(btn => {
      btn.onclick = () => {
        const g = btn.dataset.onboardGoal;
        if (tempOnboarding.goals.includes(g)) {
          tempOnboarding.goals = tempOnboarding.goals.filter(x => x !== g);
        } else {
          tempOnboarding.goals.push(g);
        }
        rerender();
      };
    });

    const nextBtn = container.querySelector('#onboardStep2Next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const sel = container.querySelector('#onboardStageSelect');
        tempOnboarding.stage = (sel && sel.value) ? sel.value : 'Mempersiapkan pernikahan';
        store.set({ onboardingStep: 3 });
        rerender();
      };
    }
  } else if (step === 3) {
    container.querySelectorAll('[data-onboard-emo]').forEach(btn => {
      btn.onclick = () => {
        tempOnboarding.emotion = btn.dataset.onboardEmo;
        rerender();
      };
    });

    const finishBtn = container.querySelector('#onboardFinishBtn');
    if (finishBtn) {
      finishBtn.onclick = () => {
        const needSel = container.querySelector('#onboardNeedSelect');
        tempOnboarding.need = needSel ? needSel.value : '';

        store.set(state => {
          const checkins = [...(state.checkins || [])];
          if (tempOnboarding.emotion) {
            checkins.push({
              emotion: tempOnboarding.emotion,
              need: tempOnboarding.need || '',
              sensations: [],
              note: '',
              at: Date.now()
            });
          }
          return {
            ...state,
            stage: tempOnboarding.stage || 'Mempersiapkan pernikahan',
            goals: tempOnboarding.goals,
            checkins,
            onboardingStep: null
          };
        });

        navigate('home');
      };
    }
  }
}
