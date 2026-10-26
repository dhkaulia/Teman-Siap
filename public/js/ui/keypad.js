/**
 * Keypad — Custom In-App Numeric Keypad with Rupiah Formatting
 * Never opens OS keyboard, 48px touch targets, quick-add chips (+10rb, +50rb, +100rb).
 */
import { idr } from './utils.js';

export class Keypad {
  constructor({ container, initialValue = 0, onChange = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.value = Math.max(0, Math.floor(Number(initialValue) || 0));
    this.onChange = onChange;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.container.classList.add('keypad-widget');
    this.render();
    this._bindEvents();
    this._updateDisplay();
  }

  render() {
    this.container.innerHTML = `
      <div class="keypad-display-box" tabindex="0" role="region" aria-label="Nominal tersimpan" aria-live="polite">
        <span class="keypad-display-val" id="keypadVal">Rp 0</span>
      </div>
      <div class="keypad-chips" role="group" aria-label="Tambah cepat nominal">
        <button type="button" class="keypad-chip" data-quick="10000">+10 rb</button>
        <button type="button" class="keypad-chip" data-quick="50000">+50 rb</button>
        <button type="button" class="keypad-chip" data-quick="100000">+100 rb</button>
      </div>
      <div class="keypad-grid" role="group" aria-label="Papan tombol angka">
        ${['1','2','3','4','5','6','7','8','9','000','0'].map(k => `
          <button type="button" class="keypad-key" data-key="${k}">${k}</button>
        `).join('')}
        <button type="button" class="keypad-key keypad-del" data-action="del" aria-label="Hapus satu angka">⌫</button>
      </div>
    `;
  }

  _bindEvents() {
    this.container.addEventListener('pointerup', (e) => {
      const quickBtn = e.target.closest('[data-quick]');
      if (quickBtn) return this.add(Number(quickBtn.dataset.quick));

      const keyBtn = e.target.closest('[data-key]');
      if (keyBtn) return this.pushDigit(keyBtn.dataset.key);

      const delBtn = e.target.closest('[data-action="del"]');
      if (delBtn) return this.popDigit();
    });

    const display = this.container.querySelector('.keypad-display-box');
    display.addEventListener('keydown', (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        this.pushDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.popDigit();
      } else if (e.key === 'Escape') {
        this.setValue(0);
      }
    });
  }

  pushDigit(digits) {
    const str = String(this.value);
    let nextStr = (str === '0') ? digits : str + digits;
    if (nextStr.length > 12) nextStr = nextStr.slice(0, 12);
    this.setValue(Number(nextStr) || 0);
  }

  popDigit() {
    const str = String(this.value);
    if (str.length <= 1) this.setValue(0);
    else this.setValue(Number(str.slice(0, -1)) || 0);
  }

  add(amt) {
    const nextVal = Math.min(10000000000, this.value + (Number(amt) || 0));
    this.setValue(nextVal);
  }

  setValue(val) {
    this.value = Math.max(0, Math.floor(Number(val) || 0));
    this._updateDisplay();
    if (typeof this.onChange === 'function') this.onChange(this.value);
  }

  _updateDisplay() {
    if (!this.container) return;
    const el = this.container.querySelector('#keypadVal');
    if (el) el.textContent = idr(this.value);
  }

  getValue() {
    return this.value;
  }

  clear() {
    this.setValue(0);
  }
}
