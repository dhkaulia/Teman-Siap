/**
 * Reusable Chip Component
 */
import { esc } from './utils.js';

export function renderChip({ id, label, icon, hint, active = false, dataAttr = 'data-chip' }) {
  return `
    <button type="button" class="chip ${active ? 'active' : ''}" ${dataAttr}="${esc(id || label)}" aria-pressed="${active}">
      ${icon ? `<span class="chip-icon">${icon}</span>` : ''}
      <div class="chip-col">
        <span class="chip-label">${esc(label)}</span>
        ${hint ? `<span class="chip-hint">${esc(hint)}</span>` : ''}
      </div>
    </button>
  `;
}

export function renderChipGrid(items, selectedValue, dataAttr = 'data-chip') {
  return `
    <div class="chip-grid">
      ${items.map(item => renderChip({
        id: item.id || item.label,
        label: item.label,
        icon: item.icon,
        hint: item.hint,
        active: selectedValue === (item.id || item.label),
        dataAttr
      })).join('')}
    </div>
  `;
}
