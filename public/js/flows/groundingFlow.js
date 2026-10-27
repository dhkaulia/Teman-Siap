/**
 * Grounding Flow — 5-Screen Full-Screen Sensory Grounding (5-4-3-2-1)
 * One sense per screen, one tap to advance, exit anytime saves nothing.
 */
export function createGroundingFlow(onFinish = null) {
  const senses = [
    {
      id: 'look',
      icon: '👀',
      count: '5 Benda',
      title: 'Lihat 5 Hal di Sekitarmu',
      desc: 'Arahkan pandanganmu. Perhatikan warna, bentuk, atau bayangan 5 benda nyata yang ada di sekitarmu sekarang.',
      btnLabel: 'Saya Sudah Melihat 5 Benda →'
    },
    {
      id: 'touch',
      icon: '✋',
      count: '4 Sentuhan',
      title: 'Rasakan 4 Sentuhan Fisik',
      desc: 'Fokus pada sensasi rabaan: telapak kaki menapak lantai, kain baju di pundak, tangan di atas meja, atau jari yang bersentuhan.',
      btnLabel: 'Saya Sudah Merasakan 4 Sentuhan →'
    },
    {
      id: 'hear',
      icon: '👂',
      count: '3 Suara',
      title: 'Dengarkan 3 Suara',
      desc: 'Pasang telinga dengan tenang: suara hembusan kipas/AC, kendaraan di kejauhan, atau suara helaan napasmu sendiri.',
      btnLabel: 'Saya Sudah Mendengar 3 Suara →'
    },
    {
      id: 'smell',
      icon: '👃',
      count: '2 Aroma',
      title: 'Cium 2 Aroma',
      desc: 'Hirup udara perlahan lewat hidung. Perhatikan aroma ruangan, aroma pakaianmu, atau udara segar di sekitarmu.',
      btnLabel: 'Saya Sudah Mencium 2 Aroma →'
    },
    {
      id: 'taste',
      icon: '👅',
      count: '1 Rasa',
      title: 'Perhatikan 1 Rasa di Mulut',
      desc: 'Rasakan sisa rasa di lidahmu atau teguk air minum. Hembuskan satu napas panjang yang melepaskan sisa ketegangan.',
      btnLabel: 'Selesai Latihan Grounding'
    }
  ];

  return {
    id: 'grounding',
    title: 'Teknik Grounding',
    completeLabel: 'Selesai',
    steps: senses.map((s, idx) => ({
      id: s.id,
      type: 'custom',
      hideFooter: true,
      title: s.title,
      subtitle: s.desc,
      renderCustom() {
        return `
          <div class="grounding-step-wrap">
            <div class="grounding-icon" aria-hidden="true">${s.icon}</div>
            <div class="grounding-count">${s.count}</div>
            <p class="grounding-text">${s.desc}</p>
            <button type="button" class="primary w-full grounding-advance-btn" id="groundingStepBtn">
              ${s.btnLabel}
            </button>
          </div>
        `;
      },
      bind(container, answers, runner) {
        const btn = container.querySelector('#groundingStepBtn');
        if (btn) {
          btn.onclick = () => {
            runner.setAnswer(true);
            runner.next();
          };
        }
      }
    })),

    onComplete(answers, store) {
      store.addPause({
        type: 'grounding',
        helped: true,
        at: Date.now()
      });
      if (typeof onFinish === 'function') onFinish();
    }
  };
}
