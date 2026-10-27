/**
 * Expense Flow — Quick Log Flow (Target: 3 taps and under 10 seconds)
 * 1. Keypad (amount)
 * 2. Category as icon ChoiceTiles with the last-used one first
 * 3. Immediate Save. Date defaults to today and changeable via small chip.
 * Follow-up: Bubble "Tersimpan." + OPTIONAL "Mau cerita sedikit?" with expense tags.
 * Never block saving on reflection. Never label purchase as bad or impulsive.
 */
import { CONTENT } from '../../content.js';
import { Keypad } from '../ui/keypad.js';
import { ChoiceTiles } from '../ui/choiceTiles.js';
import { Bubble } from '../ui/bubble.js';
import { esc, today, idr } from '../ui/utils.js';

const CATEGORY_ICONS = {
  'Makanan & Kebutuhan Dapur': '🍜',
  'Transportasi & Bensin': '🚗',
  'Tempat Tinggal & Tagihan Rutin': '🏠',
  'Bantuan Keluarga / Orang Tua (Sandwich Gen)': '🤲',
  'Persiapan Pernikahan / Acara': '💍',
  'Hiburan & Kesenangan Pribadi': '☕',
  'Cicilan & Kewajiban Utang': '💳',
  'Kesehatan & Perawatan': '💊',
  'Tabungan Dana Cadangan': '🪙',
  'Lainnya': '✨'
};

export function createExpenseFlow(store, onFinish = null) {
  let selectedDate = today();
  let savedExpenseIndex = null;

  // Order categories with last-used first
  const existingExpenses = (store && store.d && store.d.expenses) || [];
  const lastCategory = existingExpenses.length ? existingExpenses[existingExpenses.length - 1].category : null;

  const categories = [...CONTENT.categories];
  if (lastCategory && categories.includes(lastCategory)) {
    const idx = categories.indexOf(lastCategory);
    categories.splice(idx, 1);
    categories.unshift(lastCategory);
  }

  const categoryItems = categories.map((cat, idx) => ({
    value: cat,
    label: cat,
    icon: CATEGORY_ICONS[cat] || '🪙',
    hint: idx === 0 && lastCategory === cat ? 'Terakhir kamu gunakan' : ''
  }));

  const tagItems = CONTENT.expenseTags.map(t => ({
    value: t.id,
    label: t.label,
    icon: '🏷️'
  }));

  return {
    id: 'expense',
    title: 'Catat Pengeluaran',
    completeLabel: 'Selesai',
    steps: [
      // Step 1: Keypad (amount) + date chip
      {
        id: 'amount',
        type: 'custom',
        title: 'Jumlah Pengeluaran',
        subtitle: 'Masukkan nominal belanja secara tenang tanpa rasa bersalah:',
        renderCustom(answers) {
          const displayDate = new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          return `
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs mute font-medium">Tanggal Transaksi:</span>
              <label class="date-chip-btn">
                📅 ${displayDate}
                <input type="date" id="expenseDatePicker" value="${selectedDate}" class="date-picker-hidden">
              </label>
            </div>
            <div id="expenseKeypadMount"></div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#expenseKeypadMount');
          const datePicker = container.querySelector('#expenseDatePicker');

          if (datePicker) {
            datePicker.onchange = () => {
              selectedDate = datePicker.value || today();
              const dateChip = container.querySelector('.date-chip-btn');
              if (dateChip) {
                const displayDate = new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                dateChip.childNodes[0].textContent = `📅 ${displayDate} `;
              }
            };
          }

          if (mountEl) {
            const keypad = new Keypad({
              container: mountEl,
              initialValue: answers.amount || 0,
              onChange: (val) => {
                runner.setAnswer(val);
              }
            });
          }
        }
      },

      // Step 2: Category (ChoiceTiles with last-used first -> Immediate Save!)
      {
        id: 'category',
        type: 'custom',
        hideFooter: true,
        title: 'Pilih Kategori',
        subtitle: 'Sentuh satu kategori untuk langsung menyimpan transaksi ini:',
        renderCustom(answers) {
          return `
            <div class="card card-border-teal mb-3 p-2">
              <span class="text-xs mute">Nominal Tercatat:</span>
              <div class="font-bold text-teal text-lg">${idr(answers.amount || 0)}</div>
            </div>
            <div id="expenseCategoryTiles"></div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#expenseCategoryTiles');
          if (!mountEl) return;

          new ChoiceTiles({
            container: mountEl,
            items: categoryItems,
            selected: answers.category || null,
            multiple: false,
            onChange: (selectedCat) => {
              runner.setAnswer(selectedCat);

              // Immediate Save! Never blocked by reflection
              const amount = Number(answers.amount) || 0;
              if (amount > 0) {
                store.addExpense({
                  amount,
                  category: selectedCat,
                  date: selectedDate,
                  tag: 'planned',
                  note: '',
                  at: Date.now()
                });
                savedExpenseIndex = store.d.expenses.length - 1;
              }

              // Advance to optional follow-up
              setTimeout(() => {
                runner.next();
              }, 300);
            }
          });
        }
      },

      // Step 3: Optional follow-up (Bubble "Tersimpan." + "Mau cerita sedikit?")
      {
        id: 'reflect',
        type: 'custom',
        title: 'Catatan Pengeluaran',
        renderCustom(answers) {
          return `
            <div class="mb-3">
              ${Bubble.renderHTML({
                sender: 'Teman Siap',
                role: 'guide',
                icon: '🪙',
                text: 'Tersimpan. Setiap catatan membantumu semakin memahami hubungan emosi dengan keuangan.'
              })}
            </div>

            <div class="card mb-3">
              <h3 class="text-sm font-bold mb-1">Mau cerita sedikit? (Opsional)</h3>
              <p class="mute text-xs mb-3">Tandai konteks pengeluaran ini untuk melihat polamu di kemudian hari:</p>
              <div id="expenseTagTiles" class="mb-3"></div>

              <label for="expenseNoteField" class="text-sm font-medium">Catatan nama barang / tempat:</label>
              <input type="text" id="expenseNoteField" placeholder="Misal: Kopi susu saat deadline, bensin, dll." value="${esc(answers.note || '')}">
            </div>
          `;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#expenseTagTiles');
          const noteField = container.querySelector('#expenseNoteField');

          const updateSavedExpense = () => {
            if (savedExpenseIndex !== null && store.d.expenses[savedExpenseIndex]) {
              store.set(state => {
                const expenses = [...state.expenses];
                if (expenses[savedExpenseIndex]) {
                  expenses[savedExpenseIndex].tag = answers.tag || expenses[savedExpenseIndex].tag;
                  expenses[savedExpenseIndex].note = (answers.note || '').trim();
                }
                return { ...state, expenses };
              });
            }
          };

          if (mountEl) {
            new ChoiceTiles({
              container: mountEl,
              items: tagItems,
              selected: answers.tag || 'planned',
              multiple: false,
              onChange: (tagVal) => {
                answers.tag = tagVal;
                updateSavedExpense();
              }
            });
          }

          if (noteField) {
            noteField.oninput = () => {
              answers.note = noteField.value;
              updateSavedExpense();
            };
          }
        }
      }
    ],

    onComplete(answers, store) {
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
