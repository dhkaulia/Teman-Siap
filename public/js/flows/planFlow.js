/**
 * Plan Flow — "Jika [tile] maka [tile]" Implementation Intentions Builder
 * Uses presets from content.js with free text as optional fallback.
 */
import { ChoiceTiles } from '../ui/choiceTiles.js';
import { esc } from '../ui/utils.js';

export function createPlanFlow(onFinish = null) {
  const triggerPresets = [
    { value: 'Melihat diskon promo saat malam hari', label: 'Melihat diskon promo saat malam hari', icon: '🌙' },
    { value: 'Merasa stres karena pekerjaan dan ingin jajan berlebihan', label: 'Merasa stres karena pekerjaan & ingin jajan', icon: '⚡' },
    { value: 'Takut mengecek saldo karena cemas melihat angkanya', label: 'Takut mengecek saldo karena cemas', icon: '🫣' },
    { value: 'Keluarga membutuhkan bantuan uang mendadak', label: 'Keluarga butuh bantuan mendadak', icon: '🤲' },
    { value: 'Tergoda belanja saat bosan scrolling ponsel', label: 'Tergoda belanja saat bosan scrolling', icon: '📱' },
    { value: 'custom', label: 'Tulis situasi pemicu sendiri...', icon: '✍️' }
  ];

  const actionPresets = [
    { value: 'Tutup aplikasi marketplace, minum segelas air hangat, dan beri jeda 24 jam.', label: 'Tutup aplikasi & beri jeda 24 jam', icon: '⏳' },
    { value: 'Tarik napas dalam 3 kali, buka aplikasi rekening, lalu catat satu angka dengan tenang.', label: 'Tarik napas 3 kali & catat dengan tenang', icon: '📝' },
    { value: 'Berjalan kaki santai 10 menit atau dengarkan 1 lagu favorit sebelum checkout.', label: 'Jalan santai 10 menit / dengarkan 1 lagu', icon: '🎧' },
    { value: 'Duduk berdua dengan pasangan untuk mendiskusikan batas bantuan yang aman.', label: 'Duduk berdua & sepakati batas bantuan aman', icon: '🤝' },
    { value: 'custom', label: 'Tulis tindakan respon sendiri...', icon: '✍️' }
  ];

  return {
    id: 'plan',
    title: 'Rencana Jika-Maka',
    completeLabel: 'Simpan Rencana',
    steps: [
      // Step 1: Trigger ("Jika...")
      {
        id: 'trigger',
        type: 'custom',
        title: 'Jika situasi ini muncul...',
        subtitle: 'Pilih situasi godaan atau pemicu belanja emosional:',
        renderCustom(answers) {
          return `
            <div id="planTriggerTiles" class="mb-3"></div>
            <div id="planCustomTriggerBox" ${answers.trigger && !triggerPresets.some(p => p.value === answers.trigger && p.value !== 'custom') ? '' : 'hidden'}>
              <label for="planCustomTriggerInput" class="text-sm font-medium">Situasi pemicu kustom:</label>
              <input type="text" id="planCustomTriggerInput" placeholder="Misal: Saat teman mengajak hangout mewah..." value="${answers.trigger !== 'custom' ? esc(answers.trigger || '') : ''}">
            </div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#planTriggerTiles');
          const customBox = container.querySelector('#planCustomTriggerBox');
          const customInput = container.querySelector('#planCustomTriggerInput');

          if (mountEl) {
            new ChoiceTiles({
              container: mountEl,
              items: triggerPresets,
              selected: answers.trigger || triggerPresets[0].value,
              multiple: false,
              onChange: (val) => {
                if (val === 'custom') {
                  if (customBox) customBox.hidden = false;
                  if (customInput) customInput.focus();
                  answers.trigger = (customInput && customInput.value.trim()) || 'godaan belanja muncul';
                } else {
                  if (customBox) customBox.hidden = true;
                  answers.trigger = val;
                }
                runner.setAnswer(answers.trigger);
              }
            });
            if (!answers.trigger) runner.setAnswer(triggerPresets[0].value);
          }

          if (customInput) {
            customInput.oninput = () => {
              answers.trigger = customInput.value.trim() || 'godaan belanja muncul';
              runner.setAnswer(answers.trigger);
            };
          }
        }
      },

      // Step 2: Action ("Maka saya akan...")
      {
        id: 'action',
        type: 'custom',
        title: 'Maka saya akan...',
        subtitle: 'Pilih respon sehat yang otomatis menenangkan pikiranmu:',
        renderCustom(answers) {
          return `
            <div id="planActionTiles" class="mb-3"></div>
            <div id="planCustomActionBox" ${answers.action && !actionPresets.some(p => p.value === answers.action && p.value !== 'custom') ? '' : 'hidden'}>
              <label for="planCustomActionInput" class="text-sm font-medium">Tindakan respon kustom:</label>
              <input type="text" id="planCustomActionInput" placeholder="Misal: Minum air putih dan beri jeda 1 jam..." value="${answers.action !== 'custom' ? esc(answers.action || '') : ''}">
            </div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#planActionTiles');
          const customBox = container.querySelector('#planCustomActionBox');
          const customInput = container.querySelector('#planCustomActionInput');

          if (mountEl) {
            new ChoiceTiles({
              container: mountEl,
              items: actionPresets,
              selected: answers.action || actionPresets[0].value,
              multiple: false,
              onChange: (val) => {
                if (val === 'custom') {
                  if (customBox) customBox.hidden = false;
                  if (customInput) customInput.focus();
                  answers.action = (customInput && customInput.value.trim()) || 'ambil jeda sejenak';
                } else {
                  if (customBox) customBox.hidden = true;
                  answers.action = val;
                }
                runner.setAnswer(answers.action);
              }
            });
            if (!answers.action) runner.setAnswer(actionPresets[0].value);
          }

          if (customInput) {
            customInput.oninput = () => {
              answers.action = customInput.value.trim() || 'ambil jeda sejenak';
              runner.setAnswer(answers.action);
            };
          }
        }
      },

      // Step 3: Sentence Preview
      {
        id: 'preview',
        type: 'custom',
        title: 'Rencana Respon Otomatis',
        subtitle: 'Respon ini akan membantumu mengambil keputusan sehat saat godaan datang:',
        renderCustom(answers) {
          return `
            <div class="card card-border-teal p-3 mb-3">
              <div class="text-xs font-bold text-teal mb-1">Rencana Terbentuk:</div>
              <p class="text-md font-medium text-ink-primary">
                "<b>Jika</b> ${esc(answers.trigger || 'godaan muncul')}, <b>maka saya akan</b> ${esc(answers.action || 'ambil jeda sejenak')}."
              </p>
            </div>
          `;
        }
      }
    ],

    onComplete(answers, store) {
      store.addPlan({
        i: answers.trigger || 'godaan belanja',
        t: answers.action || 'ambil jeda 10 menit',
        at: Date.now()
      });
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
