/**
 * Breathing Flow — Full-Screen 5-Cycle Breather Flow
 * After 5 cycles: ask one-tap question "Terasa lebih ringan?" (ya / sedikit / belum)
 * with zero judgment on any answer. Exit anytime saves nothing.
 */
import { Breather } from '../ui/breather.js';
import { ChoiceTiles } from '../ui/choiceTiles.js';

export function createBreathingFlow(onFinish = null) {
  return {
    id: 'breathing',
    title: 'Latihan Napas Tenang',
    completeLabel: 'Selesai ✨',
    steps: [
      // Step 1: Full-screen Breather 5 cycles
      {
        id: 'breathe',
        type: 'custom',
        hideFooter: true,
        title: 'Napas Tenang (4-4-6)',
        subtitle: '5 siklus rileks. Tarik 4 detik, tahan 4 detik, hembuskan 6 detik:',
        renderCustom() {
          return `<div id="flowBreatherMount"></div>`;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#flowBreatherMount');
          if (!mountEl) return;

          new Breather({
            container: mountEl,
            totalCycles: 5,
            onComplete: () => {
              setTimeout(() => {
                runner.next();
              }, 800);
            }
          });
        }
      },

      // Step 2: One-tap question "Terasa lebih ringan?"
      {
        id: 'feedback',
        type: 'custom',
        title: 'Terasa lebih ringan?',
        subtitle: 'Dengarkan sensasi tubuhmu tanpa menghakimi:',
        renderCustom(answers) {
          return `
            <div id="breathingFeedbackTiles" class="mb-3"></div>
            <div id="breathingFeedbackNote" class="card card-border-teal text-sm mute mt-3" hidden>
              Terima kasih telah meluangkan 1 menit untuk dirimu. Setiap tarikan napas memberi ruang aman bagi sistem sarafmu.
            </div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#breathingFeedbackTiles');
          const noteEl = container.querySelector('#breathingFeedbackNote');
          if (!mountEl) return;

          new ChoiceTiles({
            container: mountEl,
            items: [
              { value: 'ya', label: 'Ya, terasa lebih lega', icon: '🌿', hint: 'Pundak dan dada lebih rileks' },
              { value: 'sedikit', label: 'Sedikit lebih rileks', icon: '🍃', hint: 'Detak jantung mulai melambat' },
              { value: 'belum', label: 'Belum banyak berubah', icon: '☁️', hint: 'Tidak apa-apa, tubuh butuh waktu' }
            ],
            selected: answers.feedback || null,
            multiple: false,
            onChange: (val) => {
              runner.setAnswer(val);
              if (noteEl) noteEl.hidden = false;
            }
          });
        }
      }
    ],

    onComplete(answers, store) {
      store.addPause({
        type: 'breathing',
        feedback: answers.feedback || 'selesai',
        helped: answers.feedback !== 'belum',
        at: Date.now()
      });
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
