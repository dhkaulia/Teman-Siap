/**
 * AnswerSheet — Playful bottom sheet that slides up after each step
 * 
 * Rules:
 * - Slides up in the thumb zone with Tunas mascot, one-line message, and 56px Continue button.
 * - NO wrong-answer state for emotions or money (emotions and financial reflections are always valid).
 * - For knowledge questions, a "belum pas" state uses soft coral and a gentle explanation, never red or buzzers.
 * - Animate transform/opacity only; 60fps; accessible focus trap and Escape handler.
 */

import { esc } from './utils.js';
import { renderMascot } from './mascot.js';

export class AnswerSheet {
  /**
   * Shows an AnswerSheet
   * @param {object} options
   * @param {'success'|'belum_pas'|'gentle'} [options.type='success']
   * @param {string} [options.message]
   * @param {string} [options.explanation]
   * @param {string} [options.mascotState]
   * @param {string} [options.buttonText='Lanjut']
   * @param {Function} [options.onContinue]
   * @param {number|string} [options.stage]
   * @returns {AnswerSheet}
   */
  static show(options = {}) {
    const sheet = new AnswerSheet(options);
    sheet.open();
    return sheet;
  }

  constructor({
    type = 'success',
    message = 'Mantap, kamu menamai perasaanmu.',
    explanation = '',
    mascotState = null,
    buttonText = 'Lanjut',
    onContinue = null,
    secondaryButtonText = null,
    onSecondary = null,
    stage = 'tunas'
  } = {}) {
    this.type = type === 'belum_pas' || type === 'gentle' ? 'belum_pas' : 'success';
    this.message = message;
    this.explanation = explanation;
    this.mascotState = mascotState || (this.type === 'belum_pas' ? 'think' : 'cheer');
    this.buttonText = buttonText;
    this.onContinue = onContinue;
    this.secondaryButtonText = secondaryButtonText;
    this.onSecondary = onSecondary;
    this.stage = stage;
    this._el = null;
    this._prevActive = typeof document !== 'undefined' ? document.activeElement : null;
  }

  open() {
    this.close(); // remove existing if any

    const isGentle = this.type === 'belum_pas';
    const accentClass = isGentle ? 'answersheet-coral' : 'answersheet-success';
    const btnClass = isGentle ? 'btn-chunky btn-coral btn-thumb' : 'btn-chunky primary btn-thumb';
    const bannerTag = isGentle ? 'Belum Pas' : 'Bagus Sekali';
    const tagClass = isGentle ? 'card-tag coral' : 'card-tag tunas';

    const overlay = document.createElement('div');
    overlay.className = 'answersheet-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', isGentle ? 'Ulasan Lembut' : 'Langkah Selesai');

    overlay.innerHTML = `
      <div class="answersheet-backdrop"></div>
      <div class="answersheet-sheet ${accentClass}">
        <div class="answersheet-pill-handle" aria-hidden="true"></div>
        <div class="answersheet-content">
          <div class="answersheet-mascot-wrap">
            ${renderMascot(this.mascotState, 80, { stage: this.stage, label: 'Tunas' })}
          </div>
          <div class="answersheet-text-wrap">
            <span class="${tagClass} mb-1">${bannerTag}</span>
            <div class="answersheet-message">${esc(this.message)}</div>
            ${this.explanation ? `<div class="answersheet-explanation mute text-xs mt-1">${esc(this.explanation)}</div>` : ''}
          </div>
        </div>
        <div class="answersheet-actions">
          <button type="button" class="${btnClass}" id="answerSheetContinueBtn">
            <span>${esc(this.buttonText)} →</span>
          </button>
          ${this.secondaryButtonText ? `
            <button type="button" class="btn-chunky btn-ghost btn-thumb mt-2" id="answerSheetSecondaryBtn">
              <span>${esc(this.secondaryButtonText)}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this._el = overlay;

    // Trigger slide up
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      const btn = overlay.querySelector('#answerSheetContinueBtn');
      if (btn) btn.focus();
    });

    // Event binding
    const continueBtn = overlay.querySelector('#answerSheetContinueBtn');
    continueBtn.addEventListener('click', () => this._handleContinue());

    if (this.secondaryButtonText) {
      const secBtn = overlay.querySelector('#answerSheetSecondaryBtn');
      if (secBtn) {
        secBtn.addEventListener('click', () => {
          this.close();
          if (typeof this.onSecondary === 'function') {
            this.onSecondary();
          }
        });
      }
    }

    this._onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this._handleContinue();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);
  }

  _handleContinue() {
    this.close();
    if (typeof this.onContinue === 'function') {
      this.onContinue();
    }
  }

  close() {
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._el && this._el.parentNode) {
      this._el.classList.remove('is-open');
      setTimeout(() => {
        if (this._el && this._el.parentNode) {
          this._el.parentNode.removeChild(this._el);
        }
      }, 220);
    }
    if (this._prevActive && typeof this._prevActive.focus === 'function') {
      try { this._prevActive.focus(); } catch (e) {}
    }
  }
}
