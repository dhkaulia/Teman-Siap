import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  JAKARTA_OFFSET_MS,
  getJakartaWeekBounds,
  getJakartaMonthKey,
  getAllPractices,
  getJakartaWeeklyPracticeCount,
  calculateRitme,
  getSeeds,
  awardSeeds,
  purchaseCosmetic,
  equipCosmetic,
  checkMilestones,
  COSMETICS_CATALOG,
  WEEKLY_GOAL_OPTIONS
} from '../public/js/rewards.js';
import { renderSelf } from '../public/js/screens/saya.js';
import { renderHome } from '../public/js/screens/home.js';

describe('Reward System & Gentle Weekly Ritme (Anti-Pressure)', () => {

  describe('Timezone & Week-Boundary Edge Cases (Asia/Jakarta UTC+7)', () => {
    it('calculates exact Monday 00:00:00 to Sunday 23:59:59 in Asia/Jakarta', () => {
      // 2026-10-27 is a Tuesday in Asia/Jakarta
      // Monday of that week: 2026-10-26 00:00:00 WIB = 2026-10-25 17:00:00 UTC
      // Sunday of that week: 2026-11-01 23:59:59.999 WIB = 2026-11-01 16:59:59.999 UTC
      const tuesdayWib = Date.UTC(2026, 9, 27, 3, 0, 0); // 10:00 AM WIB
      const bounds = getJakartaWeekBounds(tuesdayWib);

      const startJakartaDate = new Date(bounds.startUtc + JAKARTA_OFFSET_MS);
      const endJakartaDate = new Date(bounds.endUtc + JAKARTA_OFFSET_MS);

      // Start must be Monday 00:00:00
      assert.equal(startJakartaDate.getUTCDay(), 1, 'Start day must be Monday');
      assert.equal(startJakartaDate.getUTCHours(), 0);
      assert.equal(startJakartaDate.getUTCMinutes(), 0);
      assert.equal(startJakartaDate.getUTCSeconds(), 0);
      assert.equal(bounds.weekKey, '2026-10-26');

      // End must be Sunday 23:59:59.999
      assert.equal(endJakartaDate.getUTCDay(), 0, 'End day must be Sunday');
      assert.equal(endJakartaDate.getUTCHours(), 23);
      assert.equal(endJakartaDate.getUTCMinutes(), 59);
      assert.equal(endJakartaDate.getUTCSeconds(), 59);
    });

    it('places Sunday 23:58 WIB and Monday 00:02 WIB into separate weeks', () => {
      // Sunday night: 2026-11-01 23:58:00 WIB (Sunday 16:58:00 UTC)
      const sundayNightUtc = Date.UTC(2026, 10, 1, 16, 58, 0);
      const sundayBounds = getJakartaWeekBounds(sundayNightUtc);

      // Monday morning: 2026-11-02 00:02:00 WIB (Sunday 17:02:00 UTC)
      const mondayMorningUtc = Date.UTC(2026, 10, 1, 17, 2, 0);
      const mondayBounds = getJakartaWeekBounds(mondayMorningUtc);

      assert.equal(sundayBounds.weekKey, '2026-10-26');
      assert.equal(mondayBounds.weekKey, '2026-11-02');
      assert.notEqual(sundayBounds.startUtc, mondayBounds.startUtc);
    });

    it('generates consistent month key in Asia/Jakarta', () => {
      // 2026-10-31 23:30:00 WIB = 2026-10-31 16:30:00 UTC -> 2026-10
      const oct31Wib = Date.UTC(2026, 9, 31, 16, 30, 0);
      assert.equal(getJakartaMonthKey(oct31Wib), '2026-10');

      // 2026-11-01 00:30:00 WIB = 2026-10-31 17:30:00 UTC -> 2026-11
      const nov01Wib = Date.UTC(2026, 9, 31, 17, 30, 0);
      assert.equal(getJakartaMonthKey(nov01Wib), '2026-11');
    });
  });

  describe('Weekly Ritme Calculation & 2 Automatic Libur per Month', () => {
    it('protects missed weeks with up to 2 automatic libur per month', () => {
      // Setup a 4-week timeline:
      // Week 1 (Oct 5-11, 2026): 3 practices (completed)
      // Week 2 (Oct 12-18, 2026): 0 practices (protected by Libur #1)
      // Week 3 (Oct 19-25, 2026): 3 practices (completed)
      // Current Week: Week 4 (Oct 26 - Nov 1, 2026): 0 practices so far
      const w1Mon = Date.UTC(2026, 9, 5, 0, 0, 0) - JAKARTA_OFFSET_MS;
      const w3Mon = Date.UTC(2026, 9, 19, 0, 0, 0) - JAKARTA_OFFSET_MS;
      const currentTs = Date.UTC(2026, 9, 27, 3, 0, 0); // Tuesday of Week 4

      const mockStoreData = {
        enableRitme: true,
        weeklyGoal: 3,
        practices: [
          { at: w1Mon + 1000, type: 'checkin' },
          { at: w1Mon + 2000, type: 'expense' },
          { at: w1Mon + 3000, type: 'pause' },
          { at: w3Mon + 1000, type: 'checkin' },
          { at: w3Mon + 2000, type: 'lesson' },
          { at: w3Mon + 3000, type: 'pause' }
        ]
      };

      const result = calculateRitme(mockStoreData, currentTs);
      assert.equal(result.enabled, true);
      // Week 1 and Week 3 met the goal; Week 2 was missed but protected by libur!
      // Total active ritme weeks: 2 completed weeks
      assert.equal(result.ritmeWeeks, 2, 'Ritme must remain active due to libur protection');
      assert.equal(result.isProtectedByLibur, true);
      assert.equal(result.liburUsedThisMonth, 1, 'One libur consumed in Oct 2026');
      assert.equal(result.liburRemainingThisMonth, 1, 'One libur remaining');
      assert.equal(result.isReset, false);
    });

    it('triggers neutral reset when missed weeks exceed 2 libur in a month', () => {
      // Setup timeline with 3 missed weeks in October:
      // Week 1 (Oct 5): 3 practices (completed)
      // Week 2 (Oct 12): 0 practices (Libur 1 used)
      // Week 3 (Oct 19): 0 practices (Libur 2 used)
      // Week 4 (Oct 26): 0 practices (3rd missed week in Oct -> Libur exceeded -> neutral reset)
      // Current timestamp: Wednesday Nov 4, 2026 (Week 5)
      const w1Mon = Date.UTC(2026, 9, 5, 0, 0, 0) - JAKARTA_OFFSET_MS;
      const currentTs = Date.UTC(2026, 10, 4, 3, 0, 0); // Wednesday of Week 5

      const mockStoreData = {
        enableRitme: true,
        weeklyGoal: 3,
        practices: [
          { at: w1Mon + 1000, type: 'checkin' },
          { at: w1Mon + 2000, type: 'expense' },
          { at: w1Mon + 3000, type: 'pause' }
        ]
      };

      const result = calculateRitme(mockStoreData, currentTs);
      assert.equal(result.isReset, true);
      assert.equal(result.ritmeWeeks, 0);
      assert.ok(result.neutralMessage.includes('Mulai lagi kapan saja, tamanmu tetap ada'));
    });

    it('neutral reset NEVER clears seeds, inventory, or growth stage', () => {
      const mockStore = {
        d: {
          enableRitme: true,
          weeklyGoal: 3,
          seeds: 42,
          inventory: ['pot-clay', 'outfit-silk-ribbon', 'bg-tea-garden'],
          equippedCosmetics: { pot: 'pot-clay', outfit: 'outfit-silk-ribbon', background: 'bg-tea-garden' },
          practices: [] // Empty practices -> 0 ritme
        }
      };

      const result = calculateRitme(mockStore.d);
      assert.equal(result.ritmeWeeks, 0);
      // Data remains intact
      assert.equal(mockStore.d.seeds, 42);
      assert.equal(mockStore.d.inventory.length, 3);
      assert.equal(mockStore.d.equippedCosmetics.outfit, 'outfit-silk-ribbon');
    });
  });

  describe('Currency "Benih" Rules & Cosmetics Catalog', () => {
    it('awards fixed seeds for mindful practice and logs transaction', () => {
      const store = {
        d: {
          enableRewards: true,
          seeds: 3,
          seedTransactions: []
        },
        save: () => {}
      };

      const newBalance = awardSeeds(store, 1, 'Latihan napas selesai');
      assert.equal(newBalance, 4);
      assert.equal(store.d.seeds, 4);
      assert.equal(store.d.seedTransactions.length, 1);
      assert.equal(store.d.seedTransactions[0].amount, 1);
      assert.equal(store.d.seedTransactions[0].reason, 'Latihan napas selesai');
    });

    it('NEVER awards seeds based on money amounts', () => {
      // Mindful expense logging awards 1 fixed seed regardless of whether expense is 5.000 or 5.000.000
      const storeSmall = { d: { enableRewards: true, seeds: 0, seedTransactions: [] }, save: () => {} };
      const storeLarge = { d: { enableRewards: true, seeds: 0, seedTransactions: [] }, save: () => {} };

      awardSeeds(storeSmall, 1, 'Pencatatan sadar: Rp 5.000');
      awardSeeds(storeLarge, 1, 'Pencatatan sadar: Rp 5.000.000');

      assert.equal(storeSmall.d.seeds, 1);
      assert.equal(storeLarge.d.seeds, 1);
    });

    it('purchases cosmetic item when seeds are sufficient', () => {
      const store = {
        d: {
          enableRewards: true,
          seeds: 10,
          inventory: ['pot-clay', 'outfit-default', 'bg-default'],
          seedTransactions: []
        },
        save: () => {}
      };

      const item = COSMETICS_CATALOG.find(c => c.id === 'pot-blue-ceramic'); // price: 5
      assert.ok(item);

      const res = purchaseCosmetic(store, 'pot-blue-ceramic');
      assert.equal(res.success, true);
      assert.equal(store.d.seeds, 5);
      assert.ok(store.d.inventory.includes('pot-blue-ceramic'));
      assert.equal(store.d.seedTransactions.length, 1);
      assert.equal(store.d.seedTransactions[0].amount, -5);
    });

    it('rejects purchase when seeds are insufficient without penalty', () => {
      const store = {
        d: {
          enableRewards: true,
          seeds: 2,
          inventory: ['pot-clay'],
          seedTransactions: []
        },
        save: () => {}
      };

      const res = purchaseCosmetic(store, 'pot-blue-ceramic'); // price: 5
      assert.equal(res.success, false);
      assert.ok(res.message.includes('belum cukup'));
      assert.equal(store.d.seeds, 2); // Unchanged
    });

    it('equips owned cosmetic in correct category', () => {
      const store = {
        d: {
          inventory: ['pot-clay', 'pot-blue-ceramic', 'outfit-default', 'bg-default'],
          equippedCosmetics: { pot: 'pot-clay', outfit: 'outfit-default', background: 'bg-default' }
        },
        save: () => {}
      };

      const success = equipCosmetic(store, 'pot', 'pot-blue-ceramic');
      assert.equal(success, true);
      assert.equal(store.d.equippedCosmetics.pot, 'pot-blue-ceramic');
    });

    it('rejects equipping unowned cosmetic', () => {
      const store = {
        d: {
          inventory: ['pot-clay'],
          equippedCosmetics: { pot: 'pot-clay', outfit: 'outfit-default', background: 'bg-default' }
        },
        save: () => {}
      };

      const success = equipCosmetic(store, 'pot', 'pot-terracotta-gold');
      assert.equal(success, false);
      assert.equal(store.d.equippedCosmetics.pot, 'pot-clay');
    });
  });

  describe('Private Garden Milestones (Kebun Saya)', () => {
    it('evaluates milestones based on user real data without public ranking', () => {
      const storeData = {
        checkins: [{ emotion: 'Tenang', at: Date.now() }],
        expenses: [{ amount: 50000, at: Date.now() }],
        pauses: [{ type: 'breathing', at: Date.now() }],
        goal: { name: 'Tabungan Rumah', target: 5000000 },
        coupleConversations: {},
        practices: []
      };

      const milestones = checkMilestones(storeData);
      assert.equal(milestones.length, 8);

      const msCheckin = milestones.find(m => m.id === 'ms-checkin');
      const msExpense = milestones.find(m => m.id === 'ms-expense');
      const msPause = milestones.find(m => m.id === 'ms-pause');
      const msGoal = milestones.find(m => m.id === 'ms-goal');
      const msConvo = milestones.find(m => m.id === 'ms-conversation');

      assert.equal(msCheckin.unlocked, true);
      assert.equal(msExpense.unlocked, true);
      assert.equal(msPause.unlocked, true);
      assert.equal(msGoal.unlocked, true);
      assert.equal(msConvo.unlocked, false);
    });
  });

  describe('Disabling Rewards & Ritme Completely', () => {
    it('disables ritme when enableRitme is false', () => {
      const storeData = {
        enableRitme: false,
        practices: [{ at: Date.now(), type: 'checkin' }]
      };

      const r = calculateRitme(storeData);
      assert.equal(r.enabled, false);
      assert.equal(r.ritmeWeeks, 0);

      // In Saya screen, ritme tracker shows disabled text
      const htmlSaya = renderSelf({ d: storeData });
      assert.ok(htmlSaya.includes('Pelacak ritme mingguan sedang dinonaktifkan'));

      // In Home screen, weekly practice pill is hidden
      const htmlHome = renderHome({ d: storeData });
      assert.equal(htmlHome.includes('class="path-weekly-pill"'), false);
      assert.equal(htmlHome.includes('class="weekly-practice-banner"'), false);
    });

    it('disables rewards when enableRewards is false', () => {
      const store = {
        d: {
          enableRewards: false,
          seeds: 10
        },
        save: () => {}
      };

      assert.equal(getSeeds(store.d), 0);
      assert.equal(awardSeeds(store, 5), 0);

      // In Saya screen, rewards shows disabled message
      const htmlSaya = renderSelf(store);
      assert.ok(htmlSaya.includes('Sistem hadiah Benih dan kosmetik taman sedang dinonaktifkan'));

      // In Home screen, seeds pill is hidden
      const htmlHome = renderHome(store);
      assert.equal(htmlHome.includes('class="path-seeds-pill"'), false);
    });
  });

  describe('Anti-Pressure Copy Verification (Automated Grep Test)', () => {
    it('strictly forbids loss-framed words across all UI strings', () => {
      const store = {
        d: {
          enableRitme: true,
          enableRewards: true,
          seeds: 5,
          inventory: ['pot-clay'],
          practices: []
        }
      };

      const htmlSaya = renderSelf(store);
      const htmlHome = renderHome(store);
      const combinedHtml = `${htmlSaya}\n${htmlHome}`.toLowerCase();

      // Banned loss-framing terms
      const bannedTerms = [
        'kehilangan',
        'hangus',
        'hampir putus',
        'rugi',
        'streak patah',
        'penalti',
        'gagal menjaga',
        'terlambat'
      ];

      for (const term of bannedTerms) {
        assert.equal(
          combinedHtml.includes(term),
          false,
          `UI copy must NOT contain pressure/loss-framed word: "${term}"`
        );
      }

      // Neutral reset assurance must be present
      assert.ok(combinedHtml.includes('mulai lagi kapan saja, tamanmu tetap ada'));
    });
  });

});
