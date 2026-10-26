/**
 * ProgressBar — Chunky, rounded progress bar with a soft white shine
 * 
 * Rules:
 * - 14px chunky height with pill radius (9999px)
 * - Fills smoothly with CSS transition (transform/width)
 * - Supports continuous and segmented layouts for multi-part lessons
 * - Accessible with role="progressbar" and aria attributes
 */

export class ProgressBar {
  /**
   * @param {object} options
   * @param {HTMLElement|string} options.container
   * @param {number} [options.current=1] - 1-based current step
   * @param {number} [options.total=4] - Total steps
   * @param {number} [options.segments=0] - Number of segments (0 or 1 for continuous, >1 for segmented)
   * @param {string} [options.color='var(--tunas)']
   * @param {boolean} [options.showLabel=false]
   */
  constructor({
    container,
    current = 1,
    total = 4,
    segments = 0,
    color = 'var(--tunas)',
    showLabel = false
  } = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.current = Math.max(0, Number(current) || 0);
    this.total = Math.max(1, Number(total) || 1);
    this.segments = Math.max(0, Number(segments) || 0);
    this.color = color;
    this.showLabel = showLabel;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.render();
  }

  setProgress(current, total = this.total) {
    this.current = Math.max(0, Number(current) || 0);
    this.total = Math.max(1, Number(total) || 1);
    this.render();
  }

  render() {
    if (!this.container) return;
    const ratio = Math.min(1, Math.max(0, this.current / this.total));
    const pct = Math.round(ratio * 100);

    if (this.segments > 1) {
      // Segmented Progress Bar
      let segmentHtml = '';
      const totalSeg = this.segments;
      const completedSegments = Math.floor(ratio * totalSeg);
      const activeSegFraction = (ratio * totalSeg) - completedSegments;

      for (let i = 0; i < totalSeg; i++) {
        let fillWidth = '0%';
        if (i < completedSegments) {
          fillWidth = '100%';
        } else if (i === completedSegments && activeSegFraction > 0) {
          fillWidth = `${Math.round(activeSegFraction * 100)}%`;
        }
        segmentHtml += `
          <div class="progressbar-segment">
            <div class="progressbar-segment-fill" style="width: ${fillWidth}; background-color: ${this.color};">
              <div class="progressbar-shine" aria-hidden="true"></div>
            </div>
          </div>
        `;
      }

      this.container.innerHTML = `
        <div class="progressbar-wrap segmented"
             role="progressbar"
             aria-valuenow="${this.current}"
             aria-valuemin="0"
             aria-valuemax="${this.total}"
             aria-label="Kemajuan pelajaran: ${this.current} dari ${this.total}">
          ${segmentHtml}
        </div>
        ${this.showLabel ? `<div class="progressbar-label mute text-xs mt-1">Bagian ${Math.min(this.total, this.current)} dari ${this.total}</div>` : ''}
      `;
    } else {
      // Continuous Chunky Progress Bar
      this.container.innerHTML = `
        <div class="progressbar-wrap continuous"
             role="progressbar"
             aria-valuenow="${this.current}"
             aria-valuemin="0"
             aria-valuemax="${this.total}"
             aria-label="Kemajuan langkah: ${this.current} dari ${this.total}">
          <div class="progressbar-track">
            <div class="progressbar-fill" style="width: ${pct}%; background-color: ${this.color};">
              <div class="progressbar-shine" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        ${this.showLabel ? `<div class="progressbar-label mute text-xs mt-1">Langkah ${this.current} dari ${this.total}</div>` : ''}
      `;
    }
  }
}
