/**
 * Confetti & Sparkle — Tiny 600ms celebratory particle burst
 * 
 * Rules:
 * - Strictly 600ms duration.
 * - Used ONLY at session completion, maximum once per session.
 * - Disabled completely when prefers-reduced-motion is active.
 * - Disabled completely if settings toggle "Efek perayaan" is turned off.
 * - Animates transform and opacity only (60fps performance on low-end Android).
 */

const STORAGE_KEY_CELEBRATION = 'temansiap_celebration';
const completedSessions = new Set();

/**
 * Checks if celebration effect setting is active (defaults to true)
 * @returns {boolean}
 */
export function isCelebrationEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY_CELEBRATION) !== 'false';
  } catch (e) {
    return true;
  }
}

/**
 * Updates celebration effect preference
 * @param {boolean} enabled
 */
export function setCelebrationEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_CELEBRATION, enabled ? 'true' : 'false');
  } catch (e) {}
}

/**
 * Resets session guard (for testing or restarting a session)
 * @param {string} [sessionId]
 */
export function resetSessionCelebration(sessionId) {
  if (sessionId) completedSessions.delete(sessionId);
  else completedSessions.clear();
}

/**
 * Triggers a tiny 600ms celebration burst
 * @param {object} options
 * @param {string} [options.sessionId] - Session ID to ensure max once per session
 * @param {HTMLElement} [options.container] - Target container (defaults to document.body)
 * @returns {boolean} true if celebration fired, false if skipped
 */
export function triggerCelebration(options = {}) {
  // Rule 1: Max once per session
  const sessionId = options.sessionId || 'default_session';
  if (completedSessions.has(sessionId)) {
    return false;
  }

  // Rule 2: Respect settings toggle "Efek perayaan"
  if (!isCelebrationEnabled()) {
    return false;
  }

  // Rule 2b: Respect body effects-disabled class
  if (typeof document !== 'undefined' && document.body && document.body.classList.contains('effects-disabled')) {
    return false;
  }

  // Rule 3: Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
  }

  // Mark session as completed
  completedSessions.add(sessionId);

  // If running in headless node / test environment without DOM
  if (typeof document === 'undefined') {
    return true;
  }

  const container = options.container || document.body;
  const burstWrap = document.createElement('div');
  burstWrap.className = 'confetti-burst-wrap';
  burstWrap.setAttribute('aria-hidden', 'true');

  const colors = [
    'var(--tunas, #15803D)',
    'var(--sunny, #F59E0B)',
    'var(--teal, #1B5E59)',
    'var(--coral, #C84825)',
    'var(--plum, #6B4E71)'
  ];

  const count = 24;
  let particlesHtml = '';

  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    const angle = (i / count) * 360;
    const distance = 40 + (i % 5) * 16;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.round(Math.cos(rad) * distance);
    const ty = Math.round(Math.sin(rad) * distance - 20);
    const rot = (i * 35) % 360;
    const size = 6 + (i % 4) * 2;
    const isCircle = i % 3 === 0;

    particlesHtml += `
      <div class="confetti-particle ${isCircle ? 'circle' : 'rect'}"
           style="--tx: ${tx}px; --ty: ${ty}px; --rot: ${rot}deg; --color: ${color}; width: ${size}px; height: ${size}px;">
      </div>
    `;
  }

  burstWrap.innerHTML = particlesHtml;
  container.appendChild(burstWrap);

  // Strict 600ms duration clean-up
  setTimeout(() => {
    if (burstWrap && burstWrap.parentNode) {
      burstWrap.parentNode.removeChild(burstWrap);
    }
  }, 600);

  return true;
}
