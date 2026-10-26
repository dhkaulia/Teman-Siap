// Teman Siap Content Engine
// Grounded in evidence-based frameworks: DBT, ACT, CBT, and the Gottman Method.
// Note: Plain Bahasa Indonesia on primary views; clinical specifics in progressive details (PRD 13.3).

export const CONTENT = {
  // Emotion Taxonomy (Level 1: Notice & Name)
  // Default is secular/plain; faith framing is opt-in via user setting
  emotions: [
    { id: 'tenang', label: 'Tenang & Lega', icon: '🌿', hint: 'Napas teratur, pundak rileks' },
    { id: 'cemas', label: 'Cemas / Gelisah', icon: '⚡', hint: 'Dada sesak, pikiran melompat-lompat' },
    { id: 'lelah', label: 'Lelah / Burnout', icon: '🌙', hint: 'Energi habis, tubuh terasa berat' },
    { id: 'senang', label: 'Senang', icon: '✨', hint: 'Energi positif, dada hangat' },
    { id: 'bersyukur', label: 'Bersyukur', icon: '🤲', hint: 'Merasa cukup dengan keadaan saat ini', faithHint: 'Sikap syukur & qana\'ah atas rezeki saat ini' },
    { id: 'sedih', label: 'Sedih / Rentan', icon: '💧', hint: 'Tenggorokan tercekat, ingin menyendiri' },
    { id: 'marah', label: 'Kesal / Frustrasi', icon: '🔥', hint: 'Rahang tegang, dada panas' },
    { id: 'kewalahan', label: 'Kewalahan', icon: '🌊', hint: 'Banyak tuntutan, sulit berpikir jernih' },
    { id: 'bingung', label: 'Ragu / Bingung', icon: '🧭', hint: 'Belum tahu arah langkah berikutnya' }
  ],

  // Body Sensations (DBT "Observe & Describe" in plain language)
  bodySensations: [
    'Dada terasa sesak atau berdebar',
    'Pundak dan leher kaku tegang',
    'Perut melilit atau kembung',
    'Rahang terkunci atau gigi gemeretak',
    'Kepala terasa berat atau pusing',
    'Napas pendek dan terburu-buru',
    'Tubuh terasa rileks dan ringan',
    'Tidak merasakan ketegangan khusus'
  ],

  // Core Needs (Plain language, non-judgmental)
  needs: [
    'Istirahat sejenak tanpa rasa bersalah',
    'Didengarkan tanpa langsung dinasihati',
    'Waktu tenang untuk sendiri',
    'Rasa aman dan kepastian rencana',
    'Pelukan atau dukungan emosional',
    'Bantuan praktis untuk tugas hari ini',
    'Belum tahu, hanya butuh jeda hening'
  ],

  // Micro Regulation Exercises (Level 3: Regulate)
  exercises: [
    {
      id: 'ex-breath',
      title: 'Latihan Napas Tenang (4-4-6)',
      faithTitle: 'Latihan Napas Sabar (4-4-6)',
      plainTag: 'Meredakan Gelisah',
      duration: '1 Menit',
      description: 'Membantu menenangkan detak jantung saat pikiran terasa terburu-buru.',
      steps: [
        'Duduk santai dan turunkan ketegangan di kedua pundakmu.',
        'Tarik napas perlahan lewat hidung dalam 4 hitungan.',
        'Tahan napas sejenak dengan lembut dalam 4 hitungan.',
        'Hembuskan perlahan lewat mulut seperti meniup lilin dalam 6 hitungan.',
        'Ulangi 4–5 kali. Kamu bebas berhenti kapan saja jika merasa tidak nyaman.'
      ],
      clinicalDetail: 'Berdasarkan teknik paced breathing (DBT Distress Tolerance) yang menstimulasi saraf parasimpatis untuk menurunkan hormon stres secara alami.'
    },
    {
      id: 'ex-grounding',
      title: 'Jangkar Panca Indera (5-4-3-2-1)',
      plainTag: 'Menghentikan Overthinking',
      duration: '2 Menit',
      description: 'Menarik perhatian kembali ke saat ini ketika pikiran terjebak kekhawatiran masa depan.',
      steps: [
        'Lihat sekeliling dan sebutkan 5 benda yang kamu lihat.',
        'Sentuh 4 permukaan di dekatmu dan rasakan teksturnya.',
        'Dengarkan 3 suara samar di sekitarmu.',
        'Hirup dan kenali 2 aroma di udara.',
        'Rasakan 1 rasa di lidahmu atau minum seteguk air hangat.'
      ],
      clinicalDetail: 'Berdasarkan prinsip mindfulness panca indera (ACT / Grounding) untuk memutus siklus ruminasi dan mengembalikan kontak dengan realitas saat ini.'
    },
    {
      id: 'ex-tipp',
      title: 'Sentuhan Air Sejuk',
      plainTag: 'Menenangkan Emosi Memuncak',
      duration: '1 Menit',
      description: 'Langkah darurat fisiologis saat rasa marah atau panik mendadak memuncak.',
      steps: [
        'Ambil air dingin atau kompres kain basah yang sejuk.',
        'Usapkan lembut pada area mata, pelipis, dan leher selama 30 detik.',
        'Tarik napas panjang sambil merasakan kesejukan air meresap ke kulit.'
      ],
      clinicalDetail: 'Berdasarkan keterampilan TIPP (Temperature) dalam Dialectical Behavior Therapy (DBT) yang memicu mamalian dive reflex untuk memperlambat laju jantung.'
    }
  ],

  // Financial Categories & Contextual Reflection Tags
  categories: [
    'Makanan & Kebutuhan Dapur',
    'Transportasi & Bensin',
    'Tempat Tinggal & Tagihan Rutin',
    'Bantuan Keluarga / Orang Tua (Sandwich Gen)',
    'Persiapan Pernikahan / Acara',
    'Hiburan & Kesenangan Pribadi',
    'Cicilan & Kewajiban Utang',
    'Kesehatan & Perawatan',
    'Tabungan Dana Cadangan',
    'Lainnya'
  ],

  expenseTags: [
    { id: 'planned', label: 'Sudah direncanakan dalam pos bulanan' },
    { id: 'need_unexpected', label: 'Kebutuhan penting tapi tidak terduga' },
    { id: 'pleasure', label: 'Menikmati hidup & apresiasi diri yang sehat' },
    { id: 'stress_relief', label: 'Beli pelarian karena lelah / stres kerja' },
    { id: 'fomo', label: 'Terpancing diskon kilat / takut kehabisan (FOMO)' },
    { id: 'family_duty', label: 'Tanggung jawab berbakti kepada keluarga' },
    { id: 'boredom', label: 'Iseng belanja saat bosan scrolling ponsel' },
    { id: 'private', label: 'Pilihan pribadi tanpa alasan khusus' }
  ],

  // Cognitive Restructuring Cards for Impulsive Spending
  cognitiveReframes: [
    {
      impulseThought: '“Aku kerja keras seharian, aku berhak belanja barang ini sekarang!”',
      counterPerspective: 'Kamu sangat berhak merasa bahagia dan beristirahat. Tapi tanyakan pada diri: apakah kebahagiaan itu harus dibeli dengan mengorbankan ketenangan saldo tabunganmu besok?'
    },
    {
      impulseThought: '“Diskonnya besar banget hari ini, kalau nggak beli sekarang rugi!”',
      counterPerspective: 'Diskon 50% untuk barang yang belum direncanakan tetap menghabiskan 100% uangmu. Uang yang tetap di rekeningmu adalah diskon 100% untuk keamanan masa depan.'
    },
    {
      impulseThought: '“Cuma nominal kecil kok, nggak bakal langsung bangkrut.”',
      counterPerspective: 'Satu pengeluaran kecil memang tidak membuat miskin, tapi kebiasaan mengabaikannya bisa menunda impian besar kalian (seperti tempat tinggal mandiri atau dana darurat).'
    },
    {
      impulseThought: '“Teman-temanku sudah punya barang ini, aku malu kalau ketinggalan.”',
      counterPerspective: 'Masa depan bersama dibangun di atas ketenangan sendiri, bukan untuk penilaian orang lain. Hidup secukupnya adalah kunci kedamaian sejati.',
      counterPerspectiveFaith: 'Pernikahan yang sakinah dibangun di atas ketenteraman bersama, bukan untuk panggung penonton. Sikap syukur dan qana\'ah adalah kunci ketenangan sejati.'
    }
  ],

  // Preset If-Then Coping Plans (Implementation Intentions)
  presetPlans: [
    {
      i: 'Melihat diskon promo saat malam hari',
      t: 'Tutup aplikasi marketplace, minum segelas air hangat, dan beri jeda 24 jam sebelum memutuskan.'
    },
    {
      i: 'Merasa stres karena pekerjaan dan ingin jajan berlebihan',
      t: 'Berjalan kaki santai 10 menit atau dengarkan 1 lagu favorit sebelum membuka aplikasi pesan antar.'
    },
    {
      i: 'Takut mengecek saldo karena cemas melihat angkanya',
      t: 'Tarik napas dalam 3 kali, buka aplikasi rekening, lalu catat satu angka dengan tenang tanpa menyalahkan diri.'
    },
    {
      i: 'Keluarga membutuhkan bantuan uang mendadak',
      t: 'Duduk berdua dengan pasangan untuk mendiskusikan batas bantuan yang aman bagi rumah tangga.'
    }
  ],

  // Guided Couple Conversations (Module C: Us)
  conversations: [
    {
      id: 'c-security',
      title: 'Arti Rasa Aman Finansial Bagi Kita',
      subtitle: 'Memahami latar belakang & kekhawatiran masing-masing soal uang.',
      prompt: 'Ketika kamu membayangkan keuangan rumah tangga kita nanti, apa yang paling membuatmu merasa aman dan tenang? Dan apa kekhawatiran terbesarmu?',
      helperA: 'Contoh: "Aku merasa tenang kalau kita punya dana darurat setara 3 bulan pengeluaran pokok..."',
      helperB: 'Contoh: "Kekhawatiran terbesarku adalah jika ada tanggungan utang yang dirahasiakan..."',
      gottmanTip: 'Dengarkan untuk memahami dunia batin pasanganmu, bukan untuk mendebat atau langsung membenarkan.',
      clinicalDetail: 'Berdasarkan konsep Love Maps & Fondasi Rumah Tangga dari Gottman Method: saling mengenal peta psikologis pasangan tentang uang.'
    },
    {
      id: 'c-family',
      title: 'Dukungan untuk Orang Tua & Keluarga Besar',
      subtitle: 'Menavigasi bakti keluarga / generasi sandwich dengan rasa adil.',
      prompt: 'Bagaimana bayanganmu mengenai bantuan dana untuk orang tua atau saudara setelah kita menikah? Seberapa rutin dan bagaimana kita menentukan batasnya bersama?',
      helperA: 'Contoh: "Membantu orang tua adalah bakti bagiku, tapi aku ingin kita menyepakati pos anggaran tetap yang jelas..."',
      helperB: 'Contoh: "Aku mendukung penuh, asalkan kebutuhan pokok dan tabungan masa depan rumah tangga kita tetap terjaga..."',
      gottmanTip: 'Gunakan kalimat "Saya merasa..." alih-alih menyalahkan keluarga pasangan. Bicarakan nilai baktinya bersama.',
      clinicalDetail: 'Menggunakan prinsip Softened Startup: memulai diskusi sensitif tanpa nada menyerang (antidote terhadap Criticism).'
    },
    {
      id: 'c-spend',
      title: 'Ruang Uang Pribadi Tanpa Rasa Bersalah',
      subtitle: 'Menjaga kemandirian dan rasa saling percaya dalam pengeluaran harian.',
      prompt: 'Apakah menurutmu kita perlu punya "uang jajan pribadi" masing-masing yang bebas digunakan tanpa harus izin untuk setiap rupiahnya? Berapa porsi yang terasa adil?',
      helperA: 'Contoh: "Aku merasa butuh sedikit kebebasan belanja hobi tanpa rasa bersalah atau harus selalu melapor..."',
      helperB: 'Contoh: "Setuju, asalkan pos tabungan bersama dan tagihan rumah sudah disisihkan terlebih dahulu..."',
      gottmanTip: 'Transparansi tidak sama dengan hilangnya privasi. Kesepakatan yang jelas justru mencegah rasa saling curiga.',
      clinicalDetail: 'Menyelaraskan nilai otonomi dan kebersamaan (Autonomy vs. Connectedness) dalam psikologi relasi.'
    },
    {
      id: 'c-goals',
      title: 'Mimpi Bersama 1–3 Tahun Pertama',
      subtitle: 'Menjadikan uang sebagai sarana mencapai cita-cita bersama.',
      prompt: 'Sebutkan 2 hal yang paling ingin kita wujudkan bersama dalam 1–3 tahun pertama (misal: bebas utang, sewa rumah nyaman, ibadah bersama, atau persiapan anak)?',
      helperA: 'Contoh: "Prioritasku adalah menyelesaikan sisa biaya pernikahan secepatnya agar bebas beban..."',
      helperB: 'Contoh: "Aku ingin kita punya tabungan awal untuk persiapan tempat tinggal mandiri..."',
      gottmanTip: 'Uang terasa jauh lebih ringan diatur ketika memiliki makna dan tujuan yang disepakati bersama.',
      clinicalDetail: 'Membangun Makna Bersama (Shared Meaning): pilar puncak dalam Gottman Sound Relationship House.'
    }
  ],

  // Discussion Starters for Shared Space
  discussStarters: [
    'Hal apa yang baru kamu sadari tentang sudut pandang pasanganmu?',
    'Di bagian mana nilai dan harapan kalian berdua sudah selaras?',
    'Jika ada perbedaan harapan, jalan tengah kecil apa yang bisa kita coba bulan ini?'
  ],

  // Gottman Antidotes in Gentle Language (Zero Shame, No Harsh Red)
  communicationPatterns: [
    {
      name: 'Menyalahkan Pribadi Pasangan',
      example: '“Kamu selalu boros dan nggak mikirin masa depan!”',
      antidoteName: 'Awali dengan Lembut (“Saya merasa…”)',
      antidoteExample: '“Saya merasa cemas saat belanja kita melebihi rencana. Bisakah kita cek anggaran bersama malam ini?”'
    },
    {
      name: 'Menyindir Sinis / Meremehkan',
      example: 'Meremehkan pendapat pasangan dengan sindiran atau nada mencemooh.',
      antidoteName: 'Ungkapkan Kebutuhan & Bangun Apresiasi',
      antidoteExample: 'Fokus pada apa yang kamu butuhkan, dan hargai niat baik pasangan yang sudah dilakukan (Rasio 5:1).'
    },
    {
      name: 'Langsung Membela Diri',
      example: '“Bukan salahku dong! Kamu sendiri yang bikin pengeluaran bengkak!”',
      antidoteName: 'Terima Sebagian Tanggung Jawab',
      antidoteExample: '“Maaf, aku memang kelupaan mencatatnya tadi siang. Mari kita perbaiki sama-sama.”'
    },
    {
      name: 'Mogok Bicara / Menutup Diri',
      example: 'Mendadak diam seribu bahasa dan menolak diajak bicara saat suasana tegang.',
      antidoteName: 'Minta Jeda Menenangkan Tubuh (20 Menit)',
      antidoteExample: '“Aku sedang merasa kewalahan sekarang. Boleh kita rehat 20 menit agar aku bisa menenangkan diri dulu?”'
    }
  ]
};
