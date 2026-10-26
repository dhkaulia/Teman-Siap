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
  const reframeText = faithPerspective && chosenReframe.counterPerspectiveFaith 
    ? chosenReframe.counterPerspectiveFaith 
    : chosenReframe.counterPerspective;

  return {
    id: 'urge',
    title: 'Jeda Belanja (Urge Surfing)',
    completeLabel: 'Selesai ✨',
    steps: [
      // Step 1: Starting Intensity (Wave 1 to 10)
      {
        id: 'startIntensity',
        type: 'custom',
        title: 'Seberapa kuat dorongannya?',
        subtitle: 'Sentuh dan geser ombak naik atau turun untuk menandai dorongan belanjamu saat ini:',
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

      // Step 2: 10-minute timer scene with stored end timestamp + Wake Lock + Midway CBT Bubble
      {
        id: 'surfing',
        type: 'custom',
        hideFooter: true,
        title: 'Jeda Sadar 10 Menit',
        subtitle: 'Beri ruang sejenak agar amigdala mereda dan pikiran rasionalmu kembali jernih:',
        renderCustom() {
          return `
            <div class="urge-scene-box">
              <div class="timer-display mb-1" id="urgeSceneTimer">10:00</div>
              <div class="mute text-xs mb-3" id="urgeSceneSubtext">Jeda sedang berjalan...</div>

              <div id="urgeWaveSceneMount" class="mb-3"></div>

              <!-- Midway CBT Reframe Bubble (appears around 5 minutes or tapped) -->
              <div id="urgeMidwayBubble" class="mb-3">
                ${Bubble.renderHTML({
                  sender: 'Sudut Pandang Seimbang',
                  role: 'guide',
                  icon: '💡',
                  text: `${chosenReframe.impulseThought} → ${reframeText}`
                })}
              </div>

              <button type="button" class="secondary w-full btn-action-sm mt-2" id="finishUrgeEarlyBtn">
                Selesaikan Jeda Sekarang
              </button>
            </div>
          `;
        },
        bind(container, answers, runner) {
          const timerEl = container.querySelector('#urgeSceneTimer');
          const waveMount = container.querySelector('#urgeWaveSceneMount');
          const finishBtn = container.querySelector('#finishUrgeEarlyBtn');

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

          const updateScene = () => {
            const now = Date.now();
            const remainSec = Math.max(0, Math.round((endTs - now) / 1000));
            const m = Math.floor(remainSec / 60);
            const s = String(remainSec % 60).padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;

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
