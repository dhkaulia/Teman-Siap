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

import { renderOnboarding, bindOnboarding } from './screens/onboarding.js';
import { renderHome, bindHome } from './screens/home.js';
import { renderEmotions, bindEmotions, setEmotionSubView, cleanupEmosi } from './screens/emosi.js';
import { renderMoney, bindMoney, setMoneySubView, cleanupUang } from './screens/uang.js';
import { renderRelationship, bindRelationship } from './screens/kita.js';
import { renderSelf, bindSelf } from './screens/saya.js';

// Navigation tabs definition
const TABS = [
  { id: 'home', label: 'Beranda', icon: '🏡' },
  { id: 'emo', label: 'Emosi', icon: '🌱' },
  { id: 'money', label: 'Uang', icon: '🪙' },
  { id: 'us', label: 'Kita', icon: '🤝' },
  { id: 'me', label: 'Saya', icon: '👤' }
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

  if (!store.d.stage) {
    navEl.style.display = 'none';
    return;
  }

  navEl.style.display = 'flex';
  navEl.innerHTML = TABS.map(t => `
    <button type="button" data-tab="${t.id}" ${t.id === currentTab ? 'aria-current="page"' : ''} aria-label="${t.label}">
      <span class="nav-icon" aria-hidden="true">${t.icon}</span>
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

  if (!store.d.stage) {
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
// Theme Management
// -------------------------------------------------------------
function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn) return;

  btn.onclick = () => {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      if (icon) icon.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      if (icon) icon.textContent = '🌙';
    }
  };
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

  setupKeyboardProtection();
  setupThemeToggle();

  render();

  // Attempt restoring active session if browser refreshed during a flow
  sessionRunner.restoreIfAvailable();

  // Keep screen updated when store updates (e.g. from completed flows)
  store.subscribe(() => {
    if (!sessionRunner.getActiveSession()) {
      render();
    }
  });
}

// Auto-boot if document ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
