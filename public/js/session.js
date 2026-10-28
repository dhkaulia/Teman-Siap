/**
 * Teman Siap — Declarative Flow Session Runner
 * 
 * Rules:
 * - A flow is data: { id, title, steps: [{ id, type, title, subtitle, optional, ... }], onComplete }
 * - Full-screen overlay with: thin progress bar, back button, exit (X) button, skip link for optional steps.
 * - Exit (X) asks nothing, saves nothing, immediately clears in-progress session.
 * - In-progress session is persisted so refresh/call does not lose progress.
 * - Transitions: 200ms fade/slide respecting reduced-motion.
 * - Does not re-render whole view on state change; updates only the active step container.
 */

import { store } from './store.js';
import { announce } from './ui/utils.js';

export const SESSION_STORAGE_KEY = 'temansiap_active_session';

/**
 * Pure session reducer function for testability.
 */
export function sessionReducer(state, action) {
  if (!action) return state;

  switch (action.type) {
    case 'START_FLOW': {
      return {
        flowId: action.flow.id,
        flow: action.flow,
        stepIndex: 0,
        answers: { ...(action.initialAnswers || {}) },
        isComplete: false,
        updatedAt: Date.now()
      };
    }

    case 'RESTORE_SESSION': {
      if (!action.saved || action.saved.flowId !== action.flow.id) return null;
      return {
        flowId: action.flow.id,
        flow: action.flow,
        stepIndex: action.saved.stepIndex || 0,
        answers: { ...(action.saved.answers || {}) },
        isComplete: false,
        updatedAt: action.saved.updatedAt || Date.now()
      };
    }

    case 'SET_ANSWER': {
      if (!state || state.isComplete) return state;
      const step = state.flow.steps[state.stepIndex];
      const stepId = action.stepId || (step ? step.id : null);
      if (!stepId) return state;

      return {
        ...state,
        answers: {
          ...state.answers,
          [stepId]: action.value
        },
        updatedAt: Date.now()
      };
    }

    case 'NEXT_STEP': {
      if (!state || state.isComplete) return state;
      const nextIndex = state.stepIndex + 1;
      if (nextIndex >= state.flow.steps.length) {
        return {
          ...state,
          isComplete: true,
          updatedAt: Date.now()
        };
      }
      return {
        ...state,
        stepIndex: nextIndex,
        updatedAt: Date.now()
      };
    }

    case 'PREV_STEP': {
      if (!state || state.stepIndex <= 0) return state;
      return {
        ...state,
        stepIndex: state.stepIndex - 1,
        updatedAt: Date.now()
      };
    }

    case 'SKIP_STEP': {
      if (!state || state.isComplete) return state;
      const step = state.flow.steps[state.stepIndex];
      if (!step || !step.optional) return state; // Only optional steps can be skipped

      const nextIndex = state.stepIndex + 1;
      if (nextIndex >= state.flow.steps.length) {
        return {
          ...state,
          isComplete: true,
          updatedAt: Date.now()
        };
      }
      return {
        ...state,
        stepIndex: nextIndex,
        updatedAt: Date.now()
      };
    }

    case 'CANCEL_SESSION': {
      return null;
    }

    default:
      return state;
  }
}

export class SessionRunner {
  constructor() {
    this._state = null;
    this._overlayEl = null;
    this._flows = new Map();
    this._onCloseCallback = null;
  }

  registerFlow(flow) {
    this._flows.set(flow.id, flow);
  }

  getFlow(flowId) {
    return this._flows.get(flowId);
  }

  getActiveSession() {
    return this._state;
  }

  /**
   * Start a declarative flow session
   */
  start(flow, initialAnswers = {}, onClose = null) {
    if (!flow || !Array.isArray(flow.steps) || flow.steps.length === 0) {
      console.error('Invalid flow provided to SessionRunner', flow);
      return;
    }

    this._onCloseCallback = onClose;
    this._state = sessionReducer(null, {
      type: 'START_FLOW',
      flow,
      initialAnswers
    });

    this._persist();
    this._mountOverlay();
    this._renderCurrentStep();
  }

  /**
   * Resume an in-progress session if one was saved
   */
  restoreIfAvailable() {
    if (this._state) return false;
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;

    try {
      const saved = JSON.parse(raw);
      const flow = this._flows.get(saved.flowId);
      if (!flow) {
        this._clearPersistence();
        return false;
      }

      // Privacy hardening: if a couple or love-maps flow is restored mid-flow,
      // private answer text was kept in memory only and is now absent from disk.
      // Restart that partner's answer step with a calm notice.
      if (saved.flowId.startsWith('couple-') && saved.stepIndex >= 1) {
        saved.stepIndex = 1; // Restart at partnerA answer step
        saved.answers = saved.answers || {};
        saved.answers._refreshedNotice = true;
      } else if (saved.flowId === 'flow-love-maps' && saved.stepIndex >= 1) {
        saved.stepIndex = 1; // Restart at selfA answer step
        saved.answers = saved.answers || {};
        saved.answers._refreshedNotice = true;
      }

      this._state = sessionReducer(null, {
        type: 'RESTORE_SESSION',
        flow,
        saved
      });

      if (this._state) {
        this._mountOverlay();
        this._renderCurrentStep();
        return true;
      }
    } catch (e) {
      this._clearPersistence();
    }
    return false;
  }

  _persist() {
    if (typeof localStorage === 'undefined') return;
    if (!this._state || this._state.isComplete) {
      this._clearPersistence();
      return;
    }

    const flow = this._state.flow;
    const answersToPersist = { ...(this._state.answers || {}) };

    // Privacy rule: Never persist a partner's private answer text in the resumable session or localStorage
    // Strip private answer text for couple conversations and love maps mid-flow
    const isPrivateFlow = flow?.id?.startsWith('couple-') || flow?.id === 'flow-love-maps' || this._state.flowId?.startsWith('couple-') || this._state.flowId === 'flow-love-maps';
    if (isPrivateFlow) {
      delete answersToPersist.answerA;
      delete answersToPersist.answerB;
      if (answersToPersist.partnerA && typeof answersToPersist.partnerA === 'object') {
        const pA = { ...answersToPersist.partnerA };
        delete pA.answerA;
        delete pA.text;
        delete pA.answer;
        answersToPersist.partnerA = pA;
      }
      if (answersToPersist.partnerB && typeof answersToPersist.partnerB === 'object') {
        const pB = { ...answersToPersist.partnerB };
        delete pB.answerB;
        delete pB.text;
        delete pB.answer;
        answersToPersist.partnerB = pB;
      }
      for (const key of Object.keys(answersToPersist)) {
        if (key.startsWith('selfA') || key.startsWith('selfB') || key.startsWith('guessA') || key.startsWith('guessB')) {
          delete answersToPersist[key];
        }
      }
    }

    const payload = {
      flowId: this._state.flowId,
      stepIndex: this._state.stepIndex,
      answers: answersToPersist,
      updatedAt: this._state.updatedAt
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }

  _clearPersistence() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  _mountOverlay() {
    if (this._overlayEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'session-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <header class="session-header">
        <button type="button" class="icon-btn" id="sessionBackBtn" aria-label="Kembali ke langkah sebelumnya">←</button>
        <div class="session-progress-track">
          <div class="session-progress-bar" id="sessionProgressBar"></div>
        </div>
        <button type="button" class="icon-btn" id="sessionExitBtn" aria-label="Tutup dan batalkan latihan">✕</button>
      </header>
      <div class="session-body" id="sessionBody"></div>
      <footer class="session-footer" id="sessionFooter"></footer>
    `;

    document.body.appendChild(overlay);
    this._overlayEl = overlay;

    overlay.querySelector('#sessionBackBtn').onclick = () => this.prev();
    overlay.querySelector('#sessionExitBtn').onclick = () => this.exit();
  }

  setOverlayTint(color) {
    if (this._overlayEl) {
      this._overlayEl.style.backgroundColor = color || 'var(--bg-canvas)';
    }
  }

  _unmountOverlay() {
    if (this._overlayEl) {
      this._overlayEl.style.backgroundColor = '';
      this._overlayEl.remove();
      this._overlayEl = null;
    }
    if (this._onCloseCallback) {
      this._onCloseCallback();
      this._onCloseCallback = null;
    }
  }

  _renderCurrentStep() {
    if (!this._overlayEl || !this._state) return;

    const { flow, stepIndex, answers } = this._state;
    const step = flow.steps[stepIndex];
    const totalSteps = flow.steps.length;

    // 1. Update Progress Bar
    const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);
    const barEl = this._overlayEl.querySelector('#sessionProgressBar');
    if (barEl) barEl.style.width = `${progressPct}%`;

    // 2. Update Back Button Visibility
    const backBtn = this._overlayEl.querySelector('#sessionBackBtn');
    if (backBtn) {
      backBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    }

    // 3. Step Body Rendering with 200ms Transition
    const bodyEl = this._overlayEl.querySelector('#sessionBody');
    const existingStep = bodyEl.firstElementChild;

    const newStepContainer = document.createElement('div');
    newStepContainer.className = 'session-step-container step-entering';
    newStepContainer.innerHTML = this._buildStepHTML(step, answers);

    announce(`Langkah ${stepIndex + 1} dari ${totalSteps}: ${step.title || 'Latihan'}`);

    if (existingStep) {
      existingStep.classList.add('step-leaving');
      setTimeout(() => existingStep.remove(), 200);
    }
    bodyEl.appendChild(newStepContainer);

    // Trigger enter transition
    requestAnimationFrame(() => {
      newStepContainer.classList.remove('step-entering');
    });

    this._bindStepInputs(newStepContainer, step);

    // 4. Footer Rendering (Next + Optional Skip Link)
    const footerEl = this._overlayEl.querySelector('#sessionFooter');
    if (step.hideFooter) {
      footerEl.style.display = 'none';
      return;
    }
    footerEl.style.display = 'flex';

    const isLastStep = stepIndex === totalSteps - 1;
    const nextLabel = step.nextLabel || (isLastStep ? (flow.completeLabel || 'Selesai ✨') : 'Lanjut →');

    footerEl.innerHTML = `
      ${step.optional ? `<button type="button" class="session-skip-link" id="sessionSkipLink">Lewati langkah ini</button>` : ''}
      <button type="button" class="primary w-full" id="sessionNextBtn">${nextLabel}</button>
    `;

    const nextBtn = footerEl.querySelector('#sessionNextBtn');
    if (nextBtn) nextBtn.onclick = () => this.next();

    const skipBtn = footerEl.querySelector('#sessionSkipLink');
    if (skipBtn) skipBtn.onclick = () => this.skip();
  }

  _buildStepHTML(step, answers) {
    const currentVal = answers[step.id];

    let contentHTML = '';
    switch (step.type) {
      case 'choice': {
        contentHTML = `
          <div class="chip-grid">
            ${(step.options || []).map(opt => {
              const isSelected = currentVal === opt.value || currentVal === opt.label;
              return `
                <button type="button" class="chip ${isSelected ? 'active' : ''}" data-choice="${esc(opt.value || opt.label)}" aria-pressed="${isSelected}">
                  ${opt.icon ? `<span class="chip-icon">${opt.icon}</span>` : ''}
                  <div class="chip-col">
                    <span class="chip-label">${esc(opt.label)}</span>
                    ${opt.hint ? `<span class="chip-hint">${esc(opt.hint)}</span>` : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        `;
        break;
      }

      case 'multichoice':
      case 'bodymap': {
        const selectedArr = Array.isArray(currentVal) ? currentVal : [];
        contentHTML = `
          <div class="pill-list">
            ${(step.options || []).map(opt => {
              const val = typeof opt === 'string' ? opt : opt.value || opt.label;
              const isSelected = selectedArr.includes(val);
              return `
                <button type="button" class="pill-item ${isSelected ? 'active' : ''}" data-multi="${esc(val)}">
                  ${esc(val)}
                </button>
              `;
            }).join('')}
          </div>
        `;
        break;
      }

      case 'select': {
        contentHTML = `
          <select id="stepSelectField">
            <option value="">${esc(step.placeholder || '-- Pilih salah satu --')}</option>
            ${(step.options || []).map(opt => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return `<option value="${esc(val)}" ${currentVal === val ? 'selected' : ''}>${esc(lbl)}</option>`;
            }).join('')}
          </select>
        `;
        break;
      }

      case 'reflection':
      case 'textarea': {
        contentHTML = `
          <textarea id="stepTextField" placeholder="${esc(step.placeholder || 'Tuliskan refleksimu…')}" rows="4">${esc(currentVal || '')}</textarea>
        `;
        break;
      }

      case 'number': {
        contentHTML = `
          <input type="number" id="stepNumberField" inputmode="numeric" pattern="[0-9]*" value="${esc(currentVal || '')}" placeholder="${esc(step.placeholder || '0')}" min="1">
        `;
        break;
      }

      case 'custom': {
        if (typeof step.renderCustom === 'function') contentHTML = step.renderCustom(answers, this);
        else if (typeof step.render === 'function') contentHTML = step.render(answers, this);
        break;
      }

      default:
        contentHTML = `<p class="mute">Langkah tanpa tipe input.</p>`;
    }

    if (step.noCard) {
      return contentHTML;
    }

    return `
      <div class="card mb-3">
        ${step.tag ? `<span class="card-tag saffron">${esc(step.tag)}</span>` : ''}
        ${step.title ? `<h2 class="mt-2 mb-1">${esc(step.title)}</h2>` : ''}
        ${step.subtitle ? `<p class="mute mb-3">${esc(step.subtitle)}</p>` : ''}
        ${contentHTML}
        ${step.clinicalDetail ? `
          <details class="clinical-note mt-3">
            <summary>Pelajari prinsip ilmiahnya</summary>
            <p>${esc(step.clinicalDetail)}</p>
          </details>
        ` : ''}
      </div>
    `;
  }

  _bindStepInputs(container, step) {
    if (typeof step.bind === 'function') {
      step.bind(container, this._state.answers, this);
    }
    if (typeof step.bindCustom === 'function') {
      step.bindCustom(container, this._state.answers, this);
    }

    switch (step.type) {
      case 'choice': {
        container.querySelectorAll('[data-choice]').forEach(btn => {
          btn.onclick = () => {
            const val = btn.dataset.choice;
            this.setAnswer(val);
            container.querySelectorAll('[data-choice]').forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          };
        });
        break;
      }

      case 'multichoice':
      case 'bodymap': {
        container.querySelectorAll('[data-multi]').forEach(btn => {
          btn.onclick = () => {
            const val = btn.dataset.multi;
            const currentArr = Array.isArray(this._state.answers[step.id]) ? [...this._state.answers[step.id]] : [];
            const idx = currentArr.indexOf(val);
            if (idx >= 0) {
              currentArr.splice(idx, 1);
              btn.classList.remove('active');
            } else {
              currentArr.push(val);
              btn.classList.add('active');
            }
            this.setAnswer(currentArr);
          };
        });
        break;
      }

      case 'select': {
        const sel = container.querySelector('#stepSelectField');
        if (sel) {
          sel.onchange = () => this.setAnswer(sel.value);
        }
        break;
      }

      case 'reflection':
      case 'textarea': {
        const txt = container.querySelector('#stepTextField');
        if (txt) {
          txt.oninput = () => this.setAnswer(txt.value);
        }
        break;
      }

      case 'number': {
        const num = container.querySelector('#stepNumberField');
        if (num) {
          num.oninput = () => this.setAnswer(num.value ? Number(num.value) : '');
        }
        break;
      }
    }
  }

  setAnswer(value) {
    if (!this._state) return;
    this._state = sessionReducer(this._state, {
      type: 'SET_ANSWER',
      value
    });
    this._persist();
  }

  next() {
    if (!this._state) return;

    this._state = sessionReducer(this._state, { type: 'NEXT_STEP' });

    if (this._state.isComplete) {
      this._complete();
    } else {
      this._persist();
      this._renderCurrentStep();
    }
  }

  prev() {
    if (!this._state) return;
    this._state = sessionReducer(this._state, { type: 'PREV_STEP' });
    this._persist();
    this._renderCurrentStep();
  }

  skip() {
    if (!this._state) return;
    this._state = sessionReducer(this._state, { type: 'SKIP_STEP' });

    if (this._state.isComplete) {
      this._complete();
    } else {
      this._persist();
      this._renderCurrentStep();
    }
  }

  exit() {
    // If flow defines custom onExit (e.g. lesson player "Simpan dan keluar?" dialog), delegate to it
    if (this._state && this._state.flow && typeof this._state.flow.onExit === 'function') {
      this._state.flow.onExit(this);
      return;
    }
    this.forceExit();
  }

  forceExit() {
    // Discard session and unmount immediately
    this._state = sessionReducer(this._state, { type: 'CANCEL_SESSION' });
    this._clearPersistence();
    this._unmountOverlay();
  }

  pauseAndExit() {
    // Save current progress to persistence and close overlay
    this._persist();
    this._unmountOverlay();
  }

  _complete() {
    const { flow, answers } = this._state;
    this._clearPersistence();
    this._unmountOverlay();

    if (typeof flow.onComplete === 'function') {
      try {
        flow.onComplete(answers, store);
      } catch (e) {
        console.error('Error in flow.onComplete', e);
      }
    }
  }
}

export const sessionRunner = new SessionRunner();

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
