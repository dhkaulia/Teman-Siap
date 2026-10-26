/**
 * Screen: Kita & Komunikasi (Us)
 * Couple perspective simulator, private-by-default consent reveal, and Gottman antidotes.
 */
import { CONTENT } from '../../content.js';
import { esc } from '../ui/utils.js';

let selectedConvoId = null;

export function setSelectedConvo(id) {
  selectedConvoId = id;
}

export function renderRelationship(store) {
  const d = store.d;
  const perspective = d.currentPerspective || 'A';
  const partnerLabel = perspective === 'A' ? 'Kamu (Partner A)' : 'Pasanganmu (Partner B)';

  if (selectedConvoId) {
    const convo = CONTENT.conversations.find(c => c.id === selectedConvoId);
    const dataA = (d.partnerA && d.partnerA[selectedConvoId]) || { answer: '', consentShare: false };
    const dataB = (d.partnerB && d.partnerB[selectedConvoId]) || { answer: '', consentShare: false };
    const myData = perspective === 'A' ? dataA : dataB;
    const bothConsented = Boolean(dataA.consentShare && dataB.consentShare);
    const jointNote = (d.sharedNotes && d.sharedNotes[selectedConvoId]) || '';

    return `
      <!-- Back button -->
      <div class="card-title-row mb-3">
        <button type="button" class="secondary btn-action-sm" id="exitConvoDetailBtn">
          ← Kembali ke Daftar
        </button>
        <span class="card-tag plum">Modul Percakapan</span>
      </div>

      <!-- Perspective Simulator -->
      <div class="couple-switcher">
        <div class="couple-switcher-label">
          Mengisi sebagai: <b>${perspective === 'A' ? 'Partner A' : 'Partner B'}</b>
        </div>
        <div class="perspective-toggle">
          <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPerspectiveA">Partner A</button>
          <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPerspectiveB">Partner B</button>
        </div>
      </div>

      <div class="card card-border-plum">
        <h2 class="mt-0">${esc(convo.title)}</h2>
        <p class="mute mb-3">${esc(convo.subtitle)}</p>

        <div class="convo-prompt-box">
          <b>Pertanyaan Refleksi:</b><br>
          ${esc(convo.prompt)}
        </div>

        <p class="mute text-sm mb-3">
          ${perspective === 'A' ? esc(convo.helperA) : esc(convo.helperB)}
        </p>

        <!-- Solo Answer Form -->
        <label for="convoAnswerInput">Jawaban Refleksimu (${partnerLabel}):</label>
        <textarea id="convoAnswerInput" placeholder="Tuliskan isi hatimu secara jujur tanpa khawatir dihakimi...">${esc(myData.answer)}</textarea>

        <!-- Explicit Consent to Share Toggle (Private by Default) -->
        <div class="consent-checkbox-card">
          <label class="consent-checkbox-label">
            <input type="checkbox" id="consentShareBox" class="consent-checkbox-input" ${myData.consentShare ? 'checked' : ''}>
            <span class="text-sm">
              <b>Saya setuju membagikan jawaban ini ke Ruang Bersama.</b><br>
              <span class="mute text-xs">Jika tidak dicentang, catatan ini tetap 100% rahasia untuk dirimu sendiri.</span>
            </span>
          </label>
        </div>

        <div class="sticky-bottom-action">
          <button type="button" class="plum-btn w-full" id="saveConvoAnswerBtn">
            Simpan Jawaban (${perspective === 'A' ? 'Partner A' : 'Partner B'})
          </button>
        </div>

        <details class="clinical-note mt-4">
          <summary>Prinsip komunikasi di balik topik ini</summary>
          <p>${esc(convo.clinicalDetail)}</p>
          <p class="mute"><b>Tips:</b> ${esc(convo.gottmanTip)}</p>
        </details>
      </div>

      <!-- Ruang Temu Bersama (Shared Space Reveal Canvas) -->
      <div class="shared-room">
        <div class="card-title-row">
          <h3 class="text-plum mb-0">🤝 Ruang Temu Bersama</h3>
          ${bothConsented ? 
            `<span class="consent-badge shared">✓ Terbuka (Keduanya Setuju)</span>` : 
            `<span class="consent-badge locked">🔒 Menunggu Persetujuan Berdua</span>`}
        </div>

        ${bothConsented ? `
          <p class="mute text-sm">
            Kalian berdua telah sepakat membagikan refleksi masing-masing. Dengarkan dengan empati tanpa saling memotong.
          </p>

          <div class="shared-split">
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner A</div>
              <div class="partner-box-text">
                ${esc(dataA.answer || '(Belum mengisi)')}
              </div>
            </div>
            <div class="partner-box">
              <div class="partner-box-title">Sudut Pandang Partner B</div>
              <div class="partner-box-text">
                ${esc(dataB.answer || '(Belum mengisi)')}
              </div>
            </div>
          </div>

          <div class="convo-agreement-box">
            <div class="font-bold text-sm text-plum mb-1">
              Pertanyaan Diskusi Berdua:
            </div>
            <ul class="discussion-list">
              ${CONTENT.discussStarters.map(q => `<li>${esc(q)}</li>`).join('')}
            </ul>

            <label for="jointAgreementInput" class="mt-3">Satu Komitmen / Langkah Kecil Bersama:</label>
            <input type="text" id="jointAgreementInput" value="${esc(jointNote)}" placeholder="Misal: Buat pos khusus bantuan keluarga Rp 500 rb/bulan">
            <button type="button" class="plum-btn w-full" id="saveJointAgreementBtn">
              Simpan Kesepakatan Bersama 📝
            </button>
          </div>
        ` : `
          <div class="text-center p-3">
            <div class="text-2xl mb-1" aria-hidden="true">🔒</div>
            <div class="font-bold text-md mb-1">Jawaban Belum Dibuka Berdua</div>
            <p class="mute text-sm">
              Untuk menjaga rasa aman psikologis, Ruang Bersama hanya terbuka jika <b>kedua belah pihak</b> telah mengisi dan mencentang persetujuan berbagi.
              <br><br>
              <i>Gunakan toggle <b>Partner B</b> di bagian atas layar untuk menguji simulasi respon pasanganmu!</i>
            </p>
          </div>
        `}
      </div>
    `;
  }

  // Conversation List View
  return `
    <div class="card-title-row">
      <div>
        <span class="card-tag plum">Pilar Relasi</span>
        <h1 class="mt-1 mb-1">Kita & Komunikasi</h1>
      </div>
    </div>
    <p class="mute">Persiapan pernikahan bukan memaksakan kesamaan instan, tapi melatih cara mendengar dan bernegosiasi secara aman.</p>

    <!-- Perspective Switcher in List View -->
    <div class="couple-switcher">
      <div class="couple-switcher-label">
        Mode Simulasi Pasangan: <b>${partnerLabel}</b>
      </div>
      <div class="perspective-toggle">
        <button type="button" class="${perspective === 'A' ? 'active' : ''}" id="switchPerspectiveA">Partner A</button>
        <button type="button" class="${perspective === 'B' ? 'active' : ''}" id="switchPerspectiveB">Partner B</button>
      </div>
    </div>

    <!-- Conversation Catalog -->
    <div class="mt-2">
      ${CONTENT.conversations.map(c => {
        const hasA = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].answer;
        const hasB = d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].answer;
        const bothShared = d.partnerA && d.partnerA[c.id] && d.partnerA[c.id].consentShare &&
                           d.partnerB && d.partnerB[c.id] && d.partnerB[c.id].consentShare;

        return `
          <div class="card card-border-plum">
            <div class="card-title-row">
              <h3 class="mb-0">${esc(c.title)}</h3>
              ${bothShared ? `<span class="consent-badge shared">✓ Terbuka Berdua</span>` :
                (hasA || hasB ? `<span class="consent-badge locked">Sedang Berjalan</span>` : `<span class="card-tag plum">5–15 Mnt</span>`)}
            </div>
            <p class="mute text-sm mt-1 mb-3">${esc(c.subtitle)}</p>

            <button type="button" class="plum-btn w-full" data-start-convo="${esc(c.id)}">
              Mulai Percakapan Ini →
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Gentle Communication Antidotes Sheet -->
    <div class="card">
      <div class="card-title-row">
        <h3>Pola Komunikasi Sehat</h3>
        <span class="card-tag">Riset Hubungan</span>
      </div>
      <p class="mute">4 kebiasaan berbicara yang melelahkan dan penawar lembutnya:</p>

      <div class="flex flex-col gap-2">
        ${CONTENT.communicationPatterns.map(p => `
          <div class="plan-item">
            <div class="font-bold text-ink-secondary">${esc(p.name)}</div>
            <div class="mute text-sm mb-1">Contoh: ${esc(p.example)}</div>
            <div class="text-teal font-medium">Langkah Sehat: ${esc(p.antidoteName)}</div>
            <div class="text-sm">${esc(p.antidoteExample)}</div>
          </div>
        `).join('')}
      </div>

      <details class="clinical-note mt-3">
        <summary>Prinsip Gottman Method</summary>
        <p>Berdasarkan riset hubungan John Gottman selama 40 tahun. Pasangan yang stabil bukan pasangan yang tanpa konflik, melainkan yang mampu memulihkan diri dengan awalan lembut dan merawat rasio positif 5:1.</p>
      </details>
    </div>
  `;
}

export function bindRelationship(container, store, navigate, rerender) {
  const btnA = container.querySelector('#switchPerspectiveA');
  const btnB = container.querySelector('#switchPerspectiveB');
  if (btnA) {
    btnA.onclick = () => {
      store.setCurrentPerspective('A');
      rerender();
    };
  }
  if (btnB) {
    btnB.onclick = () => {
      store.setCurrentPerspective('B');
      rerender();
    };
  }

  container.querySelectorAll('[data-start-convo]').forEach(btn => {
    btn.onclick = () => {
      selectedConvoId = btn.dataset.startConvo;
      rerender();
    };
  });

  const exitBtn = container.querySelector('#exitConvoDetailBtn');
  if (exitBtn) {
    exitBtn.onclick = () => {
      selectedConvoId = null;
      rerender();
    };
  }

  const saveConvoBtn = container.querySelector('#saveConvoAnswerBtn');
  if (saveConvoBtn) {
    saveConvoBtn.onclick = () => {
      const ansEl = container.querySelector('#convoAnswerInput');
      const consentEl = container.querySelector('#consentShareBox');
      const ans = ansEl ? ansEl.value.trim() : '';
      const consent = consentEl ? consentEl.checked : false;
      const perspective = store.d.currentPerspective || 'A';

      store.setPartnerAnswer(perspective, selectedConvoId, ans, consent);
      alert(`Jawaban untuk ${perspective === 'A' ? 'Partner A' : 'Partner B'} berhasil disimpan.`);
      rerender();
    };
  }

  const saveJointBtn = container.querySelector('#saveJointAgreementBtn');
  if (saveJointBtn) {
    saveJointBtn.onclick = () => {
      const noteEl = container.querySelector('#jointAgreementInput');
      const note = noteEl ? noteEl.value.trim() : '';
      if (!note) {
        alert('Tuliskan komitmen atau langkah kecil yang ingin kalian sepakati.');
        return;
      }
      store.setJointNote(selectedConvoId, note);
      alert('Kesepakatan bersama berhasil dicatat!');
      rerender();
    };
  }
}
