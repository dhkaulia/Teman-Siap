/**
 * Teman Siap — Original Mascot ("Tunas") & Spot Illustration Kit
 * 
 * Character: "Tunas", an empathetic little sprout buddy that grows leaves
 * as the user practices. Warm, simple shapes, big readable eyes, gender neutral,
 * culturally neutral, zero resemblance to existing app mascots.
 * 
 * - States: idle, wave, cheer, think, calm, hug, sleepy
 * - Growth stages: tunas -> 2 daun -> 4 daun -> berbunga (tied to total practices, not money/streaks)
 * - 8 Spot illustrations: emosi, uang, kita, tabungan, jeda, napas, percakapan, selesai
 * - Pure inline SVG, < 4KB each, CSS transforms/SMIL animation loops < 3s,
 *   with prefers-reduced-motion static fallback, dark mode ready via CSS vars.
 */

import { esc } from './utils.js';

export const MASCOT_STATES = ['idle', 'wave', 'cheer', 'think', 'calm', 'hug', 'sleepy'];
export const GROWTH_STAGES = ['tunas', '2 daun', '4 daun', 'berbunga'];
export const SPOT_ILLUSTRATIONS = ['emosi', 'uang', 'kita', 'tabungan', 'jeda', 'napas', 'percakapan', 'selesai'];

/**
 * Calculates growth stage based strictly on total meaningful practices.
 * Never based on money balances or streaks.
 * @param {number} totalPractices
 */
export function getMascotStage(totalPractices = 0) {
  const count = Math.max(0, Number(totalPractices) || 0);
  if (count >= 15) {
    return {
      id: 'berbunga',
      name: 'Berbunga',
      count,
      min: 15,
      next: null,
      desc: 'Tunas telah mekar berbunga berkat konsistensi latihanmu!'
    };
  }
  if (count >= 8) {
    return {
      id: '4 daun',
      name: '4 Daun',
      count,
      min: 8,
      next: 15,
      desc: 'Empat daun lebat yang tumbuh dari dedikasi dan kesadaranmu.'
    };
  }
  if (count >= 3) {
    return {
      id: '2 daun',
      name: '2 Daun',
      count,
      min: 3,
      next: 8,
      desc: 'Dua daun pertama yang bertumbuh dari langkah awal belajarmu.'
    };
  }
  return {
    id: 'tunas',
    name: 'Tunas Awal',
    count,
    min: 0,
    next: 3,
    desc: 'Tunas kecil yang siap bertumbuh di setiap sesi latihan.'
  };
}

/**
 * Normalizes stage parameter (accepts numbers, strings with hyphens or spaces)
 */
function normalizeStage(stage, totalPractices) {
  if (typeof totalPractices === 'number') {
    return getMascotStage(totalPractices).id;
  }
  if (typeof stage === 'number') {
    return getMascotStage(stage).id;
  }
  if (!stage) return 'tunas';
  const s = String(stage).toLowerCase().trim().replace(/_/g, ' ');
  if (s.includes('bunga')) return 'berbunga';
  if (s.includes('4')) return '4 daun';
  if (s.includes('2')) return '2 daun';
  return 'tunas';
}

/**
 * Helper to sum total practices across check-ins, expenses, pauses, and couple talks.
 * @param {object} storeOrData
 * @returns {number}
 */
export function getTotalPractices(storeOrData) {
  const d = storeOrData && storeOrData.d ? storeOrData.d : (storeOrData || {});
  let total = 0;
  if (Array.isArray(d.checkins)) total += d.checkins.length;
  if (Array.isArray(d.expenses)) total += d.expenses.length;
  if (Array.isArray(d.pauses)) total += d.pauses.length;
  if (d.coupleConversations && typeof d.coupleConversations === 'object') {
    total += Object.keys(d.coupleConversations).length;
  }
  return total;
}

/**
 * Internal leaf crown SVG generator based on growth stage
 */
function renderHeadStage(stage) {
  switch (stage) {
    case 'berbunga':
      return `
        <g class="tunas-head-leaf">
          <path d="M 60,42 L 60,30" stroke="var(--tunas, #15803D)" stroke-width="3.5" stroke-linecap="round" />
          <!-- 4 Base Leaves -->
          <path d="M 60,34 C 45,38 40,28 46,24 C 53,20 58,29 60,34 Z" fill="var(--tunas, #15803D)" />
          <path d="M 60,34 C 75,38 80,28 74,24 C 67,20 62,29 60,34 Z" fill="var(--tunas, #15803D)" />
          <!-- 5 Petals Blooming around (60, 20) -->
          <circle cx="60" cy="14" r="5" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <circle cx="66" cy="18" r="5" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <circle cx="64" cy="25" r="5" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <circle cx="56" cy="25" r="5" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <circle cx="54" cy="18" r="5" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <!-- Golden Flower Center -->
          <circle cx="60" cy="20" r="5.2" fill="var(--sunny, #F59E0B)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />
          <circle cx="58.5" cy="18.5" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <!-- Pollen accents -->
          <circle cx="73" cy="13" r="1.5" fill="var(--sunny, #F59E0B)" />
          <circle cx="47" cy="13" r="1.5" fill="var(--sunny, #F59E0B)" />
        </g>`;
    case '4 daun':
      return `
        <g class="tunas-head-leaf">
          <path d="M 60,42 L 60,32" stroke="var(--tunas, #15803D)" stroke-width="3.5" stroke-linecap="round" />
          <!-- Lower Left Leaf -->
          <path d="M 60,34 C 44,37 38,28 44,23 C 51,19 57,28 60,34 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.8" stroke-linejoin="round" />
          <!-- Lower Right Leaf -->
          <path d="M 60,34 C 76,37 82,28 76,23 C 69,19 63,28 60,34 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.8" stroke-linejoin="round" />
          <!-- Upper Left Leaf -->
          <path d="M 60,32 C 51,23 50,13 56,11 C 62,9 62,23 60,32 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.8" stroke-linejoin="round" />
          <!-- Upper Right Leaf -->
          <path d="M 60,32 C 69,23 70,13 64,11 C 58,9 58,23 60,32 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.8" stroke-linejoin="round" />
          <circle cx="60" cy="32" r="2.4" fill="var(--tunas-dark, #14532D)" />
        </g>`;
    case '2 daun':
      return `
        <g class="tunas-head-leaf">
          <path d="M 60,42 L 60,33" stroke="var(--tunas, #15803D)" stroke-width="3.5" stroke-linecap="round" />
          <!-- Left Leaf -->
          <path d="M 60,33 C 48,31 42,21 48,16 C 55,14 59,25 60,33 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="2" stroke-linejoin="round" />
          <!-- Right Leaf -->
          <path d="M 60,33 C 72,31 78,21 72,16 C 65,14 61,25 60,33 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="2" stroke-linejoin="round" />
          <circle cx="60" cy="33" r="2.2" fill="var(--tunas-dark, #14532D)" />
        </g>`;
    case 'tunas':
    default:
      return `
        <g class="tunas-head-leaf">
          <path d="M 60,42 L 60,34" stroke="var(--tunas, #15803D)" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 60,34 C 60,25 70,22 72,26 C 74,31 68,36 60,34 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="2" stroke-linejoin="round" />
          <circle cx="58" cy="34" r="2" fill="var(--tunas, #15803D)" />
        </g>`;
  }
}

/**
 * Internal facial expressions and arms generator based on mascot state
 */
function renderExpressionAndArms(state) {
  switch (state) {
    case 'wave':
      return `
        <!-- Cheerful open eyes with sparkles -->
        <circle cx="48" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="72" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="46.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <circle cx="49.5" cy="66.5" r="0.7" fill="#FFFFFF" />
        <circle cx="70.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <circle cx="73.5" cy="66.5" r="0.7" fill="#FFFFFF" />
        <!-- Open cheerful smile -->
        <path d="M 55,75 Q 60,82 65,75 Z" fill="var(--coral, #C84825)" stroke="var(--ink-primary, #12211F)" stroke-width="1.8" />
        <!-- Left arm resting, Right arm waving -->
        <path class="tunas-arm-left" d="M 33,74 C 27,78 27,85 34,86" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path class="tunas-arm-right" d="M 87,70 C 97,63 103,50 97,46 C 92,43 88,58 84,66" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`;

    case 'cheer':
      return `
        <!-- Joyful upward crescent eyes (^ ^) -->
        <path d="M 44,67 Q 48,61 52,67" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="3" stroke-linecap="round" />
        <path d="M 68,67 Q 72,61 76,67" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="3" stroke-linecap="round" />
        <!-- Beaming open mouth with white shine -->
        <path d="M 54,74 Q 60,84 66,74 Z" fill="var(--coral, #C84825)" stroke="var(--ink-primary, #12211F)" stroke-width="2" />
        <path d="M 57,80 Q 60,78 63,80" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
        <!-- Both arms up in victory -->
        <path class="tunas-arm-left" d="M 35,68 C 24,56 19,46 25,43 C 31,41 35,56 36,66" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        <path class="tunas-arm-right" d="M 85,68 C 96,56 101,46 95,43 C 89,41 85,56 84,66" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Celebration sparkles -->
        <path d="M 22,34 L 24,38 L 28,40 L 24,42 L 22,46 L 20,42 L 16,40 L 20,38 Z" fill="var(--sunny, #F59E0B)" />
        <path d="M 98,34 L 100,38 L 104,40 L 100,42 L 98,46 L 96,42 L 92,40 L 96,38 Z" fill="var(--sunny, #F59E0B)" />`;

    case 'think':
      return `
        <!-- Curious inquiring gaze -->
        <circle cx="49" cy="64" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="73" cy="64" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="48" cy="62.5" r="1.6" fill="#FFFFFF" />
        <circle cx="72" cy="62.5" r="1.6" fill="#FFFFFF" />
        <!-- Thoughtful small puckered mouth -->
        <ellipse cx="61" cy="77" rx="2" ry="2.5" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.2" />
        <!-- Left arm resting, Right arm holding chin -->
        <path class="tunas-arm-left" d="M 33,74 C 27,78 27,85 34,86" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path class="tunas-arm-right" d="M 87,76 C 88,84 76,84 71,78 C 70,75 75,74 76,76" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`;

    case 'calm':
      return `
        <!-- Serene downward resting arcs (~ ~) for deep breathing -->
        <path d="M 44,65 Q 48,69 52,65" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.8" stroke-linecap="round" />
        <path d="M 68,65 Q 72,69 76,65" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.8" stroke-linecap="round" />
        <!-- Peaceful gentle smile -->
        <path d="M 56,76 Q 60,79 64,76" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.2" stroke-linecap="round" />
        <!-- Hands folded gently in lap/tummy -->
        <path d="M 33,76 C 44,83 56,82 58,80" fill="none" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path d="M 87,76 C 76,83 64,82 62,80" fill="none" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />`;

    case 'hug':
      return `
        <!-- Compassionate, deeply understanding eyes -->
        <circle cx="48" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="72" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="46.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <circle cx="70.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <!-- Warm empathetic smile -->
        <path d="M 56,75 Q 60,79 64,75" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.2" stroke-linecap="round" />
        <!-- Self-hug arms wrapped across chest -->
        <path d="M 32,74 C 45,78 62,79 66,74 C 67,72 65,69 62,70 C 56,73 42,72 34,70" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 88,74 C 75,80 58,81 54,76 C 53,74 55,71 58,72 C 64,75 78,74 86,70" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Comforting warm heart badge -->
        <path d="M 60,63 C 58,59 53,60 53,64 C 53,68 60,72 60,72 C 60,72 67,68 67,64 C 67,60 62,59 60,63 Z" fill="var(--coral, #C84825)" opacity="0.9" />`;

    case 'sleepy':
      return `
        <!-- Cozy half-closed eyes -->
        <path d="M 44,65 Q 48,68 52,65" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.8" stroke-linecap="round" />
        <path d="M 68,66 Q 72,69 76,66" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.8" stroke-linecap="round" />
        <!-- Cozy smile -->
        <path d="M 57,76 Q 60,79 63,76" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.2" stroke-linecap="round" />
        <!-- Relaxed arms -->
        <path class="tunas-arm-left" d="M 33,74 C 27,78 27,85 34,86" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path d="M 86,76 C 88,82 82,85 76,84" fill="none" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <!-- Floating zZ for returning after a break -->
        <g class="tunas-zzz">
          <text x="78" y="52" font-family="var(--font-display, sans-serif)" font-size="11" font-weight="800" fill="var(--saffron, #D97706)">z</text>
          <text x="86" y="44" font-family="var(--font-display, sans-serif)" font-size="14" font-weight="800" fill="var(--saffron, #D97706)">Z</text>
        </g>`;

    case 'idle':
    default:
      return `
        <!-- Friendly round open eyes with sparkles -->
        <circle cx="48" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="72" cy="65" r="4.6" fill="var(--ink-primary, #12211F)" />
        <circle cx="46.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <circle cx="49.5" cy="66.5" r="0.7" fill="#FFFFFF" />
        <circle cx="70.5" cy="63.5" r="1.6" fill="#FFFFFF" />
        <circle cx="73.5" cy="66.5" r="0.7" fill="#FFFFFF" />
        <!-- Gentle calm smile -->
        <path d="M 56,76 Q 60,80 64,76" fill="none" stroke="var(--ink-primary, #12211F)" stroke-width="2.4" stroke-linecap="round" />
        <!-- Resting little sprout arms -->
        <path class="tunas-arm-left" d="M 33,74 C 27,78 27,85 34,86" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path class="tunas-arm-right" d="M 87,74 C 93,78 93,85 86,86" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />`;
  }
}

const STATE_STYLES = {
  idle: `
    .tunas-idle .tunas-body-group { animation: tunas-bob 2.4s ease-in-out infinite; }
    .tunas-idle .tunas-head-leaf { animation: tunas-sway 2.4s ease-in-out infinite; }
    @keyframes tunas-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes tunas-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  `,
  wave: `
    .tunas-wave .tunas-arm-right { animation: tunas-wave-hand 1.2s ease-in-out infinite; }
    .tunas-wave .tunas-body-group { animation: tunas-tilt 1.2s ease-in-out infinite; }
    @keyframes tunas-wave-hand { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-28deg); } }
    @keyframes tunas-tilt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
  `,
  cheer: `
    .tunas-cheer .tunas-body-group { animation: tunas-jump 1.5s ease-in-out infinite; }
    .tunas-cheer .tunas-head-leaf { animation: tunas-cheer-leaf 1.5s ease-in-out infinite; }
    @keyframes tunas-jump { 0%, 100% { transform: translateY(0) scale(1, 1); } 30% { transform: translateY(-8px) scale(0.96, 1.04); } 50% { transform: translateY(0) scale(1.04, 0.96); } 70% { transform: translateY(-2px); } }
    @keyframes tunas-cheer-leaf { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.12) rotate(4deg); } }
  `,
  think: `
    .tunas-think .tunas-body-group { animation: tunas-ponder 2.2s ease-in-out infinite; }
    @keyframes tunas-ponder { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(3deg); } }
  `,
  calm: `
    .tunas-calm .tunas-body-group { animation: tunas-breathe 2.8s ease-in-out infinite; }
    @keyframes tunas-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  `,
  hug: `
    .tunas-hug .tunas-body-group { animation: tunas-comfort 2.0s ease-in-out infinite; }
    @keyframes tunas-comfort { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.98, 1.02); } }
  `,
  sleepy: `
    .tunas-sleepy .tunas-body-group { animation: tunas-nod 2.6s ease-in-out infinite; }
    .tunas-sleepy .tunas-zzz { animation: tunas-drift 2.6s ease-out infinite; }
    @keyframes tunas-nod { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(3deg); } }
    @keyframes tunas-drift { 0% { opacity: 0; transform: translate(0, 0) scale(0.7); } 50% { opacity: 0.9; } 100% { opacity: 0; transform: translate(8px, -14px) scale(1.1); } }
  `
};

const BASE_STYLE = `
  .tunas-svg { overflow: visible; display: inline-block; vertical-align: middle; }
  .tunas-body-group { transform-origin: 60px 85px; }
  .tunas-head-leaf { transform-origin: 60px 38px; }
  .tunas-arm-left { transform-origin: 34px 74px; }
  .tunas-arm-right { transform-origin: 86px 74px; }
  @media (prefers-reduced-motion: reduce) {
    .tunas-svg *, .tunas-svg { animation: none !important; transition: none !important; }
  }
`;

function cleanSvg(str) {
  return str
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim();
}

/**
 * Main Mascot Renderer: renderMascot(state, size, options)
 * 
 * @param {string} state - 'idle' | 'wave' | 'cheer' | 'think' | 'calm' | 'hug' | 'sleepy'
 * @param {number} size - Desired width & height in px (e.g. 48, 96, 160)
 * @param {object|string|number} options - Optional stage or { stage, totalPractices, label, decorative, className }
 * @returns {string} Clean inline SVG (< 4KB)
 */
export function renderMascot(state = 'idle', size = 160, options = {}) {
  const normState = MASCOT_STATES.includes(state) ? state : 'idle';
  const opt = typeof options === 'object' && options !== null ? options : { stage: options };
  const stage = normalizeStage(opt.stage, opt.totalPractices);
  const pxSize = Number(size) || 160;
  const label = opt.label || '';
  const isDecorative = opt.decorative !== undefined ? Boolean(opt.decorative) : !label;
  const a11yAttr = isDecorative
    ? 'aria-hidden="true"'
    : `role="img" aria-label="${esc(label)}"`;
  const titleTag = label ? `<title>${esc(label)}</title>` : '';
  const extraClass = opt.className ? ` ${esc(opt.className)}` : '';
  const includeStyle = opt.inlineStyle !== false;
  const stateCss = STATE_STYLES[normState] || STATE_STYLES.idle;
  const styleBlock = includeStyle
    ? `<style>${BASE_STYLE}${stateCss}</style>`
    : '';

  return cleanSvg(`
<svg class="tunas-svg tunas-${normState}${extraClass}" viewBox="0 0 120 120" width="${pxSize}" height="${pxSize}" ${a11yAttr}>
  ${titleTag}
  ${styleBlock}

  <!-- Grounding Shadow -->
  <ellipse cx="60" cy="103" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />

  <!-- Animated Body Group -->
  <g class="tunas-body-group">
    <!-- Growth Stage Leaves on Top -->
    ${renderHeadStage(stage)}

    <!-- Main Pear-Drop Seedling Body -->
    <path d="M 60,42 C 40,42 33,56 33,74 C 33,92 44,101 60,101 C 76,101 87,92 87,74 C 87,56 80,42 60,42 Z"
      fill="var(--tunas-light, #DCFCE7)"
      stroke="var(--tunas, #15803D)"
      stroke-width="3.5"
      stroke-linejoin="round" />

    <!-- Soft Tummy Patch -->
    <path d="M 60,66 C 50,66 45,74 45,83 C 45,93 51,98 60,98 C 69,98 75,93 75,83 C 75,74 70,66 60,66 Z"
      fill="rgba(255, 255, 255, 0.45)" />

    <!-- Cheeks (Blushing Peach/Coral) -->
    <ellipse cx="43" cy="74" rx="4.5" ry="3" fill="var(--coral, #C84825)" opacity="0.4" />
    <ellipse cx="77" cy="74" rx="4.5" ry="3" fill="var(--coral, #C84825)" opacity="0.4" />

    <!-- Face Expression & Arms -->
    ${renderExpressionAndArms(normState)}
  </g>
</svg>`);
}

/**
 * 8 Simple Spot Illustrations in the same organic chunky style.
 * Uses CSS variables & currentColor for seamless light/dark mode theming.
 * Strictly < 4KB each.
 * 
 * @param {string} name - emosi | uang | kita | tabungan | jeda | napas | percakapan | selesai
 * @param {number} size - Desired width & height (default 64)
 * @param {object} options - { label, decorative, className }
 */
export function renderSpotIllustration(name, size = 64, options = {}) {
  const pxSize = Number(size) || 64;
  const label = options.label || '';
  const isDecorative = options.decorative !== undefined ? Boolean(options.decorative) : !label;
  const a11yAttr = isDecorative
    ? 'aria-hidden="true"'
    : `role="img" aria-label="${esc(label)}"`;
  const titleTag = label ? `<title>${esc(label)}</title>` : '';
  const extraClass = options.className ? ` ${esc(options.className)}` : '';

  let content = '';
  switch (name) {
    case 'emosi':
      // Heart-shaped botanical leaf with calming concentric attunement ripple
      content = `
        <ellipse cx="32" cy="56" rx="14" ry="3" fill="rgba(0,0,0,0.08)" />
        <circle cx="32" cy="30" r="26" fill="none" stroke="var(--coral-light, #FFEDE7)" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" />
        <path d="M 32,48 C 16,36 12,24 20,16 C 26,10 32,16 32,20 C 32,16 38,10 44,16 C 52,24 48,36 32,48 Z"
          fill="var(--coral, #C84825)"
          stroke="var(--coral-dark, #9A3412)"
          stroke-width="2.5"
          stroke-linejoin="round" />
        <path d="M 32,23 L 32,42" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" />
        <circle cx="41" cy="20" r="1.5" fill="#FFFFFF" opacity="0.8" />`;
      break;

    case 'uang':
      // Grounded gold coin nurturing a fresh sprout
      content = `
        <ellipse cx="32" cy="56" rx="16" ry="3" fill="rgba(0,0,0,0.08)" />
        <!-- Big Round Coin -->
        <circle cx="32" cy="35" r="21" fill="var(--saffron-light, #FEF3C7)" stroke="var(--saffron, #D97706)" stroke-width="2.5" />
        <circle cx="32" cy="35" r="16" fill="none" stroke="var(--saffron-dark, #B45309)" stroke-width="1.5" stroke-dasharray="2 2" />
        <!-- Sprout growing out of coin top -->
        <path d="M 32,32 L 32,15" stroke="var(--tunas, #15803D)" stroke-width="3" stroke-linecap="round" />
        <path d="M 32,18 C 24,18 20,11 25,8 C 30,6 32,14 32,18 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.5" />
        <path d="M 32,18 C 40,18 44,11 39,8 C 34,6 32,14 32,18 Z" fill="var(--tunas, #15803D)" stroke="var(--tunas-dark, #14532D)" stroke-width="1.5" />
        <!-- Coin Slot -->
        <rect x="27" y="32" width="10" height="4" rx="2" fill="var(--saffron-dark, #B45309)" />`;
      break;

    case 'kita':
      // Two intertwined botanical sprout loops leaning together in mutual respect
      content = `
        <ellipse cx="32" cy="56" rx="18" ry="3.5" fill="rgba(0,0,0,0.08)" />
        <!-- Partner A Leaf/Stem (Teal) -->
        <path d="M 22,50 C 14,40 16,22 26,18 C 33,15 35,26 31,35 C 28,42 25,48 22,50 Z"
          fill="var(--teal-light, #E6F2F0)"
          stroke="var(--teal, #1B5E59)"
          stroke-width="2.5"
          stroke-linejoin="round" />
        <!-- Partner B Leaf/Stem (Plum) Intertwined -->
        <path d="M 42,50 C 50,40 48,22 38,18 C 31,15 29,26 33,35 C 36,42 39,48 42,50 Z"
          fill="var(--plum-light, #F3EEF5)"
          stroke="var(--plum, #6B4E71)"
          stroke-width="2.5"
          stroke-linejoin="round" />
        <!-- Center Harmony Seed -->
        <circle cx="32" cy="27" r="4" fill="var(--sunny, #F59E0B)" stroke="var(--sunny-dark, #B45309)" stroke-width="1.5" />`;
      break;

    case 'tabungan':
      // Rounded glass savings jar with coins at bottom and growing seedling
      content = `
        <ellipse cx="32" cy="57" rx="16" ry="3.5" fill="rgba(0,0,0,0.08)" />
        <!-- Glass Jar Body -->
        <rect x="18" y="20" width="28" height="34" rx="10" fill="var(--tunas-light, #DCFCE7)" stroke="var(--tunas, #15803D)" stroke-width="2.5" />
        <!-- Jar Neck & Lid -->
        <path d="M 22,20 L 42,20" stroke="var(--tunas-dark, #14532D)" stroke-width="3" stroke-linecap="round" />
        <rect x="23" y="15" width="18" height="5" rx="2" fill="var(--tunas-dark, #14532D)" />
        <!-- Coins at base -->
        <ellipse cx="28" cy="46" rx="6" ry="2.5" fill="var(--saffron, #D97706)" />
        <ellipse cx="36" cy="47" rx="5" ry="2.5" fill="var(--sunny, #F59E0B)" />
        <!-- Sprouting Seed Inside -->
        <path d="M 32,45 L 32,28" stroke="var(--tunas, #15803D)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 32,32 C 26,30 24,24 29,22 C 33,21 33,28 32,32 Z" fill="var(--tunas, #15803D)" />
        <path d="M 32,30 C 38,28 40,22 35,20 C 31,19 31,26 32,30 Z" fill="var(--tunas, #15803D)" />`;
      break;

    case 'jeda':
      // Hourglass framed by a calm wave, representing urge surfing
      content = `
        <ellipse cx="32" cy="57" rx="18" ry="3" fill="rgba(0,0,0,0.08)" />
        <!-- Calming wave base -->
        <path d="M 8,46 C 18,41 24,52 34,46 C 42,41 48,50 56,47" fill="none" stroke="var(--teal, #1B5E59)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Hourglass Outer Shell -->
        <path d="M 22,14 L 42,14 L 34,28 L 42,42 L 22,42 L 30,28 Z"
          fill="var(--saffron-light, #FEF3C7)"
          stroke="var(--saffron, #D97706)"
          stroke-width="2.5"
          stroke-linejoin="round" />
        <!-- Flowing Sand -->
        <path d="M 27,18 L 37,18 L 32,26 Z" fill="var(--saffron, #D97706)" />
        <ellipse cx="32" cy="38" rx="5" ry="2.5" fill="var(--saffron, #D97706)" />
        <circle cx="32" cy="31" r="1.2" fill="var(--saffron-dark, #B45309)" />`;
      break;

    case 'napas':
      // Swirling breath wind circulating around calm botanical lung leaves
      content = `
        <ellipse cx="32" cy="56" rx="14" ry="3" fill="rgba(0,0,0,0.08)" />
        <!-- Circular Breath Wind Swirl -->
        <path d="M 32,8 A 22,22 0 1,1 12,38" fill="none" stroke="var(--teal, #1B5E59)" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3" />
        <polygon points="12,34 16,39 10,40" fill="var(--teal, #1B5E59)" />
        <!-- Left Lung Leaf -->
        <path d="M 30,44 C 20,40 18,22 28,18 C 30,17 31,30 30,44 Z"
          fill="var(--tunas-light, #DCFCE7)"
          stroke="var(--tunas, #15803D)"
          stroke-width="2" />
        <!-- Right Lung Leaf -->
        <path d="M 34,44 C 44,40 46,22 36,18 C 34,17 33,30 34,44 Z"
          fill="var(--teal-light, #E6F2F0)"
          stroke="var(--teal, #1B5E59)"
          stroke-width="2" />
        <!-- Center Stem -->
        <path d="M 32,48 L 32,15" stroke="var(--ink-secondary, #485D5A)" stroke-width="2" stroke-linecap="round" />`;
      break;

    case 'percakapan':
      // Two friendly conversational speech bubbles with plant leaf touches
      content = `
        <ellipse cx="32" cy="56" rx="16" ry="3.5" fill="rgba(0,0,0,0.08)" />
        <!-- Partner A Bubble (Plum) -->
        <path d="M 12,28 C 12,20 20,15 30,15 C 40,15 48,20 48,28 C 48,34 42,40 33,40 L 22,46 L 24,39 C 16,38 12,34 12,28 Z"
          fill="var(--plum-light, #F3EEF5)"
          stroke="var(--plum, #6B4E71)"
          stroke-width="2.5"
          stroke-linejoin="round" />
        <!-- Sprout icon inside bubble A -->
        <path d="M 28,31 L 28,23" stroke="var(--plum, #6B4E71)" stroke-width="2" stroke-linecap="round" />
        <circle cx="28" cy="22" r="2.5" fill="var(--plum, #6B4E71)" />
        <!-- Partner B Small Bubble (Saffron) -->
        <circle cx="45" cy="20" r="10" fill="var(--saffron-light, #FEF3C7)" stroke="var(--saffron, #D97706)" stroke-width="2" />
        <!-- Tiny heart in bubble B -->
        <path d="M 45,22 C 43,20 41,20 41,22 C 41,24 45,26 45,26 C 45,26 49,24 49,22 C 49,20 47,20 45,22 Z" fill="var(--coral, #C84825)" />`;
      break;

    case 'selesai':
    default:
      // Celebratory checked milestone badge with leafy laurel wreath
      content = `
        <ellipse cx="32" cy="56" rx="16" ry="3" fill="rgba(0,0,0,0.08)" />
        <!-- Sunny Scalloped Seal Badge -->
        <circle cx="32" cy="31" r="19" fill="var(--sunny-light, #FEF3C7)" stroke="var(--sunny, #F59E0B)" stroke-width="2.5" />
        <circle cx="32" cy="31" r="15" fill="var(--sunny, #F59E0B)" />
        <!-- Crisp White Checkmark -->
        <path d="M 24,31 L 30,37 L 40,24" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Laurel Leaf Twigs -->
        <path d="M 12,40 C 10,32 14,22 17,16" fill="none" stroke="var(--tunas, #15803D)" stroke-width="2" stroke-linecap="round" />
        <path d="M 52,40 C 54,32 50,22 47,16" fill="none" stroke="var(--tunas, #15803D)" stroke-width="2" stroke-linecap="round" />`;
      break;
  }

  return cleanSvg(`
<svg class="spot-illustration spot-${esc(name)}${extraClass}" viewBox="0 0 64 64" width="${pxSize}" height="${pxSize}" ${a11yAttr}>
  ${titleTag}
  ${content}
</svg>`);
}
