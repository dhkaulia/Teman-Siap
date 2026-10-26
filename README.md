# Teman Siap (MVP Prototype)
> *Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.*

Teman Siap adalah aplikasi web ramah-pemula (mobile-first & local-first) yang memadukan kesadaran emosional, kebiasaan finansial sehat tanpa rasa bersalah, dan persiapan komunikasi pernikahan untuk masyarakat Indonesia.

---

## 🚀 Cara Menjalankan

Aplikasi ini menggunakan **zero-dependency vanilla architecture** (hanya memerlukan Node.js 18+):

```bash
# Jalankan server lokal
node serve.js
```
Lalu buka di browser: **[http://localhost:3000](http://localhost:3000)** (atau buka `index.html` langsung di browser Anda).

---

## 🧭 Fondasi Konseptual & Arsitektur

Prototipe ini mewujudkan sintesis dari **PRD Teman Siap v1.0** serta tiga dokumen riset ilmiah:
1. **Document A (Bimwin to 'Just Enough'):** Mengintegrasikan psikologi dan keuangan untuk pra-nikah di Indonesia (mengatasi penyebab perceraian nomor dua), mengedepankan kearifan lokal (*gotong royong*, *sabr*, dan *syukur / hidup secukupnya*).
2. **Document B (Ostrich Effect to Prosperity):** Mengatasi penghindaran finansial (*ostrich effect*) dengan merayakan kebiasaan mencatat transaksi (bukan besar saldo), serta meredam belanja impulsif (*Compulsive Buying Behavior*) melalui *urge surfing* (berselancar ombak dorongan 10 menit), restrukturisasi kognitif CBT, dan rencana jika-maka (*implementation intentions*).
3. **Document C (Digital Therapist Blueprint):** Kurikulum berjenjang dari kesadaran diri pemula (DBT *Observe & Describe*), toleransi distres (napas 4-4-6 & TIPP), hingga kesiapan relasi (Gottman *Four Horsemen & Antidotes*, Love Maps, rasio 5:1).

---

## 📱 Fitur yang Tersedia di Prototipe Ini

### 1. Onboarding Kilat "Instant Win" (3 Menit)
- Pengenalan nilai & keamanan privasi tanpa perlu registrasi akun atau email.
- Pemilihan tahap hidup (Catin, Tunangan, Pengantin Baru, Menjelajah Diri).
- Cek batin kilat 1 menit untuk memberi kepemilikan psikologis awal secara positif.

### 2. Beranda & Mesin Rekomendasi Terpadu (Notice → Practice)
- Rekomendasi satu langkah berikutnya yang transparan dan tanpa tekanan.
- Pelacak praktik bermakna mingguan (*Weekly Meaningful Practice*) menggantikan sistem *streak* yang memicu kecemasan.
- Akses pintas kilat *Urge Surfing*.

### 3. Pilar Diri: Emosi & Regulasi (Me)
- Cek emosi 8 spektrum lengkap dengan pemetaan sensasi fisik tubuh (DBT *What Skills*).
- Latihan interaktif Napas Sabar 4-4-6 dengan panduan visual lingkaran ritmis.
- Panduan grounding indera (5-4-3-2-1) dan teknik TIPP air dingin.

### 4. Pilar Finansial: Keuangan Sadar (My Money)
- Pencatatan pengeluaran mandiri dengan penanda konteks psikologis (*antecedent tags*: stres kerja, lelah, FOMO diskon, atau terencana).
- Simulator interaktif *Urge Surfing* dengan slider intensitas 1–10, animasi gelombang ombak, penghitung waktu mundur jeda 10 menit, dan kartu restrukturisasi kognitif CBT.
- Tabungan "Cukup" (Sakinah) dengan indikator pencapaian visual.
- Pembangun Rencana Jika-Maka (*If-Then Plans*).

### 5. Pilar Relasi: Percakapan Terpandu & Simulator Pasangan (Us)
- **Dual-Perspective Couple Simulator:** Memungkinkan reviewer menguji sudut pandang **Partner A** dan **Partner B** secara independen.
- **Firewall Privasi Berbasis Persetujuan (*Consent-based Reveal*):** Jawaban pribadi tetap 100% rahasia hingga KEDUA pasangan mencentang persetujuan berbagi.
- **Ruang Temu Bersama:** Membuka komparasi perspektif, pertanyaan pemantik diskusi Gottman, dan pencatatan komitmen bersama.
- Lembar panduan penawar racun komunikasi Gottman (*Four Horsemen & Antidotes*).

### 6. Ruang Saya: Privasi & Layanan Krisis Terverifikasi
- Ringkasan riwayat latihan tanpa skor kematangan yang menghakimi.
- Kendali *local-first*: Unduh cadangan JSON dan Hapus Seluruh Data.
- Daftar kontak darurat resmi Indonesia (SEJIWA 119 ext 8, SAPA 129 KemenPPPA, Yayasan Pulih, Sahabat Rekan Sebaya).

---

## 🎨 Standar Desain Anti-Slop (`DESIGN.md`)
- **Tone:** Hangat, tenang, bersahabat, menghargai proses, non-judgmental.
- **Palet Semantik:** Deep Botanical Teal (`#1B5E59`), Warm Saffron (`#D97706`), Relational Plum (`#6B4E71`), Organic Canvas Sand (`#F4F6F5`).
- **Aksessibilitas:** Kontras teks di atas 5.5:1 (melebihi WCAG 2.1 AA), target sentuh minimal 48px, dan dukungan preferensi *reduced-motion*.
