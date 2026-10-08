# Antrein

**Platform reservasi dan antrean online untuk klinik, barbershop, bengkel, dan usaha layanan lainnya.**

Antrein membantu pelanggan memilih layanan dan jadwal, mengambil antrean langsung, lalu memantau status melalui tautan pribadi. Pemilik usaha dan petugas mengatur cabang, layanan, reservasi, serta antrean dari ruang kerja yang responsif.

> Untuk klinik, Antrein hanya mengelola reservasi dan antrean. Antrein bukan sistem rekam medis, diagnosis, atau resep.

## Fitur MVP

- Autentikasi akun dan pembuatan ruang usaha.
- Profil usaha, cabang, hari/jam operasional, serta zona waktu WIB, WITA, WIT, atau UTC.
- Layanan dengan estimasi durasi, jeda persiapan, kapasitas slot, status aktif, dan dukungan walk-in.
- Reservasi dengan slot yang mengikuti jam buka, hari kerja, tanggal libur khusus, kapasitas, dan batas hari pemesanan.
- Halaman publik per usaha, pemilihan cabang dan layanan, reservasi, serta antrean langsung.
- Kode reservasi unik dan halaman status pribadi dengan posisi serta estimasi waktu tunggu.
- Check-in, panggil berikutnya/ulang, mulai/selesaikan layanan, pembatalan, serta penandaan tidak hadir setelah masa toleransi.
- Batas waktu perubahan/pembatalan reservasi, toleransi keterlambatan pelanggan, dan jumlah maksimum pemanggilan ulang yang dapat diatur per cabang.
- Pembaruan antrean otomatis dan indikator koneksi pada halaman pelanggan.
- Undangan petugas dengan peran operator/penyedia layanan, pembatasan cabang, dan layanan yang ditugaskan.
- QR SVG untuk membuka halaman pemesanan tiap cabang.
- Laporan dengan filter tanggal, cabang, layanan, petugas, metrik operasional, dan unduhan CSV.
- Pengaturan usaha/cabang, profil akun, serta halaman kebijakan privasi dan ketentuan.

## Teknologi

| Bagian                | Teknologi                                   |
| --------------------- | ------------------------------------------- |
| Backend               | Laravel 13, PHP 8.3+                        |
| Frontend              | React 19, TypeScript, Inertia.js            |
| Styling               | Tailwind CSS 4                              |
| Build                 | Vite Plus / Vite                            |
| Database pengembangan | SQLite                                      |
| Database deployment   | MySQL atau PostgreSQL yang didukung Laravel |

## Persyaratan

- PHP 8.3 atau lebih baru beserta ekstensi Laravel yang dibutuhkan.
- Composer 2.
- Node.js versi yang didukung Vite Plus dan npm.
- Database SQLite untuk pengembangan lokal, atau MySQL untuk deployment.

## Menjalankan secara lokal

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Pastikan konfigurasi database di `.env` sesuai. Untuk SQLite, buat file database bila belum tersedia:

```bash
touch database/database.sqlite
php artisan migrate
```

Jalankan Laravel dan Vite:

```bash
composer run dev
```

Buka alamat yang ditampilkan di terminal, biasanya `http://127.0.0.1:8000`.

Akun pertama dibuat melalui halaman **Mulai gratis**. Setelah mendaftar, pemilik membuat profil usaha, cabang, dan layanan. Dari dashboard, pemilik dapat membagikan tautan/QR publik atau mengundang anggota tim.

## Deploy ke hosting Laravel

Antrein adalah aplikasi full-stack Laravel, bukan situs statis. Gunakan hosting yang menyediakan PHP 8.3+, Composer 2, Node.js/npm untuk build, database MySQL atau PostgreSQL, HTTPS, dan akses document root. Arahkan domain ke direktori `public` aplikasi. Deploy frontend statis saja ke Vercel tidak akan menjalankan Laravel atau database.

### 1. Siapkan variabel produksi

Gunakan [`deploy/production.env.example`](deploy/production.env.example) sebagai daftar variabel. Masukkan nilainya melalui panel environment hosting atau file `.env` di server; jangan commit `.env` atau kredensial ke GitHub. Buat database produksi dan isi `APP_URL`, kredensial database, serta detail SMTP. Buat `APP_KEY` satu kali. Jika memakai panel environment hosting, buat key dengan `php artisan key:generate --show`, lalu simpan nilai yang ditampilkan ke variabel `APP_KEY`. Jika memakai file `.env` di server, jalankan `php artisan key:generate --force` satu kali. Simpan key tersebut dan jangan menggantinya saat pembaruan aplikasi. Pastikan `APP_DEBUG=false` dan cookie sesi hanya dikirim lewat HTTPS (`SESSION_SECURE_COOKIE=true`). SMTP harus dikonfigurasi sebelum mengandalkan email verifikasi, undangan, atau pemulihan kata sandi.

### 2. Pasang dependensi dan build aset

Jalankan dari folder proyek pada server atau pipeline deployment:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
```

Jika hosting tidak menyediakan Node.js, jalankan `npm ci` dan `npm run build` di pipeline, lalu unggah hasil `public/build` bersama source aplikasi.

### 3. Jalankan migrasi dan optimasi Laravel

Setelah `.env` produksi dan koneksi database siap:

```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Pastikan folder `storage` dan `bootstrap/cache` dapat ditulis oleh proses PHP. Gunakan HTTPS, aktifkan backup terjadwal database dan berkas yang diunggah, lalu uji pemulihan backup sebelum menerima pelanggan. Pantau log aplikasi setelah rilis. Jalankan worker queue atau scheduler hanya jika konfigurasi/fitur yang memerlukannya sudah diaktifkan.

### 4. Verifikasi sebelum membuka akses publik

- Buka halaman beranda, daftar, masuk, dashboard, pemesanan, status antrean, laporan, dan halaman legal di domain HTTPS.
- Uji pembuatan reservasi dan antrean dengan data uji, lalu hapus data uji sebelum peluncuran.
- Pastikan email verifikasi/reset kata sandi benar-benar diterima dari SMTP produksi.
- Lengkapi kontak pengelola, kebijakan privasi, dan ketentuan penggunaan untuk domain yang akan dipublikasikan.

Konfigurasi domain, database, SMTP, backup, dan kredensial hosting tetap perlu diisi pada akun hosting Anda sebelum aplikasi dapat dipublikasikan.

## Catatan MVP

- Undangan petugas tersedia sebagai tautan yang dibagikan manual. SMTP belum dikonfigurasi secara default; atur penyedia email sebelum menggunakan undangan email atau mengandalkan reset kata sandi di hosting.
- Notifikasi WhatsApp/SMS otomatis, pembayaran, sinkronisasi kalender, pengingat email terjadwal, branding khusus halaman publik, pemindahan tiket, analitik tren lanjutan, dan panel admin platform belum termasuk. Fitur-fitur tersebut berada di luar cakupan MVP PRD.
- Estimasi tunggu adalah kisaran perkiraan dari urutan antrean, durasi layanan, dan kapasitas petugas; nilainya dapat berubah selama operasional.
- Laporan harian dan filter rentang tanggal tersedia. Analitik tren lintas periode belum tersedia.
- Halaman privasi dan ketentuan merupakan baseline. Sebelum peluncuran publik, lengkapi identitas/kontak pengelola, masa retensi, prosedur permintaan/penghapusan data, serta minta tinjauan hukum yang sesuai.
- Sebelum digunakan oleh pelanggan, konfigurasi domain HTTPS, database produksi, SMTP, backup dan uji pemulihan, pemantauan error, serta prosedur antrean manual saat jaringan/hosting terganggu.
- Antrein adalah aplikasi full-stack Laravel. Deploy frontend statis saja ke Vercel tidak cukup untuk menjalankan backend dan database.

## Struktur folder

```text
Antrein/
├── app/Http/Controllers/       # Alur usaha, pemesanan, antrean, dan tim
├── app/Models/                 # Model usaha, cabang, layanan, reservasi
├── database/migrations/        # Skema database
├── resources/js/pages/         # Halaman React + TypeScript
├── routes/web.php              # Rute web dan API berbasis sesi
├── public/                     # Berkas publik dan hasil build
├── .env.example                # Template konfigurasi lokal/deployment
├── composer.json               # Dependensi PHP
└── package.json                # Dependensi frontend
```

## Lisensi dan hak cipta

Hak cipta atas source code Antrein dimiliki oleh **Ahmad Tibyan Hakim**. Semua hak dilindungi. Penggunaan, penyalinan, perubahan, distribusi, atau penggunaan komersial memerlukan izin tertulis dari pemilik. Lihat [`LICENSE`](LICENSE).

## Pengembang

**Ahmad Tibyan Hakim**

GitHub: [AhmadTibyanHakim77](https://github.com/AhmadTibyanHakim77)
