/**
 * Teman Siap — UI Utilities & Formatting Helpers
 */

export const DEV_MODE = typeof window !== 'undefined' && (
  new URLSearchParams(window.location.search).has('dev') ||
  localStorage.getItem('temansiap_dev') === '1'
);

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export function idr(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey() {
  return today().slice(0, 7);
}

/**
 * Screen reader live announcement helper
 * Uses aria-live="polite" live region for step changes and timer milestones
 */
export function announce(message) {
  if (typeof document === 'undefined') return;
  const liveEl = document.getElementById('liveAnnouncer');
  if (liveEl) {
    liveEl.textContent = '';
    requestAnimationFrame(() => {
      liveEl.textContent = String(message || '');
    });
  }
}

