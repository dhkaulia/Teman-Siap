# REVIEW.md — Registry Tinjauan Profesional (Klinis, Finansial, dan Keselamatan)

Dokumen ini mencatat seluruh bagian teks, latihan, kategori finansial, dan rujukan keselamatan dalam basis kode **Teman Siap** yang memerlukan tinjauan oleh tenaga profesional berlisensi sebelum rilis publik (mengacu pada PRD Bagian 13.3 dan 15.4).

Status Saat Ini: **PENDING REVIEW** (Draf untuk purwarupa/evaluasi internal).

---

## 1. Keselamatan & Rujukan Krisis (Safety & Crisis Referrals)

| Berkas | Baris | Komponen / Teks | Kategori Tinjauan | Peran Peninjau yang Dibutuhkan | Status |
|---|---|---|---|---|---|
| `public/support.js` | 6–8 | Penafian hukum dan medis (*Disclaimer*: bukan pengganti diagnosis psikologis klinis atau penasihat keuangan) | Batasan Hukum & Etika | Konsultan Hukum / Spesialis Etika Medis | `PENDING_REVIEW` |
| `public/support.js` | 9–11 | Teks panduan saat krisis darurat (*Crisis Guidance Text*) | Protokol Keselamatan | Psikolog Klinis / Psikiater Konsultan | `PENDING_REVIEW` |
| `public/support.js` | 12–17 | Daftar nomor telepon darurat & organisasi mitra (SEJIWA 119 ext 8, SAPA 129, Yayasan Pulih, LSM Sahabat Rekan Sebaya) | Verifikasi Institusional Kontak | Koordinator Krisis Kesehatan Jiwa | `PENDING_REVIEW` |
| `public/app.js` | 425–440 | Penjelasan mode krisis pengembang (`DEV_MODE`) & penyembunyian nomor sebelum rilis resmi | Keamanan Data & Privasi | Tim Teknis & Spesialis Keamanan Privasi | `PENDING_REVIEW` |

---

## 2. Konten Psikologis & Regulasi Emosi (Clinical & Emotional Regulation)

| Berkas | Baris | Komponen / Teks | Kategori Tinjauan | Peran Peninjau yang Dibutuhkan | Status |
|---|---|---|---|---|---|
| `public/content.js` | 8–17 | Taksonomi 8 emosi dasar dan label deskripsi (*CONTENT.emotions*) | Literasi Emosi (DBT) | Psikolog Klinis Dewasa | `PENDING_REVIEW` |
| `public/content.js` | 20–29 | Daftar sensasi fisik penanda emosi (*CONTENT.bodySensations*: dada berdebar, rahang kaku, dsb.) | Kesadaran Somatik (DBT Observe & Describe) | Psikolog Klinis / Terapis Somatik | `PENDING_REVIEW` |
| `public/content.js` | 32–40 | Kebutuhan dasar emosional (*CONTENT.needs*: istirahat tanpa rasa bersalah, didengarkan, jeda hening) | Validasi Kebutuhan Emosional | Psikolog Klinis | `PENDING_REVIEW` |
| `public/content.js` | 43–57 | Latihan Napas Tenang / Napas Sabar 4-4-6 (*Paced Breathing exercise & clinical detail*) | Toleransi Distres Fisiologis | Psikolog Klinis Terlatih DBT | `PENDING_REVIEW` |
| `public/content.js` | 58–72 | Latihan Jangkar Panca Indera 5-4-3-2-1 (*Sensory Grounding steps & clinical detail*) | Teknik Mindfulness (ACT) | Psikolog Klinis / Mindfulness Practitioner | `PENDING_REVIEW` |
| `public/content.js` | 73–86 | Latihan Sentuhan Air Sejuk (*TIPP Temperature skill*) | Intervensi Darurat Fisiologis | Psikolog Klinis Terlatih DBT | `PENDING_REVIEW` |
| `public/app.js` | 270–305 | Algoritma interaktif ritme napas (4 detik tarik, 4 detik tahan, 6 detik hembus) | Efektivitas Panduan Visual Napas | Psikolog Klinis | `PENDING_REVIEW` |

---

## 3. Psikologi Finansial & Pengendalian Impuls (Financial Behavior & Impulse Management)

| Berkas | Baris | Komponen / Teks | Kategori Tinjauan | Peran Peninjau yang Dibutuhkan | Status |
|---|---|---|---|---|---|
| `public/content.js` | 89–100 | Kategori pengeluaran rumah tangga Indonesia (*CONTENT.categories*, termasuk generasi sandwich) | Alokasi Anggaran Realistis | Perencana Keuangan Independen (CFP) | `PENDING_REVIEW` |
| `public/content.js` | 102–112 | Penanda konteks psikologis belanja (*CONTENT.expenseTags*: stres kerja, FOMO diskon, pelarian) | Perilaku Belanja Kompulsif | Terapis Finansial / Psikolog Perilaku | `PENDING_REVIEW` |
| `public/content.js` | 114–132 | Kartu Restrukturisasi Kognitif Belanja (*CONTENT.cognitiveReframes*: reframing pikiran impulsif) | Restrukturisasi Kognitif (CBT) | Terapis CBT Berlisensi / Psikolog | `PENDING_REVIEW` |
| `public/content.js` | 134–152 | Draf Templat Rencana Jika-Maka (*CONTENT.presetPlans*: implementation intentions) | Pembentukan Kebiasaan (Behavioral Activation) | Psikolog Perilaku | `PENDING_REVIEW` |
| `public/app.js` | 330–365 | Latihan Berselancar Dorongan (*Urge Surfing 10-minute wave timer & slider 1–10*) | Intervensi Impuls (ACT) | Psikolog Klinis / Terapis Perilaku | `PENDING_REVIEW` |

---

## 4. Komunikasi & Relasi Pranikah (Premarital Relationship Communication)

| Berkas | Baris | Komponen / Teks | Kategori Tinjauan | Peran Peninjau yang Dibutuhkan | Status |
|---|---|---|---|---|---|
| `public/content.js` | 154–195 | 4 Topik Percakapan Terpandu Pranikah (*CONTENT.conversations*: rasa aman finansial, bantuan orang tua, uang pribadi, mimpi 3 tahun) | Kesiapan Pernikahan & Komunikasi Finansial | Terapis Perkawinan & Keluarga (MFT) / Konselor KUA | `PENDING_REVIEW` |
| `public/content.js` | 197–202 | Pertanyaan Pemantik Diskusi Bersama (*CONTENT.discussStarters*) | Fasilitasi Percakapan Netral | Konselor Pernikahan | `PENDING_REVIEW` |
| `public/content.js` | 204–230 | Panduan Penawar Racun Komunikasi (*CONTENT.communicationPatterns*: Four Horsemen & Antidotes) | Gottman Method Relationship Skills | Konselor Tersertifikasi Gottman Method | `PENDING_REVIEW` |
| `public/app.js` | 460–510 | Mekanisme Firewall Privasi & Izin Berbagi (*Consent-based Reveal*) | Pencegahan Konflik & Pemaksaan Relasi | Psikolog Relasi / Konselor Pranikah | `PENDING_REVIEW` |

---

## 5. Konteks Budaya & Nilai Keimanan (Cultural & Faith Framing)

| Berkas | Baris | Komponen / Teks | Kategori Tinjauan | Peran Peninjau yang Dibutuhkan | Status |
|---|---|---|---|---|---|
| `public/content.js` | 13, 45, 129 | Integrasi konsep *syukur*, *sabar*, *qana'ah*, dan *sakinah* pada opsi opt-in | Sensitivitas Budaya & Nilai Agama | Pengkaji Budaya Indonesia / Fasilitator Bimwin | `PENDING_REVIEW` |
| `public/app.js` | 65–70, 410–420 | Pengaturan preferensi opt-in "Tampilkan sudut pandang nilai iman" (default: off) | Inklusivitas & Netralitas Platform | Tim Desain Inklusif | `PENDING_REVIEW` |

---

### Alur Tindak Lanjut:
1. Setiap peninjau mencantumkan nama, tanggal tinjauan, dan catatan perubahan spesifik di berkas `public/content.js` atau `public/support.js`.
2. Setelah disetujui secara tertulis, ubah status dari `PENDING_REVIEW` menjadi `APPROVED` beserta nomor versi rilis.
