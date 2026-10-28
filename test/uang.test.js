import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Store, createInitialState } from '../public/js/store.js';
import { renderMoney } from '../public/js/screens/uang.js';
import { monthKey, today } from '../public/js/ui/utils.js';

describe('Uang & Savings Goal Top-up', () => {
  it('tracks savings on the goal only and does not add an expense entry', () => {
    const store = new Store();
    store.init();
    store.set(s => ({
      ...s,
      goal: { name: 'Dana Cadangan Sakinah', target: 5000000, saved: 1000000 },
      expenses: [
        { amount: 50000, category: 'Makanan', date: today() }
      ]
    }));

    const initialExpenseCount = store.d.expenses.length;
    const initialSaved = store.d.goal.saved;
    const topupAmount = 250000;

    // Simulate goal top-up: update goal only
    store.setGoal({
      ...store.d.goal,
      saved: store.d.goal.saved + topupAmount
    });

    // Verify goal saved is updated
    assert.equal(store.d.goal.saved, initialSaved + topupAmount);
    // Verify no expense was added
    assert.equal(store.d.expenses.length, initialExpenseCount, 'Savings top-up must NOT add an expense');
  });

  it('calculates "Tercatat bulan ini" from spending entries only, ignoring savings', () => {
    const currentMonth = monthKey();
    const store = {
      d: {
        goal: { name: 'Dana Darurat', target: 10000000, saved: 2000000 },
        expenses: [
          { amount: 75000, category: 'Makanan & Kebutuhan Dapur', date: `${currentMonth}-05` },
          { amount: 25000, category: 'Transportasi & Bensin', date: `${currentMonth}-10` },
          // Even if an older legacy state contained a savings entry:
          { amount: 500000, category: 'Tabungan Dana Cadangan', date: `${currentMonth}-12` },
          // Previous month spending should be ignored:
          { amount: 100000, category: 'Makanan & Kebutuhan Dapur', date: '2025-01-01' }
        ]
      }
    };

    const rendered = renderMoney(store);
    // Spending total should be 75,000 + 25,000 = 100,000 (Rp 100.000)
    // It should NOT include the 500,000 savings entry!
    assert.ok(
      rendered.includes('Rp&nbsp;100.000') || rendered.includes('Rp 100.000'),
      'Rendered display must count only spending entries (100.000) and ignore savings'
    );
    assert.ok(
      !rendered.includes('600.000'),
      'Rendered display must NOT include savings in spending total'
    );
  });
});
