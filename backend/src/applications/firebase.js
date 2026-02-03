import admin from 'firebase-admin';
import { createRequire } from 'module'; 
import dotenv from 'dotenv';
import { logger } from "./logging.js"; 

dotenv.config();

let firebaseApp;

const isProduction = process.env.NODE_ENV === 'production' || process.env.K_SERVICE;

if (isProduction) {
    // --- MODE PRODUCTION (Cloud Functions / Cloud Run) ---
    firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.GOOGLE_BUCKET_NAME
    });
    logger.info("🔥 Firebase Init: Production Mode (ADC)");

} else {
    // --- MODE DEVELOPMENT (Localhost) ---
    try {
        const require = createRequire(import.meta.url);
        const serviceAccount = require('../../service-account-key.json');
        
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.GOOGLE_BUCKET_NAME
        });
        logger.info("💻 Firebase Init: Local Development Mode");
    } catch (error) {
        console.warn("⚠️ service-account-key.json tidak ditemukan. Mencoba menggunakan ADC Lokal...");
        
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: process.env.GOOGLE_BUCKET_NAME
        });
    }
}

const db = admin.firestore();
const bucket = admin.storage().bucket(); 
const messaging = admin.messaging();

export { admin, db, bucket, messaging, firebaseApp };