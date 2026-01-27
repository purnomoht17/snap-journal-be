# Gunakan image Node.js versi LTS yang ringan
FROM node:20-alpine

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json terlebih dahulu (untuk caching layer)
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin sisa kode sumber proyek (termasuk service-account-key.json)
COPY . .

# Ekspos port aplikasi
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]