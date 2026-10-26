/**
 * Screen: Home (Beranda)
 * 
 * Rules:
 * - One primary panel "Langkah hari ini" driven by transparent rule-based getSuggestedAction.
 * - Vertical journey path: 4 soft nodes (Mengenal diri, Percaya diri soal uang, Bicara berdua, Merencanakan masa depan)
 *   showing completed practices with a small check, never a score or percentage of "readiness".
 * - Weekly "latihan bermakna" count framed as "minggu ini kamu sudah berlatih N kali".
 * - No streak counters; missing a week shows nothing negative.
 * - Acceptance: Home fits in one screen at 360x740 without scrolling past the main panel.
 */

import { esc } from '../ui/utils.js';

/**
 * Transparent rule-based action suggestion
 * Deterministic, explainable, and zero judgment.
 */
export function getSuggestedAction(d) {
  if (!d) {
    return {
      title: 'Sapa perasaanmu 1 menit',
      desc: 'Mengenali apa yang kamu rasakan hari ini adalah langkah awal ketenangan.',
      tab: 'emo',
      subView: 'checkin',
      btnText: 'Mulai Cek Emosi'
    };
  }

  // Rule 1: No emotion check-ins yet
  if (!d.checkins || !d.checkins.length) {
    return {
      title: 'Sapa perasaanmu 1 menit',
      desc: 'Mengenali apa yang kamu rasakan hari ini adalah langkah awal ketenangan.',
      tab: 'emo',
      subView: 'checkin',
      btnText: 'Mulai Cek Emosi'
    };
  }

  // Rule 2: No conscious expenses logged yet
  if (!d.expenses || !d.expenses.length) {
    return {
      title: 'Catat satu pengeluaran sadar',
      desc: 'Hadapi catatan uang tanpa rasa takut. Catat satu angka pengeluaran hari ini.',
      tab: 'money',
      subView: 'log',
      btnText: 'Catat Pengeluaran'
    };
  }

  // Rule 3: No couple conversations completed yet
  const hasConvo = (d.coupleConversations && Object.keys(d.coupleConversations).length > 0) ||
                   (d.partnerA && Object.keys(d.partnerA).length > 0) ||
                   (d.partnerB && Object.keys(d.partnerB).length > 0);
  if (!hasConvo) {
    return {
      title: 'Percakapan: Arti Rasa Aman',
      desc: 'Diskusikan apa yang membuatmu dan pasangan merasa aman soal uang.',
      tab: 'us',
      subView: null,
      btnText: 'Mulai Percakapan'
    };
  }

  // Rule 4: Regular maintenance practice (Urge surfing / pausing)
  return {
    title: 'Latihan Jeda Belanja (Urge Surfing)',
    desc: 'Latih menunda keinginan belanja impulsif dengan jeda hening sejenak.',
    tab: 'money',
    subView: 'urge',
    btnText: 'Coba Jeda Belanja'
  };
}

/**
 * Weekly practice counter
 * Computes practices in the last 7 days.
 */
export function getWeeklyPracticeCount(d) {
  if (!d) return 0;
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  let count = 0;
  if (Array.isArray(d.checkins)) {
    count += d.checkins.filter(c => (c.at || 0) >= oneWeekAgo).length;
  }
  if (Array.isArray(d.expenses)) {
    count += d.expenses.filter(e => (e.at || 0) >= oneWeekAgo).length;
  }
  if (Array.isArray(d.pauses)) {
    count += d.pauses.filter(p => (p.at || 0) >= oneWeekAgo).length;
  }
  if (d.coupleConversations && typeof d.coupleConversations === 'object') {
    count += Object.values(d.coupleConversations).filter(c => (c.completedAt || 0) >= oneWeekAgo).length;
  }

  return count;
}

export function renderHome(store) {
  const d = store.d;
  const s = getSuggestedAction(d);
  const weeklyCount = getWeeklyPracticeCount(d);

  // 4 Soft Journey Nodes (Check status without readiness scores or percentages)
  const isNode1Done = Boolean((d.checkins && d.checkins.length > 0) || (d.pauses && d.pauses.length > 0));
  const isNode2Done = Boolean(d.expenses && d.expenses.length > 0);
  const isNode3Done = Boolean(
    (d.coupleConversations && Object.keys(d.coupleConversations).length > 0) ||
    (d.partnerA && Object.keys(d.partnerA).length > 0)
  );
  const isNode4Done = Boolean(d.goal || (d.plans && d.plans.length > 0));

  const journeyNodes = [
    {
      id: 'node-self',
      icon: '🌱',
      title: 'Mengenal diri',
      hint: 'Cek emosi & napas tenang',
      completed: isNode1Done,
      tab: 'emo'
    },
    {
      id: 'node-money',
      icon: '🪙',
      title: 'Percaya diri soal uang',
      hint: 'Catatan sadar & jeda belanja',
      completed: isNode2Done,
      tab: 'money'
    },
    {
      id: 'node-us',
      icon: '🤝',
      title: 'Bicara berdua',
      hint: 'Percakapan pasangan satu ponsel',
      completed: isNode3Done,
      tab: 'us'
    },
    {
      id: 'node-future',
      icon: '🎯',
      title: 'Merencanakan masa depan',
      hint: 'Tujuan tabungan & rencana jika-maka',
      completed: isNode4Done,
      tab: 'money'
    }
  ];

  return `
    <!-- Minimal Greeting (Compact for 360x740 fit) -->
    <div class="home-greeting-row">
      <div>
        <h1 class="home-greeting-title">Selamat datang.</h1>
        <p class="mute home-greeting-sub">${esc(d.stage || 'Persiapan Bersama')}</p>
      </div>
    </div>

    <!-- The One Primary Panel: Langkah Hari Ini -->
    <div class="hero-action mb-3">
      <div class="hero-label">
        Langkah Hari Ini
      </div>
      <h2>${esc(s.title)}</h2>
      <p>${esc(s.desc)}</p>
      <button type="button" id="heroActionBtn">${esc(s.btnText)} →</button>
    </div>

    <!-- Weekly Practice Count (No streaks, zero negative framing) -->
    <div class="weekly-practice-banner mb-3" role="status">
      <span class="weekly-icon" aria-hidden="true">🌿</span>
      <span class="weekly-text">
        ${weeklyCount > 0
          ? `Minggu ini kamu sudah berlatih <b>${weeklyCount} kali</b>.`
          : 'Minggu ini kamu sudah berlatih <b>0 kali</b>. Luangkan satu langkah santai hari ini.'}
      </span>
    </div>

    <!-- Vertical Journey Path: 4 Soft Nodes -->
    <div class="card p-3 mb-2">
      <div class="card-title-row mb-2">
        <h2 class="text-sm font-bold text-ink-primary mb-0">Jejak Kesiapan</h2>
        <span class="text-xs mute">Langkah Nyata</span>
      </div>

      <div class="journey-path">
        ${journeyNodes.map(node => `
          <button type="button" class="journey-node ${node.completed ? 'completed' : ''}" data-journey-tab="${node.tab}">
            <div class="journey-node-dot" aria-hidden="true">
              ${node.completed ? '✓' : ''}
            </div>
            <div class="journey-node-main">
              <div class="journey-node-title">
                <span class="journey-node-icon" aria-hidden="true">${node.icon}</span>
                <span>${esc(node.title)}</span>
              </div>
              <div class="journey-node-hint">${esc(node.hint)}</div>
            </div>
            <span class="journey-node-arrow" aria-hidden="true">→</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

export function bindHome(container, store, navigate) {
  const heroBtn = container.querySelector('#heroActionBtn');
  if (heroBtn) {
    heroBtn.onclick = () => {
      const s = getSuggestedAction(store.d);
      navigate(s.tab, s.subView);
    };
  }

  container.querySelectorAll('[data-journey-tab]').forEach(btn => {
    btn.onclick = () => {
      navigate(btn.dataset.journeyTab);
    };
  });
}
