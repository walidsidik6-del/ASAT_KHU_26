# PSAT Secure Exam — SMA Khairul Ulum
## Dokumentasi Sistem & Panduan PostCSS

---

## 📦 Struktur Proyek

```
psat-exam/
├── index.html              ← File utama aplikasi ujian
├── package.json            ← Dependensi npm
├── postcss.config.js       ← Konfigurasi PostCSS
├── tailwind.config.js      ← Konfigurasi Tailwind CSS
├── src/
│   └── styles/
│       └── main.css        ← Source CSS (PostCSS input)
├── dist/
│   └── styles.css          ← CSS hasil build (PostCSS output)
└── logo SMA.png            ← Logo sekolah
```

---

## 🚀 Setup PostCSS

### 1. Install Dependensi
```bash
npm install
```

### 2. Build CSS (sekali)
```bash
npm run build
```

### 3. Build CSS (mode development — auto-reload saat ada perubahan)
```bash
npm run dev
```

### 4. Build CSS (mode produksi — minified + autoprefixed)
```bash
NODE_ENV=production npm run build:css
```

---

## 🔧 Plugin PostCSS yang Digunakan

| Plugin | Fungsi |
|--------|--------|
| `postcss-import` | Import file CSS lain via `@import` |
| `postcss-nested` | Sintaks nested CSS seperti Sass/SCSS |
| `tailwindcss` | Utility-first CSS framework |
| `autoprefixer` | Tambah vendor prefix otomatis (-webkit-, -moz-, dst) |
| `cssnano` | Minifikasi CSS (hanya production mode) |

---

## 🛡️ Sistem Keamanan 7-Lapis

### Layer 1 — Background App Killer
**Fungsi:** Mendeteksi dan memperingatkan tentang aplikasi yang berjalan di latar belakang.

**Mekanisme:**
- BroadcastChannel: Mengirim sinyal ke semua tab/sesi lain untuk menutup diri
- Screen Wake Lock: Memantau jika kontrol layar diambil alih app lain
- Performance Observer: Memantau resource loading dari domain asing
- DOM injection scan: Deteksi elemen asing yang di-inject ke halaman
- Periodic scan setiap 3 detik untuk analisis viewport/screen mismatch

**Perilaku:**
- Pelanggaran 1-2x: Peringatan dengan countdown 10 detik, siswa dapat dismiss
- Pelanggaran 3x: Reset otomatis ke halaman login

---

### Layer 2 — Chat Bubble Killer
**Fungsi:** Mendeteksi gelembung chat dari WhatsApp, Messenger, Telegram, dll.

**Mekanisme:**
- Touch hitTest: Deteksi jika sentuhan "melewati" elemen ujian (bubble menyerap sentuhan)
- Blur burst detection: 3+ blur events dalam 2 detik = chat bubble muncul-hilang
- MutationObserver: Langsung hapus elemen dengan class/id mengandung "bubble", "chathead", dll.
- VisibilityState flicker: Perubahan visibility < 800ms = chat head tap

**Perilaku:** Countdown 5 detik, lalu reset otomatis.

---

### Layer 3 — Anti-PiP (Picture-in-Picture)
**Fungsi:** Blokir total mode Picture-in-Picture pada semua video.

**Mekanisme:**
- Override `document.pictureInPictureEnabled` → false
- Tambah `disablePictureInPicture` pada semua elemen video
- MutationObserver untuk video yang ditambahkan secara dinamis
- Polling setiap 800ms untuk memastikan tidak ada PiP aktif

**Perilaku:** Countdown 5 detik, lalu reset otomatis.

---

### Layer 4 — Anti-Overlay (Zero Tolerance)
**Fungsi:** Deteksi aplikasi overlay (draw-over-apps) dengan ZERO TOLERANCE.

**Mekanisme:**
- document.visibilitychange: Setiap layar tersembunyi → langsung reset
- Pointer capture hijack: Deteksi jika pointer tidak mengarah ke elemen kita
- window blur/focus: Kehilangan fokus tanpa pindah ke input internal = overlay
- getDisplayMedia block: Blokir semua screen recording/sharing
- rAF heartbeat: Gap render > 500ms = overlay sistem aktif
- Polling setiap 300ms untuk verifikasi visibility
- Security shield div: Transparan di z-index 89999

**Perilaku:** LANGSUNG reset tanpa countdown (800ms delay untuk user membaca pesan).

---

### Layer 5 — Anti-Floating App
**Fungsi:** Deteksi aplikasi mengambang (floating window) pada Android/iOS.

**Mekanisme:**
- Quick focus cycle: blur-focus < 300ms sebanyak 3x = floating app
- iPad Slide Over: `window.innerWidth / screen.width < 0.40`
- Resize burst: 4+ resize events dalam 1 detik = floating window adjust

**Perilaku:** Countdown 5 detik, lalu reset otomatis.

---

### Layer 6 — App Switch / Visibility Guard
**Fungsi:** Deteksi perpindahan aplikasi, notifikasi, dan recent apps.

**Mekanisme:**
- visibilitychange API
- window blur/focus dengan delay 400ms
- Fullscreen change detection
- iOS Control Center / Notification Center detection
- Android Back/Recent Apps via popstate
- Developer Tools detection via outerWidth - innerWidth > 160px

**Perilaku:** Countdown 5 detik, lalu reset otomatis.

---

### Layer 7 — Split Screen Detection
**Fungsi:** Deteksi mode layar terbagi (split screen / multitasking).

**Mekanisme:**
- `window.innerWidth / screen.width < 0.55` (mobile) atau `< 0.65` (desktop)
- `window.innerHeight / screen.height < 0.55` (mobile) atau `< 0.65` (desktop)
- Polling setiap 800ms + resize event listener

**Perilaku:** Countdown 10 detik, jika tidak diperbaiki → reset otomatis.

---

## ⚙️ Konfigurasi Admin

### Mengganti Kode Ujian
```javascript
const VALID_EXAM_CODE = 'PSAT2026'; // Ganti sesuai kebutuhan
```

### Menambah URL Google Form
```javascript
const FORM_MAPPING = {
  'X-1': {
    'Matematika': 'https://docs.google.com/forms/d/e/XXXX/viewform',
    // ... tambah mapel lainnya
  }
};
```

### Melihat Log Pelanggaran
Buka browser console pada halaman login dan jalankan:
```javascript
JSON.parse(localStorage.getItem('psat_violations') || '[]')
```

---

## 📱 Kompatibilitas

| Platform | Status |
|----------|--------|
| Android Chrome | ✅ Full support |
| iOS Safari | ✅ Full support |
| Desktop Chrome/Edge | ✅ Full support |
| Desktop Firefox | ✅ Full support |
| Samsung Internet | ✅ Full support |

---

## ⚠️ Catatan Penting

1. **HTTPS Required**: Beberapa API (Wake Lock, Notification, Service Worker) memerlukan HTTPS
2. **Fullscreen**: Ujian menggunakan mode fullscreen — pastikan browser mengizinkan
3. **iframe Google Form**: Google Form tidak dapat sepenuhnya diblokir dari sisi browser;
   sistem ini melindungi *lingkungan* ujian, bukan konten form itu sendiri
4. **False Positive**: Sistem dirancang dengan beberapa toleransi (delay 150-400ms)
   untuk menghindari false positive saat interaksi normal (mengetik, scrolling)

---

*PSAT Secure Exam v2.0 — SMA Khairul Ulum 2025/2026*
