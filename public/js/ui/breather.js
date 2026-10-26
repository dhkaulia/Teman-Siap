/**
 * Breather — 4-4-6 Micro-Regulation Breathing Circle
 * Pure CSS transforms (no layout re-calc), pausable, reduced-motion text countdown.
 */
export class Breather {
  constructor({ container, totalCycles = 4, onComplete = null }) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.totalCycles = totalCycles;
    this.onComplete = onComplete;
    this.phase = 'idle'; // 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete'
    this.timer = null;
    this.secondsLeft = 0;
    this.cycleCount = 0;
    this.isPaused = false;
    this._init();
  }

  _init() {
    if (!this.container) return;
    this.container.classList.add('breather-widget');
    this.render();
    this._bindEvents();
  }

  render() {
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.container.innerHTML = `
      <div class="breather-visual-wrap">
        <div class="breather-ring" id="breatherRing">
          <div class="breather-inner-text" id="breatherInner">Mulai</div>
        </div>
      </div>
      <div class="breather-status" role="status" aria-live="polite" id="breatherStatus">
        Tekan tombol untuk mulai latihan napas 4-4-6
      </div>
      ${isReduced ? '<div class="breather-reduced-note mute text-xs">Mode gerak minimal aktif (hitung mundur teks)</div>' : ''}
      <div class="breather-controls">
        <button type="button" class="primary" id="breatherActionBtn">Mulai Latihan</button>
        <button type="button" class="secondary" id="breatherResetBtn" disabled>Reset</button>
      </div>
    `;
  }

  _bindEvents() {
    this.actionBtn = this.container.querySelector('#breatherActionBtn');
    this.resetBtn = this.container.querySelector('#breatherResetBtn');
    this.ring = this.container.querySelector('#breatherRing');
    this.innerText = this.container.querySelector('#breatherInner');
    this.statusText = this.container.querySelector('#breatherStatus');

    this.actionBtn.addEventListener('pointerup', () => {
      if (this.phase === 'idle' || this.phase === 'complete') this.start();
      else if (this.isPaused) this.resume();
      else this.pause();
    });

    this.resetBtn.addEventListener('pointerup', () => this.stop());
  }

  start() {
    this.cycleCount = 0;
    this.isPaused = false;
    this.resetBtn.disabled = false;
    this._nextPhase('inhale');
  }

  _nextPhase(nextPhase) {
    if (this.phase === 'complete') return;
    this.phase = nextPhase;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let duration = 4;
    let label = 'Tarik';
    let cue = 'Tarik napas perlahan lewat hidung (4 detik)...';

    if (this.phase === 'inhale') {
      this.ring.className = isReduced ? 'breather-ring' : 'breather-ring expand';
    } else if (this.phase === 'hold') {
      duration = 4;
      label = 'Tahan';
      cue = 'Tahan napas santai dan rileks (4 detik)...';
      this.ring.className = isReduced ? 'breather-ring' : 'breather-ring hold';
    } else if (this.phase === 'exhale') {
      duration = 6;
      label = 'Hembus';
      cue = 'Hembuskan perlahan lewat mulut (6 detik)...';
      this.ring.className = isReduced ? 'breather-ring' : 'breather-ring contract';
    }

    this.secondsLeft = duration;
    this.innerText.textContent = label;
    this.statusText.textContent = cue;
    this.actionBtn.textContent = 'Jeda';

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPaused) return;
      this.secondsLeft--;
      if (isReduced) this.innerText.textContent = `${label} ${this.secondsLeft}s`;
      if (this.secondsLeft <= 0) {
        clearInterval(this.timer);
        if (this.phase === 'inhale') this._nextPhase('hold');
        else if (this.phase === 'hold') this._nextPhase('exhale');
        else if (this.phase === 'exhale') {
          this.cycleCount++;
          if (this.cycleCount >= this.totalCycles) this._complete();
          else this._nextPhase('inhale');
        }
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
    this.actionBtn.textContent = 'Lanjutkan';
    this.statusText.textContent = 'Latihan dijeda sejenak.';
  }

  resume() {
    this.isPaused = false;
    this.actionBtn.textContent = 'Jeda';
  }

  _complete() {
    clearInterval(this.timer);
    this.phase = 'complete';
    this.ring.className = 'breather-ring complete';
    this.innerText.textContent = '🌿';
    this.statusText.textContent = 'Bagus sekali. Napasmu kini terasa lebih tenang.';
    this.actionBtn.textContent = 'Mulai Lagi';
    this.resetBtn.disabled = true;
    if (typeof this.onComplete === 'function') this.onComplete();
  }

  stop() {
    clearInterval(this.timer);
    this.phase = 'idle';
    this.isPaused = false;
    this.ring.className = 'breather-ring';
    this.innerText.textContent = 'Mulai';
    this.statusText.textContent = 'Latihan dihentikan.';
    this.actionBtn.textContent = 'Mulai Latihan';
    this.resetBtn.disabled = true;
  }
}
