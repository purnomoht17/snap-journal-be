import { database } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";
import { uploadToGCS, deleteFromGCS } from "../applications/google-storage.js";
import { v4 as uuidv4 } from "uuid";
import aiHelperService from "./ai-helper-service.js";

/**
 * Membuat Journal Baru (POST /api/v1/journals)
 * @param {Object} user - User yang sedang login (req.user)
 * @param {Object} request - Body request (title, note)
 * @param {Object} file - File video dari Multer (req.file)
 */
const createJournal = async (user, request, file) => {
    if (!file) {
        throw new ResponseError(400, "File video wajib diunggah.");
    }

    const journalId = uuidv4();
    const now = new Date().toISOString();

    const folder = `journals/${user.uid}/videos`;
    let videoUrl;

    try {
        videoUrl = await uploadToGCS(file, folder);
    } catch (error) {
        throw new ResponseError(500, `Gagal upload video: ${error.message}`);
    }

    const fullText = `${request.title} . ${request.note}`;
    
    let aiAnalysis = { emotion: null, expression: null, confidence: null };

    try {
        const result = await aiHelperService.analyzeSentiment(fullText);
        if (result) {
            aiAnalysis = result;
        }
    } catch (e) {
        console.error("AI Analysis Skipped (Network/Quota Error):", e.message);
    }

    const journalData = {
        id: journalId,
        user_id: user.uid,
        title: request.title,
        note: request.note,
        video_url: videoUrl,
        photo_url: null,     
        image_path: null,    
        
        emotion: aiAnalysis.emotion,        
        expression: aiAnalysis.expression,  
        confidence: aiAnalysis.confidence,  
        
        similarity: null,        
        tags: null,             
        illustrator: null,      
        illustrator_urls: null, 
        chatbot_suggestion: null, 
        chatbot_highlight: null,  
        chatbot_strategy: null,   

        created_at: now,
        updated_at: now
    };

    await database.collection("journals").doc(journalId).set(journalData);

    await database.collection("users").doc(user.uid).update({
        last_entry: now
    });

    return journalData;
};

/**
 * Mengambil daftar jurnal (GET /api/v1/journals)
 * Filter berdasarkan User ID, Bulan, dan Tahun.
 * * @param {Object} user - User yang sedang login (req.user)
 * @param {Object} request - Query params (request.month, request.year)
 * @returns {Object} - Object berisi 'meta' dan 'data'
 */
const listJournal = async (user, request) => {
    const now = new Date();
    const month = request.month ? parseInt(request.month) : now.getMonth() + 1;
    const year = request.year ? parseInt(request.year) : now.getFullYear();
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = endDate.getDate();
    const journalsRef = database.collection("journals");
    
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("created_at", ">=", startDate.toISOString())
        .where("created_at", "<=", endDate.toISOString())
        .orderBy("created_at", "desc")
        .get();

    const journals = [];
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            journals.push(doc.data());
        });
    }

    return {
        meta: {
            filter_month: month,
            filter_year: year,
            days_in_month: daysInMonth,
            period_start: startDate.toISOString(),
            period_end: endDate.toISOString()
        },
        data: journals
    };
};

/**
 * Mengambil detail lengkap satu jurnal (GET /api/v1/journals/:id)
 * Termasuk data hasil analisis AI jika sudah tersedia.
 * @param {Object} user - User object dari token
 * @param {String} journalId - ID Jurnal
 */
const getDetailJournal = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan");
    }

    const journalData = doc.data();
    if (journalData.user_id !== user.uid) {
        throw new ResponseError(403, "Anda tidak memiliki akses ke jurnal ini");
    }
    return journalData;
}

/**
 * Mengupdate data teks jurnal (PUT /api/v1/journals/:id)
 * @param {Object} user - User object
 * @param {Object} request - Body (title, note)
 * @param {String} journalId - ID Jurnal
 */
const updateJournal = async (user, request, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan");
    }

    const currentData = doc.data();

    if (currentData.user_id !== user.uid) {
        throw new ResponseError(403, "Anda tidak memiliki akses untuk mengedit jurnal ini");
    }

    const now = new Date().toISOString();
    const updates = {
        title: request.title,
        note: request.note,
        updated_at: now
    };

    await docRef.update(updates);

    return {
        ...currentData, 
        ...updates     
    };
};

/**
 * Menghapus jurnal & file terkait (DELETE /api/v1/journals/:id)
 * @param {Object} user - User object
 * @param {String} journalId - ID Jurnal
 */
const deleteJournal = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan");
    }

    const journalData = doc.data();
    if (journalData.user_id !== user.uid) {
        throw new ResponseError(403, "Anda tidak memiliki akses untuk menghapus jurnal ini");
    }

    const deletePromises = [];
    
    if (journalData.video_url) {
        deletePromises.push(deleteFromGCS(journalData.video_url));
    }
    
    if (journalData.photo_url) {
        deletePromises.push(deleteFromGCS(journalData.photo_url));
    }

    await Promise.all(deletePromises);
    await docRef.delete();

    return {
        message: "Jurnal dan file terkait berhasil dihapus"
    };
};

export default {
    createJournal,
    listJournal,
    getDetailJournal,
    updateJournal,
    deleteJournal
};