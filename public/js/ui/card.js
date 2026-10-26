/**
 * Reusable Card & Tag Components
 */
import { esc } from './utils.js';

export function renderCard({ title, tag, tagClass = '', content, footer = '', className = '' }) {
  return `
    <div class="card ${className}">
      ${(title || tag) ? `
        <div class="card-title-row">
          ${title ? `<h3>${esc(title)}</h3>` : '<div></div>'}
          ${tag ? `<span class="card-tag ${tagClass}">${esc(tag)}</span>` : ''}
        </div>
      ` : ''}
      ${content}
      ${footer ? `<div class="card-footer mt-2">${footer}</div>` : ''}
    </div>
  `;
}

export function renderClinicalNote(text, summary = 'Pelajari prinsip ilmiahnya') {
  if (!text) return '';
  return `
    <details class="clinical-note mt-3">
      <summary>${esc(summary)}</summary>
      <p>${esc(text)}</p>
    </details>
  `;
}
