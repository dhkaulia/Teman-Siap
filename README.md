# Teman Siap (MVP Prototype)
> *Pahami dirimu. Pahami uangmu. Bangun masa depan lebih tenang bersama.*

Teman Siap adalah aplikasi web ramah-pemula (mobile-first & local-first) yang memadukan kesadaran emosional, kebiasaan finansial sehat tanpa rasa bersalah, dan persiapan komunikasi pernikahan untuk masyarakat Indonesia.

---

## 🚀 Cara Menjalankan

Aplikasi ini menggunakan **zero-dependency vanilla architecture** (hanya memerlukan Node.js 18+):

```bash
# Jalankan server statis (melayani berkas dari /public)
node serve.js
```
Lalu buka di browser: **[http://localhost:3000](http://localhost:3000)**.

Untuk menginspeksi berkas draf bantuan krisis dalam mode review pengembang, tambahkan parameter `?dev=1`:  
**[http://localhost:3000?dev=1](http://localhost:3000?dev=1)**

---

## 📊 Status Implementasi & Pengujian

### Yang Sudah Teruji Secara Teknis
- **Server Statis Mandiri (`serve.js`):** Melayani berkas khusus dari direktori `/public` dengan proteksi ketat terhadap *path traversal*, penanganan tipe MIME lengkap, dan halaman 404 khusus.
- **Tampilan Mobile-First:** Dirancang untuk dimensi dasar 360x740 (hingga 480px di desktop), menggunakan viewport `100dvh`, perlindungan *safe-area-inset* atas dan bawah.
- **Zona Jempol & Aksesibilitas Sentuh:** Tombol aksi utama berada di sepertiga bawah layar (thumb zone) dengan target sentuh minimal 48x48px dan jarak antarelemen minimal 8px.
- **Perlindungan Keyboard Ponsel:** Event `focusin` dan `visualViewport` otomatis menggulir kolom isian ke tengah layar agar tidak tertutup keyboard virtual.
- **Kedaulatan Data Lokal (Local-First):** Seluruh data tersimpan di `localStorage` peramban pengguna; tidak ada data yang dikirim ke server pihak ketiga. Pengguna dapat mengunduh cadangan JSON atau menghapus seluruh data kapan saja.
- **Tanpa Data Palsu (Zero Fake Data):** Pengguna baru memulai dengan status bersih tanpa nominal fiktif, tanpa saldo tabungan rekaan, dan tanpa rencana otomatis yang tidak dibuat pengguna.
- **Pemisahan Perspektif Nilai Iman:** Seluruh materi menggunakan bahasa universal netral secara bawaan. Perspektif nilai keimanan (*sabar*, *syukur*, *qana'ah*) berada di balik pengaturan opt-in di menu "Saya" (default: non-aktif).
- **Simulator Komunikasi Pasangan:** Mendukung simulasi dua sudut pandang (*Partner A* dan *Partner B*) dengan mekanisme *consent-based reveal* (jawaban tetap privat sampai kedua belah pihak memberi izin).

### Yang Memerlukan Tinjauan Profesional (Lihat `REVIEW.md`)
- **Kontak Darurat & Hotline:** Daftar kontak bantuan krisis di `public/support.js` berstatus `verified: false` (`lastVerified: null`) dan hanya dapat dilihat jika `DEV_MODE` aktif. Daftar ini memerlukan konfirmasi institusional sebelum rilis publik.
- **Konten Psikologis & Klinis:** Latihan berbasis DBT, ACT, CBT, dan Gottman Method memerlukan tinjauan klinis oleh psikolog berlisensi sebelum klaim efektivitas diajukan.
- **Materi Keuangan:** Kategori pengeluaran dan panduan pos anggaran memerlukan tinjauan oleh perencana keuangan independen (CFP).
- **Audit Aksesibilitas Formal:** Pengujian langsung dengan pembaca layar (screen reader) pada perangkat fisik Android dan iOS belum dilakukan secara formal.
- **Perangkat Keras Fisik:** Perilaku keyboard virtual pihak ketiga (misal: SwiftKey, Gboard) dan takik layar fisik (*notch / dynamic island*) memerlukan uji coba langsung di berbagai tipe gawai.

---

## 🧭 Fondasi Konseptual

Prototipe ini merujuk pada tiga dokumen kajian pra-nikah Indonesia:
1. **Document A (Bimwin to 'Just Enough'):** Menghubungkan bimbingan pra-nikah dengan pencegahan masalah finansial pasca-nikah, mengedepankan kearifan gotong royong dan hidup secukupnya.
2. **Document B (Ostrich Effect to Prosperity):** Mengatasi kecemasan memeriksa keuangan (*ostrich effect*) dengan merayakan kebiasaan mencatat transaksi, serta teknik *urge surfing* (10 menit jeda belanja) dan rencana jika-maka.
3. **Document C (Digital Therapist Blueprint):** Kurikulum berjenjang dari literasi emosi pemula (DBT), toleransi distres (napas 4-4-6), hingga komunikasi relasi (Gottman Method: *softened startup* dan rasio 5:1).

---

## 📁 Struktur Direktori

```
/
├── public/                  # Berkas publik yang disajikan oleh server
│   ├── index.html           # Shell aplikasi web
│   ├── styles.css           # Desain mobile-first & CSS variables
│   ├── content.js           # Kurikulum emosi, uang, dan percakapan
│   ├── support.js           # Daftar draf kontak krisis (unverified)
│   └── app.js               # Logika aplikasi dan penyimpanan lokal
├── DESIGN.md                # Spesifikasi sistem desain & dial anti-slop
├── REVIEW.md                # Daftar teks klinis, finansial & keselamatan untuk ditinjau
├── README.md                # Dokumentasi proyek & status verifikasi
├── serve.js                 # Server statis lokal aman (Node 18+)
└── package.json             # Konfigurasi proyek
```
