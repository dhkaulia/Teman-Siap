/**
 * Reusable Pill List Component
 */
import { esc } from './utils.js';

export function renderPill({ label, value, active = false, dataAttr = 'data-pill' }) {
  const val = value !== undefined ? value : label;
  return `
    <button type="button" class="pill-item ${active ? 'active' : ''}" ${dataAttr}="${esc(val)}" aria-pressed="${active}">
      ${esc(label)}
    </button>
  `;
}

export function renderPillList(items, selectedValues = [], dataAttr = 'data-pill') {
  const selectedArr = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  return `
    <div class="pill-list">
      ${items.map(item => {
        const label = typeof item === 'string' ? item : item.label;
        const value = typeof item === 'string' ? item : (item.value !== undefined ? item.value : item.label);
        return renderPill({
          label,
          value,
          active: selectedArr.includes(value),
          dataAttr
        });
      }).join('')}
    </div>
  `;
}
