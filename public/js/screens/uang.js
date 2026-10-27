/**
 * Screen: Keuangan Sadar (My Money)
 * Calm hub + tiles:
 * - One large number "Rp 0" with a single-line caption "Dari catatanmu"
 * - Three icon tiles (Tabungan, Jeda, Rencana) with a status chip
 * - Fixed "+ Catat" button with enough bottom padding so no row is hidden
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
import { renderIcon } from '../ui/icons.js';
import { playTapSound, triggerHapticTap } from '../ui/feedback.js';

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
    <div class="uang-screen-wrap">
      <!-- Screen Header -->
      <div class="card-title-row mb-2">
        <h1 class="text-xl display font-bold mb-0">${COPY.uang.title}</h1>
        <span class="card-tag saffron">${COPY.uang.tag}</span>
      </div>

      <!-- One Large Number with Single-Line Caption "Dari catatanmu" -->
      <div class="card uang-hero-card mb-3">
        <div class="card-title-row mb-1">
          <span class="card-tag">Tercatat Bulan Ini</span>
          <span class="text-xs mute">${new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="uang-amount-display display tabular-nums">
          ${currentMonthExpenses.length ? idr(totalSpent) : 'Rp 0'}
        </div>
        <div class="uang-caption">Dari catatanmu</div>
      </div>

      <!-- Three Icon Tiles (Tabungan, Jeda, Rencana) with Status Chips -->
      <div class="uang-tiles-grid mb-3">
        <!-- Tile 1: Tabungan -->
        <button type="button" class="uang-tile-btn" id="hubGoalRow" aria-label="Tabungan">
          <div class="uang-tile-icon teal" aria-hidden="true">${renderIcon('goal')}</div>
          <div class="uang-tile-title">Tabungan</div>
          <span class="card-tag ${goal ? 'tunas' : ''}">
            ${goal ? `${Math.round((goal.saved / (goal.target || 1)) * 100)}%` : 'Belum ada'}
          </span>
        </button>

        <!-- Tile 2: Jeda -->
        <button type="button" class="uang-tile-btn" id="hubUrgeRow" aria-label="Jeda">
          <div class="uang-tile-icon saffron" aria-hidden="true">${renderIcon('urge')}</div>
          <div class="uang-tile-title">Jeda</div>
          <span class="card-tag saffron">Urge Surfing</span>
        </button>

        <!-- Tile 3: Rencana -->
        <button type="button" class="uang-tile-btn" id="hubPlanRow" aria-label="Rencana">
          <div class="uang-tile-icon plum" aria-hidden="true">${renderIcon('plan')}</div>
          <div class="uang-tile-title">Rencana</div>
          <span class="card-tag ${plans.length ? 'tunas' : ''}">
            ${plans.length ? `${plans.length} aktif` : 'Belum ada'}
          </span>
        </button>
      </div>

      <!-- Active Goal Progress Details (if active) -->
      ${goal ? `
        <div class="card p-3 mb-3">
          <div class="flex justify-between items-center text-xs mb-1">
            <span class="font-bold text-ink-primary">${esc(goal.name)}</span>
            <span class="font-bold text-teal">${idr(goal.saved)} / ${idr(goal.target)}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" data-progress="${Math.min(100, Math.round((goal.saved / (goal.target || 1)) * 100))}"></div>
          </div>
        </div>
      ` : ''}

      <!-- Active If-Then Plans (if any) -->
      ${plans.length ? `
        <div class="card mb-3">
          <div class="card-title-row mb-2">
            <h3 class="text-sm font-bold text-ink-primary mb-0">Rencana Jika-Maka</h3>
            <button type="button" class="secondary btn-action-sm" id="addNewPlanBtn">+ Tambah</button>
          </div>
          <div class="flex flex-col gap-2">
            ${plans.map((p) => `
              <div class="plan-item">
                <div class="text-xs font-medium"><b>Jika</b> ${esc(p.i)}, <b>maka</b> ${esc(p.t)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recent Transactions List (if any) -->
      ${currentMonthExpenses.length ? `
        <div class="card mb-3">
          <div class="card-title-row mb-1">
            <h3 class="text-sm font-bold text-ink-primary mb-0">Catatan Terakhir</h3>
            <span class="text-xs mute">${currentMonthExpenses.length} transaksi</span>
          </div>
          <div class="flex flex-col">
            ${currentMonthExpenses.slice(-4).reverse().map(exp => `
              <div class="recent-expense-row">
                <div>
                  <div class="font-medium text-xs text-ink-primary">${esc(exp.category)}</div>
                  <div class="mute text-xs">${esc(exp.date)}${exp.note ? ' • ' + esc(exp.note) : ''}</div>
                </div>
                <div class="font-bold text-teal text-xs">${idr(exp.amount)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Fixed Big "+ Catat" Button in Thumb Zone -->
    <div class="sticky-bottom-action">
      <button type="button" class="primary w-full btn-lg font-bold" id="openQuickLogBtn">
        + Catat
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
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createExpenseFlow(store, () => rerender()));
    };
  }

  // Tile 1: Goal Tile / Row
  const goalRow = container.querySelector('#hubGoalRow');
  if (goalRow) {
    goalRow.onclick = () => {
      playTapSound();
      triggerHapticTap();
      const currentGoal = store.d.goal;
      if (!currentGoal) {
        // Create new goal flow
        sessionRunner.start(createGoalFlow(() => rerender()));
      } else {
        // Open quick top-up bottom sheet
        const sheet = new BottomSheet();
        sheet.open({
          title: `+ Tabung: ${currentGoal.name}`,
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
              Simpan Tabungan
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
              playTapSound();
              triggerHapticTap();
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

  // Tile 2: Urge Surfing Tile / Row
  const urgeRow = container.querySelector('#hubUrgeRow');
  if (urgeRow) {
    urgeRow.onclick = () => {
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createUrgeFlow(store.d.faithPerspective, () => rerender()));
    };
  }

  // Tile 3: Plan Tile / Row
  const planRow = container.querySelector('#hubPlanRow');
  if (planRow) {
    planRow.onclick = () => {
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createPlanFlow(() => rerender()));
    };
  }

  const addPlanBtn = container.querySelector('#addNewPlanBtn');
  if (addPlanBtn) {
    addPlanBtn.onclick = () => {
      playTapSound();
      triggerHapticTap();
      sessionRunner.start(createPlanFlow(() => rerender()));
    };
  }
}
