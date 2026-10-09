# Deploy Antrein ke Vercel

Antrein adalah aplikasi Laravel full-stack. Konfigurasi ini memakai runtime PHP komunitas **vercel-php** dan preset Vercel **Other**; preset saja tidak cukup untuk menjalankan Laravel. Runtime PHP komunitas bukan runtime resmi bawaan Vercel.

## Pengaturan proyek Vercel

Saat mengimpor repository AhmadTibyanHakim77/Antrein, gunakan:

- Nama proyek: **antrein** (URL **antrein.vercel.app** hanya tersedia jika nama itu belum dipakai).
- Root Directory: **./**
- Framework Preset: **Other**
- Install, Build, dan Output Directory: biarkan mengikuti konfigurasi repository.

Project menggunakan PHP 8.4 melalui runtime PHP komunitas, dan Node.js 22 untuk membangun aset Vite.

## Yang harus disiapkan sebelum deploy pertama

1. Buat database MySQL yang dapat diakses dari internet. Jangan gunakan SQLite lokal; sistem berkas function Vercel hanya dapat ditulis sementara di /tmp.
2. Masukkan variabel berikut di Settings → Environment Variables pada project Vercel. Isi kredensial database dari penyedia database, jangan masukkan ke GitHub.

   - **APP_NAME=Antrein**
   - **APP_ENV=production**
   - **APP_KEY** — buat dengan perintah php artisan key:generate --show, lalu simpan hanya di Vercel.
   - **APP_DEBUG=false**
   - **APP_URL=https://antrein.vercel.app** (sesuaikan bila nama domain Vercel berbeda)
   - **LOG_CHANNEL=stderr**
   - **DB_CONNECTION=mysql**
   - **DB_HOST**, **DB_PORT**, **DB_DATABASE**, **DB_USERNAME**, **DB_PASSWORD**
   - **SESSION_DRIVER=database**
   - **CACHE_STORE=database**
   - **QUEUE_CONNECTION=sync**

3. Jalankan migrasi Laravel ke database produksi satu kali sebelum menerima reservasi: php artisan migrate --force.
4. Setelah environment variables dan database siap, klik Deploy. Vercel akan memberi alamat .vercel.app saat deployment berhasil.

## Penyimpanan dan batasan

Entry point api/index.php mengarahkan penyimpanan runtime Laravel ke /tmp/antrein-storage, karena sistem berkas function tidak persisten. Saat ini aplikasi tidak mengunggah berkas pengguna. Jika fitur upload ditambahkan, gunakan object storage eksternal; berkas di /tmp akan hilang ketika function dimulai ulang.

Runtime PHP yang digunakan adalah runtime komunitas yang direkomendasikan di dokumentasi Vercel, bukan runtime resmi bawaan. Untuk produksi dengan worker antrean, scheduler, atau penyimpanan permanen, gunakan hosting Laravel khusus atau tambahkan layanan terpisah yang sesuai.
