# Snap Journal Backend API

SnapJournal Backend adalah layanan RESTful API yang dibangun menggunakan Node.js dan Express. Backend ini menangani autentikasi pengguna, manajemen jurnal harian, integrasi Cloud Storage, serta analisis AI menggunakan Gemini dan layanan Microservice eksternal.

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (v18 atau lebih baru disarankan)
- [Docker](https://www.docker.com/) (Opsional, jika ingin menjalankan via container)
- Akun Google Cloud / Firebase

---

## 🛠 Teknologi Utama

* **Node.js & Express** - Framework Backend
* **Firebase Authentication** - Manajemen User
* **Firebase Firestore** - Database NoSQL
* **Firebase Cloud Storage** - Penyimpanan Media
* **Swagger** - Dokumentasi API
* **Nodemailer** - Layanan Email

---

## 🚀 Instalasi & Menjalankan (Local)

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

1. **Clone Repository**
   ```bash
   git clone https://github.com/purnomoht17/snap-journal-be.git
   ```

2. **Masuk ke Direktori**

   ```bash
   cd backend
   ```

3. **Konfigurasi Environment Variable**
   Salin file contoh konfigurasi ke file `.env` baru:

   ```bash
   cp .env.example .env
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Jalankan Aplikasi**

   ```bash
   npm run dev
   ```

Server akan berjalan di `http://localhost:3000`.

---

## ⚙️ Konfigurasi .env

Buka file `.env` yang baru saja dibuat, lalu isi konfigurasi berikut:

### 1. Server Config

```ini
NODE_ENV=development
APP_URL=http://localhost:3001
JWT_SECRET=rahasia_jwt_anda_disini
```

### 2. Google Cloud & Firebase (Admin SDK)

```ini
GOOGLE_CREDENTIALS=./service-account-key.json
GOOGLE_CLIENT_API_KEY=your_firebase_web_api_key
GOOGLE_BUCKET_NAME=your-firebase-bucket-name
```

**Catatan:**

* **GOOGLE_CREDENTIALS:** Unduh dari Firebase Console > Project Settings > Service Accounts > Generate new private key. Lalu letakkan di directory root projek.
* **GOOGLE_CLIENT_API_KEY:** Ditemukan di Firebase Console > Project Settings > General > Your apps (Web App).
* **GOOGLE_BUCKET_NAME:** Salin dari menu Storage di Firebase Console.

### 3. Email Service (SMTP)

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_anda@gmail.com
SMTP_PASS=password_aplikasi_anda
SMTP_FROM_NAME="SnapJournal App"
```

**Catatan:**

* Bisa menggunakan Brevo, SendGrid, Mailtrap, atau Gmail App Password (bukan password biasa).

---

### 4. External AI Service (Gemini AI)

```ini
GEMINI_API_KEY=AIzaSy...
```

**Cara Mendapatkan API Key:**

1. Buka [Google AI Studio](https://aistudio.google.com/).
2. Login dengan akun Google Anda.
3. Masuk ke **API & Services** atau menu **Credentials**.
4. Klik **Create API Key** atau **Generate API Key**.
5. Salin API Key yang dihasilkan, lalu masukkan ke `.env` pada variabel `GEMINI_API_KEY`.

**Catatan:**

* Simpan key ini dengan aman, jangan dibagikan ke publik.
* Key ini digunakan backend untuk memanggil layanan Gemini AI, misalnya analisis teks atau sentimen.

---

### 5. External AI Service (FastAPI Microservice)

```ini
FASTAPI_TEXT_URL=http://localhost:5004
FASTAPI_VIDEO_URL=http://localhost:5003
FASTAPI_KEY=your_fastapi_secret_key
```

**Catatan:**
Pastikan Microservice Python (FastAPI) sudah dijalankan secara terpisah sesuai port.

---

## 🐳 Menjalankan dengan Docker

1. **Build Image Docker**

```bash
docker-compose build
```

2. **Jalankan Container**

```bash
docker-compose up -d
```

3. **Cek Status Container**

```bash
docker ps
```

4. **Menghentikan Container**

```bash
docker-compose down
```


## 🎉 Selamat! Aplikasi Anda sudah berjalan.

## 📚 Dokumentasi API

Dokumentasi lengkap endpoint API tersedia via Swagger UI:

👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---
