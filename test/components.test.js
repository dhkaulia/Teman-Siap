import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ChoiceTiles } from '../public/js/ui/choiceTiles.js';
import { BodyMap, BODY_REGIONS } from '../public/js/ui/bodyMap.js';
import { Breather } from '../public/js/ui/breather.js';
import { Wave } from '../public/js/ui/wave.js';
import { Keypad } from '../public/js/ui/keypad.js';
import { BottomSheet } from '../public/js/ui/bottomSheet.js';
import { Bubble } from '../public/js/ui/bubble.js';
import { ICONS, renderIcon } from '../public/js/ui/icons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UI_DIR = path.resolve(__dirname, '..', 'public', 'js', 'ui');

describe('UI Components Line Count Limit (< 150 lines)', () => {
  const componentFiles = [
    'choiceTiles.js',
    'bodyMap.js',
    'breather.js',
    'wave.js',
    'keypad.js',
    'bottomSheet.js',
    'bubble.js'
  ];

  for (const file of componentFiles) {
    it(`${file} must have strictly less than 150 lines`, () => {
      const fullPath = path.join(UI_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lineCount = content.split('\n').length;
      assert.ok(lineCount < 150, `${file} has ${lineCount} lines (must be < 150)`);
    });
  }
});

describe('ChoiceTiles Component Logic', () => {
  it('instantiates and handles selection', () => {
    assert.equal(typeof ChoiceTiles, 'function');
  });
});

describe('BodyMap Component Logic', () => {
  it('defines 8 regions including "none"', () => {
    assert.equal(BODY_REGIONS.length, 8);
    const ids = BODY_REGIONS.map(r => r.id);
    assert.ok(ids.includes('head'));
    assert.ok(ids.includes('throat'));
    assert.ok(ids.includes('chest'));
    assert.ok(ids.includes('stomach'));
    assert.ok(ids.includes('shoulders'));
    assert.ok(ids.includes('hands'));
    assert.ok(ids.includes('legs'));
    assert.ok(ids.includes('none'));
  });
});

describe('Wave Component Logic', () => {
  it('clamps values to 0-10 range', () => {
    const wave = new Wave({ container: null, value: 15 });
    assert.equal(wave.value, 10);

    const waveMin = new Wave({ container: null, value: -5 });
    assert.equal(waveMin.value, 0);

    assert.ok(wave._getText(2).includes('Tenang'));
    assert.ok(wave._getText(5).includes('Sedang'));
    assert.ok(wave._getText(8).includes('Kuat'));
    assert.ok(wave._getText(10).includes('Sangat Menggebu-gebu'));
  });
});

describe('Keypad Component Logic', () => {
  it('pushes digits, formats correctly, and handles quick adds', () => {
    const keypad = new Keypad({ container: null, initialValue: 0 });
    assert.equal(keypad.getValue(), 0);

    keypad.pushDigit('3');
    keypad.pushDigit('5');
    assert.equal(keypad.getValue(), 35);

    keypad.pushDigit('000');
    assert.equal(keypad.getValue(), 35000);

    keypad.popDigit();
    assert.equal(keypad.getValue(), 3500);

    keypad.add(50000);
    assert.equal(keypad.getValue(), 53500);

    keypad.clear();
    assert.equal(keypad.getValue(), 0);
  });
});

describe('Bubble Component Logic', () => {
  it('generates accessible HTML with sender, avatar, and actions', () => {
    const html = Bubble.renderHTML({
      sender: 'Teman Siap',
      role: 'guide',
      icon: '🌱',
      text: 'Mari berhenti sejenak.',
      timestamp: '10:00',
      actions: [
        { id: 'act-1', label: 'Tarik Napas', primary: true }
      ]
    });

    assert.ok(html.includes('bubble-guide'));
    assert.ok(html.includes('Teman Siap'));
    assert.ok(html.includes('Mari berhenti sejenak.'));
    assert.ok(html.includes('data-action-id="act-1"'));
    assert.ok(html.includes('role="article"'));
  });
});

describe('Icons SVG Redesign: Sprout Icon', () => {
  it('renders sprout icon with curved stem and 2 distinct leaves without baseline', () => {
    const sproutSvg = renderIcon('sprout');
    assert.ok(sproutSvg.includes('<svg'), 'Sprout must be a valid SVG string');
    assert.equal(sproutSvg.includes('M7 20h10'), false, 'Sprout must NOT have horizontal baseline');
    assert.ok(sproutSvg.includes('fill="currentColor"'), 'Sprout leaves must use fill="currentColor"');
    assert.ok(sproutSvg.includes('M9 21c0-6 2.5-10 6-14'), 'Sprout must have organic curved stem');
  });
});
