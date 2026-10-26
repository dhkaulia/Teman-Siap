import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { migrate, createInitialState, CURRENT_STORE_VERSION } from '../public/js/store.js';

describe('Store Migration', () => {
  it('creates clean initial state with zero fake data for null input', () => {
    const state = migrate(null);
    assert.equal(state.version, CURRENT_STORE_VERSION);
    assert.equal(state.goal, null);
    assert.deepEqual(state.plans, []);
    assert.deepEqual(state.checkins, []);
    assert.deepEqual(state.expenses, []);
    assert.equal(state.faithPerspective, false);
  });

  it('migrates v1 state by adding missing partner & faith fields', () => {
    const v1State = {
      stage: 'Sudah bertunangan',
      checkins: [{ emotion: 'Tenang', at: 123456789 }],
      expenses: [{ amount: 25000, category: 'Makanan' }]
    };

    const migrated = migrate(v1State);
    assert.equal(migrated.version, CURRENT_STORE_VERSION);
    assert.equal(migrated.stage, 'Sudah bertunangan');
    assert.equal(migrated.checkins.length, 1);
    assert.equal(migrated.expenses.length, 1);
    assert.equal(migrated.goal, null);
    assert.deepEqual(migrated.partnerA, {});
    assert.deepEqual(migrated.partnerB, {});
    assert.equal(migrated.faithPerspective, false);
    assert.equal(migrated.currentPerspective, 'A');
  });

  it('removes fake default goal if present in older state', () => {
    const oldWithFakeGoal = {
      version: 2,
      goal: { name: 'Dana Darurat Sakinah', target: 3000000, saved: 750000 }
    };

    const migrated = migrate(oldWithFakeGoal);
    assert.equal(migrated.goal, null, 'Dummy prefilled goal must be stripped out');
  });

  it('preserves valid user-entered custom goal', () => {
    const customGoal = {
      version: 3,
      goal: { name: 'Tabungan Nikah Mandiri', target: 10000000, saved: 2500000 }
    };

    const migrated = migrate(customGoal);
    assert.deepEqual(migrated.goal, { name: 'Tabungan Nikah Mandiri', target: 10000000, saved: 2500000 });
  });

  it('preserves user opt-in faithPerspective if set to true', () => {
    const state = { version: 3, faithPerspective: true };
    const migrated = migrate(state);
    assert.equal(migrated.faithPerspective, true);
  });

  it('migrates older state to v5 with reward and gentle ritme defaults', () => {
    const state = {
      version: 4,
      checkins: [{ emotion: 'Gembira', at: 100000 }]
    };
    const migrated = migrate(state);
    assert.equal(migrated.version, 5);
    assert.equal(migrated.seeds, 0);
    assert.deepEqual(migrated.seedTransactions, []);
    assert.equal(migrated.weeklyGoal, 3);
    assert.equal(migrated.enableRitme, true);
    assert.equal(migrated.enableRewards, true);
    assert.deepEqual(migrated.inventory, ['pot-clay', 'outfit-default', 'bg-default']);
    assert.deepEqual(migrated.equippedCosmetics, {
      pot: 'pot-clay',
      outfit: 'outfit-default',
      background: 'bg-default'
    });
    assert.deepEqual(migrated.practices, []);
    assert.deepEqual(migrated.completedPathNodes, []);
  });

  it('preserves custom seed balance and toggles when migrating to v5', () => {
    const customState = {
      version: 4,
      seeds: 15,
      weeklyGoal: 5,
      enableRitme: false,
      enableRewards: false,
      inventory: ['pot-clay', 'pot-blue-ceramic'],
      equippedCosmetics: {
        pot: 'pot-blue-ceramic',
        outfit: 'outfit-default',
        background: 'bg-default'
      }
    };
    const migrated = migrate(customState);
    assert.equal(migrated.version, 5);
    assert.equal(migrated.seeds, 15);
    assert.equal(migrated.weeklyGoal, 5);
    assert.equal(migrated.enableRitme, false);
    assert.equal(migrated.enableRewards, false);
    assert.deepEqual(migrated.inventory, ['pot-clay', 'pot-blue-ceramic']);
    assert.equal(migrated.equippedCosmetics.pot, 'pot-blue-ceramic');
  });
});
