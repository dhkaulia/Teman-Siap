/**
 * BodyMap — Accessible SVG Body Outline with Tappable Regions
 * Multi-select somatic sensation map for emotional awareness.
 */
import { esc } from './utils.js';

export const BODY_REGIONS = [
  { id: 'head', label: 'Kepala / Pikiran', cx: 100, cy: 38, r: 24, hr: 28 },
  { id: 'throat', label: 'Tenggorokan / Leher', cx: 100, cy: 78, r: 16, hr: 24 },
  { id: 'shoulders', label: 'Bahu / Pundak', cx: 100, cy: 104, r: 26, hr: 32 },
  { id: 'chest', label: 'Dada / Jantung', cx: 100, cy: 144, r: 24, hr: 28 },
  { id: 'stomach', label: 'Perut / Pencernaan', cx: 100, cy: 194, r: 24, hr: 28 },
  { id: 'hands', label: 'Tangan / Lengan', cx: 100, cy: 240, r: 24, hr: 28 },
  { id: 'legs', label: 'Kaki / Lutut', cx: 100, cy: 300, r: 26, hr: 30 },
  { id: 'none', label: 'Tidak terasa di mana-mana', isSpecial: true }
];

export class BodyMap {
  constructor({ container, selected = [], onChange = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.selected = new Set(Array.isArray(selected) ? selected : []);
    this.onChange = onChange;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.container.classList.add('bodymap-container');
    this.render();
    this._bindEvents();
  }

  render() {
    const isNone = this.selected.has('none');
    this.container.innerHTML = `
      <div class="bodymap-svg-wrap">
        <svg class="bodymap-svg" viewBox="0 0 200 360" role="img" aria-label="Peta Sensasi Tubuh">
          <path class="bodymap-silhouette" d="
            M 100 15 C 86 15 78 24 78 38 C 78 52 86 62 92 68 C 84 72 65 82 54 94
            C 44 105 32 135 24 185 C 20 205 32 212 38 198 C 44 175 52 145 58 135
            L 58 200 C 58 215 62 225 66 230 L 66 335 C 66 345 84 345 86 335
            L 92 235 L 100 235 L 108 235 L 114 335 C 116 345 134 345 134 335
            L 134 230 C 138 225 142 215 142 200 L 142 135 C 148 145 156 175 162 198
            C 168 212 180 205 176 185 C 168 135 156 105 146 94 C 135 82 116 72 108 68
            C 114 62 122 52 122 38 C 122 24 114 15 100 15 Z" />
          ${BODY_REGIONS.filter(r => !r.isSpecial).map(r => {
            const isChecked = this.selected.has(r.id);
            return `
              <g class="bodymap-region ${isChecked ? 'active' : ''}" data-region="${r.id}"
                 role="checkbox" tabindex="0" aria-checked="${isChecked}" aria-label="${esc(r.label)}">
                <circle class="bodymap-indicator" cx="${r.cx}" cy="${r.cy}" r="${r.r}" />
                <text class="bodymap-icon" x="${r.cx}" y="${r.cy + 4}" text-anchor="middle">${isChecked ? '✓' : ''}</text>
                <circle class="bodymap-hitarea" cx="${r.cx}" cy="${r.cy}" r="${r.hr}" />
              </g>
            `;
          }).join('')}
        </svg>
      </div>
      <div class="bodymap-none-wrap">
        <button type="button" class="bodymap-none-btn ${isNone ? 'active' : ''}"
                data-region="none" role="checkbox" aria-checked="${isNone}">
          <span class="bodymap-none-icon">${isNone ? '✓' : '○'}</span>
          <span>Tidak terasa di mana-mana</span>
        </button>
      </div>
    `;
  }

  _bindEvents() {
    this.container.addEventListener('pointerup', (e) => {
      const target = e.target.closest('[data-region]');
      if (target) this.toggle(target.dataset.region);
    });

    this.container.addEventListener('keydown', (e) => {
      const target = e.target.closest('[data-region]');
      if (target && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        this.toggle(target.dataset.region);
      }
    });
  }

  toggle(id) {
    if (id === 'none') {
      if (this.selected.has('none')) this.selected.delete('none');
      else {
        this.selected.clear();
        this.selected.add('none');
      }
    } else {
      this.selected.delete('none');
      if (this.selected.has(id)) this.selected.delete(id);
      else this.selected.add(id);
    }
    this._updateUI();
    if (typeof this.onChange === 'function') {
      this.onChange(this.getSelected());
    }
  }

  _updateUI() {
    this.container.querySelectorAll('[data-region]').forEach(el => {
      const id = el.dataset.region;
      const isChecked = this.selected.has(id);
      el.classList.toggle('active', isChecked);
      el.setAttribute('aria-checked', String(isChecked));
      if (id === 'none') {
        const icon = el.querySelector('.bodymap-none-icon');
        if (icon) icon.textContent = isChecked ? '✓' : '○';
      } else {
        const icon = el.querySelector('.bodymap-icon');
        if (icon) icon.textContent = isChecked ? '✓' : '';
      }
    });
  }

  getSelected() {
    return Array.from(this.selected);
  }

  setSelected(arr) {
    this.selected = new Set(Array.isArray(arr) ? arr : []);
    this._updateUI();
  }
}
