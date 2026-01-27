import admin from 'firebase-admin';
import { createRequire } from 'module'; 
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url);
let serviceAccount;

try {
    serviceAccount = require('../../service-account-key.json');
} catch (error) {
    console.error("Gagal memuat service-account-key.json. Pastikan file ada di root folder.");
    process.exit(1);
}

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.GCS_BUCKET_NAME
});

const db = admin.firestore();
const storage = admin.storage();
const messaging = admin.messaging();

console.log("Firebase Connected Successfully");

export { admin, db, storage, messaging, firebaseApp };