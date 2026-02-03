import { database } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";
import { uploadToGCS, deleteFromGCS } from "../applications/google-storage.js";
import { v4 as uuidv4 } from "uuid";
import aiHelperService from "./ai-helper-service.js";

/**
 * Membuat Journal Baru (POST /api/v1/journals)
 * @param {Object} user - User yang sedang login (req.user)
 * @param {Object} request - Body request (title, note)
 * @param {Object|null} videoFile - File video dari Multer (req.files['video'])
 * @param {Object|null} photoFile - File foto dari Multer (req.files['photo'])
 */
const createJournal = async (user, request, videoFile, photoFile) => {
    if (!request.title) {
        throw new ResponseError(400, "Judul jurnal wajib diisi.");
    }

    const journalId = uuidv4();
    const now = new Date().toISOString();

    let videoUrl = null;
    let photoUrl = null;
    let imagePath = null;

    if (videoFile) {
        try {
            const folder = `journals/${user.uid}/videos`;
            videoUrl = await uploadToGCS(videoFile, folder);
        } catch (error) {
            throw new ResponseError(500, `Gagal upload video: ${error.message}`);
        }
    }

    if (photoFile) {
        try {
            const folder = `journals/${user.uid}/photos`;
            photoUrl = await uploadToGCS(photoFile, folder);
            
            if (photoUrl) {
                const matches = photoUrl.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/);
                if (matches && matches[1]) {
                    imagePath = matches[1];
                } else {
                    imagePath = `${folder}/${photoFile.originalname}`;
                }
            }
        } catch (error) {
            throw new ResponseError(500, `Gagal upload foto: ${error.message}`);
        }
    }

    const fullText = `${request.title} . ${request.note || ""}`;
    let aiAnalysis = { emotion: null, expression: null, confidence: null };

    try {
        if (fullText.length > 3) {
            const result = await aiHelperService.analyzeSentiment(fullText);
            if (result) {
                aiAnalysis = result;
            }
        }
    } catch (e) {
        console.error("AI Analysis Skipped (Network/Quota Error):", e.message);
    }

    const journalData = {
        id: journalId,
        user_id: user.uid,
        title: request.title,
        note: request.note || "", 
        
        video_url: videoUrl,
        photo_url: photoUrl,     
        image_path: imagePath,    
        
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
 * Mengupdate data jurnal (Teks & Foto) (PUT /api/v1/journals/:id)
 * Jika ada upload foto baru, foto lama akan dihapus.
 * @param {Object} user - User object
 * @param {Object} request - Body (title, note)
 * @param {Object|null} photoFile - File foto baru (opsional)
 * @param {String} journalId - ID Jurnal
 */
const updateJournal = async (user, request, photoFile, journalId) => {
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
        updated_at: now
    };

    if (request.title !== undefined) {
        updates.title = request.title;
    }

    if (request.note !== undefined) {
        updates.note = request.note;
    }

    if (photoFile) {
        try {
            if (currentData.photo_url) {
                await deleteFromGCS(currentData.photo_url);
            }

            const folder = `journals/${user.uid}/photos`;
            const newPhotoUrl = await uploadToGCS(photoFile, folder);
        
            let newImagePath = null;
            if (newPhotoUrl) {
                const matches = newPhotoUrl.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/);
                if (matches && matches[1]) {
                    newImagePath = matches[1];
                } else {
                    newImagePath = `${folder}/${photoFile.originalname}`;
                }
            }

            updates.photo_url = newPhotoUrl;
            updates.image_path = newImagePath;

        } catch (error) {
            throw new ResponseError(500, `Gagal update foto: ${error.message}`);
        }
    }

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

/**
 * Meminta AI untuk memperbaiki / mengembangkan teks jurnal (POST /api/v1/journals/enhance)
 * Hanya meneruskan request ke ai-helper-service.
 * @param {Object} user - User object (tidak digunakan, tapi konsisten dengan service lain)
 * @param {Object} request - Body request { text, instruction }
 * @returns {Object} Hasil teks yang sudah diperbaiki oleh AI
 */
const enhanceJournalText = async (user, request) => {
    return await aiHelperService.enhanceJournalText(request);
};

/**
 * Melakukan tanya jawab interaktif dengan konteks jurnal tertentu (POST /api/v1/journals/:id/chat)
 * @param {Object} user - User object yang sedang login (req.user)
 * @param {String} journalId - UUID Jurnal yang akan dijadikan konteks
 * @param {Object} request - Body request berisi { message: "..." }
 * @returns {Promise<Object>} Object berisi { journal_id, question, reply }
 * @throws {ResponseError} 404 jika jurnal tidak ditemukan atau bukan milik user
 */
const chat = async (user, journalId, request) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const journalData = doc.data();

    if (journalData.user_id !== user.uid) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const aiReply = await aiHelperService.chatWithJournalContext(journalData, request.message);

    return {
        journal_id: journalId,
        question: request.message,
        reply: aiReply
    };
};

/**
 * Memicu analisis AI manual untuk jurnal tertentu (POST /api/v1/journals/:id/analyze)
 * Mengambil data jurnal, meminta insight ke AI (Tags, Strategy, Suggestion), 
 * dan menyimpan hasilnya secara permanen ke database.
 * * @param {Object} user - User object yang sedang login (mengandung uid)
 * @param {String} journalId - UUID Jurnal yang akan dianalisis
 * @returns {Promise<Object>} Data jurnal lengkap yang sudah diupdate dengan insight AI
 * @throws {ResponseError} 404 jika jurnal tidak ditemukan atau bukan milik user
 * @throws {ResponseError} 500 jika layanan AI gagal
 */
const analyze = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const journalData = doc.data();

    if (journalData.user_id !== user.uid) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const insights = await aiHelperService.generateJournalInsights(journalData);

    if (!insights) {
        throw new ResponseError(500, "Layanan AI sedang sibuk, gagal mendapatkan insight.");
    }

    const updateData = {
        tags: insights.tags,
        chatbot_highlight: insights.chatbot_highlight,
        chatbot_suggestion: insights.chatbot_suggestion,
        chatbot_strategy: insights.chatbot_strategy,
        updated_at: new Date().toISOString()
    };

    await docRef.update(updateData);

    return {
        ...journalData,
        ...updateData
    };
};

/**
 * Mengambil data Mood Calendar (GET /api/v1/mood-calendar)
 * Mengelompokkan emosi berdasarkan tanggal dalam bulan tertentu.
 * @param {Object} user - User object
 * @param {Object} request - Query { year, month }
 */
const getMoodCalendar = async (user, request) => {
    const now = new Date();
    const year = request.year ? parseInt(request.year) : now.getFullYear();
    const month = request.month ? parseInt(request.month) : now.getMonth() + 1;
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const journalsRef = database.collection("journals");
    
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("created_at", ">=", startDate.toISOString())
        .where("created_at", "<=", endDate.toISOString())
        .orderBy("created_at", "desc") 
        .get();

    const moods = {};

    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            const data = doc.data();
            
            const dateObj = new Date(data.created_at);
            const day = dateObj.getUTCDate();

            if (!moods[day]) {
                moods[day] = {
                    emotion: data.emotion,
                    expression: data.expression 
                };
            }
        });
    }

    return {
        year: year,
        month: month,
        moods: moods
    };
};

export default {
    createJournal,
    listJournal,
    getDetailJournal,
    updateJournal,
    deleteJournal,
    chat,
    analyze,
    getMoodCalendar,
    enhanceJournalText
};