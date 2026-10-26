/**
 * Screen: Home (Beranda)
 * 1 Daily suggested action, weekly practice summary (no streak shaming), quick urge tool.
 */
import { esc } from '../ui/utils.js';

export function getSuggestedAction(d) {
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
    desc: 'Latih menunda keinginan belanja impulsif dengan jeda hening sejenak.',
    tab: 'money',
    subView: 'urge',
    btnText: 'Coba Jeda Belanja'
  };
}

export function renderHome(store) {
  const d = store.d;
  const s = getSuggestedAction(d);
  const recentCheckin = d.checkins && d.checkins.length ? d.checkins[d.checkins.length - 1] : null;

  return `
    <div class="mb-3">
      <span class="card-tag saffron">Tahap: ${esc(d.stage || 'Persiapan')}</span>
      <h1 class="mt-1 mb-1">Selamat datang.</h1>
      <p class="mute">Satu tindakan kecil hari ini untuk masa depan yang lebih tenang.</p>
    </div>

    <!-- The One Primary Action of the Day -->
    <div class="hero-action">
      <div class="hero-label">
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
        <span class="card-tag">${d.faithPerspective ? 'Gotong Royong & Sabar' : 'Kebiasaan Sehat'}</span>
      </div>
      <p class="mute">Tidak ada streak yang terhapus jika kamu rehat. Kami merayakan setiap niat baik yang kamu lakukan.</p>

      <div class="home-stat-grid">
        <div class="stat-tile">
          <div class="stat-tile-icon" aria-hidden="true">🌱</div>
          <div class="stat-tile-val">${d.checkins ? d.checkins.length : 0}</div>
          <div class="stat-tile-label">Cek Emosi</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-icon" aria-hidden="true">🪙</div>
          <div class="stat-tile-val">${d.expenses ? d.expenses.length : 0}</div>
          <div class="stat-tile-label">Catat Uang</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-icon" aria-hidden="true">🌊</div>
          <div class="stat-tile-val">${d.pauses ? d.pauses.length : 0}</div>
          <div class="stat-tile-label">Jeda Belanja</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile-icon" aria-hidden="true">🤝</div>
          <div class="stat-tile-val">${Object.keys(d.partnerA || {}).length}</div>
          <div class="stat-tile-label">Percakapan</div>
        </div>
      </div>
    </div>

    <!-- Quick Urge Surfing Tool -->
    <div class="card card-border-saffron">
      <div class="card-title-row">
        <h3>Lapar Mata Saat Ini?</h3>
        <span class="card-tag saffron">Alat Cepat</span>
      </div>
      <p class="mute">Dorongan belanja memuncak selama 10 menit seperti ombak lalu mereda. Luangkan jeda sejenak.</p>
      <button type="button" class="saffron-btn w-full" id="homeUrgeBtn">
        Buka Jeda 10 Menit (Urge Surfing) ⏱️
      </button>
    </div>

    <!-- Recent Emotion Snapshot (rendered only if user has entered one) -->
    ${recentCheckin ? `
      <div class="card">
        <div class="card-title-row">
          <h3>Kondisi Terakhirmu</h3>
          <span class="mute">${new Date(recentCheckin.at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="recent-emotion-box">
          <span class="recent-emotion-icon" aria-hidden="true">🌱</span>
          <div>
            <div class="font-bold">${esc(recentCheckin.emotion)}</div>
            ${recentCheckin.need ? `<div class="mute text-sm">Kebutuhan: ${esc(recentCheckin.need)}</div>` : ''}
          </div>
        </div>
      </div>
    ` : ''}
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

  const urgeBtn = container.querySelector('#homeUrgeBtn');
  if (urgeBtn) {
    urgeBtn.onclick = () => {
      navigate('money', 'urge');
    };
  }
}
