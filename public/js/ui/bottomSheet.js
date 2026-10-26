/**
 * BottomSheet — Accessible Mobile-First Bottom Sheet Modal
 * Drag handle with swipe-down dismissal, backdrop tap, focus trap, safe-area inset.
 */
import { esc } from './utils.js';

export class BottomSheet {
  constructor() {
    this.overlay = null;
    this.sheet = null;
    this.previousActiveElement = null;
    this.onClose = null;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
  }

  open({ title = '', content = '', onClose = null }) {
    this.previousActiveElement = document.activeElement;
    this.onClose = onClose;
    this._createDOM(title, content);
    this._bindEvents();
    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
      this.sheet.classList.add('open');
      this._trapFocus();
    });
  }

  _createDOM(title, content) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'bottomsheet-backdrop';

    this.sheet = document.createElement('div');
    this.sheet.className = 'bottomsheet-panel';
    this.sheet.setAttribute('role', 'dialog');
    this.sheet.setAttribute('aria-modal', 'true');
    if (title) this.sheet.setAttribute('aria-label', title);

    this.sheet.innerHTML = `
      <div class="bottomsheet-handle-bar" aria-label="Tarik ke bawah untuk menutup" title="Tarik ke bawah untuk menutup">
        <div class="bottomsheet-pill" aria-hidden="true"></div>
      </div>
      <div class="bottomsheet-header">
        ${title ? `<h3 class="bottomsheet-title">${esc(title)}</h3>` : '<div></div>'}
        <button type="button" class="icon-btn bottomsheet-close-btn" aria-label="Tutup">✕</button>
      </div>
      <div class="bottomsheet-body">
        ${typeof content === 'string' ? content : ''}
      </div>
    `;

    if (typeof content !== 'string' && content instanceof Node) {
      this.sheet.querySelector('.bottomsheet-body').appendChild(content);
    }

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.sheet);
  }

  _bindEvents() {
    this.overlay.addEventListener('pointerup', () => this.close());
    this.sheet.querySelector('.bottomsheet-close-btn').addEventListener('pointerup', () => this.close());

    // Swipe down to dismiss
    const handle = this.sheet.querySelector('.bottomsheet-handle-bar');
    handle.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaY = e.clientY - this.startY;
      if (deltaY > 0) {
        this.sheet.style.transform = `translateY(${deltaY}px)`;
      }
    });

    const endDrag = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const deltaY = e.clientY - this.startY;
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      if (deltaY > 70) this.close();
      else this.sheet.style.transform = '';
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    // Escape and Focus trap
    this._keyHandler = (e) => {
      if (e.key === 'Escape') return this.close();
      if (e.key === 'Tab') {
        const focusables = Array.from(this.sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  }

  _trapFocus() {
    const first = this.sheet.querySelector('button, [tabindex="0"]');
    if (first) first.focus();
  }

  close() {
    if (!this.sheet || !this.overlay) return;
    document.removeEventListener('keydown', this._keyHandler);
    this.sheet.classList.remove('open');
    this.sheet.style.transform = 'translateY(100%)';
    this.overlay.classList.remove('visible');

    setTimeout(() => {
      if (this.overlay) this.overlay.remove();
      if (this.sheet) this.sheet.remove();
      this.overlay = null;
      this.sheet = null;
      if (this.previousActiveElement) {
        try { this.previousActiveElement.focus(); } catch (_) {}
      }
      if (typeof this.onClose === 'function') this.onClose();
    }, 220);
  }
}
