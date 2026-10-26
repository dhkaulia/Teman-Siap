/**
 * Checkin Flow — Declarative Emotional Awareness Flow
 * Notice & Name -> Bodily Sensations -> Core Needs -> Reflection
 */
import { CONTENT } from '../../content.js';

export function createCheckinFlow(faithPerspective = false) {
  return {
    id: 'checkin',
    title: 'Cek Emosi Sejenak',
    completeLabel: 'Simpan Cek Emosi ✨',
    steps: [
      {
        id: 'feel',
        type: 'choice',
        tag: '1. Sadar & Beri Nama',
        title: 'Apa yang paling kamu rasakan saat ini?',
        subtitle: 'Pilih satu yang paling mendekati kondisimu saat ini:',
        clinicalDetail: 'Latihan ini berakar pada keterampilan Observe & Describe dari Dialectical Behavior Therapy (DBT). Memberi nama emosi mengaktifkan korteks prefrontal otak dan meredakan reaksi impulsif amigdala.',
        options: CONTENT.emotions.map(e => ({
          value: e.label,
          label: e.label,
          icon: e.icon,
          hint: faithPerspective && e.faithHint ? e.faithHint : e.hint
        }))
      },
      {
        id: 'body',
        type: 'bodymap',
        optional: true,
        tag: '2. Sensasi Fisik Tubuh',
        title: 'Di bagian tubuh mana sensasi ini terasa?',
        subtitle: 'Boleh pilih satu, beberapa, atau lewati jika tidak merasakan ketegangan tertentu:',
        options: CONTENT.bodySensations
      },
      {
        id: 'need',
        type: 'select',
        optional: true,
        tag: '3. Kebutuhan Terdalam',
        title: 'Apa yang paling akan membantumu saat ini?',
        placeholder: '-- Boleh dilewati jika belum yakin --',
        options: CONTENT.needs.map(n => ({ value: n, label: n }))
      },
      {
        id: 'reflect',
        type: 'reflection',
        optional: true,
        tag: '4. Catatan Refleksi',
        title: 'Catatan pribadi (hanya di browsermu)',
        subtitle: 'Tuliskan apa yang ada di pikiranmu dengan bebas tanpa khawatir dihakimi:',
        placeholder: 'Tuliskan refleksimu di sini...'
      }
    ],
    onComplete(answers, store) {
      if (!answers.feel) return;
      store.addCheckin({
        emotion: answers.feel,
        sensations: Array.isArray(answers.body) ? answers.body : [],
        need: answers.need || '',
        note: (answers.reflect || '').trim(),
        at: Date.now()
      });
    }
  };
}
