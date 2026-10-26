/**
 * Teman Siap — Reward System & Gentle Weekly Ritme (Anti-Pressure)
 * 
 * Rules:
 * - Currency: "Benih" (seeds), earned for completing practices.
 * - Spent ONLY on cosmetics for Tunas and the Garden (outfits, pots, backgrounds).
 * - Seeds never expire and are never required to access content.
 * - NEVER award seeds based on money amounts (mindful logging awards fixed seeds).
 * - Streak: A weekly "ritme" instead of daily streak. A week counts when user completes
 *   their chosen weekly goal (Santai 2, Biasa 3, Semangat 5).
 * - 2 automatic "libur" per month that protect the ritme with plain-language explanation.
 * - Missing a week shows neutral reset ("Mulai lagi kapan saja, tamanmu tetap ada")
 *   and NEVER removes seeds, growth stage, or cosmetic items.
 * - Settings toggle turns ritme off entirely and hides all streak UI.
 * - Settings toggle turns rewards/seeds off entirely.
 * - Milestones: Private "Kebun" (Garden) grid in Saya. No sharing, no ranking.
 * - Default timezone: Asia/Jakarta (UTC+7, no DST).
 */

export const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export const WEEKLY_GOAL_OPTIONS = [
  { value: 2, label: 'Santai (2 kali/minggu)', hint: 'Langkah santai dan ringan untuk memulai' },
  { value: 3, label: 'Biasa (3 kali/minggu)', hint: 'Ritme seimbang yang ideal (Rekomendasi)' },
  { value: 5, label: 'Semangat (5 kali/minggu)', hint: 'Dedikasi mendalam menyambut hari bahagia' }
];

export const COSMETICS_CATALOG = [
  // Pots for Tunas
  {
    id: 'pot-clay',
    category: 'pot',
    name: 'Pot Tanah Liat Alami',
    desc: 'Pot tanah liat sederhana berpori yang sejuk.',
    icon: '🏺',
    price: 0,
    isDefault: true
  },
  {
    id: 'pot-blue-ceramic',
    category: 'pot',
    name: 'Pot Keramik Biru Laut',
    desc: 'Keramik berglasir halus dengan nuansa ketenangan.',
    icon: '🥣',
    price: 5,
    isDefault: false
  },
  {
    id: 'pot-terracotta-gold',
    category: 'pot',
    name: 'Pot Terakota Keemasan',
    desc: 'Warna terakota hangat berhiaskan lis emas lembut.',
    icon: '⚱️',
    price: 8,
    isDefault: false
  },
  {
    id: 'pot-bamboo',
    category: 'pot',
    name: 'Pot Anyaman Bambu',
    desc: 'Anyaman bambu alami yang ramah lingkungan.',
    icon: '🎍',
    price: 10,
    isDefault: false
  },

  // Outfits & Accessories for Tunas
  {
    id: 'outfit-default',
    category: 'outfit',
    name: 'Tunas Alami',
    desc: 'Penampilan alami tanpa aksesoris tambahan.',
    icon: '🌱',
    price: 0,
    isDefault: true
  },
  {
    id: 'outfit-silk-ribbon',
    category: 'outfit',
    name: 'Pita Sutra Lembut',
    desc: 'Pita sutra kecil berwarna teal di daun utama.',
    icon: '🎀',
    price: 6,
    isDefault: false
  },
  {
    id: 'outfit-glasses',
    category: 'outfit',
    name: 'Kacamata Cendekia',
    desc: 'Kacamata bulat kecil berbingkai kawat tenang.',
    icon: '👓',
    price: 8,
    isDefault: false
  },
  {
    id: 'outfit-straw-hat',
    category: 'outfit',
    name: 'Topi Jerami Kebun',
    desc: 'Topi jerami kecil peneduh sinar mentari.',
    icon: '👒',
    price: 10,
    isDefault: false
  },

  // Garden Backgrounds
  {
    id: 'bg-default',
    category: 'background',
    name: 'Beranda Tenang',
    desc: 'Sudut beranda rumah yang damai dengan lantai kayu.',
    icon: '🏡',
    price: 0,
    isDefault: true
  },
  {
    id: 'bg-tea-garden',
    category: 'background',
    name: 'Kebun Teh Pagi',
    desc: 'Hamparan bukit teh berembun di udara sejuk.',
    icon: '🍃',
    price: 8,
    isDefault: false
  },
  {
    id: 'bg-warm-sunset',
    category: 'background',
    name: 'Teras Senja Hangat',
    desc: 'Cahaya keemasan matahari terbenam yang teduh.',
    icon: '🌅',
    price: 10,
    isDefault: false
  }
];

export const GARDEN_MILESTONES = [
  {
    id: 'ms-checkin',
    title: 'Pijakan Pertama',
    icon: '🌱',
    desc: 'Cek emosi pertama tersimpan',
    check: (d) => Boolean(d && d.checkins && d.checkins.length > 0)
  },
  {
    id: 'ms-expense',
    title: 'Mata Terbuka',
    icon: '🪙',
    desc: 'Catatan pengeluaran sadar pertama',
    check: (d) => Boolean(d && d.expenses && d.expenses.length > 0)
  },
  {
    id: 'ms-conversation',
    title: 'Ruang Dialog',
    icon: '🤝',
    desc: 'Percakapan berdua pertama selesai',
    check: (d) => Boolean(
      (d && d.coupleConversations && Object.keys(d.coupleConversations).length > 0) ||
      (d && d.partnerA && Object.keys(d.partnerA).length > 0)
    )
  },
  {
    id: 'ms-pause',
    title: 'Jangkar Tenang',
    icon: '🫁',
    desc: 'Latihan napas atau urge surfing pertama',
    check: (d) => Boolean(d && d.pauses && d.pauses.length > 0)
  },
  {
    id: 'ms-goal',
    title: 'Langkah Terarah',
    icon: '🎯',
    desc: 'Tujuan tabungan pertama dirumuskan',
    check: (d) => Boolean((d && d.goal) || (d && d.goals && d.goals.length > 0))
  },
  {
    id: 'ms-10-practices',
    title: 'Akar Kokoh',
    icon: '🌳',
    desc: '10 latihan bermakna telah diselesaikan',
    check: (d) => getAllPractices(d).length >= 10
  },
  {
    id: 'ms-lesson',
    title: 'Biji Pengetahuan',
    icon: '💡',
    desc: 'Menyelesaikan modul sesi belajar mikro',
    check: (d) => Boolean(
      (d && d.completedPathNodes && d.completedPathNodes.some(id => id.includes('lesson'))) ||
      (d && d.practices && d.practices.some(p => p.type === 'lesson'))
    )
  },
  {
    id: 'ms-ritme',
    title: 'Ritme Tumbuh',
    icon: '🌿',
    desc: 'Menjaga ritme latihan mingguan pertama kali',
    check: (d) => {
      const r = calculateRitme(d);
      return r.ritmeWeeks >= 1 || r.currentWeekCompleted;
    }
  }
];

/**
 * Computes week boundaries in Asia/Jakarta timezone (UTC+7, Monday to Sunday)
 * @param {number|Date} timestamp
 * @returns {{ startUtc: number, endUtc: number, weekKey: string, monthKey: string }}
 */
export function getJakartaWeekBounds(timestamp = Date.now()) {
  const ts = Number(timestamp) || Date.now();
  const d = new Date(ts + JAKARTA_OFFSET_MS);

  // ISO Day of Week: Monday = 1, Sunday = 7
  const dayOfWeek = d.getUTCDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const daysToMonday = isoDay - 1;

  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const date = d.getUTCDate();

  // Midnight Monday 00:00:00 Asia/Jakarta in UTC
  const startUtc = Date.UTC(y, m, date - daysToMonday, 0, 0, 0, 0) - JAKARTA_OFFSET_MS;
  const endUtc = startUtc + (7 * 24 * 60 * 60 * 1000) - 1; // Sunday 23:59:59.999

  const mon = new Date(startUtc + JAKARTA_OFFSET_MS);
  const weekYear = mon.getUTCFullYear();
  const weekMonth = String(mon.getUTCMonth() + 1).padStart(2, '0');
  const weekDay = String(mon.getUTCDate()).padStart(2, '0');

  const weekKey = `${weekYear}-${weekMonth}-${weekDay}`;
  const monthKey = `${weekYear}-${weekMonth}`;

  return { startUtc, endUtc, weekKey, monthKey };
}

/**
 * Returns month key in Asia/Jakarta timezone (YYYY-MM)
 */
export function getJakartaMonthKey(timestamp = Date.now()) {
  const ts = Number(timestamp) || Date.now();
  const d = new Date(ts + JAKARTA_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Collects all practices across store collections with valid timestamps
 * @param {object} d - Store data
 * @returns {Array<{ timestamp: number, type: string, id?: string }>}
 */
export function getAllPractices(d) {
  if (!d) return [];
  const list = [];

  if (Array.isArray(d.checkins)) {
    d.checkins.forEach(c => {
      const ts = c.at || (c.date ? Date.parse(c.date) : 0);
      if (ts > 0) list.push({ timestamp: ts, type: 'checkin' });
    });
  }

  if (Array.isArray(d.expenses)) {
    d.expenses.forEach(e => {
      const ts = e.at || (e.date ? Date.parse(e.date) : 0);
      if (ts > 0) list.push({ timestamp: ts, type: 'expense' });
    });
  }

  if (Array.isArray(d.pauses)) {
    d.pauses.forEach(p => {
      const ts = p.at || (p.date ? Date.parse(p.date) : 0);
      if (ts > 0) list.push({ timestamp: ts, type: p.type || 'pause' });
    });
  }

  if (d.coupleConversations && typeof d.coupleConversations === 'object') {
    Object.values(d.coupleConversations).forEach(c => {
      const ts = c.completedAt || 0;
      if (ts > 0) list.push({ timestamp: ts, type: 'couple', id: c.convoId });
    });
  }

  if (Array.isArray(d.practices)) {
    d.practices.forEach(p => {
      const ts = p.at || 0;
      if (ts > 0) list.push({ timestamp: ts, type: p.type || 'practice', id: p.id });
    });
  }

  // Sort chronologically ascending
  list.sort((a, b) => a.timestamp - b.timestamp);
  return list;
}

/**
 * Computes weekly practice count for the current Asia/Jakarta week
 * @param {object} d - Store data
 * @param {number} [currentTimestamp=Date.now()]
 * @returns {number}
 */
export function getJakartaWeeklyPracticeCount(d, currentTimestamp = Date.now()) {
  if (!d) return 0;
  const { startUtc, endUtc } = getJakartaWeekBounds(currentTimestamp);
  const practices = getAllPractices(d);
  return practices.filter(p => p.timestamp >= startUtc && p.timestamp <= endUtc).length;
}

/**
 * Calculates Weekly Ritme with 2 automatic libur / month and neutral reset
 * 
 * Rules:
 * - A week counts when user reaches weeklyGoal practices (default: 3).
 * - Up to 2 automatic "libur" per calendar month protect the ritme if a week is missed.
 * - Missing a week without available libur triggers a neutral reset:
 *   "Mulai lagi kapan saja, tamanmu tetap ada."
 * - NEVER removes seeds, growth stages, or items.
 * - If d.enableRitme is false, streak UI is disabled.
 * 
 * @param {object} d - Store data
 * @param {number} [currentTimestamp=Date.now()]
 * @returns {object} Ritme calculation results
 */
export function calculateRitme(d, currentTimestamp = Date.now()) {
  const isEnabled = d ? (d.enableRitme !== false) : true;
  const weeklyGoal = d ? (Number(d.weeklyGoal) || 3) : 3;

  if (!isEnabled) {
    return {
      enabled: false,
      ritmeWeeks: 0,
      weeklyGoal,
      currentWeekPractices: 0,
      currentWeekCompleted: false,
      isProtectedByLibur: false,
      liburUsedThisMonth: 0,
      liburRemainingThisMonth: 2,
      statusText: 'Pelacak ritme dinonaktifkan',
      neutralMessage: 'Mulai lagi kapan saja, tamanmu tetap ada.'
    };
  }

  const currentBounds = getJakartaWeekBounds(currentTimestamp);
  const currentMonthKey = currentBounds.monthKey;
  const practices = getAllPractices(d);

  // Group practices by Asia/Jakarta weekKey
  const weekMap = new Map();
  practices.forEach(p => {
    const { weekKey, monthKey, startUtc, endUtc } = getJakartaWeekBounds(p.timestamp);
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { weekKey, monthKey, startUtc, endUtc, practices: [] });
    }
    weekMap.get(weekKey).practices.push(p);
  });

  // Current week practices count
  const currentWeekData = weekMap.get(currentBounds.weekKey);
  const currentWeekPractices = currentWeekData ? currentWeekData.practices.length : 0;
  const currentWeekCompleted = currentWeekPractices >= weeklyGoal;

  // Track libur consumption per month: { 'YYYY-MM': count }
  const liburUsage = new Map();
  const getLiburUsed = (mKey) => liburUsage.get(mKey) || 0;
  const consumeLibur = (mKey) => {
    const used = getLiburUsed(mKey);
    liburUsage.set(mKey, used + 1);
    return used < 2;
  };

  // Walk backwards week-by-week from previous week
  let ritmeWeeks = 0;
  let isProtectedByLibur = false;
  let isReset = false;

  // Previous week boundary
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  let checkTime = currentBounds.startUtc - 1000; // Inside previous week

  // Find earliest practice timestamp or limit lookback to 52 weeks
  const earliestTs = practices.length ? practices[0].timestamp : currentTimestamp;
  const earliestBounds = getJakartaWeekBounds(earliestTs);
  const maxWeeksToScan = 52;

  let scanCount = 0;
  while (checkTime >= earliestBounds.startUtc && scanCount < maxWeeksToScan) {
    scanCount++;
    const bounds = getJakartaWeekBounds(checkTime);
    const data = weekMap.get(bounds.weekKey);
    const count = data ? data.practices.length : 0;

    if (count >= weeklyGoal) {
      ritmeWeeks++;
    } else {
      // Week had fewer than weeklyGoal practices
      // Check if automatic libur can protect this week (max 2 per month)
      if (getLiburUsed(bounds.monthKey) < 2) {
        consumeLibur(bounds.monthKey);
        isProtectedByLibur = true;
        // Protected week maintains the ritme!
      } else {
        // Missed week with no libur available -> neutral reset
        isReset = true;
        break;
      }
    }

    // Step back 1 week
    checkTime = bounds.startUtc - 1000;
  }

  // If current week itself has already met the goal, count it in active ritme!
  if (currentWeekCompleted) {
    ritmeWeeks++;
  }

  const liburUsedThisMonth = getLiburUsed(currentMonthKey);
  const liburRemainingThisMonth = Math.max(0, 2 - liburUsedThisMonth);

  let statusText = '';
  if (ritmeWeeks > 0) {
    statusText = `Ritme aktif: ${ritmeWeeks} minggu bertumbuh 🌿`;
  } else if (currentWeekPractices > 0) {
    statusText = `Minggu ini: ${currentWeekPractices} dari ${weeklyGoal} langkah selesai 🌱`;
  } else {
    statusText = 'Mulai lagi kapan saja, tamanmu tetap ada 🌱';
  }

  return {
    enabled: true,
    ritmeWeeks,
    weeklyGoal,
    currentWeekPractices,
    currentWeekCompleted,
    isProtectedByLibur,
    liburUsedThisMonth,
    liburRemainingThisMonth,
    statusText,
    isReset,
    neutralMessage: 'Mulai lagi kapan saja, tamanmu tetap ada.'
  };
}

/**
 * Gets current Benih (seeds) balance
 * @param {object} d
 * @returns {number}
 */
export function getSeeds(d) {
  if (!d || d.enableRewards === false) return 0;
  return Math.max(0, Number(d.seeds) || 0);
}

/**
 * Awards seeds for mindful practice completion
 * NEVER awarded based on money amounts.
 * 
 * @param {object} store - Store instance
 * @param {number} amount - Fixed seed amount
 * @param {string} reason - Empathetic description
 * @param {object} [meta]
 * @returns {number} New seed balance
 */
export function awardSeeds(store, amount = 1, reason = 'Latihan bermakna', meta = {}) {
  if (!store || !store.d) return 0;
  if (store.d.enableRewards === false) return 0;

  const earned = Math.max(0, Number(amount) || 1);
  const current = Math.max(0, Number(store.d.seeds) || 0);
  store.d.seeds = current + earned;

  if (!Array.isArray(store.d.seedTransactions)) {
    store.d.seedTransactions = [];
  }

  store.d.seedTransactions.push({
    at: Date.now(),
    amount: earned,
    reason,
    meta
  });

  if (typeof store.save === 'function') {
    store.save();
  }

  return store.d.seeds;
}

/**
 * Purchases a cosmetic item with Benih
 * Seeds never expire and are only for cosmetic garden items.
 * 
 * @param {object} store
 * @param {string} itemId
 * @returns {{ success: boolean, message: string }}
 */
export function purchaseCosmetic(store, itemId) {
  if (!store || !store.d) return { success: false, message: 'Store tidak tersedia' };

  const item = COSMETICS_CATALOG.find(c => c.id === itemId);
  if (!item) return { success: false, message: 'Barang tidak ditemukan' };

  if (!Array.isArray(store.d.inventory)) {
    store.d.inventory = ['pot-clay', 'outfit-default', 'bg-default'];
  }

  if (store.d.inventory.includes(itemId)) {
    return { success: true, message: 'Barang sudah menjadi milikmu' };
  }

  const currentSeeds = getSeeds(store.d);
  if (currentSeeds < item.price) {
    return { success: false, message: `Benih belum cukup (membutuhkan ${item.price} benih)` };
  }

  store.d.seeds = currentSeeds - item.price;
  store.d.inventory.push(itemId);

  if (!Array.isArray(store.d.seedTransactions)) {
    store.d.seedTransactions = [];
  }
  store.d.seedTransactions.push({
    at: Date.now(),
    amount: -item.price,
    reason: `Membeli ${item.name}`,
    meta: { itemId }
  });

  if (typeof store.save === 'function') {
    store.save();
  }

  return { success: true, message: `Berhasil mendapatkan ${item.name}!` };
}

/**
 * Equips a cosmetic item in the chosen category
 * @param {object} store
 * @param {'pot'|'outfit'|'background'} category
 * @param {string} itemId
 * @returns {boolean}
 */
export function equipCosmetic(store, category, itemId) {
  if (!store || !store.d) return false;
  const inventory = Array.isArray(store.d.inventory) ? store.d.inventory : ['pot-clay', 'outfit-default', 'bg-default'];
  if (!inventory.includes(itemId)) return false;

  if (!store.d.equippedCosmetics || typeof store.d.equippedCosmetics !== 'object') {
    store.d.equippedCosmetics = { pot: 'pot-clay', outfit: 'outfit-default', background: 'bg-default' };
  }

  store.d.equippedCosmetics[category] = itemId;

  if (typeof store.save === 'function') {
    store.save();
  }
  return true;
}

/**
 * Checks all garden milestones against user's real local data
 * @param {object} d - Store data
 * @returns {Array<object>}
 */
export function checkMilestones(d) {
  return GARDEN_MILESTONES.map(ms => {
    const isUnlocked = ms.check(d);
    return {
      id: ms.id,
      title: ms.title,
      icon: ms.icon,
      desc: ms.desc,
      unlocked: isUnlocked,
      statusLabel: isUnlocked ? 'Mekar ✨' : 'Kuncup 🌱'
    };
  });
}
