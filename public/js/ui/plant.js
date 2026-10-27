/**
 * Teman Siap — Botanical Stoneware Plant System (Taman Kita)
 * 
 * Rules:
 * - 4 plant stages in the Taman Kita garden:
 *     1. biji (seed): one almond-brown seed resting on the soil
 *     2. tunas (sprout): one stem, two leaves
 *     3. berdaun (leafy): 5 to 6 distinct leaves with varied size & curl
 *     4. berbunga (flowering): 7+ leaves, one plum flower with a lighter inner tone and orange stamens, plus 2 buds
 * - Same cream stoneware pot across stages: speckled surface, visible base ring, dark soil top
 * - Leaves have 3 tones (base, shade, highlight), a center vein, different in size & curl
 * - Light comes from the upper left
 * - Pure inline SVG with CSS variables: --leaf-1..3, --petal-1..2, --pot-1..2, --soil
 * - Zero SVG filters (strictly banned for 60fps mobile performance)
 * - Under 4KB per stage
 * - Soft shadow NOT baked in (rendered with CSS)
 * - Sway animation only when effects are on and reduced motion is off
 * - Names stay as HTML text outside the artwork
 * - API: renderPlant(stage, size, name), stageForPractices(practicesCount)
 */

import { esc } from './utils.js';

export const PLANT_STAGES = [
  { id: 'biji', stage: 1, minPractices: 0, name: 'Biji Tunas', desc: 'Disemai di tanah gembur', icon: '🌱' },
  { id: 'tunas', stage: 2, minPractices: 2, name: 'Tunas Berdaun', desc: 'Dua helai daun hijau segar', icon: '🌿' },
  { id: 'berdaun', stage: 3, minPractices: 5, name: 'Tanaman Rimbun', desc: 'Batang kokoh & daun lebat', icon: '🪴' },
  { id: 'berbunga', stage: 4, minPractices: 9, name: 'Mekar Berbunga', desc: 'Bunga plum mekar harum', icon: '🌸' }
];

export function stageForPractices(practicesCount) {
  const count = Math.max(0, Number(practicesCount) || 0);
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    if (count >= PLANT_STAGES[i].minPractices) {
      return PLANT_STAGES[i];
    }
  }
  return PLANT_STAGES[0];
}

export const getPlantStage = stageForPractices;

export function normalizeStage(stageInput) {
  if (typeof stageInput === 'number') {
    return Math.max(1, Math.min(4, Math.floor(stageInput)));
  }
  if (typeof stageInput === 'string') {
    const s = stageInput.toLowerCase();
    if (s.includes('bunga') || s === '4' || s === 'flowering') return 4;
    if (s.includes('daun') || s.includes('rimbun') || s === '3' || s === 'leafy') return 3;
    if (s.includes('tunas') || s === '2' || s === 'sprout') return 2;
    return 1;
  }
  if (stageInput && typeof stageInput === 'object' && stageInput.stage) {
    return Math.max(1, Math.min(4, Math.floor(stageInput.stage)));
  }
  return 1;
}

// Reusable Pot Defs
const POT_DEFS_BASE = `<defs><linearGradient id="pG" x1=".2" y1=".1" x2=".8" y2=".9"><stop offset="0" stop-color="var(--pot-1)"/><stop offset=".4" stop-color="var(--pot-mid)"/><stop offset=".85" stop-color="var(--pot-2)"/><stop offset="1" stop-color="var(--pot-shade)"/></linearGradient><linearGradient id="sG" x2="1" y2="0"><stop offset="0" stop-color="var(--leaf-1)"/><stop offset="1" stop-color="var(--leaf-3)"/></linearGradient></defs>`;

const POT_DEFS_S1 = `<defs><linearGradient id="pG" x1=".2" y1=".1" x2=".8" y2=".9"><stop offset="0" stop-color="var(--pot-1)"/><stop offset=".4" stop-color="var(--pot-mid)"/><stop offset=".85" stop-color="var(--pot-2)"/><stop offset="1" stop-color="var(--pot-shade)"/></linearGradient><linearGradient id="seedG" x1=".2" y1=".1" x2=".8" y2=".9"><stop offset="0" stop-color="var(--seed-1)"/><stop offset=".5" stop-color="var(--seed-2)"/><stop offset="1" stop-color="var(--seed-3)"/></linearGradient></defs>`;

const POT_DEFS_S4 = `<defs><linearGradient id="pG" x1=".2" y1=".1" x2=".8" y2=".9"><stop offset="0" stop-color="var(--pot-1)"/><stop offset=".4" stop-color="var(--pot-mid)"/><stop offset=".85" stop-color="var(--pot-2)"/><stop offset="1" stop-color="var(--pot-shade)"/></linearGradient><linearGradient id="sG" x2="1" y2="0"><stop offset="0" stop-color="var(--leaf-1)"/><stop offset="1" stop-color="var(--leaf-3)"/></linearGradient><radialGradient id="flG" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="var(--petal-2)"/><stop offset=".65" stop-color="var(--petal-1)"/><stop offset="1" stop-color="var(--petal-shade)"/></radialGradient></defs>`;

// Reusable Cream Stoneware Pot with Visible Base Ring, Subtle Speckles & Dark Loam Soil
const STONEWARE_POT = `<path d="M73,184l2,9q25,5 50,0l2,-9z" fill="var(--pot-2)" stroke="var(--pot-stroke)" stroke-width=".75"/><ellipse cx="100" cy="193" rx="25" ry="3" fill="var(--pot-shade)" opacity=".6"/><path d="M48,132c-3,24 7,46 25,53q27,7 54,0c18,-7 28,-29 25,-53q-52,14 -104,0z" fill="url(#pG)" stroke="var(--pot-stroke)" stroke-width=".75"/><path d="M62,148a.8,.8 0 1,0 .1,0M78,158a.6,.6 0 1,0 .1,0M68,170a.7,.7 0 1,0 .1,0M86,174a.5,.5 0 1,0 .1,0M114,172a.7,.7 0 1,0 .1,0M132,165a.6,.6 0 1,0 .1,0" fill="var(--pot-speckle)" opacity=".25"/><ellipse cx="100" cy="132" rx="52" ry="14" fill="var(--pot-1)" stroke="var(--pot-stroke)" stroke-width=".75"/><ellipse cx="100" cy="132.5" rx="48" ry="12.5" fill="var(--pot-rim)"/><ellipse cx="100" cy="133" rx="46" ry="11.5" fill="var(--soil)"/><path d="M56,133q44,-7 88,0q-44,7 -88,0z" fill="var(--soil-highlight)"/>`;

/**
 * Stage 1: Biji (One almond-brown seed resting on the soil)
 */
function getStage1Svg() {
  return `<svg class="plant-svg plant-stage-1" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Biji Tunas">${POT_DEFS_S1}${STONEWARE_POT}<g class="plant-artwork-living"><ellipse cx="100" cy="132" rx="14" ry="4" fill="#1E120A" opacity=".6"/><g transform="translate(100,127) rotate(-14) translate(-100,-127)"><path d="M87,127c0,-6 8,-8 14,-8c8,0 13,4 13,8c0,5 -6,8 -13,8c-7,0 -14,-2 -14,-8z" fill="url(#seedG)" stroke="#4A260E" stroke-width=".6"/><path d="M88,127q12,-1 25,1" fill="none" stroke="var(--seed-3)" stroke-width="1" stroke-linecap="round"/><path d="M90,125c3,-4 8,-5 14,-5" fill="none" stroke="var(--seed-1)" stroke-width="1.2" stroke-linecap="round" opacity=".8"/></g></g></svg>`;
}

/**
 * Stage 2: Tunas (Sprout with single stem & two leaves with 3 tones + center vein)
 */
function getStage2Svg() {
  return `<svg class="plant-svg plant-stage-2" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tunas Berdaun">${POT_DEFS_BASE}${STONEWARE_POT}<g class="plant-artwork-living plant-sway"><path d="M100,133Q99,110 99,86" fill="none" stroke="url(#sG)" stroke-width="3" stroke-linecap="round"/><g class="plant-leaf leaf-left"><path d="M99,94Q82,90 70,68C76,78 88,88 99,94Z" fill="var(--leaf-3)"/><path d="M99,94Q78,80 70,68C84,66 94,76 99,94Z" fill="var(--leaf-1)"/><path d="M99,94Q80,82 70,68Q86,76 99,94Z" fill="var(--leaf-2)" opacity=".55"/><path d="M99,94Q82,82 70,68" fill="none" stroke="var(--leaf-vein)" stroke-width=".85" stroke-linecap="round"/></g><g class="plant-leaf leaf-right"><path d="M99,88Q116,74 132,60C122,74 112,82 99,88Z" fill="var(--leaf-1)"/><path d="M99,88Q120,86 132,60C128,70 118,84 99,88Z" fill="var(--leaf-3)"/><path d="M99,88Q118,78 132,60Q116,80 99,88Z" fill="var(--leaf-2)" opacity=".5"/><path d="M99,88Q118,74 132,60" fill="none" stroke="var(--leaf-vein)" stroke-width=".85" stroke-linecap="round"/></g></g></svg>`;
}

/**
 * Stage 3: Berdaun (6 distinct leaves of varied size, curl, and 3-tone facets)
 */
function getStage3Svg() {
  return `<svg class="plant-svg plant-stage-3" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tanaman Rimbun">${POT_DEFS_BASE}${STONEWARE_POT}<g class="plant-artwork-living plant-sway"><path d="M100,133Q99,100 100,52" fill="none" stroke="url(#sG)" stroke-width="3.5" stroke-linecap="round"/><g class="plant-leaf"><path d="M99,116Q77,110 54,104C70,102 86,110 99,116Z" fill="var(--leaf-1)"/><path d="M99,116Q78,118 54,104C66,116 84,120 99,116Z" fill="var(--leaf-3)"/><path d="M99,116Q77,110 54,104" fill="none" stroke="var(--leaf-vein)" stroke-width=".8"/></g><g class="plant-leaf"><path d="M100,110Q126,98 146,102C132,98 114,104 100,110Z" fill="var(--leaf-1)"/><path d="M100,110Q124,114 146,102C134,114 116,116 100,110Z" fill="var(--leaf-3)"/><path d="M100,110Q125,104 146,102" fill="none" stroke="var(--leaf-vein)" stroke-width=".8"/></g><g class="plant-leaf"><path d="M99,94Q70,72 48,68C66,66 84,78 99,94Z" fill="var(--leaf-1)"/><path d="M99,94Q74,86 48,68C62,80 82,90 99,94Z" fill="var(--leaf-3)"/><path d="M99,94Q72,76 48,68" fill="none" stroke="var(--leaf-vein)" stroke-width=".8"/></g><g class="plant-leaf"><path d="M100,86Q130,58 150,56C140,54 118,66 100,86Z" fill="var(--leaf-1)"/><path d="M100,86Q126,72 150,56C138,72 120,82 100,86Z" fill="var(--leaf-3)"/><path d="M100,86Q128,64 150,56" fill="none" stroke="var(--leaf-vein)" stroke-width=".8"/></g><g class="plant-leaf"><path d="M100,68Q78,44 74,38C86,38 96,50 100,68Z" fill="var(--leaf-1)"/><path d="M100,68Q84,54 74,38C84,48 94,58 100,68Z" fill="var(--leaf-3)"/><path d="M100,68Q82,46 74,38" fill="none" stroke="var(--leaf-vein)" stroke-width=".7"/></g><g class="plant-leaf"><path d="M100,52Q98,34 108,24C108,34 104,44 100,52Z" fill="var(--leaf-1)"/><path d="M100,52Q106,38 108,24C102,34 100,44 100,52Z" fill="var(--leaf-3)"/><path d="M100,52Q102,34 108,24" fill="none" stroke="var(--leaf-vein)" stroke-width=".7"/></g></g></svg>`;
}

/**
 * Stage 4: Berbunga (7 leaves, 2 buds, one radiant open plum flower with orange stamens)
 */
function getStage4Svg() {
  return `<svg class="plant-svg plant-stage-4" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mekar Berbunga">${POT_DEFS_S4}${STONEWARE_POT}<g class="plant-artwork-living plant-sway"><path d="M100,133Q99,80 100,38" fill="none" stroke="url(#sG)" stroke-width="3.5" stroke-linecap="round"/><g fill="var(--leaf-1)"><path d="M99,118Q72,108 52,106C68,102 86,110 99,118Z"/><path d="M100,114Q128,102 148,104C134,100 114,106 100,114Z"/><path d="M99,96Q68,74 44,72C64,70 84,80 99,96Z"/><path d="M100,90Q132,64 152,62C142,60 118,72 100,90Z"/><path d="M99,78Q74,52 62,50C76,48 88,62 99,78Z"/><path d="M100,72Q124,48 138,46C130,44 114,56 100,72Z"/><path d="M99,56Q84,36 80,32C88,32 94,42 99,56Z"/></g><g fill="var(--leaf-3)"><path d="M99,118Q76,120 52,106C64,118 84,122 99,118Z"/><path d="M100,114Q126,118 148,104C136,116 118,120 100,114Z"/><path d="M99,96Q72,88 44,72C60,82 82,92 99,96Z"/><path d="M100,90Q128,78 152,62C140,76 122,86 100,90Z"/><path d="M99,78Q80,60 62,50C74,60 88,70 99,78Z"/><path d="M100,72Q120,56 138,46C128,58 114,66 100,72Z"/><path d="M99,56Q88,44 80,32C88,40 94,48 99,56Z"/></g><path d="M99,118Q75,112 52,106M100,114Q126,108 148,104M99,96Q70,78 44,72M100,90Q130,68 152,62" fill="none" stroke="var(--leaf-vein)" stroke-width=".8"/><g class="plant-bud"><path d="M98,74Q82,62 70,52" fill="none" stroke="url(#sG)" stroke-width="1.8" stroke-linecap="round"/><path d="M70,52l-4,-4l5,-2z" fill="var(--leaf-3)"/><path d="M67,48c-1,-6 5,-10 6,-2z" fill="var(--petal-1)"/><path d="M101,66Q118,54 130,46" fill="none" stroke="url(#sG)" stroke-width="1.8" stroke-linecap="round"/><path d="M130,46l4,-4l1,2z" fill="var(--leaf-3)"/><path d="M129,41c3,-6 8,-1 4,4z" fill="var(--petal-1)"/></g><g class="plant-flower"><path d="M100,24c-9,-6 -10,-18 0,-18c10,0 9,12 0,18zM100,24c4,-10 18,-16 23,-9c4,7 -9,14 -23,9zM100,24c12,0 22,10 16,16c-7,6 -15,-8 -16,-16zM100,24c-1,8 -9,22 -16,16c-6,-6 4,-16 16,-16zM100,24c-14,5 -27,-2 -23,-9c5,-7 19,-1 23,9z" fill="url(#flG)" stroke="var(--petal-stroke)" stroke-width=".6"/><circle cx="100" cy="24" r="5" fill="var(--petal-core)" opacity=".85"/><circle cx="100" cy="24" r="3.2" fill="var(--petal-shade)"/><path d="M100,24v-7m0,7l5,-5m-5,5h6m-6,0l5,5m-5,-5v7m0,-7l-5,5m5,-5h-6m6,0l-5,-5" fill="none" stroke="var(--stamen)" stroke-width=".85" stroke-linecap="round"/><path d="M100,16a1.2,1.2 0 1,0 .1,0M105,18a1.2,1.2 0 1,0 .1,0M106,23a1.2,1.2 0 1,0 .1,0M105,28a1.2,1.2 0 1,0 .1,0M100,30a1.2,1.2 0 1,0 .1,0M95,28a1.2,1.2 0 1,0 .1,0M94,23a1.2,1.2 0 1,0 .1,0M95,18a1.2,1.2 0 1,0 .1,0" fill="var(--stamen-core)"/><circle cx="100" cy="24" r="1.5" fill="#FFE082"/></g></g></svg>`;
}

export function getPlantSvg(stageInput) {
  const norm = normalizeStage(stageInput);
  if (norm === 1) return getStage1Svg();
  if (norm === 2) return getStage2Svg();
  if (norm === 3) return getStage3Svg();
  return getStage4Svg();
}

/**
 * Main Plant Render API: renderPlant(stage, size, name)
 * 
 * Returns HTML string:
 * - Pure SVG plant graphic (under 4KB per stage, zero filters)
 * - Soft CSS drop shadow underneath (not baked in)
 * - Names and stage labels outside the artwork as clean HTML text
 */
export function renderPlant(stageInput, size = 160, name = '') {
  const normStage = normalizeStage(stageInput);
  const stageInfo = PLANT_STAGES.find(s => s.stage === normStage) || PLANT_STAGES[0];
  const svg = getPlantSvg(normStage);
  const widthPx = typeof size === 'number' ? `${size}px` : size;

  return `
    <div class="botanical-plant-container" style="--plant-size: ${widthPx}; width: 100%; max-width: ${widthPx};" role="figure" aria-label="${esc(name || stageInfo.name)}: ${esc(stageInfo.name)}">
      <div class="plant-artwork-frame">
        ${svg}
        <div class="plant-pot-shadow" aria-hidden="true"></div>
      </div>
      ${name ? `
        <div class="plant-label-block text-center mt-1">
          <div class="plant-partner-name font-bold text-sm text-ink-primary">${esc(name)}</div>
          <div class="plant-stage-title text-xs mute">${esc(stageInfo.name)}</div>
        </div>
      ` : ''}
    </div>
  `;
}
