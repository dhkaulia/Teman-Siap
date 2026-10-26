/**
 * Teman Siap — Central Copy & Voice Engine
 * 
 * Voice Guidelines:
 * - Like a calm, slightly witty friend ("teman yang tenang dan sedikit jenaka").
 * - Short sentences; warm address using "kamu"; never patronizing or preachy.
 * - Everyday natural Indonesian ("yuk", "santai aja", "nggak apa-apa") without being childish.
 * - Sentence case throughout.
 * - Active voice; buttons are active verbs ("Mulai", "Simpan", "Lanjut", "Coba lagi").
 * - Errors explain what happened and how to fix it gently.
 * - Empty states warmly invite action.
 * - Zero guilt, zero pressure, zero urgency.
 * - BANNED: zero urgency, zero shame, zero loss-framing.
 */

export const COPY = {
  // -------------------------------------------------------------
  // 1. Mascot Reaction Lines (30+ lines grouped by state)
  // -------------------------------------------------------------
  mascot: {
    cheer: [
      'Keren, satu langkah kecil hari ini selesai!',
      'Mantap, kamu meluangkan waktu buat dirimu.',
      'Langkah kecil yang nyata. Bangga sama kamu!',
      'Asyik, tunas kecilmu makin segar!',
      'Satu tarikan napas lebih lega hari ini.',
      'Pelan tapi pasti, kamu hebat!',
      'Senang melihatmu berproses hari ini.',
      'Proses nyata jauh lebih berharga dari sekadar sempurna.',
      'Satu catatan sadar lagi hari ini. Keren!'
    ],
    hug: [
      'Nggak apa-apa, semua perasaan boleh hadir di sini.',
      'Tarik napas dulu, kamu nggak sendirian kok.',
      'Hari yang melelahkan ya? Istirahat sejenak yuk.',
      'Peluk hangat buat hatimu yang lagi penat.',
      'Terima kasih sudah mau jujur sama perasaanmu.',
      'Pelan-pelan aja, kita lewati sama-sama.',
      'Nggak perlu buru-buru merasa baikan, santai aja.',
      'Kamu sudah bertahan sejauh ini, luar biasa.'
    ],
    sleepy: [
      'Halo lagi! Senang kamu mampir ke sini.',
      'Selamat datang kembali, santai aja yuk.',
      'Tamanmu tetap tenang menunggumu di sini.',
      'Rehat itu perlu. Siap lanjut satu langkah santai?',
      'Yuk mulai pelan-pelan lagi kapan pun kamu siap.',
      'Pintu selalu terbuka buatmu kapan saja.',
      'Semuanya tetap aman menunggumu kembali.'
    ],
    calm: [
      'Lepaskan ketegangan di kedua pundakmu perlahan.',
      'Rasakan udara sejuk yang mengalir masuk dan keluar.',
      'Hening sejenak, nikmati momen damai saat ini.',
      'Tubuhmu berhak beristirahat dengan tenang.',
      'Satu tarikan napas lembut untuk menenangkan pikiran.',
      'Beri ruang lapang di dalam dadamu.',
      'Santai aja, biarkan tubuhmu kembali rileks.'
    ]
  },

  // -------------------------------------------------------------
  // 2. Loading, Transition & Breather Lines (20+ lines)
  // -------------------------------------------------------------
  loading: [
    'Menyiapkan ruang tenangmu sebentar...',
    'Menyusun catatan dengan rapi...',
    'Tarik napas santai sejenak...',
    'Menghubungkan catatan pribadimu...',
    'Menyirami tunas kecil di taman...',
    'Menyelaraskan langkah hari ini...',
    'Beri tubuhmu jeda sejenak yuk...',
    'Membuka halaman berikutnya pelan-pelan...',
    'Menyimpan refleksi hatimu dengan aman...',
    'Merapikan sudut beranda...',
    'Hembuskan napas panjang dengan lembut...',
    'Semuanya tersimpan aman di perangkatmu...',
    'Sedang menyiapkan bahan obrolan santai...',
    'Menata pot tanaman baru...',
    'Menyiapkan kartu refleksi buat kalian...',
    'Mengumpulkan benih yang kamu rawat...',
    'Tenangkan pikiran, semua berjalan baik...',
    'Sebentar ya, ruang amanmu sedang dibuka...',
    'Langkah kecilmu sedang dicatat...',
    'Santai aja, nikmati proses belajarmu...'
  ],

  // -------------------------------------------------------------
  // 3. Navigation & Common Action Buttons
  // -------------------------------------------------------------
  nav: {
    home: 'Beranda',
    emosi: 'Emosi',
    uang: 'Uang',
    kita: 'Kita',
    saya: 'Saya'
  },

  actions: {
    start: 'Mulai',
    continue: 'Lanjut',
    save: 'Simpan',
    cancel: 'Batal',
    back: 'Kembali',
    close: 'Tutup',
    delete: 'Hapus',
    retry: 'Coba lagi',
    download: 'Unduh Cadangan',
    skip: 'Lewati',
    check: 'Periksa',
    equip: 'Pakai',
    equipped: 'Dipakai ✓',
    get: 'Dapatkan',
    share: 'Bagikan',
    keepPrivate: 'Simpan untuk Saya Saja',
    understand: 'Paham & Lanjut'
  },

  // -------------------------------------------------------------
  // 4. Safety & Ruang Aman
  // -------------------------------------------------------------
  safety: {
    triggerLink: '🛡️ Ini terasa tidak nyaman',
    screenTag: 'Ruang Aman',
    optionalBadge: 'Latihan Opsional',
    title: 'Tidak ada paksaan dalam latihan ini.',
    description: 'Sangat wajar jika sebuah topik atau pertanyaan terasa berat, memicu cemas, atau bikin lelah. Hubungan yang sehat selalu memberi ruang untuk jeda. Kamu dan pasangan bebas berhenti kapan saja tanpa rasa bersalah atau terbebani.',
    breathingCardTitle: '🌿 Butuh Menenangkan Tubuh?',
    breathingCardDesc: 'Ambil jeda 1 menit dengan latihan pernapasan santai 4-4-6 untuk menstabilkan detak jantung.',
    breathingBtn: 'Mulai Latihan Napas Tenang →',
    hotlineCardTitle: '📞 Butuh Dukungan Manusia?',
    hotlineCardDesc: 'Jika kamu merasa sangat tertekan atau butuh teman bicara yang netral, layanan profesional manusia berikut siap membantu:',
    disclaimer: 'Aplikasi ini adalah sarana edukasi mandiri, bukan layanan konseling klinis atau penasihat keuangan darurat.',
    returnBtn: '← Kembali ke Halaman Sebelumnya'
  },

  // -------------------------------------------------------------
  // 5. Screen: Home (Beranda)
  // -------------------------------------------------------------
  home: {
    heroTag: 'Langkah Hari Ini ✨',
    defaultTitle: 'Sapa Perasaanmu',
    defaultPromise: 'Mengenali apa yang kamu rasakan hari ini.',
    heroBtn: 'Mulai Sekarang',
    weeklyBadge: 'Minggu ini:',
    weeklyEncouragementZero: 'Minggu ini kamu sudah berlatih 0 kali. Luangkan satu langkah santai hari ini.',
    weeklyEncouragementCount: (n) => `Minggu ini kamu sudah berlatih ${n} kali.`,
    tunasBadge: 'Tunas:',
    seedsBadge: 'Benih',
    emptyPath: 'Materi kurikulum sedang disiapkan. Mulai dari satu langkah di atas yuk.'
  },

  // -------------------------------------------------------------
  // 6. Screen: Emosi (Jurnal & Regulasi Diri)
  // -------------------------------------------------------------
  emosi: {
    tag: 'Regulasi Mandiri',
    title: 'Jurnal & Regulasi Emosi',
    subtitle: 'Sapa apa yang sedang kamu rasakan tanpa perlu dihakimi. Semua perasaan punya pesan penting untuk didengarkan.',
    level1Tag: 'Tingkat 1 • Kenali',
    level1Title: 'Sapa Perasaanmu',
    level1Subtitle: 'Pilih satu emosi yang paling dominan di hatimu saat ini:',
    level1Empty: 'Belum ada emosi yang dipilih. Ketuk salah satu kartu di atas yuk.',
    level2Tag: 'Tingkat 2 • Raba Tubuh',
    level2Title: 'Di Mana Tubuhmu Merasakannya?',
    level2Subtitle: 'Sensasi fisik apa yang sedang kamu sadari saat ini? Boleh pilih lebih dari satu:',
    level3Tag: 'Tingkat 3 • Regulasi',
    level3Title: 'Latihan Jeda Menenangkan',
    level3Subtitle: 'Beri tubuhmu ruang aman untuk merilekskan sistem saraf secara alami:',
    historyTag: 'Catatan Hari Ini',
    historyTitle: 'Riwayat Emosi Hari Ini',
    historyEmpty: 'Belum ada cek emosi tersimpan hari ini. Ketuk tombol di bawah untuk mulai menyapa dirimu.'
  },

  // -------------------------------------------------------------
  // 7. Screen: Uang (Keuangan Sadar)
  // -------------------------------------------------------------
  uang: {
    tag: 'Keuangan Berkesadaran',
    title: 'Uang & Rasa Aman',
    subtitle: 'Bukan saldo bank, ini ruang jujur untuk melihat kebiasaan belanjamu dengan tenang tanpa rasa bersalah.',
    hubTitle: 'Tercatat bulan ini',
    hubCaption: 'Dari catatan sadarmu, bukan saldo bank',
    hubEmpty: 'Belum ada catatan bulan ini. Mulai dari satu pengeluaran kecil yuk.',
    logBtn: '+ Catat Pengeluaran',
    afterSaveBubble: 'Tersimpan rapi.',
    optionalStoryTitle: 'Mau cerita sedikit?',
    optionalStorySubtitle: 'Pilihan opsional untuk memahami alasan di balik pengeluaran ini:',
    urgeCardTitle: 'Jeda Belanja (Urge Surfing) 🌊',
    urgeCardDesc: 'Melatih menunda dorongan impulsif dengan ombak hening 10 menit.',
    urgeWavePrompt: 'Seberapa kuat dorongannya? Geser ombak untuk menentukan:',
    goalCardTitle: 'Tujuan Tabungan Bersama 🎯',
    goalCardDesc: 'Satu tabungan yang jelas dan punya makna emosional bagi kalian berdua.',
    goalEmpty: 'Belum ada tujuan tabungan aktif. Yuk rumuskan satu impian bersama.',
    planCardTitle: 'Rencana Jika-Maka 📋',
    planCardDesc: 'Menyiapkan respon otomatis sebelum godaan belanja hadir.',
    planEmpty: 'Belum ada rencana jika-maka aktif. Pilih salah satu contoh rencana yuk.'
  },

  // -------------------------------------------------------------
  // 8. Screen: Kita (Relasi, Taman Bersama & Love Maps)
  // -------------------------------------------------------------
  kita: {
    tag: 'Pilar Relasi',
    title: 'Kita & Komunikasi',
    subtitle: 'Persiapan pernikahan bukan memaksakan kesamaan instan, tapi melatih cara mendengar dan bernegosiasi secara aman di satu ponsel.',
    tamanKitaTitle: 'Taman Kita 🌸',
    tamanKitaBadge: 'Ruang Bersama',
    tamanKitaCaption: 'Taman tumbuh saat masing-masing berproses. Tidak ada yang lebih cepat atau lambat; kalian merawat ruang ini bersama-sama tanpa kompetisi.',
    perspectiveLabel: 'Sedang mengisi sebagai:',
    switchPerspectiveBtn: 'Ganti Giliran 🔄',
    editNamesBtn: 'Ubah Nama ✏️',
    colekTag: 'Saran Santai Hari Ini',
    colekPrompt: (name) => `Mau ajak ${name} mencoba satu percakapan berdua?`,
    colekDesc: 'Cukup 5 menit santai saat kalian sedang duduk bersama. Tanpa paksaan dan tanpa tekanan.',
    colekAccept: 'Pilih Topik Percakapan ✨',
    colekLater: 'Nanti saja',
    loveMapsTag: 'Game Berdua • Love Maps',
    loveMapsTitle: 'Kuis Saling Kenal (Peta Cinta) 🌸',
    loveMapsDesc: 'Jawab pertanyaan tentang dirimu, lalu tebak jawaban pasanganmu! Tanpa penilaian atau perbandingan—hanya cara hangat menemukan hal baru tentang dunia batin masing-masing.',
    loveMapsStartBtn: 'Mulai Kuis Saling Kenal (Satu Ponsel) →',
    deckTitle: 'Kartu Percakapan Berdua',
    deckSubtitle: 'Pilih topik dan balik kartu untuk melihat tips Gottman',
    deckTipBtn: 'Intip Tips Gottman 🔄',
    deckBackBtn: 'Kembali ke Topik 🔄',
    deckStartBtn: 'Mulai Percakapan (Satu Ponsel) →',
    handoverTitle: (name) => `Serahkan Ponsel ke ${name}`,
    handoverSubtitle: (nameA, nameB) => `Jawaban ${nameA} telah tersimpan aman dan tersembunyi.<br>Beri ruang bagi ${nameB} untuk membaca dan menjawab secara mandiri.`,
    handoverCountdown: (sec) => `Tombol aktif dalam ${sec} detik...`,
    handoverReady: (name) => `Saya ${name}, Siap Mulai →`,
    revealSharedTitle: 'Jawaban Siap Dibuka Berdua',
    revealSharedSubtitle: 'Kalian berdua memilih untuk saling berbagi. Duduklah berdampingan, lalu buka kartu satu per satu dengan tenang.',
    revealPrivateTitle: 'Satu jawaban tetap pribadi. Itu tidak apa-apa.',
    revealPrivateSubtitle: 'Menjaga batas kenyamanan dan rasa aman adalah bagian penting dari hubungan yang sehat. Jawaban yang disimpan untuk diri sendiri tetap dirahasiakan sepenuhnya.',
    revealPrivateNotice: 'Kalian tetap dapat melanjutkan ke pertanyaan diskusi bersama untuk melatih komunikasi terbuka secara santai.',
    remoteInviteTitle: '🔗 Hubungkan Dua Ponsel',
    remoteInviteTag: 'Segera Hadir',
    remoteInviteDesc: 'Sedang LDR atau ingin mengisi dari ponsel masing-masing? Fitur sinkronisasi privat jarak jauh sedang disiapkan.',
    remoteInviteE2EE: '🔒 Berbasis Enkripsi Ujung-ke-Ujung (E2EE) — Server hanya meneruskan data terenkripsi dan tidak pernah bisa membaca isi percakapan kalian.',
    remoteInviteBtn: 'Lihat Cara Kerja & Desain Keamanan →'
  },

  // -------------------------------------------------------------
  // 9. Screen: Saya (Profil, Privasi & Pengaturan)
  // -------------------------------------------------------------
  saya: {
    tag: 'Privasi & Perjalanan',
    title: 'Ruang Saya',
    subtitle: 'Teman Siap tidak memberi nilai atau label kelayakan menikah. Setiap latihan adalah proses belajar mandiri yang damai.',
    companionTitle: 'Teman Belajar: Tunas',
    kebunTitle: 'Kebun Saya 🌸',
    kebunTag: 'Privat',
    kebunDesc: 'Tanda jejak proses pribadimu. Tidak ada fitur berbagi ke publik atau papan peringkat; ini adalah ruang aman bagi proses belajarmu sendiri.',
    ritmeTitle: 'Target & Ritme Mingguan 🌿',
    ritmeTag: 'Tanpa Tekanan',
    ritmeDesc: 'Teman Siap melacak ritme mingguan santai, bukan streak harian yang membebani. Kamu dapat memilih target pekanan yang paling sesuai.',
    ritmeLiburBadge: (n) => `🛡️ Perlindungan libur otomatis: ${n} pekan tersisa bulan ini.`,
    ritmeExplanation: 'Jika suatu pekan terasa padat, 2 libur otomatis per bulan akan menjaga ritmemu tetap aman. Bila terlewat, ritme beristirahat secara netral tanpa mengurangi benih atau fase pertumbuhan.',
    ritmeNeutralReset: 'Mulai lagi kapan saja, tamanmu tetap ada.',
    ritmeDisabledText: 'Pelacak ritme mingguan sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.',
    koleksiTitle: 'Koleksi Taman & Benih 🌱',
    koleksiDesc: 'Benih diperoleh dari menyelesaikan latihan, khusus untuk merawat Tunas dan mempercantik taman. Benih tidak pernah kedaluwarsa dan tidak pernah dibutuhkan untuk membuka materi belajar.',
    koleksiDisabledText: 'Sistem hadiah Benih dan kosmetik taman sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.',
    historyTitle: 'Riwayat Latihan Pribadi',
    historyTag: 'Proses Nyata',
    settingsTitle: 'Preferensi & Pengaturan',
    settingsTag: 'Pengaturan',
    toggleRitmeTitle: 'Lacak ritme mingguan',
    toggleRitmeHint: 'Menampilkan hitungan ritme mingguan santai dengan perlindungan libur otomatis. Matikan jika kamu memilih belajar tanpa pelacak ritme sama sekali.',
    toggleRewardsTitle: 'Sistem Benih & kosmetik taman',
    toggleRewardsHint: 'Mengumpulkan benih dari latihan untuk merawat Tunas dan mempercantik taman. Matikan jika kamu memilih pengalaman minimalis tanpa sistem hadiah.',
    toggleFaithTitle: 'Tampilkan sudut pandang nilai iman',
    toggleFaithHint: 'Menyertakan perspektif nilai keimanan (seperti sabar, syukur, dan qana\'ah) di dalam latihan dan refleksi. Default non-aktif.',
    privacyTitle: 'Kedaulatan Data & Privasi',
    privacyTag: 'Local-First',
    privacyDesc: 'Semua catatan jurnal, nominal uang, dan refleksi batinmu tersimpan secara lokal di browsermu. Tidak ada data yang dikirim ke server pihak ketiga.',
    exportBtn: 'Unduh Cadangan (JSON) 📥',
    wipeBtn: 'Hapus Semua Data 🗑️',
    wipeConfirm: 'Apakah kamu yakin ingin menghapus seluruh data di perangkat ini? Tindakan ini tidak dapat dibatalkan.'
  },

  // -------------------------------------------------------------
  // 10. Screen: Onboarding
  // -------------------------------------------------------------
  onboarding: {
    step1Title: 'Persiapan Menikah yang Tenang',
    step1Tag: 'Ruang Mandiri',
    step1Desc: 'Bukan sekadar checklist pesta pernikahan, Teman Siap membantumu dan pasangan melatih ketenangan batin, keterbukaan soal uang, dan obrolan jujur di satu ponsel.',
    step1Privacy: '🔒 Tanpa akun wajib, tanpa iklan, dan seluruh catatanmu tersimpan aman di perangkatmu sendiri.',
    step1StartBtn: 'Mulai Langkah Pertama →',
    step1GuestBtn: 'Lihat-lihat Dulu sebagai Tamu',
    step2Tag: 'Langkah 1 dari 4 • Situasimu',
    step2Title: 'Di fase mana hubungan kalian saat ini?',
    step2Subtitle: 'Jawabanmu membantu kami menyusun saran latihan yang paling pas:',
    step3Tag: 'Langkah 2 dari 4 • Fokus Utama',
    step3Title: 'Apa yang paling ingin kamu latih?',
    step3Subtitle: 'Pilih satu atau lebih yang paling relevan bagimu saat ini. Langkah ini dapat dilewati:',
    step3NextBtn: 'Lanjut ke Latihan Pertama (60 Detik) →',
    step3SkipBtn: 'Lewati untuk sekarang',
    step4Tag: 'Langkah 3 dari 4 • Latihan Pertama',
    step4Title: 'Latihan Pertama: Napas Tenang',
    step4Subtitle: 'Sebelum mulai menjelajah, mari beri tubuhmu jeda sejenak (60 detik). Latihan napas 4-4-6 membantu menstabilkan detak jantung.',
    step4FinishBtn: 'Lanjut ke Langkah Terakhir →',
    step5Title: 'Ruang tenangmu sudah siap.',
    step5Subtitle: 'Selamat datang di Teman Siap.',
    step5Desc: 'Terima kasih sudah meluangkan waktu sejenak untuk dirimu hari ini. Bersiap untuk masa depan tidak harus terburu-buru atau sempurna. Cukup satu langkah kecil yang bermakna setiap harinya.',
    step5GoalTitle: 'Target Ritme Mingguan',
    step5GoalQuestion: 'Berapa kali kamu ingin berlatih dalam sepekan?',
    step5GoalHint: 'Pilih ritme yang paling nyaman untukmu saat ini. Kamu dapat mengubahnya kapan saja di Ruang Saya.',
    step5PrivacyNote: 'Catatan Privasi: Seluruh refleksi dan catatanmu disimpan aman di perangkatmu sendiri. Kami tidak meminta email atau kata sandi.',
    step5EnterBtn: 'Masuk ke Beranda ✨'
  },

  // -------------------------------------------------------------
  // 11. Error & Empty States (Actionable & Reassuring)
  // -------------------------------------------------------------
  errors: {
    offline: 'Koneksi internet sedang tidak tersedia. Tenang, seluruh latihan dan catatanmu tetap berfungsi lancar secara offline.',
    inputEmptyAmount: 'Nominal belum terisi. Masukkan angka pengeluaranmu dulu yuk.',
    inputEmptyText: 'Kolom ini masih kosong. Tulis sepatah dua kata atau ketuk lewati.',
    storageFull: 'Penyimpanan lokal browsermu hampir penuh. Unduh cadangan datamu di Ruang Saya lalu bersihkan riwayat lama.',
    generic: 'Ada sedikit kendala teknis. Muat ulang halaman yuk, seluruh catatanmu tetap aman tersimpan.'
  },

  emptyStates: {
    noExpenses: 'Belum ada catatan pengeluaran bulan ini. Mulai dari satu pengeluaran kecil yuk.',
    noCheckins: 'Belum ada cek emosi hari ini. Yuk luangkan 1 menit untuk sapa kabarmu.',
    noPlans: 'Belum ada rencana jika-maka aktif. Yuk buat satu rencana antisipasi godaan belanja.',
    noCoupleConvos: 'Belum ada percakapan berdua yang selesai. Pilih satu kartu obrolan santai yuk.',
    noMilestones: 'Kebunmu masih berbentuk kuncup kecil. Selesaikan latihan pertamamu untuk melihatnya mekar!'
  },

  // -------------------------------------------------------------
  // 12. Notification Text Drafts (For future opt-in PWA push)
  // (Do not request permission now; drafts for later roadmap)
  // -------------------------------------------------------------
  notifications: [
    {
      id: 'notif-morning',
      title: 'Selamat pagi!',
      body: 'Sempatkan 1 menit buat sapa apa yang kamu rasakan hari ini yuk.'
    },
    {
      id: 'notif-gentle-nudge',
      title: 'Ada waktu luang 2 menit?',
      body: 'Tunas kecilmu di taman sedang menanti satu langkah santai.'
    },
    {
      id: 'notif-weekly-reset',
      title: 'Pekan baru telah tiba',
      body: 'Luangkan langkah kecilmu minggu ini kapan pun kamu merasa siap.'
    },
    {
      id: 'notif-libur-peace',
      title: 'Pekan terasa padat?',
      body: 'Santai aja, libur otomatis melindungi ritmemu agar tetap tenang.'
    },
    {
      id: 'notif-couple-invite',
      title: 'Lagi santai berdua?',
      body: 'Buka satu kartu percakapan hangat yuk untuk saling mengenal lebih dalam.'
    }
  ]
};

/**
 * Returns a random mascot reaction for the given state
 * @param {'cheer'|'hug'|'sleepy'|'calm'} state
 * @returns {string}
 */
export function getMascotLine(state = 'cheer') {
  const lines = COPY.mascot[state] || COPY.mascot.cheer;
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx];
}

/**
 * Returns a random loading / transition line
 * @returns {string}
 */
export function getLoadingLine() {
  const lines = COPY.loading;
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx];
}
