import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { COPY, getMascotLine, getLoadingLine } from '../public/js/copy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_JS_DIR = path.resolve(__dirname, '..', 'public', 'js');

describe('Central Copy Engine (/js/copy.js)', () => {
  it('provides at least 30 mascot reaction lines grouped by state (cheer, hug, sleepy, calm)', () => {
    assert.ok(COPY.mascot, 'Mascot copy must be defined');
    assert.ok(Array.isArray(COPY.mascot.cheer) && COPY.mascot.cheer.length >= 8);
    assert.ok(Array.isArray(COPY.mascot.hug) && COPY.mascot.hug.length >= 8);
    assert.ok(Array.isArray(COPY.mascot.sleepy) && COPY.mascot.sleepy.length >= 7);
    assert.ok(Array.isArray(COPY.mascot.calm) && COPY.mascot.calm.length >= 7);

    const totalMascotLines =
      COPY.mascot.cheer.length +
      COPY.mascot.hug.length +
      COPY.mascot.sleepy.length +
      COPY.mascot.calm.length;

    assert.ok(totalMascotLines >= 30, `Expected >= 30 mascot lines, found ${totalMascotLines}`);
  });

  it('provides at least 20 gentle loading, transition and breather lines', () => {
    assert.ok(Array.isArray(COPY.loading), 'Loading lines must be an array');
    assert.ok(COPY.loading.length >= 20, `Expected >= 20 loading lines, found ${COPY.loading.length}`);
  });

  it('provides helper functions getMascotLine and getLoadingLine returning valid strings', () => {
    const cheerLine = getMascotLine('cheer');
    const hugLine = getMascotLine('hug');
    const sleepyLine = getMascotLine('sleepy');
    const calmLine = getMascotLine('calm');
    const loadingLine = getLoadingLine();

    assert.ok(cheerLine && typeof cheerLine === 'string' && cheerLine.length > 5);
    assert.ok(hugLine && typeof hugLine === 'string' && hugLine.length > 5);
    assert.ok(sleepyLine && typeof sleepyLine === 'string' && sleepyLine.length > 5);
    assert.ok(calmLine && typeof calmLine === 'string' && calmLine.length > 5);
    assert.ok(loadingLine && typeof loadingLine === 'string' && loadingLine.length > 5);
  });

  it('provides comprehensive error states and empty states for every screen', () => {
    // Errors
    assert.ok(COPY.errors.offline);
    assert.ok(COPY.errors.inputEmptyAmount);
    assert.ok(COPY.errors.inputEmptyText);
    assert.ok(COPY.errors.storageFull);
    assert.ok(COPY.errors.generic);

    // Empty states
    assert.ok(COPY.emptyStates.noExpenses);
    assert.ok(COPY.emptyStates.noCheckins);
    assert.ok(COPY.emptyStates.noPlans);
    assert.ok(COPY.emptyStates.noCoupleConvos);
    assert.ok(COPY.emptyStates.noMilestones);
  });

  it('provides gentle notification text drafts without requesting permission', () => {
    assert.ok(Array.isArray(COPY.notifications));
    assert.ok(COPY.notifications.length >= 5);
    COPY.notifications.forEach(notif => {
      assert.ok(notif.id);
      assert.ok(notif.title);
      assert.ok(notif.body);
    });
  });

  it('contains structured copy for all main screens (Home, Emosi, Uang, Kita, Saya, Onboarding)', () => {
    assert.ok(COPY.home.heroTag);
    assert.ok(COPY.emosi.title);
    assert.ok(COPY.uang.title);
    assert.ok(COPY.kita.title);
    assert.ok(COPY.saya.title);
    assert.ok(COPY.onboarding.step1Title);
    assert.ok(COPY.safety.title);
  });

  it('strictly forbids all banned words across all JavaScript files in public/', () => {
    const strictBannedWords = [
      'buruan',
      'kehilangan',
      'gagal',
      'bodoh',
      'mengorbankan',
      'jangan sampai',
      'harus',
      'wajib'
    ];

    function scanDir(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          scanDir(fullPath);
        } else if (file.name.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          // 1. Strict banned words & phrases (forbidden everywhere)
          for (const phrase of strictBannedWords) {
            const regex = new RegExp(`\\b${phrase}\\b`, 'i');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              assert.equal(
                regex.test(line),
                false,
                `Banned word/phrase "${phrase}" found in ${path.relative(PUBLIC_JS_DIR, fullPath)}:${i + 1} -> ${line.trim()}`
              );
            }
          }

          // 2. "menyesal" is forbidden EXCEPT inside wrong-answer options ({ ... isCorrect: false })
          const menyesalRegex = /\bmenyesal\b/i;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (menyesalRegex.test(line)) {
              // Check if this line or adjacent 2 lines contains isCorrect: false
              const context = [lines[i - 1] || '', line, lines[i + 1] || ''].join(' ');
              const isWrongAnswerOption = /isCorrect:\s*false/i.test(context);
              assert.ok(
                isWrongAnswerOption,
                `Banned word "menyesal" found outside wrong-answer options in ${path.relative(PUBLIC_JS_DIR, fullPath)}:${i + 1} -> ${line.trim()}`
              );
            }
          }
        }
      }
    }

    scanDir(PUBLIC_JS_DIR);
    scanDir(path.resolve(__dirname, '..', 'public'));
  });
});
