/**
 * Screen: Emosi & Regulasi (Me)
 * Emotion check-in + Self-regulation exercises (Breathing 4-4-6, Grounding 5-4-3-2-1, TIPP)
 * Zero shame, plain language, evidence-conscious.
 */
import { CONTENT } from '../../content.js';
import { esc } from '../ui/utils.js';
import { sessionRunner } from '../session.js';
import { createCheckinFlow } from '../flows/checkinFlow.js';

let emotionSubView = 'checkin'; // 'checkin' | 'practice'
let selectedEmotion = null;
let selectedSensations = [];
let activeExerciseId = null;
let breathingInterval = null;

export function cleanupEmosi() {
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
}

export function setEmotionSubView(subView) {
  cleanupEmosi();
  emotionSubView = subView || 'checkin';
}

export function renderEmotions(store) {
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag">Pilar Diri</span>
        <h1 class="mt-1 mb-1">Emosi & Regulasi</h1>
      </div>
    </div>
    <p class="mute">Emosi adalah pengalaman sementara, bukan kegagalan diri. Kenali perasaanmu tanpa menghakimi.</p>

    <!-- Sub-Navigation -->
    <div class="sub-nav" role="tablist">
      <button type="button" class="${emotionSubView === 'checkin' ? 'active' : ''}" id="emoTabCheckin">
        1. Cek Perasaan
      </button>
      <button type="button" class="${emotionSubView === 'practice' ? 'active' : ''}" id="emoTabPractice">
        2. Latihan Mandiri
      </button>
    </div>

    ${emotionSubView === 'checkin' ? renderEmotionCheckin(store) : renderEmotionPractice(store)}
  `;
}

function renderEmotionCheckin(store) {
  const faith = store.d.faithPerspective;

  if (!selectedEmotion) {
    return `
      <!-- Option: Guided Step-by-Step Flow -->
      <div class="card card-border-saffron mb-3">
        <div class="card-title-row">
          <h3>Panduan Cek Emosi Terpandu</h3>
          <span class="card-tag saffron">Fokus Penuh</span>
        </div>
        <p class="mute">Latihan terpandu satu layar per langkah dengan keheningan penuh dan tanpa distraksi.</p>
        <button type="button" class="saffron-btn w-full" id="startCheckinFlowBtn">
          Mulai Panduan Terpandu (1 Menit) 🧘
        </button>
      </div>

      <div class="card">
        <div class="card-title-row">
          <h3>Apa yang paling kamu rasakan saat ini?</h3>
          <span class="card-tag">Sadar & Beri Nama</span>
        </div>
        <p class="mute">Pilih satu yang paling mendekati kondisimu:</p>

        <div class="chip-grid">
          ${CONTENT.emotions.map(e => `
            <button type="button" class="chip" data-emo-select="${esc(e.label)}">
              <span class="chip-icon">${e.icon}</span>
              <div class="chip-col">
                <span class="chip-label">${esc(e.label)}</span>
                <span class="chip-hint">${faith && e.faithHint ? esc(e.faithHint) : esc(e.hint)}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <details class="clinical-note mt-3">
          <summary>Pelajari prinsip di balik latihan ini</summary>
          <p>Latihan ini berakar pada keterampilan 'Observe & Describe' dari Dialectical Behavior Therapy (DBT). Memberi nama emosi mengaktifkan korteks prefrontal otak dan meredakan reaksi impulsif amigdala.</p>
        </details>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card-title-row">
        <h3>Memahami: ${esc(selectedEmotion)}</h3>
        <button type="button" class="secondary btn-action-sm" id="cancelEmoSelectBtn">
          Ganti Emosi
        </button>
      </div>

      <label>Di bagian tubuh mana sensasi ini terasa? (Boleh pilih beberapa):</label>
      <div class="pill-list">
        ${CONTENT.bodySensations.map(bs => `
          <button type="button" class="pill-item ${selectedSensations.includes(bs) ? 'active' : ''}" data-sensation-toggle="${esc(bs)}">
            ${esc(bs)}
          </button>
        `).join('')}
      </div>

      <label for="checkinNeedSelect">Apa yang paling akan membantumu saat ini?</label>
      <select id="checkinNeedSelect">
        <option value="">-- Boleh dilewati jika belum yakin --</option>
        ${CONTENT.needs.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('')}
      </select>

      <label for="checkinNoteArea">Catatan pribadi (hanya di browsermu):</label>
      <textarea id="checkinNoteArea" placeholder="Tuliskan apa yang ada di pikiranmu dengan bebas..."></textarea>

      <div class="sticky-bottom-action">
        <button type="button" class="primary w-full" id="saveEmotionCheckinBtn">
          Simpan Cek Emosi Ini ✨
        </button>
      </div>
    </div>
  `;
}

function renderEmotionPractice(store) {
  const faith = store.d.faithPerspective;

  if (activeExerciseId === 'ex-breath') {
    const ex = CONTENT.exercises.find(x => x.id === 'ex-breath');
    const title = faith && ex.faithTitle ? ex.faithTitle : ex.title;

    return `
      <div class="card">
        <div class="card-title-row">
          <h3>${esc(title)}</h3>
          <button type="button" class="secondary btn-action-sm" id="exitExerciseBtn">
            ✕ Tutup Latihan
          </button>
        </div>
        <p class="mute">Tarik 4 detik, tahan 4 detik, hembuskan perlahan 6 detik. Berhenti kapan saja jika tidak nyaman.</p>

        <div class="breather-container">
          <div class="breather-circle" id="breathCircle">Mulai</div>
          <div class="breather-instruction" id="breathInstruction">Tekan tombol di bawah untuk mulai</div>
          <div class="mute text-sm" id="breathCounter">1 menit latihan santai</div>
        </div>

        <div class="btn-group">
          <button type="button" class="primary w-full" id="startBreathingBtn">Mulai Napas 1 Menit</button>
        </div>

        <details class="clinical-note mt-3">
          <summary>Pelajari prinsip di balik latihan ini</summary>
          <p>${esc(ex.clinicalDetail)}</p>
        </details>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card-title-row">
        <h3>Pilih Latihan Singkat</h3>
        <span class="card-tag saffron">Bisa Diulang Kapan Saja</span>
      </div>
      <p class="mute">Latihan terbukti secara psikologis untuk meredakan gelisah tanpa obat:</p>

      ${CONTENT.exercises.map(x => {
        const title = faith && x.faithTitle ? x.faithTitle : x.title;
        return `
          <div class="exercise-item-card">
            <div class="card-title-row mb-1">
              <span class="font-bold text-ink-primary">${esc(title)}</span>
              <span class="card-tag">${esc(x.duration)}</span>
            </div>
            <p class="mute text-sm mb-2">${esc(x.description)}</p>
            
            ${x.id === 'ex-breath' ? `
              <button type="button" class="primary w-full" data-start-ex="${esc(x.id)}">
                Buka Latihan Napas Interaktif →
              </button>
            ` : `
              <ol class="exercise-steps-ol">
                ${x.steps.map(s => `<li>${esc(s)}</li>`).join('')}
              </ol>
            `}

            <details class="clinical-note mt-2">
              <summary>Pelajari prinsip ilmiahnya</summary>
              <p>${esc(x.clinicalDetail)}</p>
            </details>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function bindEmotions(container, store, navigate, rerender) {
  const tabCheckin = container.querySelector('#emoTabCheckin');
  const tabPractice = container.querySelector('#emoTabPractice');
  if (tabCheckin) {
    tabCheckin.onclick = () => {
      cleanupEmosi();
      emotionSubView = 'checkin';
      activeExerciseId = null;
      rerender();
    };
  }
  if (tabPractice) {
    tabPractice.onclick = () => {
      cleanupEmosi();
      emotionSubView = 'practice';
      rerender();
    };
  }

  // Full-screen session runner trigger
  const startFlowBtn = container.querySelector('#startCheckinFlowBtn');
  if (startFlowBtn) {
    startFlowBtn.onclick = () => {
      sessionRunner.start(createCheckinFlow(store.d.faithPerspective), {}, () => {
        rerender();
      });
    };
  }

  container.querySelectorAll('[data-emo-select]').forEach(btn => {
    btn.onclick = () => {
      selectedEmotion = btn.dataset.emoSelect;
      rerender();
    };
  });

  const cancelBtn = container.querySelector('#cancelEmoSelectBtn');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      selectedEmotion = null;
      selectedSensations = [];
      rerender();
    };
  }

  container.querySelectorAll('[data-sensation-toggle]').forEach(btn => {
    btn.onclick = () => {
      const s = btn.dataset.sensationToggle;
      if (selectedSensations.includes(s)) {
        selectedSensations = selectedSensations.filter(x => x !== s);
      } else {
        selectedSensations.push(s);
      }
      rerender();
    };
  });

  const saveBtn = container.querySelector('#saveEmotionCheckinBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const needSel = container.querySelector('#checkinNeedSelect');
      const noteArea = container.querySelector('#checkinNoteArea');
      const need = needSel ? needSel.value : '';
      const note = noteArea ? noteArea.value.trim() : '';

      store.addCheckin({
        emotion: selectedEmotion,
        sensations: selectedSensations,
        need,
        note,
        at: Date.now()
      });

      selectedEmotion = null;
      selectedSensations = [];
      alert('Catatan emosimu berhasil disimpan. Terima kasih telah meluangkan waktu untuk dirimu.');
      rerender();
    };
  }

  container.querySelectorAll('[data-start-ex]').forEach(btn => {
    btn.onclick = () => {
      activeExerciseId = btn.dataset.startEx;
      rerender();
    };
  });

  const exitExBtn = container.querySelector('#exitExerciseBtn');
  if (exitExBtn) {
    exitExBtn.onclick = () => {
      cleanupEmosi();
      activeExerciseId = null;
      rerender();
    };
  }

  // Interactive Breathing Logic
  const breathBtn = container.querySelector('#startBreathingBtn');
  if (breathBtn) {
    breathBtn.onclick = () => {
      if (breathingInterval) {
        cleanupEmosi();
        const circle = container.querySelector('#breathCircle');
        const instruction = container.querySelector('#breathInstruction');
        if (circle) {
          circle.className = 'breather-circle';
          circle.textContent = 'Mulai';
        }
        if (instruction) instruction.textContent = 'Latihan dihentikan.';
        breathBtn.textContent = 'Mulai Napas 1 Menit';
        return;
      }

      breathBtn.textContent = 'Hentikan Latihan';
      let secondsLeft = 60;
      let phase = 0;
      let phaseTime = 0;

      const circle = container.querySelector('#breathCircle');
      const instruction = container.querySelector('#breathInstruction');
      const counter = container.querySelector('#breathCounter');

      const applyPhase = () => {
        if (!circle || !instruction) return;
        if (phase === 0) {
          circle.className = 'breather-circle inhale';
          circle.textContent = 'Tarik';
          instruction.textContent = 'Tarik napas perlahan lewat hidung...';
          phaseTime = 4;
        } else if (phase === 1) {
          circle.className = 'breather-circle hold';
          circle.textContent = 'Tahan';
          instruction.textContent = 'Tahan napas santai dan rileks...';
          phaseTime = 4;
        } else {
          circle.className = 'breather-circle exhale';
          circle.textContent = 'Hembus';
          instruction.textContent = 'Hembuskan perlahan lewat mulut...';
          phaseTime = 6;
        }
      };

      applyPhase();

      breathingInterval = setInterval(() => {
        secondsLeft--;
        phaseTime--;
        if (counter) counter.textContent = `Sisa waktu: ${secondsLeft} detik`;

        if (phaseTime <= 0) {
          phase = (phase + 1) % 3;
          applyPhase();
        }

        if (secondsLeft <= 0) {
          cleanupEmosi();
          if (circle) {
            circle.className = 'breather-circle';
            circle.textContent = 'Selesai';
          }
          if (instruction) instruction.textContent = 'Bagus sekali. Rasakan ketenangan di tubuhmu.';
          breathBtn.textContent = 'Mulai Lagi';
        }
      }, 1000);
    };
  }
}
