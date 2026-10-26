/**
 * Teman Siap — Interactive Mobile Web Prototype
 * Grounded in the PRD & Three Research Foundations:
 * 1. Bimwin to "Just Enough": Premarital emotional-financial integration, sabr & syukur
 * 2. Ostrich Effect to Prosperity: Habit gamification, urge surfing, if-then plans, non-shame budgeting
 * 3. Digital Therapist Blueprint: Scaffolding DBT/ACT/CBT, Gottman Method, consent-based partner sharing
 *
 * Local-First architecture (PRD Section 15 & 19): Private by default.
 */

// -------------------------------------------------------------
// State Management
// -------------------------------------------------------------
const store = {
  key: 'temansiap.v2',
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
    if (!this.d) {
      this.d = {
        stage: null,
        goals: [],
        checkins: [],
        expenses: [],
        goal: { name: 'Dana Darurat Sakinah', target: 3000000, saved: 750000 },
        plans: [
          {
            i: 'melihat promo flash sale malam hari',
            t: 'tutup aplikasi, minum air putih hangat, dan tunggu 24 jam'
          }
        ],
        pauses: [],
        partnerA: {},
        partnerB: {},
        sharedNotes: {},
        currentPerspective: 'A', // 'A' (Kamu) or 'B' (Pasangan)
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

// Navigation state
let currentTab = 'home';
let activeModal = null;
let timerInterval = null;
let timerSeconds = 600; // 10 minutes default
let breathingInterval = null;

const TABS = [
  { id: 'home', label: 'Beranda', icon: '🏡' },
  { id: 'emo', label: 'Emosi', icon: '🌱' },
  { id: 'money', label: 'Uang', icon: '🪙' },
  { id: 'us', label: 'Kita', icon: '🤝' },
  { id: 'me', label: 'Saya', icon: '👤' }
];

// -------------------------------------------------------------
// Core Recommendation Engine (PRD 11.5)
// Rule-based, supportive, zero-shame, non-punitive
// -------------------------------------------------------------
function getSuggestedAction() {
  const d = store.d;
  if (!d.checkins || !d.checkins.length) {
    return {
      title: 'Sapa perasaanmu 1 menit',
      desc: 'Mengenali apa yang kamu rasakan adalah fondasi ketenangan mengambil keputusan hari ini.',
      tab: 'emo',
      btnText: 'Mulai Cek Emosi'
    };
  }
  if (!d.expenses || !d.expenses.length) {
    return {
      title: 'Catat satu pengeluaran sadar',
      desc: 'Hadapi catatan keuangan tanpa rasa takut. Catat nominalnya dan apa yang melatarbelakanginya.',
      tab: 'money',
      btnText: 'Catat Pengeluaran'
    };
  }
  const hasConvo = (d.partnerA && Object.keys(d.partnerA).length > 0) || (d.partnerB && Object.keys(d.partnerB).length > 0);
  if (!hasConvo) {
    return {
      title: 'Percakapan Terpandu: Arti Rasa Aman',
      desc: 'Bahas arti rasa aman finansial bersama pasangan secara tenang, saling mendengar tanpa saling debat.',
      tab: 'us',
      btnText: 'Mulai Percakapan'
    };
  }
  return {
    title: 'Latihan Berselancar Dorongan (Urge Surfing)',
    desc: 'Latih kesabaran (sabr) menunda keinginan belanja impulsif dengan jeda 10 menit.',
    tab: 'money',
    btnText: 'Coba Urge Surfing'
  };
}

// -------------------------------------------------------------
// Navigation & View Rendering
// -------------------------------------------------------------
function renderNav() {
  const navEl = $('#nav');
  if (!store.d.stage) {
    navEl.style.display = 'none';
    return;
  }
  navEl.style.display = 'flex';
  navEl.innerHTML = TABS.map(t => `
    <button data-tab="${t.id}" ${t.id === currentTab ? 'aria-current="page"' : ''}>
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

function navigateTo(tabId) {
  clearInterval(timerInterval);
  clearInterval(breathingInterval);
  currentTab = tabId;
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
// 1. Onboarding Flow (3-Minute Instant Win)
// -------------------------------------------------------------
let tempOnboarding = {
  stage: 'Mempersiapkan pernikahan',
  goals: ['Kenali emosi & belanja impulsif', 'Latihan komunikasi uang'],
  emotion: 'Tenang & Lega',
  need: 'Istirahat tanpa merasa bersalah'
};

function renderOnboarding() {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    return `
      <div class="card" style="padding: 26px 20px; text-align: center; margin-top: 10px;">
        <div style="font-size: 3.2rem; margin-bottom: 10px;" aria-hidden="true">🌱</div>
        <h1 style="font-size: 1.85rem; margin-bottom: 8px;">Teman Siap</h1>
        <p style="font-size: 1.05rem; font-weight: 500; color: var(--teal); margin-bottom: 14px;">
          Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.
        </p>
        <p class="mute" style="margin-bottom: 24px; text-align: left;">
          Menjelang pernikahan bukan sekadar membagi biaya resepsi atau memilih tempat tinggal. Ini tentang menyelaraskan emosi, kebiasaan belanja, ekspektasi keluarga besar, dan cara berbicara berdua.
        </p>

        <div style="background: var(--teal-light); border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 22px;">
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--teal-dark); margin-bottom: 4px;">
            🔒 Privasi Penuh Tanpa Syarat
          </div>
          <div class="mute" style="color: var(--teal-dark); font-size: 0.85rem;">
            Tidak perlu membuat akun atau memasukkan email. Datamu tersimpan aman di browser perangkatmu dan tidak pernah dibagikan tanpa persetujuan eksplisitmu.
          </div>
        </div>

        <button class="primary" id="startOnboardingBtn" style="width: 100%; min-height: 52px; font-size: 1.05rem;">
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
        <p class="mute">Teman Siap menyesuaikan contoh dan latihan sesuai situasi aslimu.</p>

        <label for="onboardStage">Pilih yang paling menggambarkan:</label>
        <select id="onboardStage">
          <option value="Mempersiapkan pernikahan" selected>Mempersiapkan pernikahan (Calon Pengantin)</option>
          <option value="Sudah bertunangan">Sudah bertunangan / Dalam proses lamaran</option>
          <option value="Pengantin baru / Newlyweds">Pengantin baru (1–3 tahun pertama pernikahan)</option>
          <option value="Menjelajah untuk diri sendiri">Menjelajah untuk pemahaman diri sendiri</option>
          <option value="Tidak ingin menjawab">Lebih nyaman tidak menyebutkan</option>
        </select>

        <h3 style="margin-top: 18px;">Apa yang paling ingin kamu perbaiki?</h3>
        <p class="mute">Bisa pilih lebih dari satu:</p>

        <div class="pill-list">
          ${[
            'Mengenali emosi & pemicu belanja',
            'Kurangi belanja impulsif / lapar mata',
            'Mengatasi rasa takut mengecek saldo',
            'Komunikasi uang tanpa pertengkaran',
            'Bantuan finansial keluarga / sandwich generation',
            'Membangun tabungan dana darurat'
          ].map(g => `
            <button type="button" class="pill-item ${tempOnboarding.goals.includes(g) ? 'active' : ''}" data-goal="${esc(g)}">
              ${g}
            </button>
          `).join('')}
        </div>

        <div class="btn-group">
          <button class="primary" id="onboardNextStep2">Lanjut ke Cek Diri Sejenak →</button>
        </div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div class="card">
        <span class="card-tag saffron">Langkah 2 dari 3 • Instant Win</span>
        <h2>Sapa perasaanmu 1 menit</h2>
        <p class="mute">Sebelum mulai belajar, mari berhenti sejenak. Apa yang paling dominan kamu rasakan sekarang?</p>

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

        <label for="onboardNeed" style="margin-top: 14px;">Apa satu hal yang paling kamu butuhkan hari ini?</label>
        <select id="onboardNeed">
          ${CONTENT.needs.map(n => `
            <option value="${esc(n)}" ${tempOnboarding.need === n ? 'selected' : ''}>${n}</option>
          `).join('')}
        </select>

        <div class="btn-group">
          <button class="primary" id="onboardComplete">Selesaikan & Masuk ke Beranda ✨</button>
        </div>
      </div>
    `;
  }

  return '';
}

function bindOnboarding() {
  const step = store.d.onboardingStep || 1;

  if (step === 1) {
    const btn = $('#startOnboardingBtn');
    if (btn) btn.onclick = () => {
      store.d.onboardingStep = 2;
      render();
    };
  } else if (step === 2) {
    $$('[data-goal]').forEach(btn => {
      btn.onclick = () => {
        const goal = btn.dataset.goal;
        if (tempOnboarding.goals.includes(goal)) {
          tempOnboarding.goals = tempOnboarding.goals.filter(g => g !== goal);
          btn.classList.remove('active');
        } else {
          tempOnboarding.goals.push(goal);
          btn.classList.add('active');
        }
      };
    });

    const nextBtn = $('#onboardNextStep2');
    if (nextBtn) nextBtn.onclick = () => {
      tempOnboarding.stage = $('#onboardStage').value;
      store.d.onboardingStep = 3;
      render();
    };
  } else if (step === 3) {
    $$('[data-onboard-emo]').forEach(btn => {
      btn.onclick = () => {
        tempOnboarding.emotion = btn.dataset.onboardEmo;
        $$('[data-onboard-emo]').forEach(b => {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('active');
        });
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('active');
      };
    });

    const completeBtn = $('#onboardComplete');
    if (completeBtn) completeBtn.onclick = () => {
      tempOnboarding.need = $('#onboardNeed').value;
      
      // Save to store
      store.d.stage = tempOnboarding.stage;
      store.d.goals = tempOnboarding.goals;
      store.d.checkins.push({
        emotion: tempOnboarding.emotion,
        need: tempOnboarding.need,
        sensations: ['Tubuh rileks dan ringan'],
        note: 'Cek pertama saat onboarding',
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
    <div style="margin-bottom: 14px;">
      <span class="card-tag saffron">Tahap: ${esc(d.stage || 'Persiapan')}</span>
      <h1 style="margin: 6px 0 2px;">Selamat datang.</h1>
      <p class="mute">Satu tindakan kecil hari ini untuk masa depan yang lebih tenang.</p>
    </div>

    <!-- The Unified Core Recommendation Banner -->
    <div class="hero-action">
      <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85; margin-bottom: 4px;">
        Langkah Terpandu Hari Ini
      </div>
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.desc)}</p>
      <button id="heroActionBtn">${esc(s.btnText)} →</button>
    </div>

    <!-- Habit Practice Weekly Tracker (Practice over points, no shame streaks) -->
    <div class="card">
      <div class="card-title-row">
        <h3>Praktik Bermakna Minggu Ini</h3>
        <span class="card-tag">Gotong Royong & Sabr</span>
      </div>
      <p class="mute">Tidak ada streak harian yang hilang jika kamu rehat. Kami merayakan konsistensi kebiasaanmu.</p>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0;">
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 1.3rem;">🌱</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.checkins.length}</div>
          <div class="mute" style="font-size: 0.72rem;">Cek Emosi</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 1.3rem;">🪙</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.expenses.length}</div>
          <div class="mute" style="font-size: 0.72rem;">Catatan Uang</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 1.3rem;">🌊</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${d.pauses.length}</div>
          <div class="mute" style="font-size: 0.72rem;">Jeda Belanja</div>
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 1.3rem;">🤝</div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--teal);">${Object.keys(d.partnerA || {}).length}</div>
          <div class="mute" style="font-size: 0.72rem;">Percakapan</div>
        </div>
      </div>
    </div>

    <!-- Quick Tool: Urge Surfing (Berselancar Dorongan) Shortcut -->
    <div class="card" style="border-left: 4px solid var(--saffron);">
      <div class="card-title-row">
        <h3>Lapar Mata atau Ingin Belanja Cepat?</h3>
        <span class="card-tag saffron">Alat Cepat</span>
      </div>
      <p class="mute">Rasakan dorongan itu seperti ombak laut—ia akan memuncak lalu surut dengan sendirinya tanpa kamu harus langsung menurutinya.</p>
      <button class="saffron-btn" id="openUrgeQuickBtn">
        Mulai Jeda 10 Menit (Urge Surfing) ⏱️
      </button>
    </div>

    <!-- Recent Emotion Snapshot -->
    ${recentCheckin ? `
      <div class="card">
        <div class="card-title-row">
          <h3>Kondisi Batin Terakhirmu</h3>
          <span class="mute">${new Date(recentCheckin.at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
          <span style="font-size: 1.6rem;">🌱</span>
          <div>
            <div style="font-weight: 600;">${esc(recentCheckin.emotion)}</div>
            <div class="mute" style="font-size: 0.85rem;">Kebutuhan: ${esc(recentCheckin.need || 'Istirahat')}</div>
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
      navigateTo(s.tab);
    };
  }

  const urgeBtn = $('#openUrgeQuickBtn');
  if (urgeBtn) {
    urgeBtn.onclick = () => {
      navigateTo('money');
      setTimeout(() => {
        const el = $('#urgeSurfingSection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
  }
}

// -------------------------------------------------------------
// 3. Module A: Emotions (Emosi — "Me")
// -------------------------------------------------------------
let selectedEmotion = null;
let selectedSensations = [];
let activeBreathingStep = 'idle'; // 'idle', 'running'

function renderEmotions() {
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Diri (Me)</span>
        <h1 style="margin: 4px 0;">Emosi & Regulasi</h1>
      </div>
    </div>
    <p class="mute">Emosi adalah sinyal dan pengalaman sementara, bukan kegagalan diri. Latih kesadaran diri (DBT Mindfulness) tanpa menghakimi.</p>

    <!-- Section 1: Check-in (Notice & Name) -->
    <div class="card">
      <div class="card-title-row">
        <h3>1. Sadar & Beri Nama Perasaanmu</h3>
        <span class="card-tag">DBT Observe</span>
      </div>
      <p class="mute">Pilih apa yang paling dekat dengan kondisimu saat ini:</p>

      <div class="chip-grid">
        ${CONTENT.emotions.map(e => `
          <button type="button" class="chip ${selectedEmotion === e.label ? 'active' : ''}" data-emo-chip="${esc(e.label)}" aria-pressed="${selectedEmotion === e.label}">
            <span class="chip-icon">${e.icon}</span>
            <div class="chip-col">
              <span class="chip-label">${e.label}</span>
              <span class="chip-hint">${e.hint}</span>
            </div>
          </button>
        `).join('')}
      </div>

      ${selectedEmotion ? `
        <div style="margin-top: 16px; border-top: 1px solid var(--border-card); padding-top: 14px;">
          <label>Di bagian tubuh mana sensasi ini paling terasa? (Boleh pilih beberapa):</label>
          <div class="pill-list">
            ${CONTENT.bodySensations.map(bs => `
              <button type="button" class="pill-item ${selectedSensations.includes(bs) ? 'active' : ''}" data-sensation-pill="${esc(bs)}">
                ${bs}
              </button>
            `).join('')}
          </div>

          <label for="emotionNeedSelect">Apa yang paling akan membantumu saat ini?</label>
          <select id="emotionNeedSelect">
            <option value="">-- Lewati jika belum yakin --</option>
            ${CONTENT.needs.map(n => `<option value="${esc(n)}">${n}</option>`).join('')}
          </select>

          <label for="emotionPrivateNote">Catatan batin pribadi (hanya tersimpan di perangkat ini):</label>
          <textarea id="emotionPrivateNote" placeholder="Tuliskan apa yang ada di pikiranmu dengan bebas..."></textarea>

          <div class="btn-group">
            <button class="primary" id="saveCheckinBtn">Simpan Cek Emosi</button>
            <button class="secondary" id="resetCheckinBtn">Batal</button>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Section 2: Interactive Regulation Exercises -->
    <div class="card">
      <div class="card-title-row">
        <h3>2. Latihan Regulasi Mandiri</h3>
        <span class="card-tag saffron">Latih & Tenang</span>
      </div>
      <p class="mute">Latihan singkat untuk menenangkan sistem saraf ketika alarm stres atau kecemasan menyala.</p>

      <!-- Interactive Breathing Tool (Napas Sabar 4-4-6) -->
      <div style="background: var(--bg-canvas); border-radius: 14px; padding: 18px; margin: 14px 0; border: 1px solid var(--border-card);">
        <div style="font-weight: 700; color: var(--teal); margin-bottom: 4px;">🌿 Latihan Napas Sabar (4-4-6)</div>
        <p class="mute" style="font-size: 0.86rem; margin-bottom: 12px;">Tarik 4 detik, tahan 4 detik, buang perlahan 6 detik.</p>

        <div class="breather-container">
          <div class="breather-circle" id="breathCircle">Mulai</div>
          <div class="breather-instruction" id="breathInstruction">Tekan tombol untuk memulai</div>
          <div class="mute" id="breathCounter" style="font-size: 0.85rem;">1 menit latihan</div>
        </div>

        <div style="text-align: center;">
          <button class="primary" id="startBreathingBtn" style="min-width: 160px;">Mulai Napas 1 Menit</button>
        </div>
      </div>

      <!-- Additional Grounding Exercises Accordion -->
      <div style="margin-top: 14px;">
        <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 8px;">Latihan Alternatif Lainnya:</div>
        ${CONTENT.exercises.filter(x => x.id !== 'ex-breath').map(x => `
          <div style="border: 1px solid var(--border-card); border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; background: var(--bg-card);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: var(--ink-primary);">${x.title}</span>
              <span class="card-tag">${x.duration}</span>
            </div>
            <p class="mute" style="font-size: 0.86rem; margin: 6px 0 8px;">${x.description}</p>
            <ol style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: var(--ink-secondary);">
              ${x.steps.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
            </ol>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Safety Boundary Notice -->
    <div style="padding: 12px 16px; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border-card); font-size: 0.85rem;" class="mute">
      🛡️ <b>Batas Aman:</b> Teman Siap adalah alat edukasi dan latihan mandiri, bukan pengganti diagnosis atau terapi klinis. Jika kamu merasa tertekan dan butuh teman bicara manusia, lihat menu <b>Saya</b> untuk kontak layanan resmi terverifikasi.
    </div>
  `;
}

function bindEmotions() {
  $$('[data-emo-chip]').forEach(btn => {
    btn.onclick = () => {
      selectedEmotion = btn.dataset.emoChip;
      render();
    };
  });

  $$('[data-sensation-pill]').forEach(btn => {
    btn.onclick = () => {
      const s = btn.dataset.sensationPill;
      if (selectedSensations.includes(s)) {
        selectedSensations = selectedSensations.filter(x => x !== s);
      } else {
        selectedSensations.push(s);
      }
      render();
    };
  });

  const saveBtn = $('#saveCheckinBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const need = $('#emotionNeedSelect').value;
      const note = $('#emotionPrivateNote').value.trim();
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
      alert('Catatan emosimu berhasil disimpan di perangkat ini. Terima kasih telah meluangkan waktu untuk dirimu.');
      render();
    };
  }

  const resetBtn = $('#resetCheckinBtn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      selectedEmotion = null;
      selectedSensations = [];
      render();
    };
  }

  // Breathing Box Interaction
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
      let secondsRemaining = 60;
      let phase = 0; // 0: inhale (4s), 1: hold (4s), 2: exhale (6s)
      let phaseTimer = 0;

      const circle = $('#breathCircle');
      const instruction = $('#breathInstruction');
      const counter = $('#breathCounter');

      const runCycle = () => {
        if (phase === 0) {
          circle.className = 'breather-circle inhale';
          circle.textContent = 'Tarik';
          instruction.textContent = 'Tarik napas perlahan lewat hidung...';
          phaseTimer = 4;
        } else if (phase === 1) {
          circle.className = 'breather-circle hold';
          circle.textContent = 'Tahan';
          instruction.textContent = 'Tahan napas dengan lembut dan rileks...';
          phaseTimer = 4;
        } else {
          circle.className = 'breather-circle exhale';
          circle.textContent = 'Hembus';
          instruction.textContent = 'Hembuskan perlahan lewat mulut...';
          phaseTimer = 6;
        }
      };

      runCycle();

      breathingInterval = setInterval(() => {
        secondsRemaining--;
        phaseTimer--;

        if (counter) counter.textContent = `Sisa waktu: ${secondsRemaining} detik`;

        if (phaseTimer <= 0) {
          phase = (phase + 1) % 3;
          runCycle();
        }

        if (secondsRemaining <= 0) {
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
// -------------------------------------------------------------
let activeReframeIndex = 0;

function renderMoney() {
  const d = store.d;
  const currentMonthExpenses = (d.expenses || []).filter(e => e.date && e.date.startsWith(monthKey()));
  const totalSpent = currentMonthExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const goal = d.goal || { name: 'Dana Darurat Sakinah', target: 3000000, saved: 750000 };
  const goalPercent = Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100));

  const reframe = CONTENT.cognitiveReframes[activeReframeIndex];

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Finansial (My Money)</span>
        <h1 style="margin: 4px 0;">Keuangan Sadar</h1>
      </div>
    </div>
    <p class="mute">Bebas dari efek burung unta (ostrich effect). Hadapi angka dengan tenang, kenali dorongan belanja, dan bangun kebiasaan "cukup" (qana'ah).</p>

    <!-- Month Summary Card -->
    <div class="card">
      <div class="card-title-row">
        <h3>Ringkasan Pengeluaran Bulan Ini</h3>
        <span class="card-tag">${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div style="font-size: 1.85rem; font-weight: 700; color: var(--teal); margin: 6px 0;">
        ${idr(totalSpent)}
      </div>
      <p class="mute" style="font-size: 0.86rem; margin-bottom: 0;">
        ${currentMonthExpenses.length ? `Tercatat ${currentMonthExpenses.length} transaksi sukarela.` : 'Belum ada catatan bulan ini. Mulai dengan satu transaksi kecil.'}
        <br><i>*Angka ini dari pencatatan sadar mandiri, bukan saldo mutasi bank.</i>
      </p>
    </div>

    <!-- Interactive Urge Surfing Tool -->
    <div class="urge-surf-box" id="urgeSurfingSection">
      <div class="card-title-row">
        <h3 style="color: var(--teal-dark);">🌊 Jeda Belanja: Berselancar Dorongan (Urge Surfing)</h3>
        <span class="card-tag saffron">ACT Mindfulness</span>
      </div>
      <p class="mute" style="font-size: 0.9rem;">
        Ada barang yang ingin segera kamu beli sekarang? Nafsu belanja terasa seperti ombak besar yang memuncak selama 10–15 menit lalu mereda. Luangkan jeda sejenak sebelum memutuskan.
      </p>

      <div class="wave-graphic" aria-hidden="true">
        <svg viewBox="0 0 500 60" preserveAspectRatio="none">
          <path d="M0,30 C150,60 250,0 500,30 L500,60 L0,60 Z" fill="rgba(27, 94, 89, 0.15)"></path>
          <path d="M0,35 C120,10 320,55 500,35 L500,60 L0,60 Z" fill="rgba(217, 119, 6, 0.2)"></path>
        </svg>
      </div>

      <div class="intensity-slider-wrap">
        <div class="intensity-header">
          <span>Tingkat Dorongan Belanja (1–10):</span>
          <span id="intensityVal" style="color: var(--saffron);">7 / 10 (Cukup Kuat)</span>
        </div>
        <input type="range" class="slider-range" id="urgeIntensityRange" min="1" max="10" value="7">
      </div>

      <div class="timer-display" id="urgeTimerDisplay">10:00</div>

      <div class="btn-group" style="justify-content: center;">
        <button class="primary" id="startUrgeTimerBtn">Mulai Jeda 10 Menit ⏳</button>
        <button class="secondary" id="resetUrgeTimerBtn">Reset</button>
      </div>

      <!-- Cognitive Restructuring Card (CBT reframing) -->
      <div class="reframe-card" style="margin-top: 18px;">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--saffron); text-transform: uppercase; margin-bottom: 4px;">
          💡 Sudut Pandang Lain (CBT Restructuring)
        </div>
        <div class="reframe-thought" id="reframeThought">${reframe.impulseThought}</div>
        <div class="reframe-answer" id="reframeAnswer">${reframe.counterPerspective}</div>
        <div style="text-align: right; margin-top: 8px;">
          <button type="button" class="icon-btn" id="nextReframeBtn" style="font-size: 0.78rem; padding: 4px 10px;">
            Contoh Pikiran Lain ↻
          </button>
        </div>
      </div>
    </div>

    <!-- Add Mindful Expense Form -->
    <div class="card">
      <div class="card-title-row">
        <h3>Catat Pengeluaran Sadar</h3>
        <span class="card-tag">Notice & Act</span>
      </div>
      <p class="mute">Bukan hanya mencatat nominal, tapi memahami pemicu emosi di baliknya.</p>

      <label for="expAmount">Jumlah Nominal (Rp) *</label>
      <input type="number" id="expAmount" placeholder="Contoh: 45000" min="1" inputmode="numeric">

      <label for="expCategory">Kategori Pengeluaran</label>
      <select id="expCategory">
        ${CONTENT.categories.map(c => `<option value="${esc(c)}">${c}</option>`).join('')}
      </select>

      <label for="expDate">Tanggal</label>
      <input type="date" id="expDate" value="${today()}">

      <label for="expTag">Pengeluaran ini paling tepat digambarkan sebagai:</label>
      <select id="expTag">
        ${CONTENT.expenseTags.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
      </select>

      <label for="expNote">Catatan / Nama Barang (Opsional)</label>
      <input type="text" id="expNote" placeholder="Misal: Kopi susu saat lembur">

      <button class="primary" id="saveExpenseBtn" style="width: 100%;">Simpan Pengeluaran Sadar</button>
    </div>

    <!-- Savings Goal Card (Cukup / Qana'ah) -->
    <div class="card">
      <div class="card-title-row">
        <h3>Tujuan Tabungan Bersama (Sakinah)</h3>
        <span class="card-tag saffron">Masa Depan</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
        <span style="font-weight: 700; font-size: 1.1rem;">${esc(goal.name)}</span>
        <span style="font-weight: 600; color: var(--teal);">${idr(goal.saved)} / ${idr(goal.target)}</span>
      </div>

      <div class="bar-track">
        <div class="bar-fill" style="width: ${goalPercent}%;"></div>
      </div>
      <div class="mute" style="font-size: 0.85rem; text-align: right; margin-top: -6px; margin-bottom: 12px;">
        Tercapai ${goalPercent}%
      </div>

      <div style="display: flex; gap: 8px;">
        <input type="number" id="addSavingsAmount" placeholder="Tambah simpanan (Rp)" min="1" inputmode="numeric" style="margin-bottom: 0;">
        <button class="saffron-btn" id="addSavingsBtn" style="white-space: nowrap;">+ Tabung</button>
      </div>
    </div>

    <!-- If-Then Plans (Implementation Intentions) -->
    <div class="card">
      <div class="card-title-row">
        <h3>Rencana Jika-Maka (If-Then Plan)</h3>
        <span class="card-tag">Behavioral Activation</span>
      </div>
      <p class="mute">Bantu otakmu mengambil keputusan otomatis saat situasi rentan datang.</p>

      <div id="plansList">
        ${d.plans.map((p, idx) => `
          <div style="background: var(--bg-canvas); border-left: 3px solid var(--teal); border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; font-size: 0.9rem;">
            <b>Jika:</b> ${esc(p.i)}<br>
            <b>Maka saya akan:</b> ${esc(p.t)}
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px solid var(--border-card); margin-top: 14px; padding-top: 12px;">
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Buat Rencana Baru:</div>
        <input type="text" id="newPlanTrigger" placeholder="Jika saya... (misal: ingin jajan karena lelah kerja)">
        <input type="text" id="newPlanAction" placeholder="Maka saya akan... (misal: mandi air hangat dan istirahat 15 menit)">
        <button class="secondary" id="saveNewPlanBtn" style="width: 100%;">+ Simpan Rencana Jika-Maka</button>
      </div>
    </div>
  `;
}

function bindMoney() {
  // Intensity slider label
  const slider = $('#urgeIntensityRange');
  const label = $('#intensityVal');
  if (slider && label) {
    slider.oninput = () => {
      const v = slider.value;
      let text = 'Sedang';
      if (v <= 3) text = 'Ringan';
      else if (v <= 6) text = 'Sedang';
      else if (v <= 8) text = 'Cukup Kuat';
      else text = 'Sangat Menggebu-gebu';
      label.textContent = `${v} / 10 (${text})`;
    };
  }

  // Next reframe button
  const nextReframeBtn = $('#nextReframeBtn');
  if (nextReframeBtn) {
    nextReframeBtn.onclick = () => {
      activeReframeIndex = (activeReframeIndex + 1) % CONTENT.cognitiveReframes.length;
      const ref = CONTENT.cognitiveReframes[activeReframeIndex];
      $('#reframeThought').textContent = ref.impulseThought;
      $('#reframeAnswer').textContent = ref.counterPerspective;
    };
  }

  // Urge surfing countdown
  const startTimerBtn = $('#startUrgeTimerBtn');
  const resetTimerBtn = $('#resetUrgeTimerBtn');
  const timerDisplay = $('#urgeTimerDisplay');

  if (startTimerBtn) {
    startTimerBtn.onclick = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimerBtn.textContent = 'Lanjutkan Jeda ⏳';
        return;
      }

      startTimerBtn.textContent = 'Jeda Waktu Berjalan (Hentikan)';
      timerInterval = setInterval(() => {
        timerSeconds--;
        const m = Math.floor(timerSeconds / 60);
        const s = String(timerSeconds % 60).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;

        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerSeconds = 600;
          if (timerDisplay) timerDisplay.textContent = '10:00';
          startTimerBtn.textContent = 'Mulai Jeda 10 Menit ⏳';
          
          store.d.pauses.push({
            intensity: slider ? slider.value : 7,
            helped: true,
            at: Date.now()
          });
          store.save();
          alert('10 menit jeda selesai! Selamat telah memberi jeda bagi pikiranmu. Sekarang, kamu berada di kursi kemudi untuk memutuskan apakah barang ini benar-benar kamu perlukan.');
          render();
        }
      }, 1000);
    };
  }

  if (resetTimerBtn) {
    resetTimerBtn.onclick = () => {
      clearInterval(timerInterval);
      timerInterval = null;
      timerSeconds = 600;
      if (timerDisplay) timerDisplay.textContent = '10:00';
      if (startTimerBtn) startTimerBtn.textContent = 'Mulai Jeda 10 Menit ⏳';
    };
  }

  // Save Expense
  const saveExpBtn = $('#saveExpenseBtn');
  if (saveExpBtn) {
    saveExpBtn.onclick = () => {
      const amount = Number($('#expAmount').value);
      if (!amount || amount <= 0) {
        alert('Silakan masukkan jumlah nominal yang valid (lebih dari 0).');
        return;
      }
      const category = $('#expCategory').value;
      const date = $('#expDate').value || today();
      const tag = $('#expTag').value;
      const note = $('#expNote').value.trim();

      store.d.expenses.push({ amount, category, date, tag, note, at: Date.now() });
      store.save();
      alert('Pengeluaran berhasil dicatat secara sadar.');
      render();
    };
  }

  // Add Savings
  const addSavingsBtn = $('#addSavingsBtn');
  if (addSavingsBtn) {
    addSavingsBtn.onclick = () => {
      const val = Number($('#addSavingsAmount').value);
      if (!val || val <= 0) {
        alert('Masukkan nominal tabungan yang valid.');
        return;
      }
      store.d.goal.saved += val;
      store.d.expenses.push({
        amount: val,
        category: 'Tabungan Dana Darurat',
        date: today(),
        tag: 'planned',
        note: 'Menabung untuk ' + store.d.goal.name,
        at: Date.now()
      });
      store.save();
      alert(`Alhamdulillah, ${idr(val)} berhasil ditambahkan ke tabungan ${store.d.goal.name}!`);
      render();
    };
  }

  // Save new plan
  const savePlanBtn = $('#saveNewPlanBtn');
  if (savePlanBtn) {
    savePlanBtn.onclick = () => {
      const trigger = $('#newPlanTrigger').value.trim();
      const action = $('#newPlanAction').value.trim();
      if (!trigger || !action) {
        alert('Harap isi pemicu ("Jika...") dan tindakan alternatifnya ("Maka...").');
        return;
      }
      store.d.plans.push({ i: trigger, t: action, at: Date.now() });
      store.save();
      alert('Rencana Jika-Maka berhasil disimpan!');
      render();
    };
  }
}

// -------------------------------------------------------------
// 5. Module C: Relationship (Kita — "Us")
// Couple Simulator with Dual-Perspective & Consent-based Reveal
// -------------------------------------------------------------
let selectedConvoId = null;

function renderRelationship() {
  const d = store.d;
  const perspective = d.currentPerspective || 'A';
  const partnerLabel = perspective === 'A' ? 'Kamu (Calon Istri/Suami)' : 'Pasanganmu (Simulasi Partner)';

  if (selectedConvoId) {
    const convo = CONTENT.conversations.find(c => c.id === selectedConvoId);
    const dataA = (d.partnerA && d.partnerA[selectedConvoId]) || { answer: '', consentShare: false };
    const dataB = (d.partnerB && d.partnerB[selectedConvoId]) || { answer: '', consentShare: false };
    const myData = perspective === 'A' ? dataA : dataB;
    const bothConsented = dataA.consentShare && dataB.consentShare;
    const jointNote = (d.sharedNotes && d.sharedNotes[selectedConvoId]) || '';

    return `
      <!-- Convo Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <button class="secondary" id="backToConvoListBtn" style="min-height: 38px; padding: 6px 12px; font-size: 0.85rem;">
          ← Kembali ke Daftar Percakapan
        </button>
        <span class="card-tag plum">Modul Kita</span>
      </div>

      <!-- Simulator Perspective Switcher -->
      <div class="couple-switcher">
        <div class="couple-switcher-label">
          Sedang Mengisi Sebagai: <b>${perspective === 'A' ? 'Kamu (Partner A)' : 'Pasangan (Partner B)'}</b>
        </div>
        <div class="perspective-toggle">
          <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPartnerA">Partner A</button>
          <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPartnerB">Partner B</button>
        </div>
      </div>

      <div class="card" style="border-left: 4px solid var(--plum);">
        <h2 style="margin-top: 0;">${esc(convo.title)}</h2>
        <p class="mute" style="margin-bottom: 14px;">${esc(convo.subtitle)}</p>

        <div style="background: var(--plum-light); border-radius: 10px; padding: 14px; margin-bottom: 14px; font-size: 0.95rem; line-height: 1.5;">
          <b>Pertanyaan Refleksi:</b><br>
          ${esc(convo.prompt)}
        </div>

        <div class="mute" style="font-size: 0.85rem; margin-bottom: 14px;">
          ${perspective === 'A' ? convo.helperA : convo.helperB}
        </div>

        <!-- Solo Answer Form -->
        <label for="soloAnswerText">Jawaban Refleksimu (${partnerLabel}):</label>
        <textarea id="soloAnswerText" placeholder="Tuliskan pandangan jujurmu tanpa rasa takut dihakimi...">${esc(myData.answer)}</textarea>

        <!-- Explicit Consent to Share Toggle (PRD 15: Private by Default) -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--border-card); border-radius: 10px; padding: 12px 14px; margin: 12px 0;">
          <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin-bottom: 0;">
            <input type="checkbox" id="consentShareCheckbox" ${myData.consentShare ? 'checked' : ''} style="width: 20px; height: 20px; min-height: 20px; margin: 2px 0 0;">
            <span style="font-size: 0.9rem; color: var(--ink-primary);">
              <b>Saya bersedia membagikan jawaban ini ke Ruang Bersama Pasangan.</b><br>
              <span class="mute" style="font-size: 0.82rem;">Jika tidak dicentang, jawaban ini tetap 100% rahasia untuk dirimu sendiri.</span>
            </span>
          </label>
        </div>

        <div class="btn-group">
          <button class="plum-btn" id="saveConvoAnswerBtn">Simpan Jawaban (${perspective === 'A' ? 'Partner A' : 'Partner B'})</button>
        </div>
      </div>

      <!-- Gottman Method Softened Startup Tip -->
      <div class="card" style="border-left: 3px solid var(--teal);">
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--teal); margin-bottom: 4px;">
          💬 Tips Komunikasi Gottman (Softened Startup)
        </div>
        <p class="mute" style="font-size: 0.86rem; margin-bottom: 0;">
          ${esc(convo.gottmanTip)}
        </p>
      </div>

      <!-- Ruang Temu Bersama (Shared Space Reveal Canvas) -->
      <div class="shared-room">
        <div class="card-title-row">
          <h3 style="color: var(--plum); margin: 0;">🤝 Ruang Temu Bersama (Bahas Berdua)</h3>
          ${bothConsented ? 
            `<span class="consent-badge shared">✓ Terbuka (Keduanya Setuju)</span>` : 
            `<span class="consent-badge locked">🔒 Terkunci (Menunggu Kesepakatan)</span>`}
        </div>

        ${bothConsented ? `
          <p class="mute" style="font-size: 0.88rem;">
            Alhamdulillah, kalian berdua telah setuju membagikan refleksi masing-masing. Luangkan 10–15 menit untuk saling membaca dan mendengarkan.
          </p>

          <div class="shared-split">
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner A</div>
              <div style="font-size: 0.88rem; color: var(--ink-primary); line-height: 1.45;">
                ${esc(dataA.answer || '(Belum mengisi)')}
              </div>
            </div>
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner B</div>
              <div style="font-size: 0.88rem; color: var(--ink-primary); line-height: 1.45;">
                ${esc(dataB.answer || '(Belum mengisi)')}
              </div>
            </div>
          </div>

          <div style="background: #FFFFFF; border-radius: 10px; padding: 14px; margin-top: 14px; border: 1px solid #E6DCE8;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--plum); margin-bottom: 6px;">
              Pertanyaan untuk Didiskusikan Bersama:
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 0.86rem; color: var(--ink-secondary);">
              ${CONTENT.discussStarters.map(q => `<li style="margin-bottom: 4px;">${q}</li>`).join('')}
            </ul>

            <label for="jointDecisionText" style="margin-top: 12px; font-weight: 600;">Satu Kesepakatan / Langkah Kecil Bersama (Opsional):</label>
            <input type="text" id="jointDecisionText" value="${esc(jointNote)}" placeholder="Misal: Buat rekening khusus bantuan ortu dengan plafon Rp 1 jt/bulan">
            <button class="plum-btn" id="saveJointDecisionBtn" style="width: 100%;">Simpan Kesepakatan Bersama 📝</button>
          </div>
        ` : `
          <div style="text-align: center; padding: 20px 10px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🔒</div>
            <div style="font-weight: 600; margin-bottom: 6px;">Jawaban Belum Bisa Dibuka Berdua</div>
            <p class="mute" style="font-size: 0.86rem; max-width: 400px; margin: 0 auto;">
              Untuk menjaga rasa aman psikologis, Ruang Bersama hanya akan terbuka jika <b>kedua belah pihak</b> telah mengisi dan mencentang persetujuan berbagi.
              <br><br>
              <i>Coba beralih ke tombol <b>Partner B</b> di bagian atas untuk mensimulasikan jawaban pasanganmu!</i>
            </p>
          </div>
        `}
      </div>
    `;
  }

  // Conversation Catalog List
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag plum">Pilar Relasi (Us)</span>
        <h1 style="margin: 4px 0;">Kita & Komunikasi</h1>
      </div>
    </div>
    <p class="mute">Persiapan pernikahan bukan untuk memaksakan kecocokan instan, tapi melatih cara mendengar dan bernegosiasi dengan aman.</p>

    <!-- Couple Switcher in List View -->
    <div class="couple-switcher">
      <div class="couple-switcher-label">
        Mode Reviewer / Simulasi: <b>${partnerLabel}</b>
      </div>
      <div class="perspective-toggle">
        <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPartnerA">Partner A</button>
        <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPartnerB">Partner B</button>
      </div>
    </div>

    <!-- Conversation Cards -->
    <div style="margin-top: 12px;">
      ${CONTENT.conversations.map(c => {
        const hasA = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].answer;
        const hasB = d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].answer;
        const bothShared = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].consentShare &&
                           d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].consentShare;

        return `
          <div class="card" style="border-left: 4px solid var(--plum);">
            <div class="card-title-row">
              <h3 style="margin: 0; font-size: 1.15rem;">${esc(c.title)}</h3>
              ${bothShared ? `<span class="consent-badge shared">✓ Selesai Berdua</span>` :
                (hasA || hasB ? `<span class="consent-badge locked">Sedang Berjalan</span>` : `<span class="card-tag plum">5–15 Mnt</span>`)}
            </div>
            <p class="mute" style="font-size: 0.88rem; margin: 6px 0 12px;">${esc(c.subtitle)}</p>

            <button class="plum-btn" data-open-convo="${c.id}" style="width: 100%;">
              Mulai / Lihat Percakapan Ini →
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Gottman Four Horsemen Reference Sheet -->
    <div class="card">
      <div class="card-title-row">
        <h3>Pencegah Racun Komunikasi (Gottman Antidotes)</h3>
        <span class="card-tag">Riset 40+ Tahun</span>
      </div>
      <p class="mute">4 pola percakapan perusak hubungan dan penawar sehatnya:</p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 12px; font-size: 0.88rem;">
          <b style="color: #DC2626;">Kritik Menyerang:</b> "Kamu selalu boros dan nggak mikir!"<br>
          <span style="color: var(--teal); font-weight: 600;">Penawar Sehat:</span> "Saya merasa cemas ketika kita belanja di luar rencana. Bisakah kita cek anggaran bersama?"
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 12px; font-size: 0.88rem;">
          <b style="color: #DC2626;">Menghina (Contempt):</b> Meremehkan atau menyindir sinis.<br>
          <span style="color: var(--teal); font-weight: 600;">Penawar Sehat:</span> Membangun budaya apresiasi & bersyukur atas usaha pasangan (Rasio 5:1).
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 12px; font-size: 0.88rem;">
          <b style="color: #DC2626;">Membela Diri (Defensiveness):</b> "Bukan salahku, kamu yang mulai duluan!"<br>
          <span style="color: var(--teal); font-weight: 600;">Penawar Sehat:</span> Mengakui bagian tanggung jawab diri: "Maaf, aku memang kelupaan mencatatnya."
        </div>
        <div style="background: var(--bg-canvas); border-radius: 8px; padding: 10px 12px; font-size: 0.88rem;">
          <b style="color: #DC2626;">Mendiamkan (Stonewalling):</b> Menutup diri dan mogok bicara.<br>
          <span style="color: var(--teal); font-weight: 600;">Penawar Sehat:</span> Minta jeda fisiologis 20 menit untuk menenangkan detak jantung sebelum lanjut bicara.
        </div>
      </div>
    </div>
  `;
}

function bindRelationship() {
  const switchA = $('#switchPartnerA');
  const switchB = $('#switchPartnerB');
  if (switchA) switchA.onclick = () => { store.d.currentPerspective = 'A'; store.save(); render(); };
  if (switchB) switchB.onclick = () => { store.d.currentPerspective = 'B'; store.save(); render(); };

  $$('[data-open-convo]').forEach(btn => {
    btn.onclick = () => {
      selectedConvoId = btn.dataset.openConvo;
      render();
    };
  });

  const backBtn = $('#backToConvoListBtn');
  if (backBtn) {
    backBtn.onclick = () => {
      selectedConvoId = null;
      render();
    };
  }

  const saveConvoBtn = $('#saveConvoAnswerBtn');
  if (saveConvoBtn) {
    saveConvoBtn.onclick = () => {
      const ans = $('#soloAnswerText').value.trim();
      const consent = $('#consentShareCheckbox').checked;
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

  const saveJointBtn = $('#saveJointDecisionBtn');
  if (saveJointBtn) {
    saveJointBtn.onclick = () => {
      const note = $('#jointDecisionText').value.trim();
      if (!note) {
        alert('Tuliskan kesepakatan kecil yang ingin kalian buat.');
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
// 6. Module: Self (Saya — "Progress & Safe Space")
// -------------------------------------------------------------
function renderSelf() {
  const d = store.d;
  const support = CONTENT.supportNotice;

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Profil & Keamanan</span>
        <h1 style="margin: 4px 0;">Ruang Saya</h1>
      </div>
    </div>
    <p class="mute">Refleksi perkembangan kebiasaanmu dan kendali privasi data.</p>

    <!-- Habit Log Summary -->
    <div class="card">
      <div class="card-title-row">
        <h3>Riwayat Praktik Pribadi</h3>
        <span class="card-tag saffron">Bukan Skor Kelayakan</span>
      </div>
      <p class="mute">Teman Siap tidak pernah memberi label "pasangan buruk" atau "gagal finansial". Setiap latihan adalah langkah belajar.</p>

      <ul style="padding-left: 20px; line-height: 1.8; color: var(--ink-secondary);">
        <li>Cek emosi & kebutuhan: <b>${d.checkins.length} kali</b></li>
        <li>Pencatatan pengeluaran sadar: <b>${d.expenses.length} transaksi</b></li>
        <li>Latihan jeda belanja (Urge Surfing): <b>${d.pauses.length} kali</b></li>
        <li>Rencana Jika-Maka aktif: <b>${d.plans.length} rencana</b></li>
        <li>Refleksi percakapan bersama: <b>${Object.keys(d.partnerA || {}).length} topik</b></li>
      </ul>
    </div>

    <!-- Privacy & Local-First Management -->
    <div class="card">
      <div class="card-title-row">
        <h3>Kendali Privasi & Data</h3>
        <span class="card-tag">Local-First</span>
      </div>
      <p class="mute">
        Semua catatan jurnal, angka keuangan, dan refleksi batinmu tersimpan aman secara lokal di browser ini. Tidak ada data yang dijual atau dilacak pihak ketiga.
      </p>

      <div class="btn-group">
        <button class="secondary" id="exportDataJsonBtn">Unduh Cadangan (JSON) 📥</button>
        <button class="secondary" id="wipeAllDataBtn" style="color: #DC2626; border-color: #FECACA;">Hapus Semua Data 🗑️</button>
      </div>
    </div>

    <!-- Verified Indonesian Crisis Hotlines -->
    <div class="card" style="border-left: 4px solid var(--teal);">
      <div class="card-title-row">
        <h3 style="color: var(--teal);">${esc(support.crisisTitle)}</h3>
        <span class="card-tag">Resmi Terverifikasi</span>
      </div>
      <p class="mute" style="font-size: 0.88rem;">${esc(support.disclaimer)}</p>
      <p style="font-size: 0.88rem; color: var(--ink-secondary); margin-bottom: 12px;">${esc(support.crisisText)}</p>

      ${support.hotlines.map(h => `
        <div class="hotline-card">
          <div class="hotline-name">${esc(h.name)}</div>
          <div class="hotline-number">${esc(h.contact)}</div>
          <div class="mute" style="font-size: 0.82rem;">${esc(h.desc)}</div>
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
      downloadAnchor.setAttribute('download', 'teman-siap-data-' + today() + '.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }

  const wipeBtn = $('#wipeAllDataBtn');
  if (wipeBtn) {
    wipeBtn.onclick = () => {
      if (confirm('Apakah kamu yakin ingin menghapus seluruh data dan riwayat di perangkat ini? Tindakan ini tidak dapat dibatalkan.')) {
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

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  render();
});
render();
