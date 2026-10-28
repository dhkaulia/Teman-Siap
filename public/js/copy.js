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
    'Menyiapkan ruang tenangmu sebentar…',
    'Menyusun catatan dengan rapi…',
    'Tarik napas santai sejenak…',
    'Menghubungkan catatan pribadimu…',
    'Menyirami tunas kecil di taman…',
    'Menyelaraskan langkah hari ini…',
    'Beri tubuhmu jeda sejenak yuk…',
    'Membuka halaman berikutnya pelan-pelan…',
    'Menyimpan refleksi hatimu dengan aman…',
    'Merapikan sudut beranda…',
    'Hembuskan napas panjang dengan lembut…',
    'Semuanya tersimpan aman di perangkatmu…',
    'Sedang menyiapkan bahan obrolan santai…',
    'Menata pot tanaman baru…',
    'Menyiapkan kartu refleksi buat kalian…',
    'Mengumpulkan benih yang kamu rawat…',
    'Tenangkan pikiran, semua berjalan baik…',
    'Sebentar ya, ruang amanmu sedang dibuka…',
    'Langkah kecilmu sedang dicatat…',
    'Santai aja, nikmati proses belajarmu…'
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
    triggerLink: 'Ini terasa tidak nyaman',
    screenTag: 'Ruang Aman',
    optionalBadge: 'Latihan Opsional',
    title: 'Ruang Aman Tanpa Paksaan',
    description: 'Bebas jeda kapan saja. Kamu memegang kendali penuh.',
    breathingCardTitle: 'Butuh Tenangkan Tubuh?',
    breathingCardDesc: 'Jeda 1 menit napas rileks.',
    breathingBtn: 'Mulai Latihan Napas Tenang →',
    hotlineCardTitle: 'Butuh Teman Bicara?',
    hotlineCardDesc: 'Layanan profesional manusia siap membantu:',
    disclaimer: 'Aplikasi ini adalah sarana edukasi mandiri, bukan layanan konseling klinis atau penasihat keuangan darurat.',
    returnBtn: '← Kembali ke Halaman Sebelumnya'
  },

  // -------------------------------------------------------------
  // 5. Screen: Home (Beranda)
  // -------------------------------------------------------------
  home: {
    heroTag: 'Langkah Hari Ini',
    defaultTitle: 'Sapa Perasaanmu',
    defaultPromise: 'Mengenali apa yang kamu rasakan hari ini.',
    heroBtn: 'Mulai Sekarang',
    weeklyBadge: 'Minggu ini:',
    weeklyEncouragementZero: 'Minggu ini kamu sudah berlatih 0 kali. Luangkan satu langkah santai.',
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
    title: 'Emosi',
    subtitle: 'Sapa perasaanmu dengan tenang tanpa penghakiman.',
    level1Tag: 'Tingkat 1',
    level1Title: 'Sapa Perasaanmu',
    level1Subtitle: 'Pilih satu emosi di hatimu saat ini:',
    level1Empty: 'Belum ada emosi yang dipilih. Ketuk salah satu kartu di atas yuk.',
    level2Tag: 'Tingkat 2',
    level2Title: 'Raba Sensasi Tubuhmu',
    level2Subtitle: 'Sensasi fisik apa yang kamu sadari saat ini?',
    level3Tag: 'Tingkat 3',
    level3Title: 'Latihan Jeda Menenangkan',
    level3Subtitle: 'Beri tubuhmu ruang aman merilekskan saraf.',
    historyTag: 'Catatan Hari Ini',
    historyTitle: 'Riwayat Emosi Hari Ini',
    historyEmpty: 'Belum ada cek emosi tersimpan hari ini.'
  },

  // -------------------------------------------------------------
  // 7. Screen: Uang (Keuangan Sadar)
  // -------------------------------------------------------------
  uang: {
    tag: 'Keuangan Sadar',
    title: 'Uang',
    subtitle: 'Catatan belanja sadar tanpa rasa bersalah.',
    hubTitle: 'Tercatat bulan ini',
    hubCaption: 'Catatan sadar, bukan saldo bank',
    hubEmpty: 'Belum ada catatan bulan ini.',
    logBtn: '+ Catat Pengeluaran',
    afterSaveBubble: 'Tersimpan rapi.',
    optionalStoryTitle: 'Cerita di Balik Catatan',
    optionalStorySubtitle: 'Pilihan opsional memahami alasan pengeluaran:',
    urgeCardTitle: 'Jeda Belanja',
    urgeCardDesc: 'Tunda dorongan belanja 10 menit.',
    urgeWavePrompt: 'Seberapa kuat dorongan belanja saat ini?',
    goalCardTitle: 'Tujuan Tabungan',
    goalCardDesc: 'Impian bersama yang bermakna.',
    goalEmpty: 'Belum ada tujuan tabungan aktif.',
    planCardTitle: 'Rencana Jika-Maka',
    planCardDesc: 'Respon otomatis sebelum godaan muncul.',
    planEmpty: 'Belum ada rencana jika-maka aktif.'
  },

  // -------------------------------------------------------------
  // 8. Screen: Kita (Relasi, Taman Bersama & Love Maps)
  // -------------------------------------------------------------
  kita: {
    tag: 'Pilar Relasi',
    title: 'Kita',
    subtitle: 'Melatih mendengar dan bernegosiasi berdua dengan tenang.',
    tamanKitaTitle: 'Taman Kita',
    tamanKitaBadge: 'Ruang Bersama',
    tamanKitaCaption: 'Tumbuh bersama tanpa kompetisi.',
    perspectiveLabel: 'Sedang mengisi sebagai:',
    switchPerspectiveBtn: 'Ganti Giliran',
    editNamesBtn: 'Ubah Nama',
    colekTag: 'Saran',
    colekPrompt: (name) => `Mau ajak ${name} mencoba satu percakapan berdua?`,
    colekDesc: 'Cukup 5 menit duduk bersama tanpa tekanan.',
    colekAccept: 'Pilih Topik Percakapan',
    colekLater: 'Nanti saja',
    loveMapsTag: 'Game Berdua',
    loveMapsTitle: 'Kuis Saling Kenal',
    loveMapsDesc: 'Tebak dunia batin pasanganmu dengan hangat.',
    loveMapsStartBtn: 'Mulai Kuis (Satu Ponsel) →',
    deckTitle: 'Kartu Percakapan Berdua',
    deckSubtitle: 'Pilih topik dan balik kartu untuk melihat tips Gottman',
    deckTipBtn: 'Intip Tips Gottman',
    deckBackBtn: 'Kembali ke Topik',
    deckStartBtn: 'Mulai Percakapan →',
    handoverTitle: (name) => `Serahkan Ponsel ke ${name}`,
    handoverSubtitle: (nameA, nameB) => `Jawaban ${nameA} tersimpan aman.<br>Giliran ${nameB} menjawab mandiri.`,
    handoverCountdown: (sec) => `Tombol aktif dalam ${sec} detik…`,
    handoverReady: (name) => `Saya ${name}, Siap Mulai →`,
    revealSharedTitle: 'Jawaban Siap Dibuka Berdua',
    revealSharedSubtitle: 'Duduk berdampingan dan buka bersama dengan tenang.',
    revealPrivateTitle: 'Satu jawaban tetap pribadi. Itu tidak apa-apa.',
    revealPrivateSubtitle: 'Menjaga rasa aman adalah hak setiap individu.',
    revealPrivateNotice: 'Kalian tetap dapat melanjutkan obrolan santai.'
  },

  // -------------------------------------------------------------
  // 9. Screen: Saya (Profil, Privasi & Pengaturan)
  // -------------------------------------------------------------
  saya: {
    tag: 'Privasi & Perjalanan',
    title: 'Ruang Saya',
    subtitle: 'Ruang belajar mandiri tanpa penilaian.',
    companionTitle: 'Teman Belajar: Tunas',
    kebunTitle: 'Kebun Saya',
    kebunTag: 'Privat',
    kebunDesc: 'Ruang aman proses belajarmu sendiri.',
    ritmeTitle: 'Target & Ritme Mingguan',
    ritmeTag: 'Tanpa Tekanan',
    ritmeDesc: 'Ritme mingguan santai dengan libur otomatis.',
    ritmeLiburBadge: (n) => `Libur otomatis: ${n} pekan tersisa bulan ini.`,
    ritmeExplanation: 'Jika suatu pekan terasa padat, 2 libur otomatis per bulan menjaga ritmemu tetap aman.',
    ritmeNeutralReset: 'Mulai lagi kapan saja, tamanmu tetap ada.',
    ritmeDisabledText: 'Pelacak ritme mingguan sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.',
    koleksiTitle: 'Koleksi Taman & Benih',
    koleksiDesc: 'Benih merawat Tunas dan mempercantik taman.',
    koleksiDisabledText: 'Sistem hadiah Benih dan kosmetik taman sedang dinonaktifkan. Kamu dapat mengaktifkannya kembali di bagian Pengaturan di bawah.',
    historyTitle: 'Riwayat Latihan Pribadi',
    historyTag: 'Proses Nyata',
    settingsTitle: 'Preferensi & Pengaturan',
    settingsTag: 'Pengaturan',
    toggleRitmeTitle: 'Lacak ritme mingguan',
    toggleRitmeHint: 'Hitungan mingguan santai dengan perlindungan libur.',
    toggleRewardsTitle: 'Sistem Benih & kosmetik taman',
    toggleRewardsHint: 'Kumpulkan benih dari latihan untuk Tunas.',
    toggleFaithTitle: 'Tampilkan sudut pandang nilai iman',
    toggleFaithHint: 'Sertakan perspektif nilai keimanan dalam latihan.',
    privacyTitle: 'Kedaulatan Data & Privasi',
    privacyTag: 'Lokal',
    privacyDesc: 'Seluruh catatan tersimpan aman di browsermu.',
    exportBtn: 'Unduh Cadangan (JSON)',
    wipeBtn: 'Hapus Semua Data',
    wipeConfirm: 'Apakah kamu yakin ingin menghapus seluruh data di perangkat ini? Tindakan ini tidak dapat dibatalkan.'
  },

  // -------------------------------------------------------------
  // 10. Screen: Onboarding
  // -------------------------------------------------------------
  onboarding: {
    step1Title: 'Persiapan Menikah yang Tenang',
    step1Tag: 'Ruang Mandiri',
    step1Desc: 'Bukan sekadar checklist pesta pernikahan, Teman Siap membantumu dan pasangan melatih ketenangan batin, keterbukaan soal uang, dan obrolan jujur di satu ponsel.',
    step1Privacy: 'Tanpa perlu akun, tanpa iklan, dan seluruh catatanmu tersimpan aman di perangkatmu sendiri.',
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
    step5Desc: 'Terima kasih sudah meluangkan waktu sejenak untuk dirimu hari ini. Bersiap untuk masa depan tidak perlu terburu-buru atau sempurna. Cukup satu langkah kecil yang bermakna setiap harinya.',
    step5GoalTitle: 'Target Ritme Mingguan',
    step5GoalQuestion: 'Berapa kali kamu ingin berlatih dalam sepekan?',
    step5GoalHint: 'Pilih ritme yang paling nyaman untukmu saat ini. Kamu dapat mengubahnya kapan saja di Ruang Saya.',
    step5PrivacyNote: 'Catatan Privasi: Seluruh refleksi dan catatanmu disimpan aman di perangkatmu sendiri. Kami tidak meminta email atau kata sandi.',
    step5EnterBtn: 'Masuk ke Beranda'
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
