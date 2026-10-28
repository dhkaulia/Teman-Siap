import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';
const SECRET_STRING = 'RAHASIA-A-12345';

describe('Playwright E2E Privacy Verification: In-Memory Isolation & Zero Leakage', () => {
  let browser;
  let context;

  before(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 360, height: 740 }
    });
  });

  after(async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  });

  it('proves Partner A private answer never leaks to document.body, localStorage, or sessionStorage during Partner B turn and on reveal screen', async () => {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/?onboarded=1&tab=us`, { waitUntil: 'networkidle' });

    // Helper function to inspect all storage & DOM for the secret string
    async function assertSecretAbsent(phaseName) {
      const leakage = await page.evaluate((secret) => {
        const inInnerText = document.body.innerText.includes(secret);
        const inInnerHTML = document.body.innerHTML.includes(secret);

        // Check all localStorage keys and values
        let inLocalStorage = false;
        let matchedKey = null;
        let matchedVal = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const val = localStorage.getItem(key);
          if (key.includes(secret) || (val && val.includes(secret))) {
            inLocalStorage = true;
            matchedKey = key;
            matchedVal = val;
            break;
          }
        }

        // Check all sessionStorage keys and values
        let inSessionStorage = false;
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const val = sessionStorage.getItem(key);
          if (key.includes(secret) || (val && val.includes(secret))) {
            inSessionStorage = true;
            break;
          }
        }

        return {
          inInnerText,
          inInnerHTML,
          inLocalStorage,
          inSessionStorage
        };
      }, SECRET_STRING);

      assert.equal(
        leakage.inInnerText,
        false,
        `[${phaseName}] Secret "${SECRET_STRING}" leaked into document.body.innerText`
      );
      assert.equal(
        leakage.inInnerHTML,
        false,
        `[${phaseName}] Secret "${SECRET_STRING}" leaked into document.body.innerHTML`
      );
      assert.equal(
        leakage.inLocalStorage,
        false,
        `[${phaseName}] Secret "${SECRET_STRING}" leaked into localStorage`
      );
      assert.equal(
        leakage.inSessionStorage,
        false,
        `[${phaseName}] Secret "${SECRET_STRING}" leaked into sessionStorage`
      );
    }

    // 1. Start couple conversation flow
    const startConvoBtn = page.locator('[data-start-turn-convo]').first();
    await startConvoBtn.click();
    await page.waitForSelector('#startPartnerABtn', { state: 'visible' });

    // Step 1: Intro -> Click Mulai Giliran Partner A
    await page.locator('#startPartnerABtn').click();
    await page.waitForSelector('#partnerAText', { state: 'visible' });

    // Step 2: Partner A
    // Verify continue button starts disabled before choice
    const submitABtn = page.locator('#submitPartnerABtn');
    const isDisabledInitially = await submitABtn.isDisabled();
    assert.equal(isDisabledInitially, true, 'Submit button must start disabled before sharing choice is made');

    // Type secret reflection
    await page.locator('#partnerAText').fill(SECRET_STRING);

    // Choose "Simpan pribadi"
    const tilePrivateA = page.locator('#tilePrivateA');
    await tilePrivateA.click();

    // Verify submit button is now enabled
    const isEnabledAfterChoice = !(await submitABtn.isDisabled());
    assert.equal(isEnabledAfterChoice, true, 'Submit button must be enabled once choice is selected');

    // Submit Partner A
    await submitABtn.click();

    // Step 3: Handover Screen
    await page.waitForSelector('#handoverReadyBtn', { state: 'visible' });

    // Assert absent during handover screen
    await assertSecretAbsent('Handover Step');

    // Wait for handover countdown to complete (3 seconds)
    const readyBtn = page.locator('#handoverReadyBtn');
    await page.waitForFunction(() => {
      const btn = document.querySelector('#handoverReadyBtn');
      return btn && !btn.disabled;
    }, { timeout: 6000 });

    // Click handover ready
    await readyBtn.click();

    // Step 4: Partner B's Turn
    await page.waitForSelector('#partnerBText', { state: 'visible' });

    // CRITICAL ASSERTION: During Partner B's whole turn, secret is absent everywhere
    await assertSecretAbsent('Partner B Turn');

    // Partner B types response
    await page.locator('#partnerBText').fill('Jawaban Partner B yang aman');

    // Partner B selects Bagikan or Simpan pribadi
    await page.locator('#tileShareB').click();

    // Partner B submits to reveal screen
    await page.locator('#submitPartnerBBtn').click();

    // Step 5: Reveal Screen
    await page.waitForSelector('#revealContinueDiscussionBtn', { state: 'visible' });

    // CRITICAL ASSERTION: On reveal screen when A chose Private, secret is absent everywhere
    await assertSecretAbsent('Reveal Screen (A Private)');

    // Verify calm privacy reassurance text is shown on reveal screen
    const revealText = await page.locator('.session-body').innerText();
    assert.ok(revealText.includes('Satu jawaban tetap pribadi'), 'Reveal screen should confirm one answer is private');
    assert.ok(revealText.includes('Di satu ponsel, jawaban pribadi hanya seaman ponselnya.'));
  });
});
