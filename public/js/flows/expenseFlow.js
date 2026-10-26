/**
 * Expense Flow — Declarative Conscious Spending Flow
 * Amount -> Category -> Trigger Tag -> Reflection Note
 */
import { CONTENT } from '../../content.js';

export function createExpenseFlow() {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: 'expense',
    title: 'Catat Pengeluaran Sadar',
    completeLabel: 'Simpan Pengeluaran Sadar ✨',
    steps: [
      {
        id: 'amount',
        type: 'number',
        tag: '1. Angka Nominal',
        title: 'Jumlah Nominal Belanja (Rp)',
        subtitle: 'Hadapi angka dengan tenang tanpa rasa malu atau takut:',
        placeholder: 'Contoh: 35000',
        clinicalDetail: 'Pendekatan ini mengatasi Ostrich Effect (kebiasaan menghindari kenyataan finansial karena takut stres).'
      },
      {
        id: 'category',
        type: 'select',
        tag: '2. Kategori Pengeluaran',
        title: 'Pengeluaran untuk kategori apa?',
        placeholder: '-- Pilih Kategori --',
        options: CONTENT.categories.map(c => ({ value: c, label: c }))
      },
      {
        id: 'tag',
        type: 'select',
        tag: '3. Konteks & Pemicu',
        title: 'Pengeluaran ini paling tepat disebut:',
        subtitle: 'Membantu melihat hubungan emosi dengan dorongan belanja:',
        placeholder: '-- Pilih Pemicu Belanja --',
        options: CONTENT.expenseTags.map(t => ({ value: t.id, label: t.label }))
      },
      {
        id: 'note',
        type: 'reflection',
        optional: true,
        tag: '4. Catatan Barang',
        title: 'Catatan tambahan (Boleh dilewati)',
        subtitle: 'Misal: Es kopi saat stres deadline kerja, atau kebutuhan dapur bulanan:',
        placeholder: 'Tuliskan catatan barang...'
      }
    ],
    onComplete(answers, store) {
      const amount = Number(answers.amount);
      if (!amount || amount <= 0) return;

      store.addExpense({
        amount,
        category: answers.category || CONTENT.categories[0],
        date: today,
        tag: answers.tag || 'planned',
        note: (answers.note || '').trim(),
        at: Date.now()
      });
    }
  };
}
