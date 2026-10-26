/**
 * Goal Flow — Declarative Financial Savings Goal Flow
 */
export function createGoalFlow() {
  return {
    id: 'goal',
    title: 'Tujuan Tabungan Bersama',
    completeLabel: 'Simpan Tujuan Tabungan ✨',
    steps: [
      {
        id: 'name',
        type: 'reflection',
        tag: '1. Nama Tujuan',
        title: 'Apa nama tujuan tabungan ini?',
        subtitle: 'Fokus pada hal yang memberi rasa aman nyata bagi masa depan kalian:',
        placeholder: 'Misal: Dana Cadangan / Tempat Tinggal Mandiri'
      },
      {
        id: 'target',
        type: 'number',
        tag: '2. Target Nominal',
        title: 'Berapa target nominal yang ingin dicapai? (Rp)',
        subtitle: 'Tentukan target yang realistis dan bertahap:',
        placeholder: 'Misal: 5000000'
      }
    ],
    onComplete(answers, store) {
      const name = (answers.name || '').trim();
      const target = Number(answers.target);
      if (!name || !target || target <= 0) return;

      store.setGoal({
        name,
        target,
        saved: 0
      });
    }
  };
}
