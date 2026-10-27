/**
 * Teman Siap — Main Entrypoint (ES Module)
 * Boot, Router, Theme & Keyboard Handling
 */
import { store } from './store.js';
import { sessionRunner } from './session.js';
import { createCheckinFlow } from './flows/checkinFlow.js';
import { createBreathingFlow } from './flows/breathingFlow.js';
import { createGroundingFlow } from './flows/groundingFlow.js';
import { createExpenseFlow } from './flows/expenseFlow.js';
import { createUrgeFlow } from './flows/urgeFlow.js';
import { createGoalFlow } from './flows/goalFlow.js';
import { createPlanFlow } from './flows/planFlow.js';
import { createCoupleFlow } from './flows/coupleFlow.js';
import { CONTENT } from '../content.js';
import { announce } from './ui/utils.js';

import { renderOnboarding, bindOnboarding } from './screens/onboarding.js';
import { renderHome, bindHome } from './screens/home.js';
import { renderEmotions, bindEmotions, setEmotionSubView, cleanupEmosi } from './screens/emosi.js';
import { renderMoney, bindMoney, setMoneySubView, cleanupUang } from './screens/uang.js';
import { renderRelationship, bindRelationship } from './screens/kita.js';
import { renderSelf, bindSelf } from './screens/saya.js';
import { renderIcon } from './ui/icons.js';

// Navigation tabs definition (No emojis; clean outline 24px currentColor SVG icons)
const TABS = [
  { id: 'home', label: 'Beranda', iconName: 'home' },
  { id: 'emo', label: 'Emosi', iconName: 'emo' },
  { id: 'money', label: 'Uang', iconName: 'money' },
  { id: 'us', label: 'Kita', iconName: 'us' },
  { id: 'me', label: 'Saya', iconName: 'me' }
];

let currentTab = 'home';

// -------------------------------------------------------------
// Router & Navigation
// -------------------------------------------------------------
export function navigate(tabId, subView = null) {
  cleanupEmosi();
  cleanupUang();

  currentTab = tabId;
  if (subView) {
    if (tabId === 'emo') setEmotionSubView(subView);
    if (tabId === 'money') setMoneySubView(subView);
  }

  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderNav() {
  const navEl = document.getElementById('nav');
  if (!navEl) return;

  if (!store.d.onboardingComplete) {
    navEl.style.display = 'none';
    return;
  }

  navEl.style.display = 'flex';
  navEl.innerHTML = TABS.map(t => `
    <button type="button" data-tab="${t.id}" ${t.id === currentTab ? 'aria-current="page"' : ''} aria-label="${t.label}">
      <span class="nav-icon" aria-hidden="true">${renderIcon(t.iconName)}</span>
      <span>${t.label}</span>
    </button>
  `).join('');

  navEl.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      navigate(btn.dataset.tab);
    };
  });
}

export function render() {
  renderNav();
  const viewEl = document.getElementById('view');
  if (!viewEl) return;

  if (!store.d.onboardingComplete) {
    viewEl.innerHTML = renderOnboarding(store);
    bindOnboarding(viewEl, store, navigate, render);
    return;
  }

  switch (currentTab) {
    case 'home':
      viewEl.innerHTML = renderHome(store);
      bindHome(viewEl, store, navigate);
      break;
    case 'emo':
      viewEl.innerHTML = renderEmotions(store);
      bindEmotions(viewEl, store, navigate, render);
      break;
    case 'money':
      viewEl.innerHTML = renderMoney(store);
      bindMoney(viewEl, store, navigate, render);
      break;
    case 'us':
      viewEl.innerHTML = renderRelationship(store);
      bindRelationship(viewEl, store, navigate, render);
      break;
    case 'me':
      viewEl.innerHTML = renderSelf(store);
      bindSelf(viewEl, store, navigate, render);
      break;
    default:
      viewEl.innerHTML = renderHome(store);
      bindHome(viewEl, store, navigate);
  }

  checkAndShowInstallHint();
}

// -------------------------------------------------------------
// Mobile Keyboard & Viewport Protection
// -------------------------------------------------------------
function setupKeyboardProtection() {
  document.addEventListener('focusin', e => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const active = document.activeElement;
      if (active && ['INPUT', 'TEXTAREA'].includes(active.tagName)) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

// -------------------------------------------------------------
// Theme Management & Persistence (Otomatis / Terang / Gelap)
// -------------------------------------------------------------
export function applyTheme(mode) {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('temansiap_theme_mode') : null;
  const chosen = mode || stored || store.d?.themeMode || 'auto';
  let isDark = false;

  if (chosen === 'dark') {
    isDark = true;
  } else if (chosen === 'light') {
    isDark = false;
  } else {
    // auto / system
    if (typeof window !== 'undefined' && window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  if (typeof document !== 'undefined') {
    document.body.classList.toggle('theme-dark', isDark);
    document.body.classList.toggle('theme-light', !isDark);
    document.documentElement.classList.toggle('theme-dark', isDark);
    document.documentElement.classList.toggle('theme-light', !isDark);

    const icon = document.getElementById('themeIcon');
    if (icon) icon.innerHTML = isDark ? renderIcon('moon') : renderIcon('sun');

    const metaThemes = document.querySelectorAll('meta[name="theme-color"]');
    metaThemes.forEach(m => {
      m.setAttribute('content', isDark ? '#0E1514' : '#F4F6F5');
    });
  }
}

if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const mode = (typeof localStorage !== 'undefined' ? localStorage.getItem('temansiap_theme_mode') : null) || 'auto';
      if (mode === 'auto') {
        applyTheme('auto');
      }
    });
  } catch (e) {}
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.onclick = () => {
    const isDark = document.body.classList.contains('theme-dark');
    const nextMode = isDark ? 'light' : 'dark';
    store.setThemeMode(nextMode);
    applyTheme(nextMode);
  };
}

// -------------------------------------------------------------
// PWA Service Worker & Install Hint
// TODO: Push notifications for daily check-in reminders (out of scope for v1 — do not request Notification.permission)
// -------------------------------------------------------------
let deferredInstallPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}

export function registerServiceWorker() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

export function checkAndShowInstallHint() {
  const container = document.getElementById('installHintContainer');
  if (!container) return;

  // Rule: Remove the install banner from every tab except Beranda
  if (currentTab !== 'home') {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  if (typeof localStorage === 'undefined') return;
  // Rule: Show it once, and never again after dismissal
  if (
    localStorage.getItem('temansiap_install_hint_shown') === '1' ||
    localStorage.getItem('temansiap_install_hint_dismissed') === '1'
  ) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  const d = store.d;
  const completedPractices = (d.checkins?.length || 0) +
                             (d.expenses?.length || 0) +
                             (d.pauses?.length || 0) +
                             Object.keys(d.coupleConversations || {}).length;

  // Appears once, after the first completed practice, NEVER on first load
  if (completedPractices < 1) return;

  container.hidden = false;
  container.innerHTML = `
    <div class="install-hint-card" role="region" aria-label="Petunjuk pemasangan aplikasi">
      <div class="install-hint-icon" aria-hidden="true">${renderIcon('smartphone')}</div>
      <div class="install-hint-text">
        <div class="font-bold text-sm">Pasang di Layar Utama</div>
        <div class="text-xs mute">Akses cepat dan berfungsi offline.</div>
      </div>
      <div class="install-hint-actions">
        <button type="button" class="primary btn-action-sm" id="pwaInstallActionBtn">Pasang</button>
        <button type="button" class="icon-btn btn-action-sm" id="pwaDismissActionBtn" aria-label="Tutup petunjuk">✕</button>
      </div>
    </div>
  `;

  announce('Petunjuk pemasangan aplikasi Teman Siap tersedia.');

  const installBtn = container.querySelector('#pwaInstallActionBtn');
  const dismissBtn = container.querySelector('#pwaDismissActionBtn');

  const closeHint = () => {
    container.hidden = true;
    container.innerHTML = '';
    localStorage.setItem('temansiap_install_hint_shown', '1');
    localStorage.setItem('temansiap_install_hint_dismissed', '1');
  };

  if (installBtn) {
    installBtn.onclick = () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
          deferredInstallPrompt = null;
        }).catch(() => {});
      }
      closeHint();
    };
  }

  if (dismissBtn) {
    dismissBtn.onclick = closeHint;
  }
}

// -------------------------------------------------------------
// Boot Application
// -------------------------------------------------------------
export function boot() {
  store.init();

  // Register all declarative flows with session runner
  sessionRunner.registerFlow(createCheckinFlow(store.d.faithPerspective));
  sessionRunner.registerFlow(createBreathingFlow());
  sessionRunner.registerFlow(createGroundingFlow());
  sessionRunner.registerFlow(createExpenseFlow(store));
  sessionRunner.registerFlow(createUrgeFlow(store.d.faithPerspective));
  sessionRunner.registerFlow(createGoalFlow());
  sessionRunner.registerFlow(createPlanFlow());

  // Register couple conversation flows
  CONTENT.conversations.forEach(c => {
    sessionRunner.registerFlow(createCoupleFlow(c, store));
  });

  setupKeyboardProtection();
  setupThemeToggle();
  applyTheme();
  registerServiceWorker();

  // Sync effects preference with body class
  const syncEffects = () => {
    const disabled = store.d.enableEffects === false;
    document.body.classList.toggle('effects-disabled', disabled);
  };
  syncEffects();

  // URL Query Params support for automated testing, deep-linking, & visual audits
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('onboarded') === '1') {
      store.d.onboardingComplete = true;
    }
    if (params.get('theme') === 'dark') {
      applyTheme('dark');
    } else if (params.get('theme') === 'light') {
      applyTheme('light');
    }
    const tabParam = params.get('tab');
    if (tabParam) {
      currentTab = tabParam;
    }
    if (params.get('pA') !== null) {
      store.d.couple = store.d.couple || {};
      store.d.couple.partnerA = store.d.couple.partnerA || { name: 'Partner A' };
      store.d.couple.partnerA.practicesCount = Number(params.get('pA')) || 0;
    }
    if (params.get('pB') !== null) {
      store.d.couple = store.d.couple || {};
      store.d.couple.partnerB = store.d.couple.partnerB || { name: 'Partner B' };
      store.d.couple.partnerB.practicesCount = Number(params.get('pB')) || 0;
    }
    const lessonParam = params.get('lesson');
    if (lessonParam) {
      import('./flows/lessons.js').then(({ getLessonById }) => {
        import('./flows/lessonPlayer.js').then(({ createLessonFlow }) => {
          const lId = lessonParam === '1' ? 'lesson-naming-feelings' : lessonParam;
          const lesson = getLessonById(lId) || getLessonById('lesson-naming-feelings');
          if (lesson) {
            sessionRunner.start(createLessonFlow(lesson, () => navigate('home'), store));
          }
        });
      });
    }
  }

  render();
  checkAndShowInstallHint();

  // Attempt restoring active session if browser refreshed during a flow
  sessionRunner.restoreIfAvailable();

  // Keep screen updated when store updates (e.g. from completed flows)
  store.subscribe(() => {
    syncEffects();
    if (!sessionRunner.getActiveSession()) {
      render();
    }
    checkAndShowInstallHint();
  });
}

// Auto-boot if document ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
