# RestoKita — Mobile App (Ionic Vue + Android)

Aplikasi mobile **RestoKita** adalah versi Android dari sistem manajemen restoran berbasis web. Dibangun menggunakan **Ionic Vue 8**, **Capacitor 7**, **Vue 3**, **Pinia**, dan **TypeScript** — dimigrasi dari project web yang sebelumnya menggunakan Vue 3 + Tailwind CSS.

---

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Prasyarat](#prasyarat)
- [Cara Menjalankan — Dari Awal](#cara-menjalankan--dari-awal)
  - [1. Clone / Buka Project](#1-clone--buka-project)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Setting Environment Variable](#3-setting-environment-variable)
  - [4. Jalankan di Browser (Dev Mode)](#4-jalankan-di-browser-dev-mode)
  - [5. Build untuk Android](#5-build-untuk-android)
  - [6. Sync ke Android & Buka Android Studio](#6-sync-ke-android--buka-android-studio)
  - [7. Run di Emulator / HP](#7-run-di-emulator--hp)
- [Alur Navigasi](#alur-navigasi)
- [Akun & Role](#akun--role)

---

## Fitur

### Waiters (Pelayan)
| Halaman | Fungsi |
|---|---|
| **Action Hub** | Pusat navigasi; pilih antara buat pesanan, cek pesanan berjalan, atau proses pembayaran |
| **Table** | Pilih meja tersedia untuk memulai order baru |
| **Menu** | Pilih menu per kategori, search, tambah ke keranjang, input nama tamu & diskon |
| **Ongoing Orders** | Lihat pesanan yang sedang disiapkan dapur; tandai sebagai "Served" |
| **Pending Payments** | Daftar pesanan yang sudah served & belum dibayar; cari berdasarkan meja/tamu |
| **Summary & Payment** | Detail tagihan, pilih metode Cash atau QRIS, konfirmasi pembayaran |

### Admin
| Halaman | Fungsi |
|---|---|
| **Dashboard** | Statistik penjualan bulanan, top menu, item stok rendah |
| **Manage Menu** | CRUD menu, filter kategori, update stok harian |
| **Manage Staff** | CRUD akun staff (waiters / admin) |
| **Manage Table** | CRUD meja, ubah kapasitas & status |
| **Manage Category** | CRUD kategori menu |
| **Order History** | Riwayat semua pesanan, filter status pembayaran |
| **Stock History** | Log perubahan stok per item |

### Autentikasi
- Login, Register, Register Detail (nama/no. telp/alamat)
- Lupa Password → Verifikasi OTP → Reset Password
- Token JWT disimpan di `localStorage`; guard otomatis redirect berdasarkan role

---

## Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| Vue 3 | ^3.4 | Composition API + `<script setup>` |
| Ionic Vue | ^8.0 | Komponen UI mobile-native |
| Capacitor | ^7.0 | Jembatan web → Android native |
| Pinia | ^2.2 | State management |
| Vue Router | ^4.3 | Routing (via `@ionic/vue-router`) |
| Axios | ^1.7 | HTTP client ke backend API |
| TypeScript | ^5.4 | Seluruh source code ditulis TS |
| Vite | ^5.2 | Build tool |
| jwt-decode | ^4.0 | Decode token JWT untuk cek expiry & role |

---

## Struktur Project

```
Restaurant_Mobile/
├── android/                     # Native Android project (Capacitor)
├── dist/                        # Output build Vite
├── public/
├── src/
│   ├── helpers/
│   │   └── api.ts               # Axios instance (baseURL dari env)
│   ├── router/
│   │   └── index.ts             # Semua route + navigation guard
│   ├── stores/                  # Pinia stores
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── menu.ts
│   │   ├── table.ts
│   │   └── category.ts
│   ├── theme/
│   │   └── variables.css        # Ionic CSS variables + dark mode
│   ├── views/
│   │   ├── auth/                # Login, Register, OTP, Reset Password
│   │   ├── waiters/
│   │   │   ├── ActionHubPage.vue
│   │   │   └── order/           # Table, Menu, OngoingOrder, Payment, SumNPayment
│   │   ├── admin/               # Dashboard + 6 halaman manajemen
│   │   └── NotFoundPage.vue
│   ├── App.vue
│   └── main.ts
├── .env                         # Environment variables (JANGAN di-commit)
├── .env.example                 # Template .env
├── capacitor.config.ts          # Config Capacitor (appId, appName, webDir)
├── ionic.config.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Prasyarat

Pastikan semua tools berikut **sudah terinstal** di komputer sebelum mulai:

| Tool | Versi minimum | Cara cek |
|---|---|---|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Android Studio** | Ladybug (2024) | [Download](https://developer.android.com/studio) |
| **JDK** | 17+ | `java --version` |
| **Android SDK** | API 22+ | Instal via Android Studio > SDK Manager |
| **ANDROID_HOME** | — | Set environment variable ke folder SDK |

> **Tips:** Setelah instal Android Studio, buka **SDK Manager** dan pastikan **Android 14 (API 34)** atau yang lebih baru tercentang di tab *SDK Platforms*.

---

## Cara Menjalankan — Dari Awal

### 1. Clone / Buka Project

Buka terminal di folder project:

```bash
cd "C:\Users\Lenovo GK\Documents\KelasXII\TEST\Restaurant_Mobile"
```

---

### 2. Install Dependencies

```bash
npm install
```

> Akan menginstal ±234 package termasuk Ionic, Capacitor, Pinia, Axios, dll.

---

### 3. Setting Environment Variable

Salin file `.env.example` menjadi `.env`, lalu isi dengan URL backend API:

```bash
copy .env.example .env
```

Buka file `.env` dan sesuaikan:

```env
# URL backend API (tanpa trailing slash)
VITE_API_URL=http://192.168.1.100:8000

# URL folder gambar (biasanya sama dengan API_URL + /static atau /uploads)
VITE_API_URL_IMAGE=http://192.168.1.100:8000/static/
```

> **Penting:** Gunakan **IP address lokal** (bukan `localhost`) agar HP/emulator Android bisa mengakses backend yang berjalan di PC yang sama. Cek IP komputer dengan `ipconfig`.

---

### 4. Jalankan di Browser (Dev Mode)

Untuk development cepat tanpa perlu HP/emulator:

```bash
npm run dev
```

Buka browser ke `http://localhost:5173`

> Mode browser tidak mendukung fitur native (kamera, haptic, dll) — hanya untuk testing UI.

---

### 5. Build untuk Android

Setiap kali ada perubahan kode, jalankan build terlebih dahulu:

```bash
npm run build
```

Output akan berada di folder `dist/`.

---

### 6. Sync ke Android & Buka Android Studio

```bash
# Salin hasil build ke folder android/
npx cap sync android

# Buka project di Android Studio
npx cap open android
```

> Jika `android/` belum ada (pertama kali setup ulang), jalankan dulu:
> ```bash
> npx cap add android
> ```

---

### 7. Run di Emulator / HP

**Opsi A — Dari Android Studio:**
1. Android Studio terbuka otomatis setelah `npx cap open android`
2. Tunggu Gradle sync selesai (bisa 2–5 menit pertama kali)
3. Pilih emulator atau hubungkan HP via USB (aktifkan USB Debugging)
4. Klik tombol **Run ▶** (Shift+F10)

**Opsi B — Langsung dari terminal (HP fisik):**
```bash
# Pastikan HP terhubung USB dan USB Debugging aktif
npx cap run android
```

---

## Alur Navigasi

```
/ (Login)
├── /register → /register-detail
├── /forgot-password → /verify-otp → /reset-password
│
├── /waiters (Action Hub)            [role: waiters]
│   ├── /waiters/table
│   │   └── /waiters/menu/:tableCode
│   ├── /waiters/ongoing-order
│   └── /waiters/payment
│       └── /waiters/payment/:id  (Summary & Payment)
│
└── /admin (Dashboard)               [role: admin]
    ├── /admin/manage-menu
    ├── /admin/manage-table
    ├── /admin/manage-category
    ├── /admin/manage-staff
    ├── /admin/order-history
    └── /admin/stock-history
```

---

## Akun & Role

| Role | Halaman yang bisa diakses |
|---|---|
| `waiters` | `/waiters/**` |
| `admin` | `/admin/**` |
| `customer` | Dialihkan ke `/` (belum ada halaman customer di app ini) |

Token JWT disimpan di `localStorage` dengan key `token`. Navigation guard otomatis:
- Mengecek apakah token masih valid (belum expired)
- Memblokir halaman `guestOnly` jika sudah login
- Redirect ke `/` jika belum login
- Redirect ke halaman yang sesuai role jika mencoba akses halaman role lain

---

## Workflow Pengembangan Sehari-hari

```bash
# 1. Edit kode di src/
# 2. Build
npm run build

# 3. Sync ke Android
npx cap sync android

# 4. Jalankan di emulator/HP
npx cap run android
# atau tekan Run di Android Studio
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Cannot connect to API` | Pastikan `VITE_API_URL` menggunakan IP lokal, bukan `localhost` |
| `SDK not found` | Set `ANDROID_HOME` environment variable ke folder Android SDK |
| `Gradle sync failed` | Buka Android Studio > File > Sync Project with Gradle Files |
| `App crashes on launch` | Cek Logcat di Android Studio untuk error detail |
| `White screen` | Pastikan `npm run build` berhasil sebelum `npx cap sync` |
| `Port 5173 sudah dipakai` | Ganti port: `npm run dev -- --port 3000` |
