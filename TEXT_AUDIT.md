# TEXT BUDGET AUDIT REPORT (Teman Siap)

**Audit Date:** 2026-10-27  
**Viewport Target:** Mobile-First 360px  
**Status:** PASS (All 5 screens compliant with strict Text Budget rules)

---

## 1. Executive Summary & Word Count Reduction

Across all 5 screens, on-screen word counts have been audited and condensed. Long explanatory texts, clinical rationales, multi-sentence descriptions, and administrative settings have been placed behind accessible "Pelajari" bottom sheets or settings sheets.

| Screen | Word Count Before | Word Count After | Reduction (%) | What Moved Behind "Pelajari" / Settings Sheet |
| :--- | :---: | :---: | :---: | :--- |
| **Beranda (Home)** | 139 | 105 | **-24.5%** | Full unit goals and clinical rationale moved into "Pelajari Unit" bottom sheets. Install hint isolated to Beranda only. |
| **Emosi** | 99 | 32 | **-67.7%** | 42-word accordion paragraph for "Basuh Wajah Dingin (TIPP)" and mammalian dive reflex explanation moved into dedicated bottom sheet. |
| **Uang** | 81 | 43 | **-46.9%** | Removed one- and two-line descriptions from rows. Goal, urge surfing, and if-then plans now use compact status chips ("Belum ada tujuan", "Urge Surfing", "Belum ada rencana"). |
| **Kita** | 487 | 234 | **-51.9%** | Removed "Hubungkan Dua Ponsel (Segera Hadir)" card. Love Maps 21-word paragraph moved to sheet. 4 verbose communication pattern cards replaced with 4 short rows + Gottman research sheets. |
| **Saya** | 690 | 236 | **-65.8%** | Removed 2-line milestone descriptions & kebun paragraph. Ritme explanation moved to "Pelajari Libur Otomatis". 6 preference toggles, JSON backup/wipe, and emergency crisis hotlines moved to "Pengaturan & Data" sheet. |
| **Total** | **1,496** | **650** | **-56.5%** | **Overall reduction of 846 words across primary views.** |

---

## 2. Detailed Screen Audit & Applied Changes

### A. Beranda (`tab=home`)
- **Screen Title & Supporting Line:**
  - Tag: `Langkah Hari Ini` (3 words)
  - Hero Title: `Sapa Perasaanmu` (2 words)
  - Supporting Line: `Mengenali apa yang kamu rasakan hari ini.` (7 words — complies with max 10 words)
- **Unit Banners:**
  - Each curriculum unit banner transformed to: Spot illustration + Tag (`Unit 1`) + Title (`Mengenal Diri`, 2 words) + 4-word hint (`Percaya diri dan regulasi emosi`).
  - The multi-line goal (`Mengenali emosi dan regulasi tubuh sebelum berbagi hidup berdua`) moved behind a `Pelajari` bottom sheet trigger.
- **Install Hint Banner:**
  - Constrained strictly to `currentTab === 'home'`.
  - Icon updated from emoji `📲` to self-hosted SVG `smartphone` icon.
  - Text: Title `Pasang di Layar Utama` (4 words), supporting line `Akses cepat dan berfungsi offline.` (5 words).
  - Dismissal sets `temansiap_install_hint_dismissed = 1` and `temansiap_install_hint_shown = 1` in `localStorage`; it will never appear again once closed.

### B. Emosi (`tab=emo`)
- **Screen Title & Supporting Line:**
  - Title: `Apa Rasamu Hari Ini?` (4 words — complies with max 4 words).
  - Supporting Line: `Sapa perasaanmu dengan tenang tanpa penghakiman.` (6 words — complies with max 10 words).
- **Exercise List (Latihan Mandiri):**
  - Converted to clean, large rows (min 48px touch targets):
    1. Icon `breath` + Title `Napas Tenang (4-4-6)` + Status Chip `1 Menit` + Arrow.
    2. Icon `grounding` + Title `Teknik Grounding` + Status Chip `2 Menit` + Arrow.
    3. Icon `water` + Title `Basuh Wajah Dingin` + Status Chip `TIPP` + Arrow.
  - Multi-line descriptions removed from the screen face.
  - The previous 42-word accordion paragraph detailing the mammalian dive reflex and cardiac safety notes now opens inside a dedicated `Pelajari: Basuh Wajah Dingin` bottom sheet.

### C. Uang (`tab=money`)
- **Screen Title & Supporting Line:**
  - Heading updated: `Uang` (1 word — replaced former ampersand heading `Uang & Rasa Aman`).
  - Supporting Line: `Catatan belanja sadar tanpa rasa bersalah.` (6 words — complies with max 10 words).
- **Monthly Summary Hub:**
  - Title: `Tercatat bulan ini` (3 words).
  - Rupiah amount: Rendered with variable font Fraunces display numbers (`tabular-nums`).
  - Caption: `Catatan sadar, bukan saldo bank` (5 words).
- **Interactive Tiles & Status Chips:**
  - Row 1: Icon `goal` + Title `Tujuan Tabungan` + Chip (`Aktif` or `Belum ada tujuan`).
  - Row 2: Icon `urge` + Title `Jeda Belanja` + Chip `Urge Surfing`.
  - Row 3: Icon `plan` + Title `Rencana Jika-Maka` + Chip (`X rencana` or `Belum ada rencana`).
  - Removed all 2-line descriptions; tapping any tile triggers the respective flow or detail bottom sheet.

### D. Kita (`tab=us`)
- **Screen Title & Supporting Line:**
  - Heading updated: `Kita` (1 word — replaced former ampersand heading `Kita & Komunikasi`).
  - Supporting Line: `Melatih mendengar dan bernegosiasi berdua dengan tenang.` (8 words — complies with max 10 words).
- **Unbuilt Feature Removed:**
  - Completely deleted the `Hubungkan Dua Ponsel (Segera Hadir)` card to enforce the hard rule: *"Unbuilt features are not shown (no 'Segera Hadir' cards)"*.
- **Taman Kita Scene:**
  - Preserved botanical stoneware pot illustration and independent growth stages.
  - Caption shortened to `Tumbuh bersama tanpa kompetisi.` (4 words). Long rationale moved to `Pelajari Taman Kita` sheet.
- **Kuis Saling Kenal (Love Maps):**
  - Title: `Kuis Saling Kenal` (3 words).
  - Replaced 21-word description with 6-word hint (`Tebak dunia batin pasanganmu dengan hangat.`) and a `Pelajari` sheet trigger.
- **Pola Komunikasi Sehat:**
  - Converted from 4 multi-paragraph cards into a 4-row grid with status chips:
    1. Icon `shield` + `Kritik Menyerang` + Chip `Awalan Lembut`
    2. Icon `shield` + `Sarkasme & Hinaan` + Chip `Apresiasi`
    3. Icon `shield` + `Sikap Defensif` + Chip `Tanggung Jawab`
    4. Icon `shield` + `Sikap Mendiamkan` + Chip `Jeda Fisik`
  - Tapping any row opens a `BottomSheet` displaying the everyday trigger quote, the gentle antidote, and the positive alternative.
  - Clinical 40-year Gottman Sound Relationship House research moved behind a `Riset` sheet button.

### E. Saya (`tab=me`)
- **Screen Title & Supporting Line:**
  - Title: `Ruang Saya` (2 words).
  - Supporting Line: `Ruang belajar mandiri tanpa penilaian.` (5 words — complies with max 10 words).
- **Kebun Saya Milestones:**
  - Removed 23-word explanatory paragraph.
  - Milestone cards stripped of multi-sentence descriptions; cards now show Icon + Title + Status Badge (`Mekar ✓` or `Kuncup`). Tapping opens a milestone bottom sheet.
- **Target & Ritme Mingguan:**
  - Removed long paragraphs explaining automatic rest weeks.
  - Status box uses compact chips: `${currentWeekPractices}/${weeklyGoal} langkah` and `Libur: ${liburRemaining} pekan`.
  - Added `Pelajari` button opening the "Tentang Libur Otomatis" bottom sheet.
- **Admin & Setup Controls:**
  - Replaced on-screen card containing 6 checkboxes, data export/wipe buttons, and crisis contacts with a single entry tile:
    - Icon `settings` + Title `Pengaturan & Data` (3 words) + Chip `Preferensi` + Arrow.
  - Tapping opens the `Pengaturan & Privasi` bottom sheet containing all switches (Ritme, Rewards, Efek, Suara, Getaran, Sudut Pandang Iman), Local-first JSON backup/wipe actions, and crisis hotline numbers.

---

## 3. TEXT BUDGET Compliance Verification Checklist

| Rule | Requirement | Implementation Verification | Status |
| :--- | :--- | :--- | :---: |
| **1. Screen Titles** | Max 4 words | Beranda (3), Emosi (4), Uang (1), Kita (1), Saya (2) | **PASS** |
| **2. Supporting Lines** | Max 10 words, or none | All supporting lines <= 10 words (5 to 8 words) | **PASS** |
| **3. Cards & Rows** | Icon + Title (max 4 words) + hint (max 6 words), no paragraphs | Verified across all rows and cards; paragraphs moved to sheets | **PASS** |
| **4. Long Content** | Behind "Pelajari" tap (bottom sheet), never open by default | Added `BottomSheet` triggers across all 5 screens | **PASS** |
| **5. Teaching Content** | Interaction over reading, max 12 words per card face | Maintained interactive swipe/keypad/breather flows | **PASS** |
| **6. Primary Action** | One primary action per screen; admin controls in settings sheet | Admin toggles and backup/wipe live in settings bottom sheet | **PASS** |
| **7. Unbuilt Features** | Not shown (no "Segera Hadir" cards) | Removed "Hubungkan Dua Ponsel (Segera Hadir)" card | **PASS** |
| **8. Icons** | One SVG set (self-hosted). No emoji as UI icons | Clean 24px outline SVG set used; `📲` and `⏱️` removed | **PASS** |
| **9. Typography** | Real display font for numbers only | `var(--font-display)` Fraunces mapped only to numbers/stats | **PASS** |
| **10. Install Hint** | Beranda only, once only, never again after dismissal | Enforced via `currentTab === 'home'` and `localStorage` flag | **PASS** |

---

## 4. Visual Evidence at 360px Viewport

Before and after screenshots were captured at exact mobile 360px width (`360x740`, `deviceScaleFactor: 2`, `mobile: true`) via Chrome DevTools Protocol.

### Before vs After Comparisons:
- **Beranda:**
  - Before: `screenshots/before-audit-home-360px.png` (139 words)
  - After: `screenshots/after-audit-home-360px.png` (105 words)
- **Emosi:**
  - Before: `screenshots/before-audit-emo-360px.png` (99 words)
  - After: `screenshots/after-audit-emo-360px.png` (32 words)
- **Uang:**
  - Before: `screenshots/before-audit-money-360px.png` (81 words)
  - After: `screenshots/after-audit-money-360px.png` (43 words)
- **Kita:**
  - Before: `screenshots/before-audit-us-360px.png` (487 words)
  - After: `screenshots/after-audit-us-360px.png` (234 words)
- **Saya:**
  - Before: `screenshots/before-audit-me-360px.png` (690 words)
  - After: `screenshots/after-audit-me-360px.png` (236 words)
