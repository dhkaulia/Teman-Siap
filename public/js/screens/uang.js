/**
 * Screen: Keuangan Sadar (My Money)
 * Log expenses + Urge surfing (ACT & CBT) + Savings Goals (zero fake data) + If-Then Plans
 */
import { CONTENT } from '../../content.js';
import { esc, idr, today, monthKey } from '../ui/utils.js';
import { sessionRunner } from '../session.js';
import { createExpenseFlow } from '../flows/expenseFlow.js';
import { createGoalFlow } from '../flows/goalFlow.js';

let moneySubView = 'log'; // 'log' | 'urge' | 'goals'
let showNewGoalForm = false;
let activeReframeIndex = 0;
let activeTimer = null;
let timerSeconds = 600;

export function cleanupUang() {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
}

export function setMoneySubView(subView) {
  cleanupUang();
  moneySubView = subView || 'log';
}

export function renderMoney(store) {
  const d = store.d;
  const currentMonthExpenses = (d.expenses || []).filter(e => e.date && e.date.startsWith(monthKey()));
  const totalSpent = currentMonthExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Finansial</span>
        <h1 class="mt-1 mb-1">Keuangan Sadar</h1>
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
    <div class="card mt-1">
      <div class="card-title-row">
        <h3>Ringkasan Bulan Ini</h3>
        <span class="card-tag">${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="month-amount-display">
        ${idr(totalSpent)}
      </div>
      <p class="mute mb-0">
        ${currentMonthExpenses.length ? `Tercatat ${currentMonthExpenses.length} transaksi mandiri.` : 'Belum ada pengeluaran yang dicatat bulan ini.'}
        <br><span class="month-note">*Catatan mandiri untuk pemahaman diri, bukan saldo mutasi bank.</span>
      </p>
    </div>

    ${moneySubView === 'log' ? renderMoneyLog(store) : 
      moneySubView === 'urge' ? renderMoneyUrge(store) : renderMoneyGoals(store)}
  `;
}

function renderMoneyLog(store) {
  return `
    <!-- Guided Flow Option -->
    <div class="card card-border-saffron mb-3">
      <div class="card-title-row">
        <h3>Panduan Catat Pengeluaran</h3>
        <span class="card-tag saffron">Satu per Langkah</span>
      </div>
      <p class="mute">Fokus mencatat tanpa rasa bersalah melalui panduan layar demi layar.</p>
      <button type="button" class="saffron-btn w-full" id="startExpenseFlowBtn">
        Mulai Catat Terpandu 🪙
      </button>
    </div>

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
        ${CONTENT.categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
      </select>

      <label for="expDateInput">Tanggal</label>
      <input type="date" id="expDateInput" value="${today()}">

      <label for="expTagSelect">Pengeluaran ini paling tepat disebut:</label>
      <select id="expTagSelect">
        ${CONTENT.expenseTags.map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('')}
      </select>

      <label for="expNoteInput">Catatan Barang (Boleh dilewati):</label>
      <input type="text" id="expNoteInput" placeholder="Misal: Es kopi saat stres deadline">

      <div class="sticky-bottom-action">
        <button type="button" class="primary w-full" id="saveExpenseBtn">
          Simpan Pengeluaran Sadar ✨
        </button>
      </div>

      <details class="clinical-note mt-4">
        <summary>Pelajari prinsip di balik pencatatan ini</summary>
        <p>Pendekatan ini mengatasi 'Ostrich Effect' (kebiasaan menghindari kenyataan finansial karena takut stres). Dengan menandai pemicu emosi (antecedents), kamu memisahkan kebutuhan nyata dari belanja pelarian.</p>
      </details>
    </div>
  `;
}

function renderMoneyUrge(store) {
  const faith = store.d.faithPerspective;
  const reframe = CONTENT.cognitiveReframes[activeReframeIndex];
  const reframeText = faith && reframe.counterPerspectiveFaith ? reframe.counterPerspectiveFaith : reframe.counterPerspective;

  return `
    <div class="urge-surf-box">
      <div class="card-title-row">
        <h3 class="text-teal-dark">🌊 Berselancar Dorongan (Urge Surfing)</h3>
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
          <span id="sliderIntensityLabel" class="text-saffron">5 / 10 (Sedang)</span>
        </div>
        <input type="range" class="slider-range" id="urgeSlider" min="1" max="10" value="5">
      </div>

      <div class="timer-display" id="urgeTimerDisplay">10:00</div>

      <div class="btn-group">
        <button type="button" class="primary" id="startUrgeTimerBtn">Mulai Jeda 10 Menit ⏳</button>
        <button type="button" class="secondary" id="resetUrgeTimerBtn">Reset</button>
      </div>

      <!-- CBT Restructuring Card -->
      <div class="reframe-card">
        <div class="reframe-tag">
          💡 Sudut Pandang Seimbang
        </div>
        <div class="reframe-thought" id="reframeThought">${esc(reframe.impulseThought)}</div>
        <div class="reframe-answer" id="reframeAnswer">${esc(reframeText)}</div>
        <div class="text-right mt-2">
          <button type="button" class="secondary btn-action-sm" id="nextReframeBtn">
            Lihat Contoh Lain ↻
          </button>
        </div>
      </div>

      <details class="clinical-note mt-3">
        <summary>Pelajari prinsip di balik jeda ini</summary>
        <p>Berdasarkan teknik 'Urge Surfing' dari Acceptance & Commitment Therapy (ACT) dan Restrukturisasi Kognitif (CBT). Kamu melatih otak bahwa dorongan kuat tidak harus selalu diikuti dengan tindakan membeli.</p>
      </details>
    </div>
  `;
}

function renderMoneyGoals(store) {
  const d = store.d;
  const goal = d.goal;

  return `
    <!-- Goal Section: Empty state with single button if no goal entered -->
    <div class="card">
      <div class="card-title-row">
        <h3>Tujuan Tabungan Bersama</h3>
        <span class="card-tag saffron">${d.faithPerspective ? 'Masa Depan Sakinah' : 'Masa Depan'}</span>
      </div>

      ${goal ? `
        <div class="card-title-row mt-1 mb-1">
          <span class="font-bold text-lg">${esc(goal.name)}</span>
          <span class="font-medium text-teal">${idr(goal.saved)} / ${idr(goal.target)}</span>
        </div>

        <div class="bar-track">
          <div class="bar-fill" data-progress="${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}"></div>
        </div>
        <div class="mute text-right text-sm mb-3">
          Tercapai ${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}%
        </div>

        <label for="addSaveInput">Tambah tabungan hari ini:</label>
        <div class="flex gap-2">
          <input type="number" id="addSaveInput" inputmode="numeric" pattern="[0-9]*" placeholder="Nominal (Rp)" min="1" class="mb-0">
          <button type="button" class="saffron-btn nowrap" id="addSaveBtn">+ Tabung</button>
        </div>
      ` : (showNewGoalForm ? `
        <div class="mt-2">
          <label for="newGoalNameInput">Nama Tujuan Tabungan:</label>
          <input type="text" id="newGoalNameInput" placeholder="Misal: Dana Cadangan / Tempat Tinggal Mandiri">

          <label for="newGoalTargetInput">Target Nominal (Rp):</label>
          <input type="number" id="newGoalTargetInput" inputmode="numeric" pattern="[0-9]*" placeholder="Misal: 5000000" min="1">

          <div class="btn-group">
            <button type="button" class="primary" id="saveNewGoalBtn">Simpan Tujuan Tabungan</button>
            <button type="button" class="secondary" id="cancelGoalFormBtn">Batal</button>
          </div>
        </div>
      ` : `
        <div class="empty-goal-box">
          <p class="mute mb-3">Belum ada tujuan tabungan yang kamu buat.</p>
          <button type="button" class="primary w-full" id="openGoalFormBtn">
            Buat tujuan pertama
          </button>
        </div>
      `)}
    </div>

    <!-- If-Then Plans Section -->
    <div class="card">
      <div class="card-title-row">
        <h3>Rencana Jika-Maka Pribadi</h3>
        <span class="card-tag">Otomatisasi Respon</span>
      </div>
      <p class="mute">Membantu otak mengambil tindakan sehat secara otomatis saat situasi godaan muncul.</p>

      ${d.plans && d.plans.length ? `
        <div class="mb-3">
          ${d.plans.map(p => `
            <div class="plan-item">
              <b>Jika:</b> ${esc(p.i)}<br>
              <b>Maka saya akan:</b> ${esc(p.t)}
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="mute text-subtle">Belum ada rencana jika-maka.</p>
      `}

      <div class="border-t pt-3">
        <label for="planTriggerInput">Jika saya...</label>
        <input type="text" id="planTriggerInput" placeholder="misal: ingin belanja karena lelah kerja">

        <label for="planActionInput">Maka saya akan...</label>
        <input type="text" id="planActionInput" placeholder="misal: cuci muka dan minum air hangat dulu">

        <button type="button" class="secondary w-full mb-3" id="saveCustomPlanBtn">
          + Simpan Rencana Jika-Maka
        </button>

        <details>
          <summary class="font-medium text-teal cursor-pointer text-sm">
            Lihat contoh situasi siap pakai
          </summary>
          <div class="mt-2">
            ${CONTENT.presetPlans.map((pp, idx) => `
              <div class="plan-preset-row">
                <span><b>Jika</b> ${esc(pp.i)}, <b>maka</b> ${esc(pp.t)}</span>
                <button type="button" class="secondary btn-action-sm nowrap" data-adopt-plan="${idx}">
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

export function bindMoney(container, store, navigate, rerender) {
  // Update progress bar widths without inline style in templates
  container.querySelectorAll('.bar-fill[data-progress]').forEach(el => {
    el.style.width = `${el.dataset.progress}%`;
  });

  const tabLog = container.querySelector('#moneyTabLog');
  const tabUrge = container.querySelector('#moneyTabUrge');
  const tabGoals = container.querySelector('#moneyTabGoals');
  if (tabLog) tabLog.onclick = () => { cleanupUang(); moneySubView = 'log'; rerender(); };
  if (tabUrge) tabUrge.onclick = () => { cleanupUang(); moneySubView = 'urge'; rerender(); };
  if (tabGoals) tabGoals.onclick = () => { cleanupUang(); moneySubView = 'goals'; rerender(); };

  // Full-screen session runner trigger for expense
  const startExpBtn = container.querySelector('#startExpenseFlowBtn');
  if (startExpBtn) {
    startExpBtn.onclick = () => {
      sessionRunner.start(createExpenseFlow(), {}, () => {
        rerender();
      });
    };
  }

  // Save Expense
  const saveExpBtn = container.querySelector('#saveExpenseBtn');
  if (saveExpBtn) {
    saveExpBtn.onclick = () => {
      const amountVal = container.querySelector('#expAmountInput').value;
      const amount = Number(amountVal);
      if (!amount || amount <= 0) {
        alert('Masukkan nominal belanja yang valid (lebih dari 0).');
        return;
      }
      const category = container.querySelector('#expCatSelect').value;
      const date = container.querySelector('#expDateInput').value || today();
      const tag = container.querySelector('#expTagSelect').value;
      const note = container.querySelector('#expNoteInput').value.trim();

      store.addExpense({ amount, category, date, tag, note, at: Date.now() });
      alert('Pengeluaran berhasil dicatat secara sadar.');
      rerender();
    };
  }

  // Urge Surfing Slider & Timer
  const slider = container.querySelector('#urgeSlider');
  const sliderLabel = container.querySelector('#sliderIntensityLabel');
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

  const nextReframeBtn = container.querySelector('#nextReframeBtn');
  if (nextReframeBtn) {
    nextReframeBtn.onclick = () => {
      activeReframeIndex = (activeReframeIndex + 1) % CONTENT.cognitiveReframes.length;
      const ref = CONTENT.cognitiveReframes[activeReframeIndex];
      const faith = store.d.faithPerspective;
      const thEl = container.querySelector('#reframeThought');
      const ansEl = container.querySelector('#reframeAnswer');
      if (thEl) thEl.textContent = ref.impulseThought;
      if (ansEl) ansEl.textContent = faith && ref.counterPerspectiveFaith ? ref.counterPerspectiveFaith : ref.counterPerspective;
    };
  }

  const startTimerBtn = container.querySelector('#startUrgeTimerBtn');
  const resetTimerBtn = container.querySelector('#resetUrgeTimerBtn');
  const timerDisplay = container.querySelector('#urgeTimerDisplay');

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

          store.addPause({
            intensity: slider ? slider.value : 5,
            helped: true,
            at: Date.now()
          });
          alert('10 menit jeda selesai! Luar biasa telah memberi ruang bagi dirimu. Keputusan tetap di tanganmu dengan pikiran yang lebih tenang.');
          rerender();
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
  const openGoalBtn = container.querySelector('#openGoalFormBtn');
  if (openGoalBtn) {
    openGoalBtn.onclick = () => {
      showNewGoalForm = true;
      rerender();
    };
  }

  const cancelGoalBtn = container.querySelector('#cancelGoalFormBtn');
  if (cancelGoalBtn) {
    cancelGoalBtn.onclick = () => {
      showNewGoalForm = false;
      rerender();
    };
  }

  const saveGoalBtn = container.querySelector('#saveNewGoalBtn');
  if (saveGoalBtn) {
    saveGoalBtn.onclick = () => {
      const name = container.querySelector('#newGoalNameInput').value.trim();
      const target = Number(container.querySelector('#newGoalTargetInput').value);
      if (!name || !target || target <= 0) {
        alert('Harap isi nama tujuan dan nominal target.');
        return;
      }
      store.setGoal({ name, target, saved: 0 });
      showNewGoalForm = false;
      alert(`Tujuan tabungan "${name}" berhasil dibuat!`);
      rerender();
    };
  }

  const addSaveBtn = container.querySelector('#addSaveBtn');
  if (addSaveBtn) {
    addSaveBtn.onclick = () => {
      const val = Number(container.querySelector('#addSaveInput').value);
      if (!val || val <= 0) {
        alert('Masukkan nominal tabungan yang valid.');
        return;
      }
      const currentGoal = store.d.goal;
      if (!currentGoal) return;

      store.setGoal({
        ...currentGoal,
        saved: currentGoal.saved + val
      });

      store.addExpense({
        amount: val,
        category: 'Tabungan Dana Cadangan',
        date: today(),
        tag: 'planned',
        note: 'Menabung untuk ' + currentGoal.name,
        at: Date.now()
      });

      alert(`Berhasil menambahkan ${idr(val)} ke tabungan ${currentGoal.name}!`);
      rerender();
    };
  }

  // If-then plan creation
  const savePlanBtn = container.querySelector('#saveCustomPlanBtn');
  if (savePlanBtn) {
    savePlanBtn.onclick = () => {
      const i = container.querySelector('#planTriggerInput').value.trim();
      const t = container.querySelector('#planActionInput').value.trim();
      if (!i || !t) {
        alert('Harap isi pemicu ("Jika...") dan tindakannya ("Maka...").');
        return;
      }
      store.addPlan({ i, t, at: Date.now() });
      alert('Rencana Jika-Maka berhasil disimpan!');
      rerender();
    };
  }

  container.querySelectorAll('[data-adopt-plan]').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.adoptPlan);
      const pp = CONTENT.presetPlans[idx];
      if (pp) {
        store.addPlan({ i: pp.i, t: pp.t, at: Date.now() });
        alert('Rencana berhasil diadopsi ke daftar pribadimu!');
        rerender();
      }
    };
  });
}
