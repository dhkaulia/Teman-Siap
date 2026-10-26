/**
 * ChoiceTiles — Large tappable selection tiles with color + check icon
 * WCAG 2.1 AA compliant, pointer events, keyboard navigation
 */
import { esc } from './utils.js';

export class ChoiceTiles {
  constructor({ container, items = [], selected = [], multiple = false, onChange = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.items = items;
    this.multiple = multiple;
    this.selected = new Set(Array.isArray(selected) ? selected : [selected].filter(Boolean));
    this.onChange = onChange;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.container.classList.add('choice-tiles-group');
    this.container.setAttribute('role', this.multiple ? 'group' : 'radiogroup');
    this.render();
    this._bindEvents();
  }

  render() {
    this.container.innerHTML = this.items.map((item, idx) => {
      const val = item.value !== undefined ? item.value : item.label;
      const isChecked = this.selected.has(val);
      const role = this.multiple ? 'checkbox' : 'radio';
      return `
        <div class="choice-tile ${isChecked ? 'selected' : ''}"
             role="${role}"
             tabindex="${idx === 0 || isChecked ? '0' : '-1'}"
             aria-checked="${isChecked}"
             data-value="${esc(val)}"
             aria-label="${esc(item.label)}${item.hint ? ', ' + esc(item.hint) : ''}">
          <div class="choice-tile-main">
            ${item.icon ? `<span class="choice-tile-icon" aria-hidden="true">${item.icon}</span>` : ''}
            <div class="choice-tile-text">
              <span class="choice-tile-label">${esc(item.label)}</span>
              ${item.hint ? `<span class="choice-tile-hint">${esc(item.hint)}</span>` : ''}
            </div>
          </div>
          <span class="choice-tile-check" aria-hidden="true">${isChecked ? '✓' : ''}</span>
        </div>
      `;
    }).join('');
  }

  _bindEvents() {
    this.container.addEventListener('pointerup', (e) => {
      const tile = e.target.closest('.choice-tile');
      if (tile) this.toggle(tile.dataset.value);
    });

    this.container.addEventListener('keydown', (e) => {
      const tile = e.target.closest('.choice-tile');
      if (!tile) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle(tile.dataset.value);
      } else if (!this.multiple && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
        e.preventDefault();
        this._moveFocus(tile, 1);
      } else if (!this.multiple && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        this._moveFocus(tile, -1);
      }
    });
  }

  _moveFocus(currentTile, delta) {
    const tiles = Array.from(this.container.querySelectorAll('.choice-tile'));
    const nextIdx = (tiles.indexOf(currentTile) + delta + tiles.length) % tiles.length;
    const nextTile = tiles[nextIdx];
    tiles.forEach(t => t.setAttribute('tabindex', '-1'));
    nextTile.setAttribute('tabindex', '0');
    nextTile.focus();
    this.toggle(nextTile.dataset.value);
  }

  toggle(val) {
    if (this.multiple) {
      if (this.selected.has(val)) this.selected.delete(val);
      else this.selected.add(val);
    } else {
      this.selected.clear();
      this.selected.add(val);
    }
    this._updateUI();
    if (typeof this.onChange === 'function') {
      this.onChange(this.getSelected());
    }
  }

  _updateUI() {
    this.container.querySelectorAll('.choice-tile').forEach(t => {
      const isChecked = this.selected.has(t.dataset.value);
      t.classList.toggle('selected', isChecked);
      t.setAttribute('aria-checked', String(isChecked));
      const checkEl = t.querySelector('.choice-tile-check');
      if (checkEl) checkEl.textContent = isChecked ? '✓' : '';
    });
  }

  getSelected() {
    const arr = Array.from(this.selected);
    return this.multiple ? arr : (arr[0] || null);
  }

  setSelected(val) {
    this.selected = new Set(Array.isArray(val) ? val : [val].filter(Boolean));
    this._updateUI();
  }
}
