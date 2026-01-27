// backend/scripts/list-gcs.js
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json'); // Sesuaikan path key Anda

// Init Firebase (Hanya jika belum di-init di file lain)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nama-bucket-anda.appspot.com' // Ganti dengan nama bucket
    });
}

const bucket = admin.storage().bucket();
const prefix = process.argv[2] || ''; // Folder yg mau dicek (opsional)

async function listFiles() {
    console.log(`📂 Listing files in GCS Bucket (Prefix: "${prefix}")...`);

    try {
        // Ambil file dari GCS
        const [files] = await bucket.getFiles({ prefix: prefix });

        if (files.length === 0) {
            console.log('User folder kosong atau tidak ditemukan.');
            return;
        }

        console.log('\n--- DAFTAR FILE ---');
        files.forEach(file => {
            console.log(`📄 ${file.name} (${file.metadata.size} bytes)`);
        });
        console.log('-------------------\nDone.');

    } catch (error) {
        console.error('❌ Error listing files:', error.message);
    }
}

listFiles();