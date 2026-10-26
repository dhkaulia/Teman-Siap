/**
 * Screen: Keuangan Sadar (My Money)
 * Calm hub + short flows:
 * - One large number "Tercatat bulan ini" with caption "Dari catatanmu, bukan saldo bank"
 * - Empty state when no data: "Belum ada catatan. Mulai dari satu."
 * - Big "+ Catat" button fixed in the thumb zone
 * - Three rows below: Tujuan tabungan, Jeda belanja, Rencana jika-maka
 * Acceptance: One-thumb logging, timer survives screen lock & reload, no red colors, amounts formatted as Rupiah.
 */
import { sessionRunner } from '../session.js';
import { createExpenseFlow } from '../flows/expenseFlow.js';
import { createUrgeFlow } from '../flows/urgeFlow.js';
import { createGoalFlow } from '../flows/goalFlow.js';
import { createPlanFlow } from '../flows/planFlow.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { Keypad } from '../ui/keypad.js';
import { esc, idr, monthKey, today } from '../ui/utils.js';
import { COPY } from '../copy.js';

export function cleanupUang() {
  // Hub has no background timers
}

export function setMoneySubView() {
  // Replaced with flow-driven session runner
}

export function renderMoney(store) {
  const d = store.d;
  const currentMonthKey = monthKey();
  const currentMonthExpenses = (d.expenses || []).filter(e => e.date && e.date.startsWith(currentMonthKey));
  const totalSpent = currentMonthExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const goal = d.goal;
  const plans = d.plans || [];

  return `
    <div class="card-title-row mb-1">
      <div>
        <span class="card-tag">${COPY.uang.tag}</span>
        <h1 class="mt-1 mb-1">${COPY.uang.title}</h1>
      </div>
    </div>
    <p class="mute text-sm mb-3">${COPY.uang.subtitle}</p>

    <!-- Monthly Summary Hub Card -->
    <div class="card mt-1 mb-3">
      <div class="card-title-row">
        <h2 class="text-xs font-bold text-ink-primary mb-0">${COPY.uang.hubTitle}</h2>
        <span class="card-tag">${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
      </div>

      ${currentMonthExpenses.length ? `
        <div class="month-amount-display">
          ${idr(totalSpent)}
        </div>
        <p class="mute text-xs mb-1">Tercatat ${currentMonthExpenses.length} transaksi mandiri bulan ini.</p>
        <div class="month-note">${COPY.uang.hubCaption}</div>
      ` : `
        <div class="month-amount-display">
          Rp 0
        </div>
        <p class="mute text-sm mb-1 font-medium">${COPY.uang.hubEmpty}</p>
        <div class="month-note">${COPY.uang.hubCaption}</div>
      `}
    </div>

    <!-- Three Rows: Tujuan Tabungan, Jeda Belanja, Rencana Jika-Maka -->
    <div class="exercise-rows mb-4">
      <!-- Row 1: Tujuan Tabungan -->
      <div class="exercise-row" id="hubGoalRow" role="button" tabindex="0" aria-label="Tujuan Tabungan">
        <span class="exercise-icon" aria-hidden="true">🛡️</span>
        <div class="exercise-row-content">
          <div class="flex justify-between items-center">
            <div class="exercise-row-title">Tujuan Tabungan</div>
            ${goal ? `<span class="text-xs font-bold text-teal">${idr(goal.saved)} / ${idr(goal.target)}</span>` : ''}
          </div>
          ${goal ? `
            <div class="bar-track mt-1 mb-1">
              <div class="bar-fill" data-progress="${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}"></div>
            </div>
            <div class="flex justify-between items-center text-xs mute">
              <span>${esc(goal.name)}</span>
              <span>Tercapai ${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}%</span>
            </div>
          ` : `
            <div class="exercise-row-desc">Belum ada tujuan tabungan aktif. Ketuk untuk membuat tujuan pertama.</div>
          `}
        </div>
        <span class="exercise-row-arrow" aria-hidden="true">${goal ? '+' : '→'}</span>
      </div>

      <!-- Row 2: Jeda Belanja (Urge Surfing) -->
      <div class="exercise-row" id="hubUrgeRow" role="button" tabindex="0" aria-label="Jeda Belanja (Urge Surfing)">
        <span class="exercise-icon" aria-hidden="true">🌊</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Jeda Belanja (Urge Surfing)</div>
          <div class="exercise-row-desc">Tunda dorongan belanja 10 menit untuk menjernihkan pikiran</div>
        </div>
        <span class="exercise-row-arrow" aria-hidden="true">→</span>
      </div>

      <!-- Row 3: Rencana Jika-Maka -->
      <div class="exercise-row" id="hubPlanRow" role="button" tabindex="0" aria-label="Rencana Jika-Maka">
        <span class="exercise-icon" aria-hidden="true">💡</span>
        <div class="exercise-row-content">
          <div class="exercise-row-title">Rencana Jika-Maka</div>
          <div class="exercise-row-desc">${plans.length ? `${plans.length} rencana aktif untuk otomatisasi respon sehat` : 'Susun rencana otomatis saat godaan belanja muncul'}</div>
        </div>
        <span class="exercise-row-arrow" aria-hidden="true">→</span>
      </div>
    </div>

    <!-- Active If-Then Plans List (if any) -->
    ${plans.length ? `
      <div class="card mb-4">
        <div class="card-title-row mb-2">
          <h3 class="text-sm font-bold text-ink-primary mb-0">Rencana Jika-Maka Aktif</h3>
          <button type="button" class="secondary btn-action-sm" id="addNewPlanBtn">+ Tambah</button>
        </div>
        <div class="flex flex-col gap-2">
          ${plans.map((p, idx) => `
            <div class="plan-item">
              <div class="text-sm font-medium"><b>Jika</b> ${esc(p.i)}, <b>maka</b> ${esc(p.t)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Recent Conscious Expenses List (if any) -->
    ${currentMonthExpenses.length ? `
      <div class="card mb-5">
        <div class="card-title-row mb-1">
          <h3 class="text-sm font-bold text-ink-primary mb-0">Catatan Terakhir</h3>
          <span class="text-xs mute">${currentMonthExpenses.length} catatan</span>
        </div>
        <div class="flex flex-col">
          ${currentMonthExpenses.slice(-5).reverse().map(exp => `
            <div class="recent-expense-row">
              <div>
                <div class="font-medium text-sm text-ink-primary">${esc(exp.category)}</div>
                <div class="mute text-xs">${esc(exp.date)}${exp.note ? ' • ' + esc(exp.note) : ''}</div>
              </div>
              <div class="font-bold text-teal text-sm">${idr(exp.amount)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Fixed Big "+ Catat" Button in Thumb Zone -->
    <div class="sticky-bottom-action">
      <button type="button" class="primary w-full btn-lg font-bold" id="openQuickLogBtn">
        + Catat Pengeluaran
      </button>
    </div>
  `;
}

export function bindMoney(container, store, navigate, rerender) {
  // Render progress bar widths cleanly
  container.querySelectorAll('.bar-fill[data-progress]').forEach(el => {
    el.style.width = `${el.dataset.progress}%`;
  });

  // Big "+ Catat" thumb-zone button
  const quickLogBtn = container.querySelector('#openQuickLogBtn');
  if (quickLogBtn) {
    quickLogBtn.onclick = () => {
      sessionRunner.start(createExpenseFlow(store, () => rerender()));
    };
  }

  // Row 1: Goal Row
  const goalRow = container.querySelector('#hubGoalRow');
  if (goalRow) {
    goalRow.onclick = () => {
      const currentGoal = store.d.goal;
      if (!currentGoal) {
        // Create new goal flow
        sessionRunner.start(createGoalFlow(() => rerender()));
      } else {
        // Open quick top-up bottom sheet
        const sheet = new BottomSheet();
        sheet.open({
          title: `+ Tabung untuk ${currentGoal.name}`,
          content: `
            <div class="card card-border-teal p-2 mb-3">
              <div class="flex justify-between items-center text-xs mute mb-1">
                <span>Terkumpul:</span>
                <span>Target:</span>
              </div>
              <div class="flex justify-between items-center font-bold text-teal">
                <span>${idr(currentGoal.saved)}</span>
                <span>${idr(currentGoal.target)}</span>
              </div>
            </div>
            <label class="text-sm font-medium">Masukkan nominal tabungan tambahan:</label>
            <div id="topupKeypadMount"></div>
            <button type="button" class="primary w-full mt-3 btn-lg font-bold" id="confirmTopupBtn">
              Simpan Tabungan ✨
            </button>
          `,
          onClose: () => {}
        });

        setTimeout(() => {
          let topupAmt = 50000;
          const mountEl = document.getElementById('topupKeypadMount');
          if (mountEl) {
            new Keypad({
              container: mountEl,
              initialValue: 50000,
              onChange: (v) => { topupAmt = v; }
            });
          }

          const confirmBtn = document.getElementById('confirmTopupBtn');
          if (confirmBtn) {
            confirmBtn.onclick = () => {
              if (topupAmt > 0) {
                store.setGoal({
                  ...currentGoal,
                  saved: currentGoal.saved + topupAmt
                });
                store.addExpense({
                  amount: topupAmt,
                  category: 'Tabungan Dana Cadangan',
                  date: today(),
                  tag: 'planned',
                  note: 'Menabung untuk ' + currentGoal.name,
                  at: Date.now()
                });
              }
              sheet.close();
              rerender();
            };
          }
        }, 50);
      }
    };
  }

  // Row 2: Urge Surfing Row
  const urgeRow = container.querySelector('#hubUrgeRow');
  if (urgeRow) {
    urgeRow.onclick = () => {
      sessionRunner.start(createUrgeFlow(store.d.faithPerspective, () => rerender()));
    };
  }

  // Row 3: Plan Row
  const planRow = container.querySelector('#hubPlanRow');
  if (planRow) {
    planRow.onclick = () => {
      sessionRunner.start(createPlanFlow(() => rerender()));
    };
  }

  const addPlanBtn = container.querySelector('#addNewPlanBtn');
  if (addPlanBtn) {
    addPlanBtn.onclick = () => {
      sessionRunner.start(createPlanFlow(() => rerender()));
    };
  }
}
