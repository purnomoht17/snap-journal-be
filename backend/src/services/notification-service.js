import { database } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";

/**
 * Mengambil daftar notifikasi user (GET /api/v1/notifications)
 * @param {Object} user - User object dari token
 * @param {Object} request - Query params (limit)
 */
const list = async (user, request) => {
    const limit = request.limit ? parseInt(request.limit) : 50;
    
    const notificationsRef = database.collection("notifications");
    const snapshot = await notificationsRef
        .where("notifiable_id", "==", user.uid)
        .orderBy("created_at", "desc")
        .limit(limit)
        .get();

    if (snapshot.empty) {
        return [];
    }

    const notifications = snapshot.docs.map(doc => {
        const rawData = doc.data();
        let parsedData = {};

        try {
            if (typeof rawData.data === 'string') {
                parsedData = JSON.parse(rawData.data);
            } else {
                parsedData = rawData.data || {};
            }
        } catch (e) {
            console.error(`Gagal parsing JSON notifikasi ${doc.id}:`, e);
            parsedData = { title: "Notification", message: "Failed to load content" };
        }

        return {
            id: doc.id,
            title: parsedData.title || "No Title",
            message: parsedData.message || rawData.type || "No Message", 
            read_at: rawData.read_at,
            created_at: rawData.created_at 
        };
    });

    return notifications;
};

/**
 * Menandai satu notifikasi sebagai sudah dibaca (PATCH /api/v1/notifications/:id/read)
 * @param {Object} user - User object
 * @param {String} notificationId - UUID Notifikasi
 */
const markAsRead = async (user, notificationId) => {
    const docRef = database.collection("notifications").doc(notificationId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Notifikasi tidak ditemukan");
    }

    const data = doc.data();

    if (data.notifiable_id !== user.uid) {
        throw new ResponseError(404, "Notifikasi tidak ditemukan"); 
    }

    const now = new Date().toISOString();
    
    await docRef.update({
        read_at: now,
        updated_at: now
    });

    return {
        id: notificationId,
        read_at: now,
        message: "Notifikasi ditandai sudah dibaca"
    };
};

export default {
    list,
    markAsRead
};