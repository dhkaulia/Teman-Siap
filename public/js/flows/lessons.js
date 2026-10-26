/**
 * Teman Siap — Lesson Curriculum Content (3 Sample Lessons)
 * 
 * Clinical Review Tag: DRAFT - Menunggu Review Klinis Tim Psikologi & Konselor Pranikah.
 * 
 * Rules:
 * - 6 to 10 tiny steps per lesson, completing in under 2 minutes.
 * - Plain Indonesian language, empathetic and warm, zero jargon on main screens.
 * - Step types: teach, choose, match, order, reflect, doit.
 * - Evidence-based principles: Somatics, Behavioral Economics, Gottman Method.
 */

export const LESSON_NAMING_FEELINGS = {
  id: 'lesson-naming-feelings',
  nodeId: 'node-self-lesson',
  title: 'Menamai Perasaan & Sinyal Tubuh',
  subtitle: 'Mengenali alarm alami tubuh sebelum disadari pikiran',
  duration: '2 menit',
  skills: ['Menamai emosi', 'Membaca sinyal tubuh'],
  clinicalStatus: 'DRAFT',
  clinicalReviewer: 'Menunggu Review Klinis Tim Psikologi',
  clinicalNotes: 'Berdasarkan Somatic Awareness & Teori Polivagal: Menamai sensasi fisik menurunkan reaktivitas amigdala dan merangsang tonus vagal ventrikular untuk ketenangan sadar.',
  steps: [
    {
      id: 'step-teach',
      type: 'teach',
      spot: 'emosi',
      title: 'Sinyal Tubuh Selalu Bicara Dahulu',
      text: 'Emosi selalu mengetuk pintu tubuh sebelum disadari pikiran. Saat cemas, dada menyempit atau napas memendek—itu alarm alami tubuh, bukan kelemahan.'
    },
    {
      id: 'step-choose',
      type: 'choose',
      title: 'Membaca Reaksi Otomatis',
      scenario: 'Pasanganmu mengabarkan rencana pernikahan berubah mendadak. Jantungmu berdegup kencang dan rahangmu mengeras. Sinyal tubuh ini menandakan apa?',
      options: [
        { id: 'opt-a', label: 'Tubuh sedang bersiap menghadapi rasa kaget atau cemas.', isCorrect: true },
        { id: 'opt-b', label: 'Pasti ada yang salah dengan kepribadian saya.', isCorrect: false },
        { id: 'opt-c', label: 'Saya harus segera membalas pesan dengan marah.', isCorrect: false }
      ],
      correctExplanation: 'Tepat sekali! Detak jantung dan rahang yang tegang adalah respon protektif sistem saraf menghadapi ketidakpastian. Menyadari alarm ini membantumu merespons dengan tenang.',
      incorrectExplanation: 'Belum pas. Reaksi fisik itu bukanlah kekurangan dirimu atau tanda harus marah, melainkan respon protektif alami tubuh saat terkejut.'
    },
    {
      id: 'step-match',
      type: 'match',
      title: 'Pasangkan Perasaan & Sensasi Tubuh',
      subtitle: 'Ketuk perasaan di kiri, lalu ketuk sensasi tubuh yang sesuai di kanan.',
      pairs: [
        { left: 'Cemas & Khawatir', right: 'Dada sesak atau napas memendek' },
        { left: 'Marah & Tersinggung', right: 'Rahang mengeras atau tinju mengepal' },
        { left: 'Lelah & Kewalahan', right: 'Pundak terasa berat memikul beban' }
      ],
      explanation: 'Bagus sekali! Mengetahui lokasi sensasi fisik membantu kita mengenali apa yang sedang kita rasakan tanpa perlu panik.'
    },
    {
      id: 'step-reflect',
      type: 'reflect',
      title: 'Refleksi Tubuh Pribadi',
      subtitle: 'Bagian tubuh mana yang paling sering bereaksi pertama kali saat kamu mulai tegang?',
      options: [
        { id: 'ref-dada', label: 'Dada & Napas', icon: '🫁' },
        { id: 'ref-pundak', label: 'Leher & Pundak', icon: '💆' },
        { id: 'ref-perut', label: 'Perut & Pencernaan', icon: '🍃' },
        { id: 'ref-belum', label: 'Belum terlalu menyadari', icon: '🌱' }
      ],
      message: 'Terima kasih atas refleksimu. Mengamati tubuhmu sendiri adalah awal dari ketenangan bersama.'
    },
    {
      id: 'step-order',
      type: 'order',
      title: 'Urutkan Langkah Tenang Saat Memanas',
      subtitle: 'Ketuk langkah-langkah di bawah sesuai urutan yang paling sehat:',
      steps: [
        'Sadari sensasi fisik di tubuh',
        'Beri nama perasaan dengan jujur',
        'Ambil satu napas lambat untuk meredakan ketegangan'
      ],
      explanation: 'Tepat sekali! Menyadari tubuh → Menamai emosi → Mengambil napas adalah urutan ilmiah terbaik untuk mencegah ledakan reaktif.'
    },
    {
      id: 'step-doit',
      type: 'doit',
      actionType: 'breathe',
      title: 'Praktik Mikro: Satu Napas Tenang',
      subtitle: 'Ambil satu tarikan napas tenang 4-4-6 untuk meredakan alarm tubuh sekarang.',
      instruction: 'Tarik napas lembut 4 detik, tahan sejenak 4 detik, lalu hembuskan perlahan 6 detik.',
      promptText: 'Latihan 1 siklus napas sadar'
    }
  ]
};

export const LESSON_URGE_SURFING = {
  id: 'lesson-urge-surfing',
  nodeId: 'node-money-lesson',
  title: 'Jeda Berselancar Ombak Keinginan',
  subtitle: 'Menunda dorongan belanja impulsif hingga surut dengan tenang',
  duration: '2 menit',
  skills: ['Mengenali dorongan impulsif', 'Jeda tenang belanja'],
  clinicalStatus: 'DRAFT',
  clinicalReviewer: 'Menunggu Review Klinis Tim Psikologi',
  clinicalNotes: 'Berdasarkan Teori Urge Surfing Alan Marlatt & Behavioral Finance: Dorongan dopaminergik memuncak dalam 5-10 menit. Jeda attentional meredakan keinginan impulsif tanpa represi diri yang menyiksa.',
  steps: [
    {
      id: 'step-teach',
      type: 'teach',
      spot: 'jeda',
      title: 'Dorongan Belanja Bekerja Seperti Ombak',
      text: 'Dorongan belanja impulsif bekerja seperti ombak di laut. Ia naik, mencapai puncak, lalu pasti surut dalam 10 sampai 15 menit jika tidak langsung dituruti.'
    },
    {
      id: 'step-choose',
      type: 'choose',
      title: 'Menghadapi Godaan Kilat',
      scenario: 'Melihat diskon besar di malam hari, ada dorongan kuat untuk segera membeli barang yang belum dianggarkan. Respon mana yang paling bijak?',
      options: [
        { id: 'opt-a', label: 'Tunggu 10 menit dan amati dorongan itu seperti ombak.', isCorrect: true },
        { id: 'opt-b', label: 'Beli sekarang sebelum promonya habis daripada menyesal.', isCorrect: false },
        { id: 'opt-c', label: 'Marahi diri sendiri karena merasa mudah tergoda.', isCorrect: false }
      ],
      correctExplanation: 'Tepat sekali! Menunda 10 menit memberi ruang bagi pikiran rasional untuk hadir. Gelombang dopamin akan mereda dengan sendirinya.',
      incorrectExplanation: 'Belum pas. Menuruti impuls atau memarahi diri justru memperkuat lingkaran stres. Memberi jeda 10 menit adalah cara paling terbukti.'
    },
    {
      id: 'step-order',
      type: 'order',
      title: 'Urutkan 3 Langkah Berselancar Ombak (Urge Surfing)',
      subtitle: 'Ketuk urutan langkah untuk menenangkan dorongan belanja:',
      steps: [
        'Akui: Sadari dorongan belanja sedang muncul',
        'Jeda: Lepaskan ponsel atau keluar dari keranjang',
        'Bernapas: Tunggu 10 menit hingga ombak mereda'
      ],
      explanation: 'Sempurna! Akui → Jeda → Bernapas memutus otomatisasi belanja impulsif tanpa membuatmu merasa tertekan.'
    },
    {
      id: 'step-match',
      type: 'match',
      title: 'Pasangkan Pemicu Belanja & Kebutuhan Aslinya',
      subtitle: 'Seringkali dorongan belanja hanyalah penyamaran dari kebutuhan batin lain:',
      pairs: [
        { left: 'Belanja saat stres kerja', right: 'Butuh istirahat dan rasa tenang' },
        { left: 'Belanja saat merasa sepi', right: 'Butuh koneksi dan didengarkan' },
        { left: 'Belanja barang mahal mendadak', right: 'Butuh merasa berharga dan diakui' }
      ],
      explanation: 'Tepat sekali! Ketika kita tahu apa yang sebenarnya tubuh kita butuhkan, kita tidak perlu memuaskannya dengan belanja boros.'
    },
    {
      id: 'step-reflect',
      type: 'reflect',
      title: 'Pemicu Belanja Pribadi',
      subtitle: 'Saat dorongan belanja impulsif muncul, perasaan apa yang biasanya paling mendasarinya?',
      options: [
        { id: 'ref-stres', label: 'Stres atau lelah bekerja', icon: '💼' },
        { id: 'ref-bosan', label: 'Bosan mencari hiburan cepat', icon: '📱' },
        { id: 'ref-tren', label: 'Takut ketinggalan tren (FOMO)', icon: '🛍️' },
        { id: 'ref-reward', label: 'Merasa butuh penghargaan diri', icon: '🎁' }
      ],
      message: 'Keren. Menyadari pemicu adalah 80% keberhasilan mengelola pengeluaran sadar.'
    },
    {
      id: 'step-doit',
      type: 'doit',
      actionType: 'sentence',
      title: 'Praktik Mikro: Rencana Jika-Maka',
      subtitle: 'Tuliskan satu rencana Jika-Maka sederhana untuk membentengi tabunganmu:',
      instruction: 'Ketik satu kalimat rencana antisipasi:',
      placeholder: 'Jika muncul dorongan belanja impulsif di atas Rp 100.000, maka saya akan menunggu 24 jam sebelum memutuskan.',
      promptText: 'Komitmen Jika-Maka belanja'
    }
  ]
};

export const LESSON_GOTTMAN_COMPLAINT = {
  id: 'lesson-gottman-complaint',
  nodeId: 'node-fut-vision',
  title: 'Mengubah Kritik Jadi Keluhan Lembut',
  subtitle: 'Metode Gottman: Menyampaikan keresahan tanpa menyerang pribadi pasangan',
  duration: '2 menit',
  skills: ['Komunikasi Gottman', 'Keluhan lembut tanpa menyudutkan'],
  clinicalStatus: 'DRAFT',
  clinicalReviewer: 'Menunggu Review Klinis Tim Psikologi',
  clinicalNotes: 'Berdasarkan Teori Hubungan John Gottman: Softened Startup pada 3 menit awal menentukan 96% keberhasilan dialog konflik pasangan.',
  steps: [
    {
      id: 'step-teach',
      type: 'teach',
      spot: 'kita',
      title: 'Kritik Menyerang vs Keluhan Lembut',
      text: 'Kritik menyerang kepribadian pasangan ("Kamu selalu boros"). Keluhan lembut hanya membicarakan perasaan dan kebutuhan spesifik ("Aku cemas saat tabungan berkurang").'
    },
    {
      id: 'step-choose',
      type: 'choose',
      title: 'Memilih Kalimat yang Menenangkan',
      scenario: 'Pasanganmu lupa mencatat pengeluaran bersama minggu ini. Kalimat mana yang merupakan keluhan lembut?',
      options: [
        { id: 'opt-a', label: '"Aku merasa agak cemas soal anggaran kita. Bisa tolong kita rekap bersama malam ini?"', isCorrect: true },
        { id: 'opt-b', label: '"Kamu emang nggak pernah peduli sama masa depan kita!"', isCorrect: false },
        { id: 'opt-c', label: '"Percuma bikin rencana kalau kamu selalu lalai begini."', isCorrect: false }
      ],
      correctExplanation: 'Tepat sekali! Kalimat A berfokus pada perasaan diri ("Aku merasa cemas") dan mengajukan permintaan positif yang jelas, bukan menyerang watak pasangan.',
      incorrectExplanation: 'Belum pas. Menyerang dengan kata "selalu" atau "nggak pernah peduli" memicu sikap defensif. Mulailah dari perasaanmu sendiri.'
    },
    {
      id: 'step-match',
      type: 'match',
      title: 'Pasangkan Racun Komunikasi & Penawarnya',
      subtitle: 'Metode Gottman memetakan 4 racun relasi (Four Horsemen) beserta penawar sehatnya:',
      pairs: [
        { left: 'Kritik Menyerang Pribadi', right: 'Awalan yang lembut (I-statement)' },
        { left: 'Sikap Defensif Membela Diri', right: 'Menerima sebagian tanggung jawab' },
        { left: 'Menghina atau Meremehkan', right: 'Membangun budaya apresiasi' },
        { left: 'Menutup Diri (Stonewalling)', right: 'Minta jeda untuk menenangkan diri' }
      ],
      explanation: 'Luar biasa! Mengenali 4 penawar racun komunikasi ini adalah pondasi terkuat rumah tangga yang damai.'
    },
    {
      id: 'step-order',
      type: 'order',
      title: 'Urutkan Formula Keluhan Lembut (Soft Startup)',
      subtitle: 'Susun 3 bagian penting dari keluhan yang tidak menyudutkan:',
      steps: [
        'Ungkapkan perasaan: "Aku merasa cemas..."',
        'Jelaskan situasinya: "...ketika catatan pengeluaran belum direkap..."',
        'Sampaikan kebutuhan positif: "...bisa tolong kita cek bersama malam ini?"'
      ],
      explanation: 'Sempurna! Perasaan → Situasi spesifik → Permintaan positif adalah rumus baku keluhan lembut Gottman.'
    },
    {
      id: 'step-reflect',
      type: 'reflect',
      title: 'Refleksi Pola Komunikasi',
      subtitle: 'Dari racun komunikasi di atas, mana yang paling sering tanpa sadar muncul saat kalian sedang lelah?',
      options: [
        { id: 'ref-kritik', label: 'Kritik menyalahkan pasangan', icon: '⚡' },
        { id: 'ref-defensif', label: 'Defensif langsung membela diri', icon: '🛡️' },
        { id: 'ref-diam', label: 'Menutup diri dan diam seribu bahasa', icon: '🚪' },
        { id: 'ref-belum', label: 'Belum yakin, ingin mengamati dulu', icon: '🌱' }
      ],
      message: 'Jujur pada diri sendiri adalah keberanian besar. Mengenali pola ini membuat kalian bisa saling mengingatkan dengan lembut.'
    },
    {
      id: 'step-doit',
      type: 'doit',
      actionType: 'sentence',
      title: 'Praktik Mikro: Apresiasi Pasangan',
      subtitle: 'Tulis satu kalimat apresiasi tulus untuk pasanganmu hari ini:',
      instruction: 'Ketik pesan apresiasi singkat:',
      placeholder: 'Terima kasih sudah mau belajar bersama mempersiapkan masa depan kita.',
      promptText: 'Apresiasi pasangan'
    }
  ]
};

export const SAMPLE_LESSONS = [
  LESSON_NAMING_FEELINGS,
  LESSON_URGE_SURFING,
  LESSON_GOTTMAN_COMPLAINT
];

export function getLessonById(lessonId) {
  return SAMPLE_LESSONS.find(l => l.id === lessonId || l.nodeId === lessonId) || null;
}
