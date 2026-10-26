/**
 * Bubble — Accessible Chat-Bubble Message
 * Used for mindful reflection prompts, gentle coaching follow-ups, and partner responses.
 */
import { esc } from './utils.js';

export class Bubble {
  constructor({ container, sender = 'Teman Siap', role = 'guide', icon = '🌱', text = '', timestamp = '', actions = [], onAction = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.sender = sender;
    this.role = role; // 'guide' | 'user' | 'partner'
    this.icon = icon;
    this.text = text;
    this.timestamp = timestamp;
    this.actions = actions;
    this.onAction = onAction;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.el = document.createElement('div');
    this.el.className = `bubble-wrapper bubble-${this.role}`;
    this.el.setAttribute('role', 'article');
    this.el.setAttribute('aria-label', `${this.sender}: ${this.text}`);
    this.render();
    this._bindEvents();
    this.container.appendChild(this.el);
  }

  render() {
    this.el.innerHTML = `
      <div class="bubble-header">
        <span class="bubble-avatar" aria-hidden="true">${this.icon}</span>
        <span class="bubble-sender">${esc(this.sender)}</span>
        ${this.timestamp ? `<span class="bubble-time">${esc(this.timestamp)}</span>` : ''}
      </div>
      <div class="bubble-body">
        <p class="bubble-text">${esc(this.text)}</p>
      </div>
      ${this.actions.length ? `
        <div class="bubble-actions" role="group" aria-label="Tindakan lanjutan">
          ${this.actions.map(act => `
            <button type="button" class="${act.primary ? 'primary' : 'secondary'} bubble-action-btn"
                    data-action-id="${esc(act.id)}">
              ${esc(act.label)}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  _bindEvents() {
    this.el.addEventListener('pointerup', (e) => {
      const btn = e.target.closest('[data-action-id]');
      if (btn && typeof this.onAction === 'function') {
        this.onAction(btn.dataset.actionId);
      }
    });
  }

  static renderHTML({ sender = 'Teman Siap', role = 'guide', icon = '🌱', text = '', timestamp = '', actions = [] }) {
    return `
      <div class="bubble-wrapper bubble-${role}" role="article" aria-label="${esc(sender)}: ${esc(text)}">
        <div class="bubble-header">
          <span class="bubble-avatar" aria-hidden="true">${icon}</span>
          <span class="bubble-sender">${esc(sender)}</span>
          ${timestamp ? `<span class="bubble-time">${esc(timestamp)}</span>` : ''}
        </div>
        <div class="bubble-body">
          <p class="bubble-text">${esc(text)}</p>
        </div>
        ${actions.length ? `
          <div class="bubble-actions" role="group" aria-label="Tindakan lanjutan">
            ${actions.map(act => `
              <button type="button" class="${act.primary ? 'primary' : 'secondary'} bubble-action-btn"
                      data-action-id="${esc(act.id)}">
                ${esc(act.label)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
}
