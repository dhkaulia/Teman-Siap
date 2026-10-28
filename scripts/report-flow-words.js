import { createCoupleFlow } from '../public/js/flows/coupleFlow.js';
import { createLoveMapsFlow } from '../public/js/flows/loveMapsFlow.js';

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

const mockStore = {
  d: {
    couple: {
      partnerA: { name: 'Dina' },
      partnerB: { name: 'Rian' }
    }
  }
};

const convo = {
  id: 'c-security',
  title: 'Percakapan Keuangan',
  prompt: 'Bagaimana perasaanmu tentang tabungan rumah tangga kita?'
};

const coupleFlow = createCoupleFlow(convo, mockStore);

console.log('====================================================');
console.log('   COUPLE FLOW WORD BUDGET REPORT (Target < 40)     ');
console.log('====================================================');

let allCoupleUnder40 = true;
coupleFlow.steps.forEach((step, idx) => {
  const htmlShared = step.renderCustom({ sharedA: true, sharedB: true });
  const countShared = countWords(htmlShared);
  const htmlPriv = step.renderCustom({ sharedA: false, sharedB: false });
  const countPriv = countWords(htmlPriv);
  const maxCount = Math.max(countShared, countPriv);

  if (maxCount >= 40) allCoupleUnder40 = false;
  console.log(`Step ${idx + 1} [${step.id.padEnd(10)}]: Shared = ${String(countShared).padStart(2)} words | Private = ${String(countPriv).padStart(2)} words | Max = ${String(maxCount).padStart(2)} words ${maxCount < 40 ? '✓ PASS' : '✗ FAIL'}`);
});

console.log('\n====================================================');
console.log('  LOVE MAPS FLOW WORD BUDGET REPORT (Target < 40)   ');
console.log('====================================================');

const loveMapsFlow = createLoveMapsFlow(mockStore);
let allLmUnder40 = true;
loveMapsFlow.steps.forEach((step, idx) => {
  const htmlShared = step.renderCustom({
    loveMapsShared: true,
    'selfA_lm-calm': 'Kopi pagi di teras',
    'selfB_lm-calm': 'Tidur hening sejenak',
    'guessA_lm-calm': 'Rebahan tanpa suara',
    'guessB_lm-calm': 'Secangkir teh hangat'
  });
  const countShared = countWords(htmlShared);
  const htmlPriv = step.renderCustom({ loveMapsShared: false });
  const countPriv = countWords(htmlPriv);
  const maxCount = Math.max(countShared, countPriv);

  if (maxCount >= 40) allLmUnder40 = false;
  console.log(`Step ${idx + 1} [${step.id.padEnd(14)}]: Shared = ${String(countShared).padStart(2)} words | Private = ${String(countPriv).padStart(2)} words | Max = ${String(maxCount).padStart(2)} words ${maxCount < 40 ? '✓ PASS' : '✗ FAIL'}`);
});

console.log('====================================================');
console.log(`Couple Flow All Steps < 40: ${allCoupleUnder40 ? 'YES ✓' : 'NO ✗'}`);
console.log(`Love Maps Flow All Steps < 40: ${allLmUnder40 ? 'YES ✓' : 'NO ✗'}`);
console.log('====================================================');
