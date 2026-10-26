/**
 * Teman Siap — Curriculum Path Map Data Definition
 * 
 * Rules:
 * - 4 Units: "Mengenal Diri", "Tenang Soal Uang", "Bicara Berdua", "Merencanakan Masa Depan".
 * - 4 to 6 round nodes per unit on a gently curving S-path.
 * - States: selesai (check), tersedia (pulsing with MULAI bubble), terbuka-bebas (open, no locks), bonus (star).
 * - Zero lockouts: content is never locked behind failing; recommend an order visually instead.
 * - Node types: lesson, practice, checkin, conversation, money-task.
 */

import { CONTENT } from '../../content.js';
import { createCheckinFlow } from './checkinFlow.js';
import { createBreathingFlow } from './breathingFlow.js';
import { createGroundingFlow } from './groundingFlow.js';
import { createExpenseFlow } from './expenseFlow.js';
import { createUrgeFlow } from './urgeFlow.js';
import { createGoalFlow } from './goalFlow.js';
import { createPlanFlow } from './planFlow.js';
import { createCoupleFlow } from './coupleFlow.js';
import { AnswerSheet } from '../ui/answerSheet.js';

export const PATH_UNITS = [
  {
    id: 'unit-self',
    title: 'Mengenal Diri',
    subtitle: 'Percaya diri dan regulasi emosi',
    goal: 'Mengenali emosi dan regulasi tubuh sebelum berbagi hidup berdua.',
    accent: 'teal',
    spot: 'emosi',
    nodes: [
      {
        id: 'node-self-checkin',
        type: 'checkin',
        title: 'Sapa Perasaanmu',
        promise: 'Mengenali emosi dan sensasi tubuhmu dalam 1 menit.',
        duration: '1 menit',
        icon: '🌱',
        flowType: 'checkin',
        technicalBg: 'Berdasarkan Somatic Awareness & Teori Polivagal: Menamai emosi menurunkan reaktivitas amigdala dan mengaktifkan korteks prefrontal untuk ketenangan sadar.'
      },
      {
        id: 'node-self-breath',
        type: 'practice',
        title: 'Napas Tenang 4-4-6',
        promise: 'Menstabilkan ritme jantung saat cemas atau tegang.',
        duration: '1 menit',
        icon: '🫁',
        flowType: 'breathing',
        technicalBg: 'Pernapasan lambat dengan rasio hembusan lebih panjang merangsang tonus vagal parasimpatis, menurunkan kortisol dan detak jantung.'
      },
      {
        id: 'node-self-grounding',
        type: 'practice',
        title: 'Jangkar Panca Indera',
        promise: 'Membawa pikiran kembali hadir utuh di sini.',
        duration: '2 menit',
        icon: '⚓',
        flowType: 'grounding',
        technicalBg: 'Teknik Sensory Grounding 5-4-3-2-1 memutus lingkaran kecemasan kognitif dengan mengalihkan fokus ke input sensori lingkungan nyata.'
      },
      {
        id: 'node-self-lesson',
        type: 'lesson',
        title: 'Mengenal Pola Bertahan',
        promise: 'Memahami respon protektif tubuh saat menghadapi stres.',
        duration: '2 menit',
        icon: '💡',
        flowType: 'lesson-self',
        technicalBg: 'Model Regulasi James Gross: Reaksi otomatis (fight, flight, freeze) adalah respon adaptif sistem saraf, bukan kekurangan kepribadian.'
      },
      {
        id: 'node-self-bonus',
        type: 'bonus',
        isBonus: true,
        title: 'Jeda Syukur & Hening',
        promise: 'Menghargai tubuh yang telah menemanimu bertumbuh.',
        duration: '1 menit',
        icon: '⭐',
        flowType: 'breathing',
        technicalBg: 'Praktik jeda apresiatif meningkatkan neuroplastisitas positif dan daya lentur mental (resilience) menghadapi transisi peran hidup.'
      }
    ]
  },
  {
    id: 'unit-money',
    title: 'Tenang Soal Uang',
    subtitle: 'Percaya diri soal uang & kendali sadar',
    goal: 'Menata pandangan uang tanpa rasa cemas, rasa takut, atau impulsivitas.',
    accent: 'saffron',
    spot: 'uang',
    nodes: [
      {
        id: 'node-money-log',
        type: 'money-task',
        title: 'Satu Catatan Sadar',
        promise: 'Mencatat satu pengeluaran hari ini tanpa rasa bersalah.',
        duration: '30 detik',
        icon: '🪙',
        flowType: 'expense',
        technicalBg: 'Behavioral Economics: Pencatatan mikro harian menetralkan Ostrich Effect tanpa memicu rasa cemas atau penghakiman diri.'
      },
      {
        id: 'node-money-urge',
        type: 'practice',
        title: 'Jeda Belanja (Urge Surfing)',
        promise: 'Melatih menunda dorongan impulsif dengan ombak hening 10 menit.',
        duration: '2 menit',
        icon: '🌊',
        flowType: 'urge',
        technicalBg: 'Alan Marlatt Urge Surfing: Gelombang dorongan dopaminergik memuncak lalu mereda dalam 10–15 menit jika diperhatikan tanpa dilawan.'
      },
      {
        id: 'node-money-lesson',
        type: 'lesson',
        title: 'Asal Usul Script Uang',
        promise: 'Menelusuri pesan uang masa kecil dari keluarga.',
        duration: '2 menit',
        icon: '📖',
        flowType: 'lesson-money',
        technicalBg: 'Brad Klontz Money Script Inventory: Keyakinan finansial bawah sadar terbentuk sejak dini dan mempengaruhi gaya belanja dewasa.'
      },
      {
        id: 'node-money-goal',
        type: 'money-task',
        title: 'Tujuan Pertama Bersama',
        promise: 'Menentukan satu tabungan bersama yang bermakna.',
        duration: '2 menit',
        icon: '🎯',
        flowType: 'goal',
        technicalBg: 'Goal-Setting Theory Locke & Latham: Tujuan tabungan spesifik yang terikat nilai emosional meningkatkan kepatuhan menabung hingga 3x lipat.'
      },
      {
        id: 'node-money-bonus',
        type: 'bonus',
        isBonus: true,
        title: 'Rencana Jika-Maka',
        promise: 'Menyiapkan respon otomatis saat godaan belanja hadir.',
        duration: '2 menit',
        icon: '⭐',
        flowType: 'plan',
        technicalBg: 'Peter Gollwitzer Implementation Intentions: Rencana Jika-Maka mengotomatisasi kontrol diri sebelum dorongan impulsif muncul.'
      }
    ]
  },
  {
    id: 'unit-us',
    title: 'Bicara Berdua',
    subtitle: 'Dialog jujur dan setara satu ponsel',
    goal: 'Membuka dialog jujur yang setara dan aman di satu ponsel.',
    accent: 'plum',
    spot: 'kita',
    nodes: [
      {
        id: 'node-us-security',
        type: 'conversation',
        title: 'Arti Rasa Aman',
        promise: 'Mendiskusikan apa yang membuat kalian berdua tenang.',
        duration: '3 menit',
        icon: '🤝',
        convoId: 'c-security',
        flowType: 'couple',
        technicalBg: 'Metode Gottman: Menyelaraskan makna rasa aman mencegah defensiveness dan penarikan diri dalam percakapan keuangan berdua.'
      },
      {
        id: 'node-us-lifestyle',
        type: 'conversation',
        title: 'Standar Hidup & Gaya',
        promise: 'Menyelaraskan ekspektasi kenyamanan sehari-hari.',
        duration: '3 menit',
        icon: '🏡',
        convoId: 'c-lifestyle',
        flowType: 'couple',
        technicalBg: 'Sue Johnson EFT: Ekspektasi gaya hidup mencerminkan nilai inti dan kebutuhan rasa dihargai yang perlu dinegosiasikan secara terbuka.'
      },
      {
        id: 'node-us-family',
        type: 'conversation',
        title: 'Batas Sehat Keluarga',
        promise: 'Merumuskan batas sehat bersama orang tua dan keluarga besar.',
        duration: '3 menit',
        icon: '🌿',
        convoId: 'c-family',
        flowType: 'couple',
        technicalBg: 'Bowen Family Systems: Diferensiasi diri dan pembentukan batas sehat (healthy boundaries) adalah fondasi kemandirian rumah tangga baru.'
      },
      {
        id: 'node-us-debt',
        type: 'conversation',
        title: 'Komitmen Finansial',
        promise: 'Berbagi komitmen keuangan masa lalu tanpa takut dihakimi.',
        duration: '3 menit',
        icon: '⚖️',
        convoId: 'c-debt',
        flowType: 'couple',
        technicalBg: 'Mutual Transparency: Keterbukaan kewajiban finansial sejak awal menurunkan stres relasional secara signifikan di tahun pertama pernikahan.'
      },
      {
        id: 'node-us-bonus',
        type: 'bonus',
        isBonus: true,
        title: 'Apresiasi Pasangan',
        promise: 'Menyampaikan terima kasih yang tulus atas kesediaan berproses.',
        duration: '2 menit',
        icon: '⭐',
        convoId: 'c-security',
        flowType: 'couple',
        technicalBg: 'Rasio Gottman 5:1: Hubungan stabil memerlukan minimal 5 interaksi apresiatif positif untuk setiap 1 interaksi berat.'
      }
    ]
  },
  {
    id: 'unit-future',
    title: 'Merencanakan Masa Depan',
    subtitle: 'Visi jangka panjang & hari bahagia',
    goal: 'Menyusun tujuan tabungan dan rencana jika-maka bersama.',
    accent: 'sunny',
    spot: 'selesai',
    nodes: [
      {
        id: 'node-fut-vision',
        type: 'lesson',
        title: 'Visi Tiga Tahun Pertama',
        promise: 'Membayangkan rumah tangga yang ingin kalian bangun berdua.',
        duration: '2 menit',
        icon: '🔮',
        flowType: 'lesson-vision',
        technicalBg: 'Shared Meaning System: Membangun ritual, visi bersama, dan tujuan hidup memperkuat ketahanan keluarga dalam jangka panjang.'
      },
      {
        id: 'node-fut-plan',
        type: 'money-task',
        title: 'Rencana Rutinitas Baru',
        promise: 'Menetapkan kebiasaan mikro harian yang disepakati bersama.',
        duration: '2 menit',
        icon: '📋',
        flowType: 'plan',
        technicalBg: 'Atomic Habits: Kebiasaan mikro harian yang dirayakan bersama lebih konsisten daripada resolusi besar yang kaku.'
      },
      {
        id: 'node-fut-ceremony',
        type: 'conversation',
        title: 'Esensi Hari Bahagia',
        promise: 'Membicarakan makna pernikahan di atas ekspektasi pesta.',
        duration: '3 menit',
        icon: '💍',
        convoId: 'c-lifestyle',
        flowType: 'couple',
        technicalBg: 'Prinsip Nilai Universal: Mengutamakan kesiapan kehidupan setelah hari pernikahan dibandingkan beban finansial perayaan semata.'
      },
      {
        id: 'node-fut-review',
        type: 'checkin',
        title: 'Refleksi Kesiapan Batin',
        promise: 'Mengevaluasi kesiapan diri dan relasi dengan tenang.',
        duration: '2 menit',
        icon: '🌱',
        flowType: 'checkin',
        technicalBg: 'Continuous Reflective Attunement: Kesiapan pernikahan adalah proses belajar sadar yang dinamis dan terus dirawat.'
      },
      {
        id: 'node-fut-bonus',
        type: 'bonus',
        isBonus: true,
        title: 'Segel Langkah Nyata',
        promise: 'Merayakan dedikasi latihanmu menyambut masa depan.',
        duration: '1 menit',
        icon: '⭐',
        flowType: 'breathing',
        technicalBg: 'Celebration of Real Process: Mengapresiasi dedikasi belajar memperkuat rasa percaya diri menghadapi transisi kehidupan.'
      }
    ]
  }
];

/**
 * Returns a flat list of all nodes across all units
 * @returns {Array<object>}
 */
export function getAllPathNodes() {
  const all = [];
  PATH_UNITS.forEach(unit => {
    unit.nodes.forEach(node => {
      all.push({ ...node, unitId: unit.id, unitTitle: unit.title, unitAccent: unit.accent });
    });
  });
  return all;
}

/**
 * Looks up a node by ID
 * @param {string} nodeId
 * @returns {object|null}
 */
export function getNodeById(nodeId) {
  const all = getAllPathNodes();
  return all.find(n => n.id === nodeId) || null;
}

/**
 * Determines whether a node is completed based on store data
 * @param {object} node
 * @param {object} d - Store data
 * @returns {boolean}
 */
export function isNodeCompleted(node, d) {
  if (!d) return false;
  const completedNodes = Array.isArray(d.completedPathNodes) ? d.completedPathNodes : [];
  if (completedNodes.includes(node.id)) return true;

  // Domain heuristics mapped to core store collections
  if (node.id === 'node-self-checkin') {
    return Boolean(d.checkins && d.checkins.length > 0);
  }
  if (node.id === 'node-self-breath') {
    return Boolean(d.pauses && d.pauses.length > 0);
  }
  if (node.id === 'node-money-log') {
    return Boolean(d.expenses && d.expenses.length > 0);
  }
  if (node.id === 'node-money-urge') {
    return Boolean(d.pauses && d.pauses.length > 0);
  }
  if (node.id === 'node-money-goal') {
    return Boolean(d.goal || (d.goals && d.goals.length > 0));
  }
  if (node.id === 'node-money-bonus') {
    return Boolean(d.plans && d.plans.length > 0);
  }
  if (node.id === 'node-us-security') {
    return Boolean(
      (d.coupleConversations && d.coupleConversations['c-security']) ||
      (d.partnerA && d.partnerA['c-security'])
    );
  }

  return false;
}

/**
 * Determines the visually suggested next node
 * (The first non-completed node from top to bottom)
 * @param {object} d - Store data
 * @returns {object}
 */
export function getSuggestedNode(d) {
  const all = getAllPathNodes();
  for (const node of all) {
    if (!isNodeCompleted(node, d)) {
      return node;
    }
  }
  return all[0];
}

/**
 * Determines node state for UI rendering
 * @param {object} node
 * @param {object} d
 * @param {string} suggestedNodeId
 * @returns {'selesai'|'tersedia'|'terbuka-bebas'|'bonus'}
 */
export function getNodeState(node, d, suggestedNodeId) {
  if (isNodeCompleted(node, d)) return 'selesai';
  if (node.id === suggestedNodeId) return 'tersedia';
  if (node.isBonus) return 'bonus';
  return 'terbuka-bebas';
}

/**
 * Marks a node as completed in store and persists
 * @param {string} nodeId
 * @param {object} store
 */
export function markNodeCompleted(nodeId, store) {
  if (!store || !store.d) return;
  if (!Array.isArray(store.d.completedPathNodes)) {
    store.d.completedPathNodes = [];
  }
  if (!store.d.completedPathNodes.includes(nodeId)) {
    store.d.completedPathNodes.push(nodeId);
    store.save();
  }
}

/**
 * Declarative Micro-Lesson Flow Creator (used for 'lesson' node types)
 */
function createMicroLessonFlow(node, onDone) {
  return {
    id: `flow-${node.id}`,
    title: node.title,
    steps: [
      {
        id: 'intro',
        type: 'choice',
        title: node.title,
        subtitle: node.promise,
        choices: [
          { value: 'paham', label: 'Saya siap mempelajari pola ini', icon: '🌱' },
          { value: 'penasaran', label: 'Penasaran dengan respon tubuh saya', icon: '💡' }
        ],
        multiple: false
      },
      {
        id: 'insight',
        type: 'reflection',
        title: 'Wawasan Praktis',
        subtitle: node.technicalBg,
        onRender: (container, session) => {
          container.innerHTML = `
            <div class="card p-3 mb-3">
              <span class="card-tag tunas mb-2">Refleksi Singkat</span>
              <h3 class="mt-1 mb-1">${node.title}</h3>
              <p class="text-sm mute mb-2">${node.promise}</p>
              <div class="card card-border-saffron p-2 mb-3" style="background: var(--bg-canvas);">
                <div class="font-bold text-xs mb-1">Landasan Ilmiah:</div>
                <div class="text-xs mute">${node.technicalBg}</div>
              </div>
              <p class="text-xs mb-0">Langkah ini telah tercatat sebagai proses belajarmu.</p>
            </div>
          `;
        }
      }
    ],
    onComplete: (answers) => {
      if (typeof onDone === 'function') onDone();
    }
  };
}

/**
 * Instantiates the appropriate flow for a path node
 * Reuses the existing session runner flows
 * @param {object} node
 * @param {Function} onDone
 * @returns {object} Flow object
 */
export function createFlowForNode(node, onDone) {
  switch (node.flowType) {
    case 'checkin':
      return createCheckinFlow(onDone);
    case 'breathing':
      return createBreathingFlow(onDone);
    case 'grounding':
      return createGroundingFlow(onDone);
    case 'expense':
      return createExpenseFlow(onDone);
    case 'urge':
      return createUrgeFlow(onDone);
    case 'goal':
      return createGoalFlow(onDone);
    case 'plan':
      return createPlanFlow(onDone);
    case 'couple':
      return createCoupleFlow(node.convoId || 'c-security', onDone);
    default:
      return createMicroLessonFlow(node, onDone);
  }
}
