import { database } from "../applications/database.js";
import { admin } from "../applications/firebase.js";
import { ResponseError } from "../error/response-error.js";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

/**
 * Mengupdate profil user (PUT /settings/profile)
 * @param {Object} user - User object dari Middleware
 * @param {Object} request - Body request (name)
 */
const updateProfile = async (user, request) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    const updateData = {
        updatedAt: new Date().toISOString()
    };

    if (request.name) {
        updateData.name = request.name;
        try {
            await admin.auth().updateUser(user.uid, {
                displayName: request.name
            });
        } catch (error) {
            console.error("Gagal update Firebase Auth:", error);
        }
    }

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    return updatedDoc.data();
}

/**
 * Mengganti password user (PUT /settings/password)
 * @param {Object} user - User object dari Middleware
 * @param {Object} request - Body request (oldPassword, newPassword)
 */
const updatePassword = async (user, request) => {
    
    const userDoc = await database.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }
    const email = userDoc.data().email;

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;

    try {
        await axios.post(verifyUrl, {
            email: email,
            password: request.oldPassword,
            returnSecureToken: true
        });
    } catch (error) {
        throw new ResponseError(401, "Password lama salah");
    }

    try {
        await admin.auth().updateUser(user.uid, {
            password: request.newPassword
        });
    } catch (error) {
        throw new ResponseError(400, `Gagal update password: ${error.message}`);
    }

    return {
        message: "Password berhasil diperbarui, silakan login kembali dengan password baru"
    };
}

/**
 * Menghapus akun user secara permanen (DELETE /settings/account)
 * @param {Object} user - User object dari Middleware
 */
const deleteAccount = async (user) => {
    const userRef = database.collection("users").doc(user.uid);
    
    try {
        await admin.auth().deleteUser(user.uid);
        await userRef.delete();
        
        return {
            message: "Akun berhasil dihapus permanen"
        };
    } catch (error) {
        throw new ResponseError(500, `Gagal menghapus akun: ${error.message}`);
    }
}

/**
 * Menyimpan FCM Token (POST /api/v1/fcm/token)
 * @param {Object} user - User dari auth middleware
 * @param {Object} request - Body request { token: "..." }
 */
const setFcmToken = async (user, request) => {
    const userRef = database.collection("users").doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    await userRef.update({
        fcm_token: request.token,
        updated_at: new Date().toISOString()
    });

    return {
        message: "FCM token berhasil disimpan",
        user_id: user.uid
    };
}

export default {
    updateProfile,
    updatePassword,
    deleteAccount,
    setFcmToken
}