/**
 * Toast / Gentle Bubble Notification System
 * 
 * Rules:
 * - Floating gentle notification pill for reassuring confirmations.
 * - Animates transform and opacity only; 60fps; safe-area aware.
 * - Accessible: role="status" and aria-live="polite" for screen readers.
 * - Auto-dismisses with smooth transition.
 */

import { esc } from './utils.js';

let activeToast = null;
let toastTimeout = null;

/**
 * Displays a gentle toast bubble message
 * @param {string} message
 * @param {object} [options]
 * @param {'info'|'success'|'gentle'} [options.type='info']
 * @param {string} [options.icon='🌱']
 * @param {number} [options.duration=2600]
 * @returns {object} { dismiss: Function }
 */
export function showToast(message, options = {}) {
  const type = options.type || 'info';
  const icon = options.icon || (type === 'success' ? '✓' : '🌱');
  const duration = Number(options.duration) || 2600;

  dismissAllToasts();

  if (typeof document === 'undefined') {
    return { dismiss: () => {} };
  }

  let host = document.getElementById('toastHostContainer');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHostContainer';
    host.className = 'toast-host-container';
    document.body.appendChild(host);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `toast-bubble toast-${type}`;
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');

  toastEl.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon}</span>
    <span class="toast-message">${esc(message)}</span>
  `;

  host.appendChild(toastEl);
  activeToast = toastEl;

  requestAnimationFrame(() => {
    toastEl.classList.add('is-visible');
  });

  const dismiss = () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    if (toastEl && toastEl.parentNode) {
      toastEl.classList.remove('is-visible');
      setTimeout(() => {
        if (toastEl && toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
        if (activeToast === toastEl) activeToast = null;
      }, 180);
    }
  };

  toastTimeout = setTimeout(dismiss, duration);

  return { dismiss };
}

/**
 * Dismisses any currently visible toast
 */
export function dismissAllToasts() {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  if (activeToast && activeToast.parentNode) {
    activeToast.classList.remove('is-visible');
    const el = activeToast;
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 180);
    activeToast = null;
  }
}
