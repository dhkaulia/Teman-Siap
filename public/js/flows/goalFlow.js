/**
 * Goal Flow — 3-Step Financial Goal Creation Flow
 * 1. Name (presets + free text)
 * 2. Target nominal entered via Keypad
 * 3. Optional target date (skippable, missed date never labeled as failed)
 */
import { Keypad } from '../ui/keypad.js';
import { ChoiceTiles } from '../ui/choiceTiles.js';
import { esc } from '../ui/utils.js';

export function createGoalFlow(onFinish = null) {
  const goalPresets = [
    { value: 'Dana Cadangan Sakinah', label: 'Dana Cadangan Sakinah', icon: '🛡️', hint: 'Kebutuhan darurat 3-6 bulan pengeluaran' },
    { value: 'Tempat Tinggal Mandiri', label: 'Tempat Tinggal Mandiri', icon: '🏠', hint: 'Uang muka sewa / rumah berdua' },
    { value: 'Persiapan Pernikahan', label: 'Persiapan Pernikahan', icon: '💍', hint: 'Pos kebutuhan sah dan resepsi secukupnya' },
    { value: 'Kelahiran & Buah Hati', label: 'Kelahiran & Buah Hati', icon: '👶', hint: 'Dana kesehatan awal menyambut buah hati' },
    { value: 'custom', label: 'Tulis nama tujuan sendiri...', icon: '✍️', hint: 'Kustomisasi sesuai situasi kalian' }
  ];

  return {
    id: 'goal',
    title: 'Tujuan Tabungan',
    completeLabel: 'Simpan Tujuan ✨',
    steps: [
      // Step 1: Goal Name
      {
        id: 'name',
        type: 'custom',
        title: 'Nama Tujuan Tabungan',
        subtitle: 'Pilih impian bersama yang ingin kalian prioritaskan:',
        renderCustom(answers) {
          return `
            <div id="goalNameTiles" class="mb-3"></div>
            <div id="goalCustomNameBox" ${answers.name && !goalPresets.some(p => p.value === answers.name && p.value !== 'custom') ? '' : 'hidden'}>
              <label for="goalCustomNameInput" class="text-sm font-medium">Tuliskan nama tujuan kustom:</label>
              <input type="text" id="goalCustomNameInput" placeholder="Misal: Biaya pendidikan, renovasi, dll." value="${answers.name !== 'custom' ? esc(answers.name || '') : ''}">
            </div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#goalNameTiles');
          const customBox = container.querySelector('#goalCustomNameBox');
          const customInput = container.querySelector('#goalCustomNameInput');

          if (mountEl) {
            new ChoiceTiles({
              container: mountEl,
              items: goalPresets,
              selected: answers.name || 'Dana Cadangan Sakinah',
              multiple: false,
              onChange: (val) => {
                if (val === 'custom') {
                  if (customBox) customBox.hidden = false;
                  if (customInput) customInput.focus();
                  answers.name = (customInput && customInput.value.trim()) || 'Tujuan Tabungan';
                } else {
                  if (customBox) customBox.hidden = true;
                  answers.name = val;
                }
                runner.setAnswer(answers.name);
              }
            });
            if (!answers.name) runner.setAnswer('Dana Cadangan Sakinah');
          }

          if (customInput) {
            customInput.oninput = () => {
              answers.name = customInput.value.trim() || 'Tujuan Tabungan';
              runner.setAnswer(answers.name);
            };
          }
        }
      },

      // Step 2: Target Amount (Keypad)
      {
        id: 'target',
        type: 'custom',
        title: 'Target Nominal Tabungan',
        subtitle: 'Tentukan jumlah yang realistis untuk dicapai secara bertahap:',
        renderCustom(answers) {
          return `<div id="goalKeypadMount"></div>`;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#goalKeypadMount');
          if (!mountEl) return;

          new Keypad({
            container: mountEl,
            initialValue: answers.target || 5000000,
            onChange: (val) => {
              runner.setAnswer(val);
            }
          });
          runner.setAnswer(answers.target || 5000000);
        }
      },

      // Step 3: Optional Date
      {
        id: 'date',
        type: 'custom',
        optional: true,
        title: 'Target Waktu (Opsional)',
        subtitle: 'Boleh tentukan perkiraan target waktu pencapaian (tidak ada label gagal jika belum tercapai):',
        renderCustom(answers) {
          return `
            <label for="goalTargetDateInput" class="text-sm font-medium">Bulan Target (Boleh lewati):</label>
            <input type="month" id="goalTargetDateInput" value="${esc(answers.date || '')}">
            <p class="mute text-xs mt-2">
              *Progres tabungan dihitung murni dari catatan yang kamu masukkan, tanpa sanksi atau skor kegagalan.
            </p>
          `;
        },
        bind(container, answers, runner) {
          const input = container.querySelector('#goalTargetDateInput');
          if (input) {
            input.onchange = () => {
              runner.setAnswer(input.value);
            };
          }
        }
      }
    ],

    onComplete(answers, store) {
      const target = Number(answers.target) || 5000000;
      const name = (answers.name || 'Dana Cadangan Sakinah').trim();
      store.setGoal({
        name,
        target,
        targetDate: answers.date || null,
        saved: 0
      });
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
