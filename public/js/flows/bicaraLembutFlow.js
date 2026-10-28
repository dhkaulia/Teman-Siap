/**
 * Teman Siap — Latihan Bicara Lembut (Gottman Antidotes Game)
 * 
 * Short 4-round game converting "Pola Komunikasi Sehat" from a reading list into
 * an interactive swipeable/tap exercise:
 * 1. Harsh sentence is displayed.
 * 2. User chooses the gentler rewrite among choices.
 * 3. A one-line explanation appears after answering.
 * 4. The 4 patterns become 4 rounds.
 * 5. Persistent "Ini terasa tidak nyaman" exit on every step.
 * 6. Deeper Gottman background kept in a "Pelajari" sheet.
 */

import { renderMascot } from '../ui/mascot.js';
import { awardSeeds } from '../rewards.js';
import { esc } from '../ui/utils.js';
import { playTapSound, triggerHapticTap } from '../ui/feedback.js';
import { triggerCelebration } from '../ui/confetti.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { renderIcon } from '../ui/icons.js';

export const BICARA_ROUNDS = [
  {
    id: 'round-1',
    pattern: 'Kritik Menyerang',
    gottmanTag: 'Pola 1 dari 4',
    harsh: 'Kamu selalu boros dan nggak pernah mikirin masa depan kita!',
    options: [
      {
        text: 'Aku merasa cemas saat belanja kita melebihi rencana. Bisakah kita cek anggaran bersama malam ini?',
        isGentle: true,
        feedback: 'Tepat! Awali dari rasa sendiri ("Aku merasa..."), bukan menunjuk kesalahan pasangan.'
      },
      {
        text: 'Terserah kamu deh, pokoknya jangan salahin aku kalau uang tabungan habis.',
        isGentle: false,
        feedback: 'Kalimat ini menyindir dan menutup pintu diskusi. Coba ungkapkan rasa cemasmu secara jujur.'
      },
      {
        text: 'Kenapa sih kamu selalu begitu? Kan kemarin sudah dibilangin baik-baik.',
        isGentle: false,
        feedback: 'Kata "selalu" memicu sikap defensif. Ganti dengan fokus ke situasi spesifik saat ini.'
      }
    ],
    principle: 'Awalan Lembut (Softened Startup): Mengurangi 96% potensi eskalasi konflik.'
  },
  {
    id: 'round-2',
    pattern: 'Sarkasme & Meremehkan',
    gottmanTag: 'Pola 2 dari 4',
    harsh: 'Hebat banget ya, baru gajian langsung ludes. Juara emang kamu!',
    options: [
      {
        text: 'Aku lagi butuh rasa aman soal tabungan kita bulan ini. Yuk duduk berdua bikin alokasinya.',
        isGentle: true,
        feedback: 'Bagus sekali! Sampaikan kebutuhan nyata secara lugas tanpa menyindir atau mencemooh.'
      },
      {
        text: 'Ya selamat ya, silakan dihabisin semuanya sampai puas.',
        isGentle: false,
        feedback: 'Sarkasme mengikis rasa hormat. Pasangan lebih mudah mendengar jika kamu langsung menyatakan kebutuhanmu.'
      },
      {
        text: 'Pantas aja dari dulu kita nggak pernah bisa punya tabungan darurat.',
        isGentle: false,
        feedback: 'Mengungkit masa lalu memperkeruh suasana. Fokuslah pada solusi hari ini.'
      }
    ],
    principle: 'Membangun Budaya Apresiasi: Menolak nada sinis untuk menjaga harga diri pasangan.'
  },
  {
    id: 'round-3',
    pattern: 'Langsung Membela Diri',
    gottmanTag: 'Pola 3 dari 4',
    harsh: 'Bukan salahku dong! Kamu sendiri yang bikin pengeluaran bengkak kemarin!',
    options: [
      {
        text: 'Maaf, aku memang kelupaan mencatat tadi siang. Mari kita perbaiki sama-sama.',
        isGentle: true,
        feedback: 'Luar biasa! Mengakui sebagian kecil tanggung jawab mencairkan ketegangan seketika.'
      },
      {
        text: 'Kok malah nyalahin aku? Kamu kan yang kemarin jajan di luar tanpa bilang-bilang!',
        isGentle: false,
        feedback: 'Menyerang balik membuat obrolan jadi ajang saling tuduh. Akui bagianmu terlebih dahulu.'
      },
      {
        text: 'Mulai deh nuduh-nuduh. Malas aku ngomong kalau ujungnya debat begini.',
        isGentle: false,
        feedback: 'Menghindar saat dikritik menyisakan ganjalan. Sambut dengan kepala dingin.'
      }
    ],
    principle: 'Terima Tanggung Jawab: Pasangan yang bersedia meminta maaf memulihkan relasi lebih cepat.'
  },
  {
    id: 'round-4',
    pattern: 'Mogok Bicara (Stonewalling)',
    gottmanTag: 'Pola 4 dari 4',
    harsh: '(Mendadak bungkam seribu bahasa, buang muka, dan mengabaikan panggilan pasangan)',
    options: [
      {
        text: 'Aku sedang merasa kewalahan sekarang. Boleh kita rehat 20 menit agar aku bisa menenangkan diri dulu?',
        isGentle: true,
        feedback: 'Sempurna! Minta jeda fisiologis secara terbuka agar detak jantung kembali tenang.'
      },
      {
        text: '(Pergi membanting pintu kamar lalu mematikan sambungan ponsel seharian)',
        isGentle: false,
        feedback: 'Mendiamkan pasangan memicu kepanikan dan rasa ditinggalkan. Selalu komunikasikan jedamu.'
      },
      {
        text: 'Nggak usah ajak aku ngomong dulu, bikin pusing aja denger suara kamu!',
        isGentle: false,
        feedback: 'Nada ketus menyakiti perasaan. Cukup minta waktu rehat 20 menit dengan sopan.'
      }
    ],
    principle: 'Self-Soothing Fisiologis: Butuh minimal 20 menit agar hormon stres mereda sebelum lanjut bicara.'
  }
];

export function createBicaraLembutFlow(store, onComplete = null, onSafetyExit = null) {
  function renderSafetyTrigger() {
    return `
      <div class="safety-exit-row mt-4">
        <button type="button" class="safety-trigger-link" data-safety-exit="true" aria-label="Hentikan latihan jika terasa tidak nyaman">
          ${renderIcon('shield')} Ini terasa tidak nyaman
        </button>
      </div>
    `;
  }

  function bindSafetyTrigger(container, runner) {
    const link = container.querySelector('[data-safety-exit="true"]');
    if (link) {
      link.onclick = () => {
        runner.forceExit();
        if (typeof onSafetyExit === 'function') {
          onSafetyExit();
        }
      };
    }
  }

  const steps = [];

  // 4 Game Rounds
  BICARA_ROUNDS.forEach((round, roundIdx) => {
    steps.push({
      id: round.id,
      title: `Bicara Lembut: ${round.pattern}`,
      canGoBack: roundIdx > 0,
      renderCustom: (answers) => {
        return `
          <div class="card p-3 mb-3">
            <div class="card-title-row mb-2">
              <span class="card-tag saffron">${round.gottmanTag}</span>
              <span class="text-xs mute font-medium">${round.pattern}</span>
            </div>

            <!-- Harsh Sentence Card -->
            <div class="harsh-quote-card mb-3">
              <div class="harsh-quote-label">Kalimat Pemicu:</div>
              <div class="harsh-quote-text">"${esc(round.harsh)}"</div>
            </div>

            <div class="text-xs font-bold text-ink-primary mb-2">
              Pilih kalimat yang lebih lembut:
            </div>

            <!-- Choice Options -->
            <div class="bicara-options-list flex flex-col gap-2" id="optionsGroup">
              ${round.options.map((opt, optIdx) => `
                <button type="button"
                        class="bicara-option-btn"
                        data-opt-idx="${optIdx}"
                        data-is-gentle="${opt.isGentle}">
                  <span class="option-check-circle" aria-hidden="true"></span>
                  <span class="option-text text-sm">${esc(opt.text)}</span>
                </button>
              `).join('')}
            </div>

            <!-- Feedback & One-Line Explanation (hidden until tapped) -->
            <div class="bicara-feedback-box mt-3" id="feedbackBox" hidden>
              <div class="font-bold text-xs mb-1" id="feedbackStatus"></div>
              <div class="text-xs text-ink-secondary mb-3" id="feedbackText"></div>
              <button type="button" class="primary w-full btn-action-sm" id="nextStepBtn" hidden>
                ${roundIdx < 3 ? 'Lanjut ke Ronde Berikutnya →' : 'Lihat Hasil Latihan →'}
              </button>
            </div>

            ${renderSafetyTrigger()}
          </div>
        `;
      },
      bindCustom: (container, runner, answers, setAnswer) => {
        bindSafetyTrigger(container, runner);

        const optionsGroup = container.querySelector('#optionsGroup');
        const feedbackBox = container.querySelector('#feedbackBox');
        const feedbackStatus = container.querySelector('#feedbackStatus');
        const feedbackText = container.querySelector('#feedbackText');
        const nextStepBtn = container.querySelector('#nextStepBtn');

        const buttons = container.querySelectorAll('.bicara-option-btn');
        buttons.forEach(btn => {
          btn.onclick = () => {
            playTapSound();
            triggerHapticTap();

            const isGentle = btn.dataset.isGentle === 'true';
            const optIdx = Number(btn.dataset.optIdx);
            const opt = round.options[optIdx];

            buttons.forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
            feedbackBox.hidden = false;

            if (isGentle) {
              btn.classList.add('correct');
              feedbackStatus.textContent = '✓ Respon Lebih Lembut';
              feedbackStatus.className = 'font-bold text-xs text-teal mb-1';
              feedbackText.textContent = opt.feedback;
              nextStepBtn.hidden = false;
              nextStepBtn.focus();
              setAnswer(`round_${roundIdx + 1}`, true);
            } else {
              btn.classList.add('incorrect');
              feedbackStatus.textContent = 'Masih Bernada Keras';
              feedbackStatus.className = 'font-bold text-xs text-saffron mb-1';
              feedbackText.textContent = opt.feedback;
              nextStepBtn.hidden = true;
            }
          };
        });

        if (nextStepBtn) {
          nextStepBtn.onclick = () => {
            playTapSound();
            triggerHapticTap();
            runner.next();
          };
        }
      }
    });
  });

  // Complete Step
  steps.push({
    id: 'complete',
    title: 'Latihan Selesai',
    canGoBack: false,
    renderCustom: () => {
      return `
        <div class="card p-3 text-center mb-3">
          <div class="mb-2" aria-hidden="true">
            ${renderMascot('cheer', 72, { label: 'Tunas Gembira' })}
          </div>
          <span class="card-tag tunas mb-1">4 Ronde Selesai</span>
          <h2 class="text-base font-bold mt-1 mb-2">Refleks Bicara Lembut Terasah!</h2>
          <p class="text-xs mute mb-3">
            Komunikasi sehat bukan tanpa perbedaan, tapi tahu cara berlabuh dengan awalan lembut.
          </p>

          <div class="flex flex-col gap-2 mt-2">
            <button type="button" class="secondary w-full btn-action-sm" id="learnGottmanResearchSheetBtn">
              Pelajari Riset Gottman Sound House
            </button>
            <button type="button" class="primary w-full btn-action-sm" id="finishGameBtn">
              Kembali ke Halaman Kita
            </button>
          </div>

          ${renderSafetyTrigger()}
        </div>
      `;
    },
    bindCustom: (container, runner) => {
      bindSafetyTrigger(container, runner);
      triggerCelebration({ sessionId: 'bicara-lembut' });
      awardSeeds(store, 2);

      const learnBtn = container.querySelector('#learnGottmanResearchSheetBtn');
      if (learnBtn) {
        learnBtn.onclick = () => {
          playTapSound();
          triggerHapticTap();
          const sheet = new BottomSheet();
          const content = document.createElement('div');
          content.innerHTML = `
            <div class="p-1">
              <span class="card-tag saffron mb-2">Riset 40 Tahun Gottman</span>
              <h3 class="mt-1 mb-2">Awalan Lembut (Softened Startup)</h3>
              <p class="text-sm font-medium mb-3">
                Riset Dr. John Gottman menunjukkan bahwa bagaimana sebuah percakapan dimulai menentukan 96% hasil akhirnya dalam 3 menit pertama.
              </p>
              <div class="neutral-guidance-box text-xs mb-3">
                Pasangan bahagia merawat rasio 5 interaksi positif untuk setiap 1 interaksi negatif saat terjadi perbedaan pendapat.
              </div>
              <button type="button" class="primary w-full btn-action-sm mt-2" id="closeResearchSheetBtn">
                Mengerti
              </button>
            </div>
          `;
          content.querySelector('#closeResearchSheetBtn').onclick = () => sheet.close();
          sheet.open({ title: 'Riset Komunikasi Gottman', content });
        };
      }

      const finishBtn = container.querySelector('#finishGameBtn');
      if (finishBtn) {
        finishBtn.onclick = () => {
          playTapSound();
          triggerHapticTap();
          runner.complete();
          if (typeof onComplete === 'function') {
            onComplete();
          }
        };
      }
    }
  });

  return {
    id: 'flow-bicara-lembut',
    title: 'Bicara Lembut',
    steps
  };
}
