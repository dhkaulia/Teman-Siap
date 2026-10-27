/**
 * Checkin Flow — 4-Step Accessible Emotional Check-in
 * 1. feel: ChoiceTiles (8 emotions), screen tint + 400ms auto-advance
 * 2. body: BodyMap somatic locator (optional)
 * 3. need: ChoiceTiles (3-4 core needs + "Belum tahu", optional)
 * 4. reflect: Reflection Bubble, exactly ONE next step, BottomSheet private note, "Selesai"
 * 
 * Rules: Zero clinical jargon, zero shame, nothing saved if exited mid-flow.
 */
import { CONTENT } from '../../content.js';
import { ChoiceTiles } from '../ui/choiceTiles.js';
import { BodyMap } from '../ui/bodyMap.js';
import { Bubble } from '../ui/bubble.js';
import { BottomSheet } from '../ui/bottomSheet.js';
import { esc } from '../ui/utils.js';

const EMOTION_TINTS = {
  'Tenang & Lega': 'rgba(27, 94, 89, 0.08)',
  'Cemas / Gelisah': 'rgba(217, 119, 6, 0.08)',
  'Lelah / Burnout': 'rgba(98, 118, 115, 0.08)',
  'Senang': 'rgba(245, 158, 11, 0.08)',
  'Bersyukur': 'rgba(42, 138, 130, 0.08)',
  'Sedih / Rentan': 'rgba(59, 130, 246, 0.08)',
  'Kesal / Frustrasi': 'rgba(225, 29, 72, 0.08)',
  'Kewalahan': 'rgba(94, 53, 115, 0.08)'
};

function composeReflection(feel, body = [], need = '') {
  let somaticNote = '';
  const bodyArr = Array.isArray(body) ? body : [];
  if (bodyArr.includes('chest')) somaticNote = 'Dada terasa sesak atau berdebar';
  else if (bodyArr.includes('throat')) somaticNote = 'Tenggorokan terasa tercekat';
  else if (bodyArr.includes('stomach')) somaticNote = 'Perut terasa tegang atau bergejolak';
  else if (bodyArr.includes('head')) somaticNote = 'Kepala terasa penuh atau berat';
  else if (bodyArr.includes('shoulders')) somaticNote = 'Pundak terasa kaku tegang';
  else if (bodyArr.includes('hands')) somaticNote = 'Tangan terasa dingin atau gemetar';

  let text = '';
  if (somaticNote && feel) {
    text = `${somaticNote} saat ${feel.toLowerCase()}. Itu sinyal tubuh yang wajar dan respon alami sistem sarafmu.`;
  } else if (feel) {
    text = `Merasa ${feel.toLowerCase()} adalah bagian alami dari dinamika harimu. Kamu tidak perlu terburu-buru menolaknya.`;
  } else {
    text = 'Setiap sensasi emosi dan sinyal tubuh adalah pengalaman sementara yang wajar hadir.';
  }

  if (need && need !== 'Belum tahu') {
    text += ` Kebutuhanmu untuk ${need.toLowerCase()} sangat berharga untuk didengarkan.`;
  }
  return text;
}

export function createCheckinFlow(faithPerspective = false, onTriggerExercise = null) {
  const emotionItems = CONTENT.emotions.slice(0, 8).map(e => ({
    value: e.label,
    label: e.label,
    icon: e.icon,
    hint: faithPerspective && e.faithHint ? e.faithHint : e.hint
  }));

  const needItems = [
    { value: 'Istirahat sejenak', label: 'Istirahat sejenak', icon: '☕', hint: 'Rehat tanpa rasa bersalah' },
    { value: 'Didengarkan', label: 'Didengarkan', icon: '👂', hint: 'Tanpa langsung dinasihati' },
    { value: 'Waktu hening sendiri', label: 'Waktu hening sendiri', icon: '🌙', hint: 'Ruang tenang menata pikiran' },
    { value: 'Belum tahu', label: 'Belum tahu', icon: '🧭', hint: 'Hanya butuh jeda hening sejenak' }
  ];

  return {
    id: 'checkin',
    title: 'Cek Emosi',
    completeLabel: 'Selesai',
    steps: [
      // Step 1: feel (ChoiceTiles, tint screen, advance after 400ms)
      {
        id: 'feel',
        type: 'custom',
        hideFooter: true,
        title: 'Apa yang paling terasa sekarang?',
        subtitle: 'Sentuh satu yang paling mendekati kondisimu:',
        renderCustom(answers) {
          return `<div id="checkinFeelTiles" class="choice-tiles-2col"></div>`;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#checkinFeelTiles');
          if (!mountEl) return;

          new ChoiceTiles({
            container: mountEl,
            items: emotionItems,
            selected: answers.feel || null,
            multiple: false,
            onChange: (selectedVal) => {
              runner.setAnswer(selectedVal);
              const tint = EMOTION_TINTS[selectedVal] || 'rgba(27, 94, 89, 0.08)';
              runner.setOverlayTint(tint);
              setTimeout(() => {
                runner.next();
              }, 400);
            }
          });
        }
      },

      // Step 2: body (BodyMap, optional)
      {
        id: 'body',
        type: 'custom',
        optional: true,
        title: 'Di mana kamu merasakannya?',
        subtitle: 'Sentuh bagian tubuh tempat ketegangan terasa (boleh lewati):',
        renderCustom(answers) {
          return `<div id="checkinBodyMapMount"></div>`;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#checkinBodyMapMount');
          if (!mountEl) return;

          new BodyMap({
            container: mountEl,
            selected: answers.body || [],
            onChange: (selectedArr) => {
              runner.setAnswer(selectedArr);
            }
          });
        }
      },

      // Step 3: need (3-4 ChoiceTiles + "Belum tahu", optional)
      {
        id: 'need',
        type: 'custom',
        optional: true,
        title: 'Apa yang paling kamu butuhkan?',
        subtitle: 'Pilih yang paling mewakili kebutuhan batinmu saat ini:',
        renderCustom(answers) {
          return `<div id="checkinNeedTiles"></div>`;
        },
        bind(container, answers, runner) {
          const mountEl = container.querySelector('#checkinNeedTiles');
          if (!mountEl) return;

          new ChoiceTiles({
            container: mountEl,
            items: needItems,
            selected: answers.need || null,
            multiple: false,
            onChange: (selectedVal) => {
              runner.setAnswer(selectedVal);
              setTimeout(() => {
                runner.next();
              }, 400);
            }
          });
        }
      },

      // Step 4: reflect (Bubble reflection, exactly ONE next step, BottomSheet note, "Selesai")
      {
        id: 'reflect',
        type: 'custom',
        title: 'Refleksi Diri',
        subtitle: 'Melihat apa yang hadir dengan kelembutan dan penerimaan:',
        renderCustom(answers) {
          const reflectionText = composeReflection(answers.feel, answers.body, answers.need);
          const isAgitated = answers.feel === 'Kesal / Frustrasi';
          const nextStepTitle = isAgitated ? 'Teknik Grounding (5-4-3-2-1)' : 'Latihan Napas Tenang (4-4-6)';
          const nextStepIcon = isAgitated ? '👁️' : '🌬️';
          const nextStepDesc = isAgitated 
            ? '5 langkah indra untuk mengembalikan fokus ke saat ini.' 
            : '5 siklus napas rileks untuk meredakan ketegangan fisik.';
          const nextStepActionId = isAgitated ? 'launch-grounding' : 'launch-breathing';

          return `
            <div id="checkinReflectBubble" class="mb-3">
              ${Bubble.renderHTML({
                sender: 'Teman Siap',
                role: 'guide',
                icon: '🌱',
                text: reflectionText
              })}
            </div>

            <!-- Exactly ONE next step -->
            <div class="card card-border-saffron mb-3">
              <div class="card-title-row mb-1">
                <span class="font-bold text-sm text-ink-primary">Langkah Lanjutan yang Dianjurkan</span>
                <span class="card-tag saffron">1 Menit</span>
              </div>
              <p class="mute text-xs mb-2">${esc(nextStepDesc)}</p>
              <button type="button" class="saffron-btn w-full" id="reflectNextStepBtn" data-action="${nextStepActionId}">
                ${nextStepIcon} Mulai ${esc(nextStepTitle)} →
              </button>
            </div>

            <!-- Private note link -->
            <div class="text-center mb-2">
              <button type="button" class="secondary w-full btn-action-sm" id="openNoteSheetBtn">
                📝 ${answers.note ? 'Edit Catatan Pribadi' : 'Tulis Catatan Pribadi (Opsional)'}
              </button>
              ${answers.note ? `<div class="mute text-xs mt-1">✓ Catatan tersimpan secara lokal</div>` : ''}
            </div>
          `;
        },
        bind(container, answers, runner) {
          const nextStepBtn = container.querySelector('#reflectNextStepBtn');
          if (nextStepBtn) {
            nextStepBtn.onclick = () => {
              const actionId = nextStepBtn.dataset.action;
              // Finish checkin first to save data
              runner.next();
              if (typeof onTriggerExercise === 'function') {
                onTriggerExercise(actionId);
              }
            };
          }

          const noteBtn = container.querySelector('#openNoteSheetBtn');
          if (noteBtn) {
            const bottomSheet = new BottomSheet();
            noteBtn.onclick = () => {
              bottomSheet.open({
                title: 'Catatan Pribadi',
                content: `
                  <p class="mute text-sm mb-3">Tuliskan apa yang ada di pikiranmu secara jujur. Catatan ini 100% tersimpan secara rahasia di browsermu.</p>
                  <label for="privateNoteTextarea" class="text-sm font-bold">Isi Refleksi:</label>
                  <textarea id="privateNoteTextarea" placeholder="Tuliskan refleksimu di sini..." rows="4">${esc(answers.note || '')}</textarea>
                  <button type="button" class="primary w-full mt-2" id="saveNoteSheetBtn">Simpan Catatan Rahasia</button>
                `,
                onClose: () => {
                  const txt = document.getElementById('privateNoteTextarea');
                  if (txt) {
                    answers.note = txt.value.trim();
                    runner.setAnswer(answers.note);
                  }
                }
              });

              setTimeout(() => {
                const saveBtn = document.getElementById('saveNoteSheetBtn');
                if (saveBtn) {
                  saveBtn.onclick = () => {
                    const txt = document.getElementById('privateNoteTextarea');
                    answers.note = txt ? txt.value.trim() : '';
                    runner.setAnswer(answers.note);
                    bottomSheet.close();
                    if (noteBtn) noteBtn.textContent = '📝 Edit Catatan Pribadi';
                  };
                }
              }, 50);
            };
          }
        }
      }
    ],

    onComplete(answers, store) {
      if (!answers.feel) return;
      store.addCheckin({
        emotion: answers.feel,
        sensations: Array.isArray(answers.body) ? answers.body : [],
        need: answers.need || '',
        note: (answers.note || '').trim(),
        at: Date.now()
      });
    }
  };
}
