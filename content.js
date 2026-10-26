// Teman Siap Content Engine
// Grounded in DBT (mindfulness/distress tolerance), ACT (values/urge surfing), CBT (reframing), and Gottman Method.
// Note: Clinical & financial content is educational (PRD 13.3) and prepared for professional pre-release review.

const CONTENT = {
  // Emotion Taxonomy (Level 1: Notice & Name)
  emotions: [
    { id: 'tenang', label: 'Tenang & Lega', icon: '🌿', hint: 'Napas teratur, pundak rileks' },
    { id: 'cemas', label: 'Cemas / Overthinking', icon: '⚡', hint: 'Dada sesak, perut tegang, pikiran melompat' },
    { id: 'lelah', label: 'Lelah / Burnout', icon: '🌙', hint: 'Kelopak mata berat, tubuh lunglai' },
    { id: 'senang', label: 'Senang & Semangat', icon: '✨', hint: 'Energi mengalir, dada hangat' },
    { id: 'sedih', label: 'Sedih / Rentan', icon: '💧', hint: 'Tenggorokan tercekat, ingin menarik diri' },
    { id: 'marah', label: 'Kesal / Frustrasi', icon: '🔥', hint: 'Rahang mengeras, telapak tangan mengepal' },
    { id: 'kewalahan', label: 'Kewalahan', icon: '🌊', hint: 'Sulit fokus, merasa banyak tuntutan' },
    { id: 'syukur', label: 'Bersyukur (Qana\'ah)', icon: '🤲', hint: 'Merasa cukup dengan apa yang ada saat ini' }
  ],

  // Body Sensations (DBT "Observe & Describe")
  bodySensations: [
    'Dada terasa sesak atau berdebar',
    'Pundak dan leher kaku/tegang',
    'Perut melilit atau mual',
    'Rahang terkunci atau gigi gemeretak',
    'Kepala terasa berat',
    'Napas dangkal dan cepat',
    'Tubuh rileks dan ringan',
    'Tidak merasakan sensasi khusus'
  ],

  // Core Needs (DBT "Identify Needs without Judgment")
  needs: [
    'Istirahat tanpa merasa bersalah',
    'Didengarkan tanpa langsung dinasihati',
    'Waktu jeda sejenak untuk sendiri',
    'Pelukan atau rasa aman emosional',
    'Kejelasan tentang rencana ke depan',
    'Bantuan praktis meringankan beban',
    'Belum tahu pasti, hanya ingin jeda'
  ],

  // Micro Regulation Exercises (Level 3: Regulate)
  exercises: [
    {
      id: 'ex-breath',
      title: 'Latihan Napas Sabar (4-4-6)',
      tag: 'Distress Tolerance',
      duration: '1 Menit',
      description: 'Meredakan alarm tubuh saat cemas atau terburu-buru.',
      steps: [
        'Duduk dengan posisi nyaman, turunkan pundakmu.',
        'Tarik napas perlahan lewat hidung (4 hitungan).',
        'Tahan napas sejenak dengan lembut (4 hitungan).',
        'Hembuskan perlahan lewat mulut seperti meniup lilin (6 hitungan).',
        'Ulangi 4–5 kali. Kamu bisa berhenti kapan saja jika merasa tidak nyaman.'
      ],
      reviewed: 'DBT-Informed (Draft)'
    },
    {
      id: 'ex-grounding',
      title: 'Jangkar Panca Indera (5-4-3-2-1)',
      tag: 'Mindfulness',
      duration: '2 Menit',
      description: 'Menarik pikiran kembali ke saat ini ketika emosi mulai meluap.',
      steps: [
        'Sebutkan 5 benda yang kamu lihat di sekitarmu.',
        'Sentuh 4 permukaan di dekatmu dan rasakan teksturnya.',
        'Dengarkan 3 suara yang paling samar di ruangan.',
        'Kenali 2 aroma yang bisa kamu hirup saat ini.',
        'Rasakan 1 rasa di lidahmu atau teguk sedikit air putih hangat.'
      ],
      reviewed: 'ACT/Mindfulness (Draft)'
    },
    {
      id: 'ex-tipp',
      title: 'Sentuhan Air Dingin (TIPP Sederhana)',
      tag: 'Crisis Survival',
      duration: '1 Menit',
      description: 'Menurunkan detak jantung secara fisiologis saat kemarahan atau panik memuncak.',
      steps: [
        'Ambil air dingin atau kompres kain basah.',
        'Basuh wajah atau letakkan kain dingin di sekitar mata dan pelipis selama 30 detik.',
        'Bernapas perlahan saat merasakan kesejukan air meresap.'
      ],
      reviewed: 'DBT TIPP Skill (Draft)'
    }
  ],

  // Financial Categories & Contextual Reflection Tags
  categories: [
    'Makanan & Kebutuhan Harian',
    'Transportasi & Bensin',
    'Tempat Tinggal & Tagihan',
    'Bantuan Keluarga / Orang Tua (Sandwich Gen)',
    'Persiapan Pernikahan / Acara',
    'Hiburan & Kesenangan Pribadi',
    'Cicilan & Utang',
    'Kesehatan & Kebugaran',
    'Tabungan Dana Darurat',
    'Lainnya'
  ],

  expenseTags: [
    { id: 'planned', label: 'Sudah direncanakan dalam anggaran' },
    { id: 'need_unexpected', label: 'Kebutuhan mendesak tak terduga' },
    { id: 'pleasure', label: 'Menikmati hidup & apresiasi diri' },
    { id: 'stress_relief', label: 'Beli karena stres / lelah kerja' },
    { id: 'fomo', label: 'Tergiur diskon / takut kehabisan (FOMO)' },
    { id: 'family_duty', label: 'Tanggung jawab keluarga / berbakti' },
    { id: 'boredom', label: 'Iseng belanja saat bosan scrolling' },
    { id: 'private', label: 'Pilihan pribadi (tanpa catatan)' }
  ],

  // Cognitive Restructuring Cards for Impulsive Spending (CBT)
  cognitiveReframes: [
    {
      impulseThought: '“Aku kerja keras seharian, aku berhak dapat hadiah ini sekarang!”',
      counterPerspective: 'Kamu memang sangat pantas mendapatkan kebahagiaan dan istirahat. Tapi apakah membelanjakan uang ini adalah satu-satunya cara? Jangan sampai hadiah sesaat ini mencuri ketenangan saldo tabunganmu besok.'
    },
    {
      impulseThought: '“Diskonnya gede banget, kalau nggak beli sekarang bakal rugi!”',
      counterPerspective: 'Diskon 50% untuk barang yang belum kamu butuhkan tetap menghabiskan 100% uangmu. Uang yang tetap di rekeningmu adalah diskon 100% untuk masa depan.'
    },
    {
      impulseThought: '“Cuma 50 ribu ini, nggak bakal bikin bangkrut.”',
      counterPerspective: 'Nominal kecil memang tidak membuat miskin, tapi kebiasaan mengabaikannya bisa menghalangi impian besar kalian (seperti DP rumah atau dana darurat).'
    },
    {
      impulseThought: '“Semua temanku sudah punya barang ini, aku malu kalau ketinggalan.”',
      counterPerspective: 'Standar hidup yang tenang adalah hidup sesuai kemampuan sendiri (syukur & qana\'ah). Kita membangun rumah tangga untuk ketenteraman kita, bukan untuk penonton media sosial.'
    }
  ],

  // Preset If-Then Coping Plans (Implementation Intentions)
  presetPlans: [
    {
      trigger: 'Melihat diskon kilat di marketplace saat malam hari',
      action: 'Tutup aplikasi, minum segelas air hangat, dan tunggu 24 jam sebelum memutuskan.'
    },
    {
      trigger: 'Merasa stres karena pekerjaan dan ingin jajan berlebihan',
      action: 'Jalan kaki 10 menit atau dengarkan 1 lagu favorit sebelum membuka aplikasi pesan antar.'
    },
    {
      trigger: 'Takut mengecek saldo tabungan karena takut stres',
      action: 'Cek saldo sambil menarik napas dalam 3 kali, lalu catat satu angka dengan tenang.'
    },
    {
      trigger: 'Orang tua meminta bantuan uang mendadak di luar rencana',
      action: 'Bicara dengan pasangan dengan kepala dingin untuk menyepakati batas bantuan yang aman.'
    }
  ],

  // Guided Couple Conversations (Module C: Us)
  conversations: [
    {
      id: 'c-security',
      title: 'Arti Rasa Aman Finansial Bagi Kita',
      subtitle: 'Memahami latar belakang & ketakutan masing-masing soal uang.',
      prompt: 'Ketika kamu memikirkan uang dalam pernikahan kita nanti, apa yang paling membuatmu merasa aman dan tenang? Dan apa kekhawatiran terbesarmu?',
      helperA: 'Contoh: "Aku merasa aman kalau kita punya dana darurat minimal 3 bulan pengeluaran..."',
      helperB: 'Contoh: "Ketakutan terbesarku adalah jika ada utang yang dirahasiakan..."',
      gottmanTip: 'Ingat: Jangan langsung mendebat atau menawarkan solusi. Cukup dengarkan untuk memahami dunia batin pasanganmu (Love Maps).'
    },
    {
      id: 'c-family',
      title: 'Dukungan untuk Orang Tua & Keluarga Besar',
      subtitle: 'Menavigasi tanggung jawab keluarga / sandwich generation dengan adil.',
      prompt: 'Bagaimana bayanganmu mengenai bantuan finansial untuk orang tua atau saudara setelah kita menikah? Seberapa rutin dan bagaimana kita menyepakati batasnya bersama?',
      helperA: 'Contoh: "Bagi saya membantu orang tua adalah kewajiban moral, tapi saya ingin ada pos anggaran tetap..."',
      helperB: 'Contoh: "Saya mendukung penuh, asalkan kebutuhan pokok rumah tangga kita tidak terganggu..."',
      gottmanTip: 'Gunakan kalimat "Saya merasa..." alih-alih "Keluargamu terlalu menuntut...". Bicarakan nilai baktinya, lalu sepakati batas yang menjaga rumah tangga kalian.'
    },
    {
      id: 'c-spend',
      title: 'Ruang Uang Pribadi Tanpa Rasa Bersalah',
      subtitle: 'Menjaga kemandirian dan rasa saling percaya dalam pengeluaran harian.',
      prompt: 'Apakah menurutmu kita perlu punya "uang jajan pribadi" masing-masing yang tidak perlu dipertanggungjawabkan setiap rupiahnya? Berapa jumlah yang terasa adil?',
      helperA: 'Contoh: "Aku merasa butuh sedikit kebebasan belanja hobi tanpa harus izin untuk hal kecil..."',
      helperB: 'Contoh: "Setuju, asalkan pos tabungan bersama dan tagihan rumah sudah disisihkan di awal gajian..."',
      gottmanTip: 'Transparansi bukan berarti kehilangan privasi total. Kesepakatan yang jelas justru membebaskan dari rasa curiga.'
    },
    {
      id: 'c-goals',
      title: 'Mimpi Bersama 1–3 Tahun Pertama',
      subtitle: 'Mengarahkan uang sebagai alat mencapai tujuan hidup bersama.',
      prompt: 'Sebutkan 2 hal yang paling ingin kita capai bersama dalam 1–3 tahun pertama (misal: bebas utang pesta, sewa rumah nyaman, ibadah bersama, atau persiapan anak)?',
      helperA: 'Contoh: "Prioritasku adalah melunasi sisa biaya pernikahan secepatnya..."',
      helperB: 'Contoh: "Aku ingin kita punya tabungan awal untuk persiapan tempat tinggal mandiri..."',
      gottmanTip: 'Carilah titik temu mimpi bersama. Uang menjadi terasa ringan dihemat ketika memiliki makna besar di baliknya (*Epic Meaning*).'
    }
  ],

  // Discussion Starters for Shared Space
  discussStarters: [
    'Hal apa yang baru kamu sadari tentang sudut pandang pasanganmu?',
    'Di bagian mana nilai dan harapan kalian sudah selaras?',
    'Jika ada perbedaan harapan, jalan tengah kecil apa yang bisa kita coba bulan ini?'
  ],

  // Verified Crisis & Emergency Resources (Indonesia)
  supportNotice: {
    disclaimer: 'Teman Siap adalah aplikasi edukasi dan refleksi diri mandiri, bukan pengganti konseling psikologis klinis atau penasihat keuangan berlisensi.',
    crisisTitle: 'Layanan Dukungan & Bantuan Manusia',
    crisisText: 'Jika kamu atau pasangan sedang mengalami tekanan psikologis berat, kekerasan dalam relasi, atau pikiran menyakiti diri, bantuan profesional dan manusia nyata selalu tersedia secara gratis dan rahasia:',
    hotlines: [
      { name: 'Layanan SEJIWA (Kemenkes RI)', contact: '119 (ekstensi 8)', desc: 'Konseling psikologis gratis 24 jam' },
      { name: 'SAPA 129 (KemenPPPA)', contact: 'Hotline 129 / WhatsApp 08111-129-129', desc: 'Pengaduan & perlindungan perempuan dan keluarga' },
      { name: 'Yayasan Pulih', contact: 'WhatsApp 0811-8436-633', desc: 'Konseling trauma dan pemulihan kesehatan mental' },
      { name: 'LSM Sahabat Rekan Sebaya (Pencegahan Bunuh Diri)', contact: '021-9987878', desc: 'Dukungan emosional dan krisis' }
    ]
  }
};
