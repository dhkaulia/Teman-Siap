/**
 * Wave — Interactive Intensity Wave (Urge Surfing)
 * Vertical drag to set 0-10 intensity, touch-action:none on wave only, play animation mode.
 */
export class Wave {
  constructor({ container, value = 5, onChange = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.value = Math.max(0, Math.min(10, Number(value) || 0));
    this.onChange = onChange;
    this.isDragging = false;
    this.animId = null;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.container.classList.add('wave-widget');
    this.render();
    this._bindEvents();
    this._updateWave(this.value);
  }

  render() {
    this.container.innerHTML = `
      <div class="wave-track" role="slider" tabindex="0"
           aria-valuemin="0" aria-valuemax="10" aria-valuenow="${this.value}"
           aria-label="Tingkat dorongan belanja" aria-valuetext="${this._getText(this.value)}">
        <svg class="wave-svg" viewBox="0 0 300 120" preserveAspectRatio="none">
          <path class="wave-path-back" d="" />
          <path class="wave-path-front" d="" />
        </svg>
        <div class="wave-badge" aria-hidden="true">${this.value} / 10</div>
        <div class="wave-drag-zone" title="Tarik ke atas atau ke bawah untuk mengatur kekuatan dorongan"></div>
      </div>
      <div class="wave-caption mute text-xs">${this._getText(this.value)} (Sentuh & seret naik/turun)</div>
    `;
  }

  _getText(v) {
    if (v <= 2) return `${v} / 10 (Tenang / Sangat Ringan)`;
    if (v <= 5) return `${v} / 10 (Sedang)`;
    if (v <= 8) return `${v} / 10 (Kuat)`;
    return `${v} / 10 (Sangat Menggebu-gebu)`;
  }

  _bindEvents() {
    const track = this.container.querySelector('.wave-track');
    const dragZone = this.container.querySelector('.wave-drag-zone');

    dragZone.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      dragZone.setPointerCapture(e.pointerId);
      this._handlePointer(e);
    });

    dragZone.addEventListener('pointermove', (e) => {
      if (this.isDragging) this._handlePointer(e);
    });

    const endDrag = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { dragZone.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    dragZone.addEventListener('pointerup', endDrag);
    dragZone.addEventListener('pointercancel', endDrag);

    track.addEventListener('keydown', (e) => {
      let delta = 0;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = 1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'PageUp') delta = 2;
      else if (e.key === 'PageDown') delta = -2;
      else if (e.key === 'Home') this.setValue(0);
      else if (e.key === 'End') this.setValue(10);
      if (delta !== 0) {
        e.preventDefault();
        this.setValue(this.value + delta);
      }
    });
  }

  _handlePointer(e) {
    const rect = this.container.querySelector('.wave-track').getBoundingClientRect();
    const ratio = (rect.bottom - e.clientY) / rect.height;
    const nextVal = Math.round(Math.max(0, Math.min(10, ratio * 10)));
    this.setValue(nextVal);
  }

  setValue(val) {
    this.value = Math.max(0, Math.min(10, Math.round(val)));
    this._updateWave(this.value);
    if (this.container) {
      const track = this.container.querySelector('.wave-track');
      const badge = this.container.querySelector('.wave-badge');
      const caption = this.container.querySelector('.wave-caption');
      if (track) {
        track.setAttribute('aria-valuenow', this.value);
        track.setAttribute('aria-valuetext', this._getText(this.value));
      }
      if (badge) badge.textContent = `${this.value} / 10`;
      if (caption) caption.textContent = `${this._getText(this.value)} (Sentuh & seret naik/turun)`;
    }
    if (typeof this.onChange === 'function') this.onChange(this.value);
  }

  _updateWave(val) {
    if (!this.container) return;
    const front = this.container.querySelector('.wave-path-front');
    const back = this.container.querySelector('.wave-path-back');
    if (!front || !back) return;

    const baseH = 100;
    const amp = 10 + (val / 10) * 75; // Peak height from 10px to 85px
    const yPeak = baseH - amp;

    const dFront = `M 0,${baseH} C 80,${baseH + 10} 140,${yPeak} 210,${yPeak + 15} C 250,${yPeak + 25} 280,${baseH} 300,${baseH} L 300,120 L 0,120 Z`;
    const dBack = `M 0,${baseH} C 60,${yPeak + 20} 120,${yPeak - 5} 200,${baseH} C 250,${baseH + 15} 280,${baseH - 10} 300,${baseH} L 300,120 L 0,120 Z`;

    front.setAttribute('d', dFront);
    back.setAttribute('d', dBack);
  }

  play(durationMs = 4000, onEnd = null) {
    cancelAnimationFrame(this.animId);
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // Rise in first 35%, fall in remaining 65%
      let v = 0;
      if (progress < 0.35) v = (progress / 0.35) * 9.5;
      else v = 9.5 * (1 - (progress - 0.35) / 0.65);
      this.setValue(Math.round(v));

      if (progress < 1) this.animId = requestAnimationFrame(tick);
      else if (typeof onEnd === 'function') onEnd();
    };
    this.animId = requestAnimationFrame(tick);
  }

  stopAnimation() {
    cancelAnimationFrame(this.animId);
  }
}
