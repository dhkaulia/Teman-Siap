/**
 * Urge Surfing Scene Flow (Full Screen)
 * 1. "Seberapa kuat dorongannya?": drag Wave (1-10)
 * 2. 10-minute timer surviving lock/background via stored end timestamp + Wake Lock API
 * 3. Midway CBT reframe card as swipeable/dismissible Bubble
 * 4. End decision tiles (Tunggu lagi / Lihat tujuanku / Tetap beli / Lainnya), every choice acceptable
 */
import { CONTENT } from '../../content.js';
import { Wave } from '../ui/wave.js';
import { ChoiceTiles } from '../ui/choiceTiles.js';
import { Bubble } from '../ui/bubble.js';
import { announce, esc } from '../ui/utils.js';
import { BottomSheet } from '../ui/bottomSheet.js';

export function createUrgeFlow(faithPerspective = false, onFinish = null) {
  let timerInterval = null;
  let wakeLock = null;
  let waveInstance = null;

  const cleanupTimerAndWakeLock = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (wakeLock) {
      try { wakeLock.release(); } catch (_) {}
      wakeLock = null;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('temansiap_urge_end');
    }
  };

  const reframeItems = CONTENT.cognitiveReframes;
  const chosenReframe = reframeItems[Math.floor(Math.random() * reframeItems.length)];
  const shortLine = faithPerspective && chosenReframe.shortBalancedFaith
    ? chosenReframe.shortBalancedFaith
    : (chosenReframe.shortBalanced || chosenReframe.counterPerspective);
  const learnMoreText = chosenReframe.learnMore || 'Menunda dorongan belanja selama 10 menit membantu menenangkan amigdala dan mengembalikan kejernihan keputusan finansial secara alami.';

  return {
    id: 'urge',
    title: 'Jeda Belanja (Urge Surfing)',
    completeLabel: 'Selesai',
    steps: [
      // Step 1: Starting Intensity (Wave 1 to 10)
      {
        id: 'startIntensity',
        type: 'custom',
        title: 'Seberapa kuat dorongannya?',
        subtitle: 'Sentuh dan geser ombak naik atau turun:',
        renderCustom(answers) {
          return `
            <div id="urgeWaveStartMount"></div>
            <p class="mute text-xs text-center mt-2">
              Nafsu belanja bekerja seperti ombak di laut: ia akan memuncak selama beberapa menit lalu berangsur mereda.
            </p>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#urgeWaveStartMount');
          if (!mountEl) return;

          const wave = new Wave({
            container: mountEl,
            value: answers.startIntensity || 6,
            onChange: (val) => {
              runner.setAnswer(val);
            }
          });
          runner.setAnswer(wave.value);
        }
      },

      // Step 2: 10-minute timer scene with stored end timestamp + Wake Lock + Reframe Card
      {
        id: 'surfing',
        type: 'custom',
        hideFooter: true,
        title: 'Jeda Sadar 10 Menit',
        subtitle: 'Beri jeda agar pikiran kembali tenang.',
        renderCustom() {
          return `
            <div class="urge-scene-box w-full">
              <div class="urge-timer-block w-full text-center">
                <div class="timer-display tabular-nums mb-1" id="urgeSceneTimer">10:00</div>
                <div class="mute text-xs mb-3" id="urgeSceneSubtext">Jeda sedang berjalan…</div>
              </div>

              <div id="urgeWaveSceneMount" class="w-full mb-3"></div>

              <!-- Reframe Card: User's Thought + 1 Short Balanced Line (<=20 words) + Pelajari -->
              <div id="urgeReframeCard" class="card card-border-saffron urge-reframe-card w-full mb-3 text-left">
                <div class="flex items-center justify-between mb-2">
                  <span class="card-tag saffron">Sudut Pandang Seimbang</span>
                  <button type="button" class="unit-learn-btn" id="openReframeLearnBtn" aria-label="Pelajari sudut pandang seimbang">
                    Pelajari
                  </button>
                </div>
                <div class="reframe-thought font-semibold text-sm mb-1">${esc(chosenReframe.impulseThought)}</div>
                <div class="reframe-balanced text-sm mute">${esc(shortLine)}</div>
              </div>

              <button type="button" class="primary w-full" id="finishUrgeEarlyBtn">
                Selesai
              </button>
            </div>
          `;
        },
        bind(container, answers, runner) {
          const timerEl = container.querySelector('#urgeSceneTimer');
          const waveMount = container.querySelector('#urgeWaveSceneMount');
          const finishBtn = container.querySelector('#finishUrgeEarlyBtn');
          const learnBtn = container.querySelector('#openReframeLearnBtn');

          if (learnBtn) {
            learnBtn.onclick = () => {
              const sheet = new BottomSheet();
              const sheetContent = document.createElement('div');
              sheetContent.innerHTML = `
                <p class="font-semibold text-sm mb-2">${esc(chosenReframe.impulseThought)}</p>
                <p class="text-sm mb-3">${esc(shortLine)}</p>
                <div class="card p-3 mb-3">
                  <div class="text-xs font-bold text-teal mb-1">Prinsip Ilmiah:</div>
                  <div class="text-sm mute">${esc(learnMoreText)}</div>
                </div>
                <button type="button" class="primary w-full mt-2" id="closeReframeSheetBtn">Tutup</button>
              `;
              const closeBtn = sheetContent.querySelector('#closeReframeSheetBtn');
              if (closeBtn) closeBtn.onclick = () => sheet.close();
              sheet.open({
                title: 'Sudut Pandang Seimbang',
                content: sheetContent
              });
            };
          }

          // Initialize wave in scene
          if (waveMount) {
            waveInstance = new Wave({
              container: waveMount,
              value: answers.startIntensity || 6
            });
          }

          // Request Screen Wake Lock API if supported
          if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
            try {
              navigator.wakeLock.request('screen').then(lock => {
                wakeLock = lock;
              }).catch(() => {});
            } catch (_) {}
          }

          // Compute remaining time from stored end timestamp (survives screen lock & reload)
          let endTs = typeof localStorage !== 'undefined' ? Number(localStorage.getItem('temansiap_urge_end')) : 0;
          if (!endTs || isNaN(endTs) || endTs <= Date.now()) {
            endTs = Date.now() + 600 * 1000;
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('temansiap_urge_end', String(endTs));
            }
          }

          let halfwayAnnounced = false;
          announce('Latihan jeda belanja 10 menit dimulai.');

          const updateScene = () => {
            const now = Date.now();
            const remainSec = Math.max(0, Math.round((endTs - now) / 1000));
            const m = Math.floor(remainSec / 60);
            const s = String(remainSec % 60).padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;

            if (remainSec <= 300 && !halfwayAnnounced) {
              halfwayAnnounced = true;
              announce('Menit ke-5: kartu refleksi pikiran terbuka.');
            }

            // Update wave height proportionally (peaks at 4-5 mins, recedes to calm)
            if (waveInstance) {
              const elapsed = 600 - remainSec;
              let waveVal = 5;
              if (elapsed < 240) {
                // Rising towards peak
                waveVal = (answers.startIntensity || 6) + (elapsed / 240) * 3;
              } else {
                // Falling gradually to calm
                waveVal = Math.max(1, 9 - ((elapsed - 240) / 360) * 7);
              }
              waveInstance.setValue(waveVal);
            }

            if (remainSec <= 0) {
              announce('Waktu jeda 10 menit selesai. Lanjut ke keputusan.');
              cleanupTimerAndWakeLock();
              runner.next();
            }
          };

          updateScene();
          timerInterval = setInterval(updateScene, 1000);

          // Handle tab backgrounding and device lock recovery
          document.addEventListener('visibilitychange', updateScene);

          if (finishBtn) {
            finishBtn.onclick = () => {
              cleanupTimerAndWakeLock();
              runner.next();
            };
          }
        }
      },

      // Step 3: Decision & Ending Intensity (every choice acceptable, non-judgmental)
      {
        id: 'decision',
        type: 'custom',
        title: 'Apa yang ingin kamu putuskan?',
        subtitle: 'Setiap keputusan dapat diterima. Dengarkan kebutuhanmu saat ini:',
        renderCustom(answers) {
          return `
            <div id="urgeDecisionTiles" class="mb-3"></div>

            <div class="card card-border-saffron mb-3">
              <span class="text-xs font-bold text-ink-primary">Seberapa kuat sisa dorongan belanjamu sekarang? (1–10):</span>
              <div id="urgeWaveEndMount" class="mt-2"></div>
            </div>
          `;
        },
        bind(container, answers, runner) {
          const decisionMount = container.querySelector('#urgeDecisionTiles');
          const waveMount = container.querySelector('#urgeWaveEndMount');

          if (decisionMount) {
            new ChoiceTiles({
              container: decisionMount,
              items: [
                { value: 'Tunggu lagi', label: 'Tunggu lagi (tunda 24 jam)', icon: '⏳', hint: 'Beri waktu sehari untuk memastikan kebutuhan' },
                { value: 'Lihat tujuanku', label: 'Lihat tujuanku (ingat impian bersama)', icon: '🎯', hint: 'Fokus pada keamanan tabungan masa depan' },
                { value: 'Tetap beli', label: 'Tetap beli (dengan sadar & tenang)', icon: '🛍️', hint: 'Beli tanpa rasa bersalah yang menghukum diri' },
                { value: 'Lainnya', label: 'Lainnya (lakukan hal lain dulu)', icon: '💭', hint: 'Minum air, jalan santai, atau istirahat' }
              ],
              selected: answers.decision || 'Tunggu lagi',
              multiple: false,
              onChange: (val) => {
                runner.setAnswer(val);
              }
            });
            if (!answers.decision) runner.setAnswer('Tunggu lagi');
          }

          if (waveMount) {
            const endWave = new Wave({
              container: waveMount,
              value: answers.endIntensity || 2,
              onChange: (v) => {
                answers.endIntensity = v;
              }
            });
            answers.endIntensity = endWave.value;
          }
        }
      }
    ],

    onComplete(answers, store) {
      cleanupTimerAndWakeLock();
      store.addPause({
        type: 'urge_surfing',
        startIntensity: answers.startIntensity || 6,
        endIntensity: answers.endIntensity !== undefined ? answers.endIntensity : 2,
        decision: answers.decision || 'Tunggu lagi',
        helped: answers.decision !== 'Tetap beli',
        at: Date.now()
      });
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
