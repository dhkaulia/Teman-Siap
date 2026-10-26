/**
 * Teman Siap — Mobile-First, Local-First Web App
 * 
 * Architecture Rules Followed:
 * - Mobile-first: 360x740 base up to 480px column on desktop.
 * - 100dvh viewport, safe-area-inset-* compliant.
 * - Touch targets >= 48x48px, >= 8px gap. Primary actions in bottom thumb zone.
 * - Inputs visible above on-screen keyboard (focusin & visualViewport scroll).
 * - Numeric fields use inputmode="numeric".
 * - Body text >= 16px, line length <= 56ch.
 * - Zero shame: no red warnings, no broken streaks, no readiness scores.
 * - Private by default: consent-based couple sharing.
 * - Plain language: clinical specifics tucked into optional <details>.
 * - Every exercise can be skipped or exited anytime.
 * - Never shows data the user did not enter.
 * - Vanilla JS, zero runtime dependencies.
 */

// -------------------------------------------------------------
// State Store (Local-First & Private by Default)
// -------------------------------------------------------------
const store = {
  key: 'temansiap.v3',
  d: null,

  init() {
    const saved = localStorage.getItem(this.key);
    if (saved) {
      try {
        this.d = JSON.parse(saved);
      } catch (e) {
        this.d = null;
      }
    }
    // Never show data the user did not enter: goal and plans start empty
    if (!this.d) {
      this.d = {
        stage: null,
        goals: [],
        checkins: [],
        expenses: [],
        goal: null, // null until user creates one
        plans: [],  // empty until user creates or adopts one
        pauses: [],
        partnerA: {},
        partnerB: {},
        sharedNotes: {},
        currentPerspective: 'A',
        onboardingStep: 1
      };
      this.save();
    }
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.d));
  },

  wipe() {
    localStorage.removeItem(this.key);
    location.reload();
  }
};

store.init();

// Utility helpers
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const idr = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const today = () => new Date().toISOString().slice(0, 10);
const monthKey = () => today().slice(0, 7);

// Active View & Module Sub-States (One primary action per screen)
let currentTab = 'home';
let activeTimer = null;
let timerSeconds = 600; // 10 minutes default for urge surfing
let breathingInterval = null;

// Sub-view filters to keep one focus per screen
let emotionSubView = 'checkin'; // 'checkin' | 'practice'
let selectedEmotion = null;
let selectedSensations = [];
let activeExerciseId = null;

let moneySubView = 'log'; // 'log' | 'urge' | 'goals'
let showNewGoalForm = false;
let activeReframeIndex = 0;

let selectedConvoId = null;

const TABS = [
  { id: 'home', label: 'Beranda', icon: '🏡' },
  { id: 'emo', label: 'Emosi', icon: '🌱' },
  { id: 'money', label: 'Uang', icon: '🪙' },
  { id: 'us', label: 'Kita', icon: '🤝' },
  { id: 'me', label: 'Saya', icon: '👤' }
];

// -------------------------------------------------------------
// Mobile Keyboard & Viewport Protection
// Inputs must never be hidden by the on-screen keyboard
// -------------------------------------------------------------
document.addEventListener('focusin', e => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }
});

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const active = document.activeElement;
    if (active && ['INPUT', 'TEXTAREA'].includes(active.tagName)) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// -------------------------------------------------------------
// Core Recommendation Logic (Notice → Practice)
// Transparent, rule-based, zero-pressure
// -------------------------------------------------------------
function getSuggestedAction() {
  const d = store.d;
  if (!d.checkins || !d.checkins.length) {
    return {
      title: 'Sapa perasaanmu 1 menit',
      desc: 'Mengenali apa yang kamu rasakan hari ini adalah langkah awal ketenangan.',
      tab: 'emo',
      subView: 'checkin',
      btnText: 'Mulai Cek Emosi'
    };
  }
  if (!d.expenses || !d.expenses.length) {
    return {
      title: 'Catat satu pengeluaran sadar',
      desc: 'Hadapi catatan uang tanpa rasa takut. Catat satu angka pengeluaran hari ini.',
      tab: 'money',
      subView: 'log',
      btnText: 'Catat Pengeluaran'
    };
  }
  const hasConvo = (d.partnerA && Object.keys(d.partnerA).length > 0) || (d.partnerB && Object.keys(d.partnerB).length > 0);
  if (!hasConvo) {
    return {
      title: 'Percakapan: Arti Rasa Aman',
      desc: 'Diskusikan apa yang membuatmu dan pasangan merasa aman soal uang.',
      tab: 'us',
      subView: null,
      btnText: 'Mulai Percakapan'
    };
  }
  return {
    title: 'Latihan Jeda Belanja (Urge Surfing)',
    desc: 'Latih kesabaran (sabr) menunda keinginan belanja impulsif dengan jeda hening.',
    tab: 'money',
    subView: 'urge',
    btnText: 'Coba Jeda Belanja'
  };
}

// -------------------------------------------------------------
// Navigation & Main Render Pipeline
// -------------------------------------------------------------
function renderNav() {
  const navEl = $('#nav');
  if (!store.d.stage) {
    navEl.style.display = 'none';
    return;
  }
  navEl.style.display = 'flex';
  navEl.innerHTML = TABS.map(t => `
    <button type="button" data-tab="${t.id}" ${t.id === currentTab ? 'aria-current="page"' : ''} aria-label="${t.label}">
      <span class="nav-icon" aria-hidden="true">${t.icon}</span>
      <span>${t.label}</span>
    </button>
  `).join('');

  navEl.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      navigateTo(btn.dataset.tab);
    };
  });
}

function navigateTo(tabId, subView = null) {
  clearInterval(activeTimer);
  clearInterval(breathingInterval);
  activeTimer = null;
  breathingInterval = null;

  currentTab = tabId;
  if (subView) {
    if (tabId === 'emo') emotionSubView = subView;
    if (tabId === 'money') moneySubView = subView;
  }
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  renderNav();
  const viewEl = $('#view');

  if (!store.d.stage) {
    viewEl.innerHTML = renderOnboarding();
    bindOnboarding();
    return;
  }

  switch (currentTab) {
    case 'home':
      viewEl.innerHTML = renderHome();
      bindHome();
      break;
    case 'emo':
      viewEl.innerHTML = renderEmotions();
      bindEmotions();
      break;
    case 'money':
      viewEl.innerHTML = renderMoney();
      bindMoney();
      break;
    case 'us':
      viewEl.innerHTML = renderRelationship();
      bindRelationship();
      break;
    case 'me':
      viewEl.innerHTML = renderSelf();
      bindSelf();
      break;
  }
}

// -------------------------------------------------------------
// 1. Onboarding Flow (One Step Per Screen, Instant Win)
// -------------------------------------------------------------
let tempOnboarding = {
  stage: 'Mempersiapkan pernikahan',
  goals: ['Mengenali emosi & pemicu belanja', 'Komunikasi uang tanpa pertengkaran'],
  emotion: 'Tenang & Lega',
  need: 'Istirahat sejenak tanpa rasa bersalah'
};

function renderOnboarding() {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    return `
      <div class="card" style="padding: 24px 18px; text-align: center; margin-top: 8px;">
        <div style="font-size: 3rem; margin-bottom: 8px;" aria-hidden="true">🌱</div>
        <h1 style="margin-bottom: 6px;">Teman Siap</h1>
        <p style="font-size: 1.05rem; font-weight: 600; color: var(--teal); margin-bottom: 12px;">
          Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.
        </p>
        <p class="mute" style="text-align: left; margin-bottom: 20px;">
          Menjelang pernikahan bukan hanya tentang membagi biaya resepsi. Ini tentang menyelaraskan emosi, kebiasaan belanja, ekspektasi keluarga besar, dan cara berbicara berdua.
        </p>

        <div style="background: var(--teal-light); border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 24px;">
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--teal-dark); margin-bottom: 4px;">
            🔒 Privasi Penuh Tanpa Syarat
          </div>
          <div class="mute" style="color: var(--teal-dark); font-size: 0.88rem;">
            Tidak perlu akun atau email. Semua data tersimpan aman di browsermu dan tidak pernah dibagikan tanpa izinmu.
          </div>
        </div>

        <button type="button" class="primary" id="startOnboardBtn" style="width: 100%;">
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
          <option value="Mempersiapkan pernikahan" selected>Mempersiapkan pernikahan (Calon Pengantin)</option>
          <option value="Sudah bertunangan">Sudah bertunangan / Dalam proses lamaran</option>
          <option value="Pengantin baru / Newlyweds">Pengantin baru (1–3 tahun pertama)</option>
          <option value="Menjelajah untuk diri sendiri">Menjelajah untuk pemahaman diri sendiri</option>
          <option value="Tidak ingin menjawab">Lebih nyaman tidak menjawab</option>
        </select>

        <h3 style="margin-top: 16px;">Tujuan yang ingin kamu utamakan:</h3>
        <p class="mute">Boleh pilih lebih dari satu:</p>

        <div class="pill-list">
          ${[
            'Mengenali emosi & pemicu belanja',
            'Kurangi belanja impulsif / lapar mata',
            'Mengatasi rasa takut mengecek saldo',
            'Komunikasi uang tanpa pertengkaran',
            'Bantuan keluarga / sandwich generation',
            'Membangun tabungan dana darurat'
          ].map(g => `
            <button type="button" class="pill-item ${tempOnboarding.goals.includes(g) ? 'active' : ''}" data-onboard-goal="${esc(g)}">
              ${g}
            </button>
          `).join('')}
        </div>

        <div class="btn-group">
          <button type="button" class="primary" id="onboardStep2Next">Lanjut ke Cek Diri Sejenak →</button>
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
                <span class="chip-label">${e.label}</span>
                <span class="chip-hint">${e.hint}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <label for="onboardNeedSelect" style="margin-top: 14px;">Apa satu hal yang paling kamu butuhkan hari ini?</label>
        <select id="onboardNeedSelect">
          ${CONTENT.needs.map(n => `
            <option value="${esc(n)}" ${tempOnboarding.need === n ? 'selected' : ''}>${n}</option>
          `).join('')}
        </select>

        <div class="btn-group">
          <button type="button" class="primary" id="onboardFinishBtn">Selesaikan & Masuk ke Beranda ✨</button>
        </div>
      </div>
    `;
  }

  return '';
}

function bindOnboarding() {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    const btn = $('#startOnboardBtn');
    if (btn) btn.onclick = () => {
      store.d.onboardingStep = 2;
      render();
    };
  } else if (step === 2) {
    $$('[data-onboard-goal]').forEach(btn => {
      btn.onclick = () => {
        const g = btn.dataset.onboardGoal;
        if (tempOnboarding.goals.includes(g)) {
          tempOnboarding.goals = tempOnboarding.goals.filter(x => x !== g);
        } else {
          tempOnboarding.goals.push(g);
        }
        render();
      };
    });

    const nextBtn = $('#onboardStep2Next');
    if (nextBtn) nextBtn.onclick = () => {
      tempOnboarding.stage = $('#onboardStageSelect').value;
      store.d.onboardingStep = 3;
      render();
    };
  } else if (step === 3) {
    $$('[data-onboard-emo]').forEach(btn => {
      btn.onclick = () => {
        tempOnboarding.emotion = btn.dataset.onboardEmo;
        render();
      };
    });

    const finishBtn = $('#onboardFinishBtn');
    if (finishBtn) finishBtn.onclick = () => {
      tempOnboarding.need = $('#onboardNeedSelect').value;
      
      store.d.stage = tempOnboarding.stage;
      store.d.goals = tempOnboarding.goals;
      store.d.checkins.push({
        emotion: tempOnboarding.emotion,
        need: tempOnboarding.need,
        sensations: ['Tubuh terasa rileks dan ringan'],
        note: 'Cek pertama saat memulai aplikasi',
        at: Date.now()
      });
      delete store.d.onboardingStep;
      store.save();
      navigateTo('home');
    };
  }
}

// -------------------------------------------------------------
// 2. Home View (Beranda)
// -------------------------------------------------------------
function renderHome() {
  const s = getSuggestedAction();
  const d = store.d;
  const recentCheckin = d.checkins && d.checkins.length ? d.checkins[d.checkins.length - 1] : null;

  return `
    <div style="margin-bottom: 12px;">
      <span class="card-tag saffron">Tahap: ${esc(d.stage || 'Persiapan')}</span>
      <h1 style="margin: 4px 0 2px;">Selamat datang.</h1>
      <p class="mute">Satu tindakan kecil hari ini untuk masa depan yang lebih tenang.</p>
    </div>

    <!-- The One Primary Action of the Day -->
    <div class="hero-action">
      <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.9; margin-bottom: 4px;">
        Langkah Hari Ini
      </div>
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.desc)}</p>
      <button type="button" id="heroActionBtn">${esc(s.btnText)} →</button>
    </div>

    <!-- Weekly Meaningful Practice (No streak shaming) -->
    <div class="card">
      <div class="card-title-row">
        <h3>Praktik Bermakna Mingguan</h3>
        <span class="card-tag">Tanpa Tekanan</span>
      </div>
      <p class="mute">Tidak ada streak yang terhapus jika kamu rehat. Kami merayakan setiap niat baik yang kamu lakukan.</p>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px;">
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 4px; text-align: center;">
          <div style="font-size: 1.25rem;">🌱</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.checkins.length}</div>
          <div class="mute" style="font-size: 0.74rem;">Cek Emosi</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 4px; text-align: center;">
          <div style="font-size: 1.25rem;">🪙</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.expenses.length}</div>
          <div class="mute" style="font-size: 0.74rem;">Catat Uang</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 4px; text-align: center;">
          <div style="font-size: 1.25rem;">🌊</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.pauses.length}</div>
          <div class="mute" style="font-size: 0.74rem;">Jeda Belanja</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 4px; text-align: center;">
          <div style="font-size: 1.25rem;">🤝</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${Object.keys(d.partnerA || {}).length}</div>
          <div class="mute" style="font-size: 0.74rem;">Percakapan</div>
        </div>
      </div>
    </div>

    <!-- Quick Urge Surfing Tool -->
    <div class="card" style="border-left: 4px solid var(--saffron);">
      <div class="card-title-row">
        <h3>Lapar Mata Saat Ini?</h3>
        <span class="card-tag saffron">Alat Cepat</span>
      </div>
      <p class="mute">Dorongan belanja memuncak selama 10–15 menit seperti ombak lalu mereda. Luangkan jeda sejenak.</p>
      <button type="button" class="saffron-btn" id="homeUrgeBtn" style="width: 100%;">
        Buka Jeda 10 Menit (Urge Surfing) ⏱️
      </button>
    </div>

    <!-- Recent Emotion Snapshot -->
    ${recentCheckin ? `
      <div class="card">
        <div class="card-title-row">
          <h3>Kondisi Terakhirmu</h3>
          <span class="mute">${new Date(recentCheckin.at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; margin: 6px 0;">
          <span style="font-size: 1.6rem;">🌱</span>
          <div>
            <div style="font-weight: 600;">${esc(recentCheckin.emotion)}</div>
            <div class="mute" style="font-size: 0.86rem;">Kebutuhan: ${esc(recentCheckin.need || 'Istirahat')}</div>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

function bindHome() {
  const heroBtn = $('#heroActionBtn');
  if (heroBtn) {
    heroBtn.onclick = () => {
      const s = getSuggestedAction();
      navigateTo(s.tab, s.subView);
    };
  }

  const urgeBtn = $('#homeUrgeBtn');
  if (urgeBtn) {
    urgeBtn.onclick = () => {
      navigateTo('money', 'urge');
    };
  }
}

// -------------------------------------------------------------
// 3. Module A: Emotions (Emosi — "Me")
// One Primary Action Per Screen (Check-in vs Dedicated Practice)
// -------------------------------------------------------------
function renderEmotions() {
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Diri</span>
        <h1 style="margin: 4px 0 2px;">Emosi & Regulasi</h1>
      </div>
    </div>
    <p class="mute">Emosi adalah pengalaman sementara, bukan kegagalan diri. Kenali perasaanmu tanpa menghakimi.</p>

    <!-- Sub-Navigation for Clean Focus -->
    <div class="sub-nav" role="tablist">
      <button type="button" class="${emotionSubView === 'checkin' ? 'active' : ''}" id="emoTabCheckin">
        1. Cek Perasaan
      </button>
      <button type="button" class="${emotionSubView === 'practice' ? 'active' : ''}" id="emoTabPractice">
        2. Latihan Mandiri
      </button>
    </div>

    ${emotionSubView === 'checkin' ? renderEmotionCheckin() : renderEmotionPractice()}
  `;
}

function renderEmotionCheckin() {
  if (!selectedEmotion) {
    return `
      <div class="card">
        <div class="card-title-row">
          <h3>Apa yang paling kamu rasakan saat ini?</h3>
          <span class="card-tag">Sadar & Beri Nama</span>
        </div>
        <p class="mute">Pilih satu yang paling mendekati kondisimu:</p>

        <div class="chip-grid">
          ${CONTENT.emotions.map(e => `
            <button type="button" class="chip" data-emo-select="${esc(e.label)}">
              <span class="chip-icon">${e.icon}</span>
              <div class="chip-col">
                <span class="chip-label">${e.label}</span>
                <span class="chip-hint">${e.hint}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <details class="clinical-note">
          <summary>Pelajari prinsip di balik latihan ini</summary>
          <p>Latihan ini berakar pada keterampilan 'Observe & Describe' dari Dialectical Behavior Therapy (DBT). Memberi nama emosi mengaktifkan korteks prefrontal otak dan meredakan reaksi impulsif amigdala.</p>
        </details>
      </div>
    `;
  }

  // Step 2 of Check-in: Body sensations & need
  return `
    <div class="card">
      <div class="card-title-row">
        <h3>Memahami: ${esc(selectedEmotion)}</h3>
        <button type="button" class="secondary" id="cancelEmoSelectBtn" style="min-height: 38px; padding: 4px 10px; font-size: 0.85rem;">
          Ganti Emosi
        </button>
      </div>

      <label>Di bagian tubuh mana sensasi ini terasa? (Boleh pilih beberapa):</label>
      <div class="pill-list">
        ${CONTENT.bodySensations.map(bs => `
          <button type="button" class="pill-item ${selectedSensations.includes(bs) ? 'active' : ''}" data-sensation-toggle="${esc(bs)}">
            ${bs}
          </button>
        `).join('')}
      </div>

      <label for="checkinNeedSelect">Apa yang paling akan membantumu saat ini?</label>
      <select id="checkinNeedSelect">
        <option value="">-- Boleh dilewati jika belum yakin --</option>
        ${CONTENT.needs.map(n => `<option value="${esc(n)}">${n}</option>`).join('')}
      </select>

      <label for="checkinNoteArea">Catatan pribadi (hanya di browsermu):</label>
      <textarea id="checkinNoteArea" placeholder="Tuliskan apa yang ada di pikiranmu dengan bebas..."></textarea>

      <!-- Sticky thumb-zone action -->
      <div class="sticky-bottom-action">
        <button type="button" class="primary" id="saveEmotionCheckinBtn" style="width: 100%;">
          Simpan Cek Emosi Ini ✨
        </button>
      </div>
    </div>
  `;
}

function renderEmotionPractice() {
  if (activeExerciseId === 'ex-breath') {
    return `
      <div class="card">
        <div class="card-title-row">
          <h3>Latihan Napas Sabar (4-4-6)</h3>
          <button type="button" class="secondary" id="exitExerciseBtn" style="min-height: 38px; padding: 4px 10px; font-size: 0.85rem;">
            ✕ Tutup Latihan
          </button>
        </div>
        <p class="mute">Tarik 4 detik, tahan 4 detik, hembuskan perlahan 6 detik. Berhenti kapan saja jika tidak nyaman.</p>

        <div class="breather-container">
          <div class="breather-circle" id="breathCircle">Mulai</div>
          <div class="breather-instruction" id="breathInstruction">Tekan tombol di bawah untuk mulai</div>
          <div class="mute" id="breathCounter" style="font-size: 0.88rem;">1 menit latihan santai</div>
        </div>

        <div class="btn-group">
          <button type="button" class="primary" id="startBreathingBtn">Mulai Napas 1 Menit</button>
        </div>

        <details class="clinical-note" style="margin-top: 18px;">
          <summary>Pelajari prinsip di balik latihan ini</summary>
          <p>${CONTENT.exercises.find(x => x.id === 'ex-breath').clinicalDetail}</p>
        </details>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card-title-row">
        <h3>Pilih Latihan Singkat</h3>
        <span class="card-tag saffron">Bisa Diulang Kapan Saja</span>
      </div>
      <p class="mute">Latihan terbukti secara psikologis untuk meredakan gelisah tanpa obat:</p>

      ${CONTENT.exercises.map(x => `
        <div style="border: 1px solid var(--border-card); border-radius: 12px; padding: 14px; margin-bottom: 12px; background: var(--bg-card);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 1.05rem; color: var(--ink-primary);">${x.title}</span>
            <span class="card-tag">${x.duration}</span>
          </div>
          <p class="mute" style="margin-bottom: 10px; font-size: 0.9rem;">${x.description}</p>
          
          ${x.id === 'ex-breath' ? `
            <button type="button" class="primary" data-start-ex="${x.id}" style="width: 100%;">
              Buka Latihan Napas Interaktif →
            </button>
          ` : `
            <ol style="margin: 0 0 10px; padding-left: 20px; font-size: 0.9rem; color: var(--ink-secondary);">
              ${x.steps.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
            </ol>
          `}

          <details class="clinical-note">
            <summary>Pelajari prinsip ilmiahnya</summary>
            <p>${x.clinicalDetail}</p>
          </details>
        </div>
      `).join('')}
    </div>
  `;
}

function bindEmotions() {
  const tabCheckin = $('#emoTabCheckin');
  const tabPractice = $('#emoTabPractice');
  if (tabCheckin) tabCheckin.onclick = () => { emotionSubView = 'checkin'; activeExerciseId = null; render(); };
  if (tabPractice) tabPractice.onclick = () => { emotionSubView = 'practice'; render(); };

  $$('[data-emo-select]').forEach(btn => {
    btn.onclick = () => {
      selectedEmotion = btn.dataset.emoSelect;
      render();
    };
  });

  const cancelBtn = $('#cancelEmoSelectBtn');
  if (cancelBtn) cancelBtn.onclick = () => {
    selectedEmotion = null;
    selectedSensations = [];
    render();
  };

  $$('[data-sensation-toggle]').forEach(btn => {
    btn.onclick = () => {
      const s = btn.dataset.sensationToggle;
      if (selectedSensations.includes(s)) {
        selectedSensations = selectedSensations.filter(x => x !== s);
      } else {
        selectedSensations.push(s);
      }
      render();
    };
  });

  const saveBtn = $('#saveEmotionCheckinBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const need = $('#checkinNeedSelect').value;
      const note = $('#checkinNoteArea').value.trim();

      store.d.checkins.push({
        emotion: selectedEmotion,
        sensations: selectedSensations,
        need,
        note,
        at: Date.now()
      });
      store.save();

      selectedEmotion = null;
      selectedSensations = [];
      alert('Catatan emosimu berhasil disimpan. Terima kasih telah meluangkan waktu untuk dirimu.');
      render();
    };
  }

  $$('[data-start-ex]').forEach(btn => {
    btn.onclick = () => {
      activeExerciseId = btn.dataset.startEx;
      render();
    };
  });

  const exitExBtn = $('#exitExerciseBtn');
  if (exitExBtn) {
    exitExBtn.onclick = () => {
      clearInterval(breathingInterval);
      breathingInterval = null;
      activeExerciseId = null;
      render();
    };
  }

  // Interactive Breathing Logic
  const breathBtn = $('#startBreathingBtn');
  if (breathBtn) {
    breathBtn.onclick = () => {
      if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
        $('#breathCircle').className = 'breather-circle';
        $('#breathCircle').textContent = 'Mulai';
        $('#breathInstruction').textContent = 'Latihan dihentikan.';
        breathBtn.textContent = 'Mulai Napas 1 Menit';
        return;
      }

      breathBtn.textContent = 'Hentikan Latihan';
      let secondsLeft = 60;
      let phase = 0; // 0: inhale (4s), 1: hold (4s), 2: exhale (6s)
      let phaseTime = 0;

      const circle = $('#breathCircle');
      const instruction = $('#breathInstruction');
      const counter = $('#breathCounter');

      const applyPhase = () => {
        if (phase === 0) {
          circle.className = 'breather-circle inhale';
          circle.textContent = 'Tarik';
          instruction.textContent = 'Tarik napas perlahan lewat hidung...';
          phaseTime = 4;
        } else if (phase === 1) {
          circle.className = 'breather-circle hold';
          circle.textContent = 'Tahan';
          instruction.textContent = 'Tahan napas santai dan rileks...';
          phaseTime = 4;
        } else {
          circle.className = 'breather-circle exhale';
          circle.textContent = 'Hembus';
          instruction.textContent = 'Hembuskan perlahan lewat mulut...';
          phaseTime = 6;
        }
      };

      applyPhase();

      breathingInterval = setInterval(() => {
        secondsLeft--;
        phaseTime--;
        if (counter) counter.textContent = `Sisa waktu: ${secondsLeft} detik`;

        if (phaseTime <= 0) {
          phase = (phase + 1) % 3;
          applyPhase();
        }

        if (secondsLeft <= 0) {
          clearInterval(breathingInterval);
          breathingInterval = null;
          circle.className = 'breather-circle';
          circle.textContent = 'Selesai';
          instruction.textContent = 'Bagus sekali. Rasakan ketenangan di tubuhmu.';
          breathBtn.textContent = 'Mulai Lagi';
        }
      }, 1000);
    };
  }
}

// -------------------------------------------------------------
// 4. Module B: Money (Uang — "My Money")
// Segmented subviews: Log Expense | Urge Surfing | Goals & Plans
// -------------------------------------------------------------
function renderMoney() {
  const d = store.d;
  const currentMonthExpenses = (d.expenses || []).filter(e => e.date && e.date.startsWith(monthKey()));
  const totalSpent = currentMonthExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Finansial</span>
        <h1 style="margin: 4px 0 2px;">Keuangan Sadar</h1>
      </div>
    </div>
    <p class="mute">Hadapi angka dengan tenang tanpa rasa malu. Kenali pemicu belanja dan bangun kebiasaan "cukup".</p>

    <!-- Sub-Navigation -->
    <div class="sub-nav" role="tablist">
      <button type="button" class="${moneySubView === 'log' ? 'active' : ''}" id="moneyTabLog">
        1. Catat Pengeluaran
      </button>
      <button type="button" class="${moneySubView === 'urge' ? 'active' : ''}" id="moneyTabUrge">
        2. Jeda Belanja
      </button>
      <button type="button" class="${moneySubView === 'goals' ? 'active' : ''}" id="moneyTabGoals">
        3. Tabungan & Rencana
      </button>
    </div>

    <!-- Monthly Summary Bar -->
    <div class="card" style="margin-top: 4px;">
      <div class="card-title-row">
        <h3>Ringkasan Bulan Ini</h3>
        <span class="card-tag">${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div style="font-size: 1.85rem; font-weight: 700; color: var(--teal); margin: 4px 0;">
        ${idr(totalSpent)}
      </div>
      <p class="mute" style="margin-bottom: 0;">
        ${currentMonthExpenses.length ? `Tercatat ${currentMonthExpenses.length} transaksi mandiri.` : 'Belum ada pengeluaran yang dicatat bulan ini.'}
        <br><span style="font-size: 0.82rem;">*Catatan mandiri untuk pemahaman diri, bukan saldo mutasi bank.</span>
      </p>
    </div>

    ${moneySubView === 'log' ? renderMoneyLog() : 
      moneySubView === 'urge' ? renderMoneyUrge() : renderMoneyGoals()}
  `;
}

function renderMoneyLog() {
  return `
    <div class="card">
      <div class="card-title-row">
        <h3>Catat Pengeluaran Sadar</h3>
        <span class="card-tag">Sadar & Pahami</span>
      </div>
      <p class="mute">Mencatat bukan untuk menghukum diri, tapi melihat hubungan emosi dengan belanja.</p>

      <label for="expAmountInput">Jumlah Nominal (Rp) *</label>
      <input type="number" id="expAmountInput" inputmode="numeric" pattern="[0-9]*" placeholder="Contoh: 35000" min="1">

      <label for="expCatSelect">Kategori</label>
      <select id="expCatSelect">
        ${CONTENT.categories.map(c => `<option value="${esc(c)}">${c}</option>`).join('')}
      </select>

      <label for="expDateInput">Tanggal</label>
      <input type="date" id="expDateInput" value="${today()}">

      <label for="expTagSelect">Pengeluaran ini paling tepat disebut:</label>
      <select id="expTagSelect">
        ${CONTENT.expenseTags.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
      </select>

      <label for="expNoteInput">Catatan Barang (Boleh dilewati):</label>
      <input type="text" id="expNoteInput" placeholder="Misal: Es kopi saat stres deadline">

      <div class="sticky-bottom-action">
        <button type="button" class="primary" id="saveExpenseBtn" style="width: 100%;">
          Simpan Pengeluaran Sadar ✨
        </button>
      </div>

      <details class="clinical-note" style="margin-top: 24px;">
        <summary>Pelajari prinsip di balik pencatatan ini</summary>
        <p>Pendekatan ini mengatasi 'Ostrich Effect' (kebiasaan menghindari kenyataan finansial karena takut stres). Dengan menandai pemicu emosi (antecedents), kamu memisahkan kebutuhan nyata dari belanja pelarian.</p>
      </details>
    </div>
  `;
}

function renderMoneyUrge() {
  const reframe = CONTENT.cognitiveReframes[activeReframeIndex];

  return `
    <div class="urge-surf-box">
      <div class="card-title-row">
        <h3 style="color: var(--teal-dark);">🌊 Berselancar Dorongan (Urge Surfing)</h3>
        <span class="card-tag saffron">Jeda Sadar</span>
      </div>
      <p class="mute">
        Ada barang yang sangat ingin kamu beli sekarang? Nafsu belanja terasa seperti ombak—ia akan memuncak selama 10 menit lalu mereda. Luangkan jeda sebelum memutuskan.
      </p>

      <div class="wave-graphic" aria-hidden="true">
        <svg viewBox="0 0 500 60" preserveAspectRatio="none">
          <path d="M0,30 C150,60 250,0 500,30 L500,60 L0,60 Z" fill="rgba(27, 94, 89, 0.15)"></path>
          <path d="M0,35 C120,10 320,55 500,35 L500,60 L0,60 Z" fill="rgba(217, 119, 6, 0.2)"></path>
        </svg>
      </div>

      <div class="intensity-slider-wrap">
        <div class="intensity-header">
          <span>Seberapa kuat dorongan belanjamu? (1–10):</span>
          <span id="sliderIntensityLabel" style="color: var(--saffron);">7 / 10 (Cukup Kuat)</span>
        </div>
        <input type="range" class="slider-range" id="urgeSlider" min="1" max="10" value="7">
      </div>

      <div class="timer-display" id="urgeTimerDisplay">10:00</div>

      <div class="btn-group">
        <button type="button" class="primary" id="startUrgeTimerBtn">Mulai Jeda 10 Menit ⏳</button>
        <button type="button" class="secondary" id="resetUrgeTimerBtn">Reset</button>
      </div>

      <!-- CBT Restructuring Card -->
      <div class="reframe-card">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--saffron); text-transform: uppercase; margin-bottom: 4px;">
          💡 Sudut Pandang Seimbang
        </div>
        <div class="reframe-thought" id="reframeThought">${reframe.impulseThought}</div>
        <div class="reframe-answer" id="reframeAnswer">${reframe.counterPerspective}</div>
        <div style="text-align: right; margin-top: 8px;">
          <button type="button" class="secondary" id="nextReframeBtn" style="min-height: 38px; padding: 4px 12px; font-size: 0.82rem;">
            Lihat Contoh Lain ↻
          </button>
        </div>
      </div>

      <details class="clinical-note">
        <summary>Pelajari prinsip di balik jeda ini</summary>
        <p>Berdasarkan teknik 'Urge Surfing' dari Acceptance & Commitment Therapy (ACT) dan Restrukturisasi Kognitif (CBT). Kamu melatih otak bahwa dorongan kuat tidak harus selalu diikuti dengan tindakan membeli.</p>
      </details>
    </div>
  `;
}

function renderMoneyGoals() {
  const d = store.d;
  const goal = d.goal;

  return `
    <!-- Goal Section: Never shows data the user did not enter -->
    <div class="card">
      <div class="card-title-row">
        <h3>Tujuan Tabungan Bersama</h3>
        <span class="card-tag saffron">Masa Depan</span>
      </div>

      ${goal ? `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
          <span style="font-weight: 700; font-size: 1.15rem;">${esc(goal.name)}</span>
          <span style="font-weight: 600; color: var(--teal);">${idr(goal.saved)} / ${idr(goal.target)}</span>
        </div>

        <div class="bar-track">
          <div class="bar-fill" style="width: ${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}%;"></div>
        </div>
        <div class="mute" style="text-align: right; margin-top: -6px; margin-bottom: 14px; font-size: 0.86rem;">
          Tercapai ${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}%
        </div>

        <label for="addSaveInput">Tambah tabungan hari ini:</label>
        <div style="display: flex; gap: 8px;">
          <input type="number" id="addSaveInput" inputmode="numeric" pattern="[0-9]*" placeholder="Nominal (Rp)" min="1" style="margin-bottom: 0;">
          <button type="button" class="saffron-btn" id="addSaveBtn" style="white-space: nowrap;">+ Tabung</button>
        </div>
      ` : `
        <p class="mute">Belum ada tujuan tabungan yang kamu buat. Menetapkan satu tujuan bersama memberi makna besar pada penghematan kecil harian.</p>
        
        ${showNewGoalForm ? `
          <div style="border-top: 1px solid var(--border-card); padding-top: 12px; margin-top: 10px;">
            <label for="newGoalNameInput">Nama Tujuan Tabungan:</label>
            <input type="text" id="newGoalNameInput" placeholder="Misal: Dana Darurat 3 Bulan / DP Tempat Tinggal">

            <label for="newGoalTargetInput">Target Nominal (Rp):</label>
            <input type="number" id="newGoalTargetInput" inputmode="numeric" pattern="[0-9]*" placeholder="Misal: 5000000" min="1">

            <div class="btn-group">
              <button type="button" class="primary" id="saveNewGoalBtn">Simpan Tujuan Tabungan</button>
              <button type="button" class="secondary" id="cancelGoalFormBtn">Batal</button>
            </div>
          </div>
        ` : `
          <button type="button" class="primary" id="openGoalFormBtn" style="width: 100%;">
            + Buat Tujuan Tabungan Pertama
          </button>
        `}
      `}
    </div>

    <!-- If-Then Plans Section -->
    <div class="card">
      <div class="card-title-row">
        <h3>Rencana Jika-Maka Pribadi</h3>
        <span class="card-tag">Otomatisasi Respon</span>
      </div>
      <p class="mute">Membantu otak mengambil tindakan sehat secara otomatis saat situasi godaan muncul.</p>

      ${d.plans && d.plans.length ? `
        <div style="margin-bottom: 12px;">
          ${d.plans.map((p, idx) => `
            <div style="background: var(--bg-canvas); border-left: 3px solid var(--teal); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 0.92rem;">
              <b>Jika:</b> ${esc(p.i)}<br>
              <b>Maka saya akan:</b> ${esc(p.t)}
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="mute" style="font-style: italic;">Belum ada rencana jika-maka. Buat rencana baru atau pilih dari contoh siap pakai di bawah.</p>
      `}

      <div style="border-top: 1px solid var(--border-card); padding-top: 12px;">
        <label for="planTriggerInput">Jika saya...</label>
        <input type="text" id="planTriggerInput" placeholder="misal: ingin belanja karena lelah kerja">

        <label for="planActionInput">Maka saya akan...</label>
        <input type="text" id="planActionInput" placeholder="misal: cuci muka dan minum air hangat dulu">

        <button type="button" class="secondary" id="saveCustomPlanBtn" style="width: 100%; margin-bottom: 12px;">
          + Simpan Rencana Jika-Maka
        </button>

        <details>
          <summary style="font-size: 0.88rem; font-weight: 600; color: var(--teal); cursor: pointer;">
            Lihat contoh situasi siap pakai
          </summary>
          <div style="margin-top: 8px;">
            ${CONTENT.presetPlans.map((pp, idx) => `
              <div style="background: var(--bg-canvas); border-radius: 8px; padding: 8px 12px; margin-bottom: 6px; font-size: 0.86rem; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span><b>Jika</b> ${esc(pp.i)}, <b>maka</b> ${esc(pp.t)}</span>
                <button type="button" class="secondary" data-adopt-plan="${idx}" style="min-height: 36px; padding: 4px 8px; font-size: 0.78rem; white-space: nowrap;">
                  Gunakan
                </button>
              </div>
            `).join('')}
          </div>
        </details>
      </div>
    </div>
  `;
}

function bindMoney() {
  const tabLog = $('#moneyTabLog');
  const tabUrge = $('#moneyTabUrge');
  const tabGoals = $('#moneyTabGoals');
  if (tabLog) tabLog.onclick = () => { moneySubView = 'log'; render(); };
  if (tabUrge) tabUrge.onclick = () => { moneySubView = 'urge'; render(); };
  if (tabGoals) tabGoals.onclick = () => { moneySubView = 'goals'; render(); };

  // Save Expense
  const saveExpBtn = $('#saveExpenseBtn');
  if (saveExpBtn) {
    saveExpBtn.onclick = () => {
      const amount = Number($('#expAmountInput').value);
      if (!amount || amount <= 0) {
        alert('Masukkan nominal belanja yang valid (lebih dari 0).');
        return;
      }
      const category = $('#expCatSelect').value;
      const date = $('#expDateInput').value || today();
      const tag = $('#expTagSelect').value;
      const note = $('#expNoteInput').value.trim();

      store.d.expenses.push({ amount, category, date, tag, note, at: Date.now() });
      store.save();
      alert('Pengeluaran berhasil dicatat secara sadar.');
      render();
    };
  }

  // Urge Surfing Slider & Timer
  const slider = $('#urgeSlider');
  const sliderLabel = $('#sliderIntensityLabel');
  if (slider && sliderLabel) {
    slider.oninput = () => {
      const v = Number(slider.value);
      let t = 'Sedang';
      if (v <= 3) t = 'Ringan';
      else if (v <= 6) t = 'Sedang';
      else if (v <= 8) t = 'Cukup Kuat';
      else t = 'Sangat Menggebu-gebu';
      sliderLabel.textContent = `${v} / 10 (${t})`;
    };
  }

  const nextReframeBtn = $('#nextReframeBtn');
  if (nextReframeBtn) {
    nextReframeBtn.onclick = () => {
      activeReframeIndex = (activeReframeIndex + 1) % CONTENT.cognitiveReframes.length;
      const ref = CONTENT.cognitiveReframes[activeReframeIndex];
      $('#reframeThought').textContent = ref.impulseThought;
      $('#reframeAnswer').textContent = ref.counterPerspective;
    };
  }

  const startTimerBtn = $('#startUrgeTimerBtn');
  const resetTimerBtn = $('#resetUrgeTimerBtn');
  const timerDisplay = $('#urgeTimerDisplay');

  if (startTimerBtn) {
    startTimerBtn.onclick = () => {
      if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
        startTimerBtn.textContent = 'Lanjutkan Jeda ⏳';
        return;
      }

      startTimerBtn.textContent = 'Jeda Berjalan (Hentikan)';
      activeTimer = setInterval(() => {
        timerSeconds--;
        const m = Math.floor(timerSeconds / 60);
        const s = String(timerSeconds % 60).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;

        if (timerSeconds <= 0) {
          clearInterval(activeTimer);
          activeTimer = null;
          timerSeconds = 600;
          if (timerDisplay) timerDisplay.textContent = '10:00';
          startTimerBtn.textContent = 'Mulai Jeda 10 Menit ⏳';

          store.d.pauses.push({
            intensity: slider ? slider.value : 7,
            helped: true,
            at: Date.now()
          });
          store.save();
          alert('10 menit jeda selesai! Luar biasa telah memberi ruang bagi dirimu. Keputusan tetap di tanganmu dengan pikiran yang lebih tenang.');
          render();
        }
      }, 1000);
    };
  }

  if (resetTimerBtn) {
    resetTimerBtn.onclick = () => {
      clearInterval(activeTimer);
      activeTimer = null;
      timerSeconds = 600;
      if (timerDisplay) timerDisplay.textContent = '10:00';
      if (startTimerBtn) startTimerBtn.textContent = 'Mulai Jeda 10 Menit ⏳';
    };
  }

  // Goal Creation & Top-up
  const openGoalBtn = $('#openGoalFormBtn');
  if (openGoalBtn) openGoalBtn.onclick = () => { showNewGoalForm = true; render(); };

  const cancelGoalBtn = $('#cancelGoalFormBtn');
  if (cancelGoalBtn) cancelGoalBtn.onclick = () => { showNewGoalForm = false; render(); };

  const saveGoalBtn = $('#saveNewGoalBtn');
  if (saveGoalBtn) {
    saveGoalBtn.onclick = () => {
      const name = $('#newGoalNameInput').value.trim();
      const target = Number($('#newGoalTargetInput').value);
      if (!name || !target || target <= 0) {
        alert('Harap isi nama tujuan dan nominal target.');
        return;
      }
      store.d.goal = { name, target, saved: 0 };
      store.save();
      showNewGoalForm = false;
      alert(`Tujuan tabungan "${name}" berhasil dibuat!`);
      render();
    };
  }

  const addSaveBtn = $('#addSaveBtn');
  if (addSaveBtn) {
    addSaveBtn.onclick = () => {
      const val = Number($('#addSaveInput').value);
      if (!val || val <= 0) {
        alert('Masukkan nominal tabungan yang valid.');
        return;
      }
      store.d.goal.saved += val;
      store.d.expenses.push({
        amount: val,
        category: 'Tabungan Dana Cadangan',
        date: today(),
        tag: 'planned',
        note: 'Menabung untuk ' + store.d.goal.name,
        at: Date.now()
      });
      store.save();
      alert(`Alhamdulillah, ${idr(val)} ditambahkan ke tabungan ${store.d.goal.name}!`);
      render();
    };
  }

  // If-then plan creation
  const savePlanBtn = $('#saveCustomPlanBtn');
  if (savePlanBtn) {
    savePlanBtn.onclick = () => {
      const i = $('#planTriggerInput').value.trim();
      const t = $('#planActionInput').value.trim();
      if (!i || !t) {
        alert('Harap isi pemicu ("Jika...") dan tindakannya ("Maka...").');
        return;
      }
      store.d.plans.push({ i, t, at: Date.now() });
      store.save();
      alert('Rencana Jika-Maka berhasil disimpan!');
      render();
    };
  }

  $$('[data-adopt-plan]').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.adoptPlan);
      const pp = CONTENT.presetPlans[idx];
      if (pp) {
        store.d.plans.push({ i: pp.i, t: pp.t, at: Date.now() });
        store.save();
        alert('Rencana berhasil diadopsi ke daftar pribadimu!');
        render();
      }
    };
  });
}

// -------------------------------------------------------------
// 5. Module C: Relationship (Kita — "Us")
// Couple Simulator with Consent-Based Reveal
// -------------------------------------------------------------
function renderRelationship() {
  const d = store.d;
  const perspective = d.currentPerspective || 'A';
  const partnerLabel = perspective === 'A' ? 'Kamu (Partner A)' : 'Pasanganmu (Partner B)';

  if (selectedConvoId) {
    const convo = CONTENT.conversations.find(c => c.id === selectedConvoId);
    const dataA = (d.partnerA && d.partnerA[selectedConvoId]) || { answer: '', consentShare: false };
    const dataB = (d.partnerB && d.partnerB[selectedConvoId]) || { answer: '', consentShare: false };
    const myData = perspective === 'A' ? dataA : dataB;
    const bothConsented = dataA.consentShare && dataB.consentShare;
    const jointNote = (d.sharedNotes && d.sharedNotes[selectedConvoId]) || '';

    return `
      <!-- Back button in easy reach -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <button type="button" class="secondary" id="exitConvoDetailBtn" style="min-height: 44px; padding: 6px 12px; font-size: 0.9rem;">
          ← Kembali ke Daftar
        </button>
        <span class="card-tag plum">Modul Percakapan</span>
      </div>

      <!-- Perspective Simulator -->
      <div class="couple-switcher">
        <div class="couple-switcher-label">
          Mengisi sebagai: <b>${perspective === 'A' ? 'Partner A' : 'Partner B'}</b>
        </div>
        <div class="perspective-toggle">
          <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPerspectiveA">Partner A</button>
          <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPerspectiveB">Partner B</button>
        </div>
      </div>

      <div class="card" style="border-left: 4px solid var(--plum);">
        <h2 style="margin-top: 0;">${esc(convo.title)}</h2>
        <p class="mute" style="margin-bottom: 12px;">${esc(convo.subtitle)}</p>

        <div style="background: var(--plum-light); border-radius: 10px; padding: 14px; margin-bottom: 14px; font-size: 0.96rem; line-height: 1.5;">
          <b>Pertanyaan Refleksi:</b><br>
          ${esc(convo.prompt)}
        </div>

        <p class="mute" style="font-size: 0.88rem; margin-bottom: 12px;">
          ${perspective === 'A' ? convo.helperA : convo.helperB}
        </p>

        <!-- Solo Answer Form -->
        <label for="convoAnswerInput">Jawaban Refleksimu (${partnerLabel}):</label>
        <textarea id="convoAnswerInput" placeholder="Tuliskan isi hatimu secara jujur tanpa khawatir dihakimi...">${esc(myData.answer)}</textarea>

        <!-- Explicit Consent to Share Toggle (Private by Default) -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--border-card); border-radius: 10px; padding: 12px 14px; margin: 12px 0;">
          <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin-bottom: 0;">
            <input type="checkbox" id="consentShareBox" ${myData.consentShare ? 'checked' : ''} style="width: 22px; height: 22px; min-height: 22px; margin: 2px 0 0;">
            <span style="font-size: 0.92rem; color: var(--ink-primary); line-height: 1.4;">
              <b>Saya setuju membagikan jawaban ini ke Ruang Bersama.</b><br>
              <span class="mute" style="font-size: 0.84rem;">Jika tidak dicentang, catatan ini tetap 100% rahasia untuk dirimu sendiri.</span>
            </span>
          </label>
        </div>

        <div class="sticky-bottom-action">
          <button type="button" class="plum-btn" id="saveConvoAnswerBtn" style="width: 100%;">
            Simpan Jawaban (${perspective === 'A' ? 'Partner A' : 'Partner B'})
          </button>
        </div>

        <details class="clinical-note" style="margin-top: 24px;">
          <summary>Prinsip komunikasi di balik topik ini</summary>
          <p>${esc(convo.clinicalDetail)}</p>
          <p class="mute"><b>Tips:</b> ${esc(convo.gottmanTip)}</p>
        </details>
      </div>

      <!-- Ruang Temu Bersama (Shared Space Reveal Canvas) -->
      <div class="shared-room">
        <div class="card-title-row">
          <h3 style="color: var(--plum); margin: 0;">🤝 Ruang Temu Bersama</h3>
          ${bothConsented ? 
            `<span class="consent-badge shared">✓ Terbuka (Keduanya Setuju)</span>` : 
            `<span class="consent-badge locked">🔒 Menunggu Persetujuan Berdua</span>`}
        </div>

        ${bothConsented ? `
          <p class="mute" style="font-size: 0.9rem;">
            Kalian berdua telah sepakat membagikan refleksi masing-masing. Dengarkan dengan empati tanpa saling memotong.
          </p>

          <div class="shared-split">
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner A</div>
              <div style="font-size: 0.92rem; color: var(--ink-primary); line-height: 1.45;">
                ${esc(dataA.answer || '(Belum mengisi)')}
              </div>
            </div>
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner B</div>
              <div style="font-size: 0.92rem; color: var(--ink-primary); line-height: 1.45;">
                ${esc(dataB.answer || '(Belum mengisi)')}
              </div>
            </div>
          </div>

          <div style="background: #FFFFFF; border-radius: 10px; padding: 14px; margin-top: 14px; border: 1px solid #E6DCE8;">
            <div style="font-weight: 700; font-size: 0.92rem; color: var(--plum); margin-bottom: 6px;">
              Pertanyaan Diskusi Berdua:
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 0.88rem; color: var(--ink-secondary);">
              ${CONTENT.discussStarters.map(q => `<li style="margin-bottom: 4px;">${q}</li>`).join('')}
            </ul>

            <label for="jointAgreementInput" style="margin-top: 14px;">Satu Komitmen / Langkah Kecil Bersama:</label>
            <input type="text" id="jointAgreementInput" value="${esc(jointNote)}" placeholder="Misal: Buat amplop khusus bantuan keluarga Rp 1 jt/bulan">
            <button type="button" class="plum-btn" id="saveJointAgreementBtn" style="width: 100%;">
              Simpan Kesepakatan Bersama 📝
            </button>
          </div>
        ` : `
          <div style="text-align: center; padding: 18px 8px;">
            <div style="font-size: 2.2rem; margin-bottom: 6px;" aria-hidden="true">🔒</div>
            <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 6px;">Jawaban Belum Dibuka Berdua</div>
            <p class="mute" style="font-size: 0.88rem; max-width: 400px; margin: 0 auto;">
              Untuk menjaga rasa aman psikologis, Ruang Bersama hanya terbuka jika <b>kedua belah pihak</b> telah mengisi dan mencentang persetujuan berbagi.
              <br><br>
              <i>Gunakan toggle <b>Partner B</b> di bagian atas layar untuk menguji simulasi respon pasanganmu!</i>
            </p>
          </div>
        `}
      </div>
    `;
  }

  // Conversation List View
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag plum">Pilar Relasi</span>
        <h1 style="margin: 4px 0 2px;">Kita & Komunikasi</h1>
      </div>
    </div>
    <p class="mute">Persiapan pernikahan bukan memaksakan kesamaan instan, tapi melatih cara mendengar dan bernegosiasi secara aman.</p>

    <!-- Perspective Switcher in List View -->
    <div class="couple-switcher">
      <div class="couple-switcher-label">
        Mode Simulasi Pasangan: <b>${partnerLabel}</b>
      </div>
      <div class="perspective-toggle">
        <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPerspectiveA">Partner A</button>
        <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPerspectiveB">Partner B</button>
      </div>
    </div>

    <!-- Conversation Catalog -->
    <div style="margin-top: 10px;">
      ${CONTENT.conversations.map(c => {
        const hasA = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].answer;
        const hasB = d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].answer;
        const bothShared = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].consentShare &&
                           d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].consentShare;

        return `
          <div class="card" style="border-left: 4px solid var(--plum);">
            <div class="card-title-row">
              <h3 style="margin: 0; font-size: 1.15rem;">${esc(c.title)}</h3>
              ${bothShared ? `<span class="consent-badge shared">✓ Terbuka Berdua</span>` :
                (hasA || hasB ? `<span class="consent-badge locked">Sedang Berjalan</span>` : `<span class="card-tag plum">5–15 Mnt</span>`)}
            </div>
            <p class="mute" style="margin: 6px 0 12px; font-size: 0.9rem;">${esc(c.subtitle)}</p>

            <button type="button" class="plum-btn" data-start-convo="${c.id}" style="width: 100%;">
              Mulai Percakapan Ini →
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Gentle Communication Antidotes Sheet -->
    <div class="card">
      <div class="card-title-row">
        <h3>Pola Komunikasi Sehat</h3>
        <span class="card-tag">Riset Hubungan</span>
      </div>
      <p class="mute">4 kebiasaan berbicara yang melelahkan dan penawar lembutnya:</p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${CONTENT.communicationPatterns.map(p => `
          <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 12px; font-size: 0.9rem;">
            <div style="font-weight: 700; color: var(--ink-secondary);">${esc(p.name)}</div>
            <div class="mute" style="margin-bottom: 4px;">Contoh: ${esc(p.example)}</div>
            <div style="color: var(--teal); font-weight: 600;">Langkah Sehat: ${esc(p.antidoteName)}</div>
            <div style="color: var(--ink-primary); font-size: 0.88rem;">${esc(p.antidoteExample)}</div>
          </div>
        `).join('')}
      </div>

      <details class="clinical-note" style="margin-top: 14px;">
        <summary>Prinsip Gottman Method</summary>
        <p>Berdasarkan riset hubungan John Gottman selama 40 tahun. Pasangan yang stabil bukan pasangan yang tanpa konflik, melainkan yang mampu memulihkan diri dengan awalan lembut dan merawat rasio positif 5:1.</p>
      </details>
    </div>
  `;
}

function bindRelationship() {
  const btnA = $('#switchPerspectiveA');
  const btnB = $('#switchPerspectiveB');
  if (btnA) btnA.onclick = () => { store.d.currentPerspective = 'A'; store.save(); render(); };
  if (btnB) btnB.onclick = () => { store.d.currentPerspective = 'B'; store.save(); render(); };

  $$('[data-start-convo]').forEach(btn => {
    btn.onclick = () => {
      selectedConvoId = btn.dataset.startConvo;
      render();
    };
  });

  const exitBtn = $('#exitConvoDetailBtn');
  if (exitBtn) {
    exitBtn.onclick = () => {
      selectedConvoId = null;
      render();
    };
  }

  const saveConvoBtn = $('#saveConvoAnswerBtn');
  if (saveConvoBtn) {
    saveConvoBtn.onclick = () => {
      const ans = $('#convoAnswerInput').value.trim();
      const consent = $('#consentShareBox').checked;
      const perspective = store.d.currentPerspective || 'A';

      if (perspective === 'A') {
        store.d.partnerA[selectedConvoId] = { answer: ans, consentShare: consent, updatedAt: Date.now() };
      } else {
        store.d.partnerB[selectedConvoId] = { answer: ans, consentShare: consent, updatedAt: Date.now() };
      }
      store.save();
      alert(`Jawaban untuk ${perspective === 'A' ? 'Partner A' : 'Partner B'} berhasil disimpan.`);
      render();
    };
  }

  const saveJointBtn = $('#saveJointAgreementBtn');
  if (saveJointBtn) {
    saveJointBtn.onclick = () => {
      const note = $('#jointAgreementInput').value.trim();
      if (!note) {
        alert('Tuliskan komitmen atau langkah kecil yang ingin kalian sepakati.');
        return;
      }
      if (!store.d.sharedNotes) store.d.sharedNotes = {};
      store.d.sharedNotes[selectedConvoId] = note;
      store.save();
      alert('Kesepakatan bersama berhasil dicatat!');
      render();
    };
  }
}

// -------------------------------------------------------------
// 6. Module: Self (Saya — "Safe Space & Verification")
// -------------------------------------------------------------
function renderSelf() {
  const d = store.d;
  const support = CONTENT.supportNotice;

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Privasi & Riwayat</span>
        <h1 style="margin: 4px 0 2px;">Ruang Saya</h1>
      </div>
    </div>
    <p class="mute">Teman Siap tidak memberi nilai atau label "kelayakan menikah". Setiap latihan adalah proses belajar mandiri.</p>

    <!-- Habit Log Summary -->
    <div class="card">
      <div class="card-title-row">
        <h3>Riwayat Latihan Pribadi</h3>
        <span class="card-tag saffron">Proses Nyata</span>
      </div>

      <ul style="padding-left: 20px; line-height: 1.8; color: var(--ink-secondary); font-size: 0.95rem;">
        <li>Cek emosi tersimpan: <b>${d.checkins.length} kali</b></li>
        <li>Pengeluaran sadar tercatat: <b>${d.expenses.length} transaksi</b></li>
        <li>Jeda belanja (Urge Surfing): <b>${d.pauses.length} kali</b></li>
        <li>Rencana Jika-Maka aktif: <b>${d.plans.length} rencana</b></li>
        <li>Topik percakapan terisi: <b>${Object.keys(d.partnerA || {}).length} topik</b></li>
      </ul>
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
        <button type="button" class="secondary" id="wipeAllDataBtn" style="color: #B91C1C; border-color: #FCA5A5;">
          Hapus Semua Data 🗑️
        </button>
      </div>
    </div>

    <!-- Verified Indonesian Crisis Contacts -->
    <div class="card" style="border-left: 4px solid var(--teal);">
      <div class="card-title-row">
        <h3 style="color: var(--teal);">${esc(support.crisisTitle)}</h3>
        <span class="card-tag">Resmi Terverifikasi</span>
      </div>
      <p class="mute" style="font-size: 0.88rem;">${esc(support.disclaimer)}</p>
      <p style="font-size: 0.9rem; color: var(--ink-secondary); margin-bottom: 12px;">${esc(support.crisisText)}</p>

      ${support.hotlines.map(h => `
        <div class="hotline-card">
          <div class="hotline-name">${esc(h.name)}</div>
          <div class="hotline-number">${esc(h.contact)}</div>
          <div class="mute" style="font-size: 0.84rem;">${esc(h.desc)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function bindSelf() {
  const exportBtn = $('#exportDataJsonBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.d, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'teman-siap-backup-' + today() + '.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  const wipeBtn = $('#wipeAllDataBtn');
  if (wipeBtn) {
    wipeBtn.onclick = () => {
      if (confirm('Apakah kamu yakin ingin menghapus seluruh data di perangkat ini? Tindakan ini tidak dapat dibatalkan.')) {
        store.wipe();
      }
    };
  }
}

// -------------------------------------------------------------
// Global Theme Toggle
// -------------------------------------------------------------
function setupThemeToggle() {
  const btn = $('#themeToggle');
  const icon = $('#themeIcon');
  if (!btn) return;

  btn.onclick = () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      if (icon) icon.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      if (icon) icon.textContent = '🌙';
    }
  };
}

// -------------------------------------------------------------
// Boot Application
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  render();
});
render();
