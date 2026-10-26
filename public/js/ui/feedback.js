/**
 * Sound and Haptics Feedback — Pure WebAudio & navigator.vibrate(10)
 * 
 * Rules:
 * - Tiny optional sounds generated with WebAudio (NO external audio files).
 * - navigator.vibrate(10) for taps (10ms duration).
 * - Strictly OFF by default until user explicitly enables them in settings/onboarding.
 * - Gentle, warm acoustic frequencies; zero harsh or buzzer sounds.
 */

const STORAGE_KEY_SOUND = 'temansiap_sound';
const STORAGE_KEY_HAPTICS = 'temansiap_haptics';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Checks if sound effects are enabled (OFF by default)
 * @returns {boolean}
 */
export function isSoundEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Sets sound effects preference
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, enabled ? 'true' : 'false');
  } catch (e) {}
}

/**
 * Checks if haptic vibration is enabled (OFF by default)
 * @returns {boolean}
 */
export function isHapticsEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY_HAPTICS) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Sets haptics preference
 * @param {boolean} enabled
 */
export function setHapticsEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_HAPTICS, enabled ? 'true' : 'false');
  } catch (e) {}
}

/**
 * Plays a gentle, warm tap sound (520Hz decaying over 70ms)
 * @returns {boolean} true if played, false if disabled/unavailable
 */
export function playTapSound() {
  if (!isSoundEnabled()) return false;
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Plays a gentle, cheerful completion chord (523Hz + 659Hz over 180ms)
 * @returns {boolean} true if played, false if disabled/unavailable
 */
export function playSuccessSound() {
  if (!isSoundEnabled()) return false;
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    const now = ctx.currentTime;
    [523.25, 659.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Triggers a tiny 10ms haptic tap on devices supporting navigator.vibrate
 * @returns {boolean} true if triggered, false if disabled/unsupported
 */
export function triggerHapticTap() {
  if (!isHapticsEnabled()) return false;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(10);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Triggers gentle celebration haptic feedback pattern
 * @returns {boolean}
 */
export function triggerHapticSuccess() {
  if (!isHapticsEnabled()) return false;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([10, 30, 15]);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}
