import { database } from "../applications/database.js";
import { admin } from "../applications/firebase.js";
import { ResponseError } from "../error/response-error.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import emailService from "./email-service.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL;

// --- INTERNAL HELPER: Proses Verifikasi Email ---
const _processVerificationEmail = async (uid, email, name) => {
    const token = jwt.sign(
        { uid: uid, email: email }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    const verificationLink = `${APP_URL}/api/v1/auth/email/verify?token=${token}`;

    await emailService.sendVerificationEmail(email, name, verificationLink);

    await database.collection("users").doc(uid).update({
        last_verification_sent_at: new Date().toISOString()
    });
};

/**
 * Mendaftarkan user baru ke Firebase Auth & Firestore
 * @param {Object} request - Body request (name, email, password)
 */
const register = async (request) => {
    const userCheck = await database.collection("users")
        .where("email", "==", request.email)
        .get();

    if (!userCheck.empty) {
        throw new ResponseError(400, "Email sudah terdaftar");
    }

    let userRecord;

    try {
        userRecord = await admin.auth().createUser({
            email: request.email,
            password: request.password,
            displayName: request.name,
        });
    } catch (error) {
        throw new ResponseError(400, `Gagal mendaftarkan user: ${error.message}`);
    }

    const now = new Date().toISOString();

    const userData = {
        uid: userRecord.uid,
        name: request.name,
        email: request.email,
        password: "encrypted_by_firebase", 
        email_verified_at: null,
        remember_token: null,
        fcm_token: null,
        last_entry_at: now,
        last_entry: null,  
        last_reminder_at: null,
        created_at: now,
        updated_at: now
    };

    await database.collection("users").doc(userRecord.uid).set(userData);

    await _processVerificationEmail(userRecord.uid, request.email, request.name);

    return {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at,
        message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi."
    };
}

/**
 * Login user menggunakan Email & Password via Google Identity Toolkit
 * @param {Object} request - Body request (email, password)
 */
const login = async (request) => {
    const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;

    try {
        const response = await axios.post(loginUrl, {
            email: request.email,
            password: request.password,
            returnSecureToken: true
        });

        const { idToken, localId, refreshToken, expiresIn } = response.data;

        const userDoc = await database.collection("users").doc(localId).get();
        if (!userDoc.exists) {
            throw new ResponseError(404, "User profile not found");
        }

        const userData = userDoc.data();

        await database.collection("users").doc(localId).update({
            last_entry_at: new Date().toISOString()
        });

        return {
            token: idToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            user: {
                uid: localId,
                name: userData.name,
                email: userData.email,
                email_verified_at: userData.email_verified_at || null 
            }
        };

    } catch (error) {
        if (error.response) {
            const errorCode = error.response.data.error.message;
            if (errorCode === "EMAIL_NOT_FOUND" || errorCode === "INVALID_PASSWORD" || errorCode === "INVALID_LOGIN_CREDENTIALS") {
                throw new ResponseError(401, "Email atau password salah");
            } else if (errorCode === "USER_DISABLED") {
                throw new ResponseError(403, "Akun ini telah dinonaktifkan");
            } else if (errorCode === "TOO_MANY_ATTEMPTS_TRY_LATER") {
                throw new ResponseError(429, "Terlalu banyak percobaan login gagal. Silakan coba lagi nanti.");
            }
        }
        throw new ResponseError(500, "Layanan login bermasalah");
    }
}

/**
 * Logout user (Revoke Refresh Token)
 * @param {Object} user - User object dari Middleware
 */
const logout = async (user) => {
    try {
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {    
        console.error("Gagal revoke token:", error);
    }

    return {
        message: "Logout berhasil"
    };
}

/**
 * Mendapatkan data user yang sedang login (GET /me)
 * @param {Object} user - User object dari Middleware Auth (hasil decode token)
 */
const getMe = async (user) => {
    const userDoc = await database.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    const userData = userDoc.data();
    
    return {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        last_entry_at: userData.last_entry_at
    };
}

/**
 * Mengirim ulang email verifikasi (POST /email/verify-notification)
 * @param {Object} user - User object dari Middleware
 */
const sendVerificationEmail = async (user) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    const userData = userDoc.data();

    if (userData.email_verified_at) {
        throw new ResponseError(400, "Email sudah terverifikasi sebelumnya.");
    }

    const lastSent = userData.last_verification_sent_at ? new Date(userData.last_verification_sent_at) : null;
    const now = new Date();
    
    if (lastSent) {
        const diffInSeconds = (now - lastSent) / 1000;
        if (diffInSeconds < 60) { 
            throw new ResponseError(429, "Terlalu banyak permintaan. Silakan tunggu beberapa saat.");
        }
    }

    await _processVerificationEmail(user.uid, userData.email, userData.name);

    return {
        message: "Link verifikasi telah dikirim ulang ke email Anda.",
        status: "verification-link-sent"
    };
}

/**
 * Memverifikasi email user berdasarkan token (GET /email/verify)
 * @param {Object} request - Query params (token)
 */
const verifyEmail = async (request) => {
    const { token } = request;

    if (!token) {
        throw new ResponseError(400, "Token verifikasi wajib ada.");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new ResponseError(403, "Link verifikasi tidak valid atau sudah kadaluarsa.");
    }

    const { uid, email } = decoded;
    const userRef = database.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan.");
    }

    const userData = userDoc.data();

    if (userData.email !== email) {
        throw new ResponseError(403, "Token tidak valid untuk akun ini.");
    }

    if (userData.email_verified_at) {
        return {
            message: "Email sudah terverifikasi sebelumnya.",
            email_verified_at: userData.email_verified_at
        };
    }

    const now = new Date().toISOString();

    await userRef.update({
        email_verified_at: now,
        updated_at: now
    });

    try {
        await admin.auth().updateUser(uid, { emailVerified: true });
    } catch (e) {
        console.error("Gagal update status verifikasi di Firebase Auth:", e);
    }

    return {
        message: "Email berhasil diverifikasi! Akun Anda kini aktif.",
        email_verified_at: now
    };
}

/**
 * Request Link Reset Password (POST /forgot-password)
 */
const forgotPassword = async (request) => {
    const usersRef = database.collection("users");
    const snapshot = await usersRef.where("email", "==", request.email).limit(1).get();

    if (snapshot.empty) {
        throw new ResponseError(404, "Email tidak terdaftar.");
    }

    const token = jwt.sign(
        { email: request.email, type: 'reset-password' }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );
    
    const now = new Date();

    await database.collection("password_reset_tokens").doc(request.email).set({
        email: request.email,
        token: token,
        created_at: now.toISOString()
    });

    const resetLink = `${APP_URL}/reset-password?token=${token}&email=${request.email}`;

    await emailService.sendResetPasswordEmail(request.email, resetLink);

    return {
        message: "Link reset password telah dikirim ke email Anda."
    };
}

/**
 * Proses Reset Password Baru (POST /reset-password)
 */
const resetPassword = async (request) => {
    const { email, token, password, password_confirmation } = request;

    if (password !== password_confirmation) {
        throw new ResponseError(400, "Konfirmasi password tidak cocok.");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new ResponseError(400, "Token tidak valid atau sudah kadaluarsa.");
    }

    if (decoded.email !== email) {
        throw new ResponseError(400, "Token tidak valid untuk email ini.");
    }

    const tokenDocRef = database.collection("password_reset_tokens").doc(email);
    const tokenDoc = await tokenDocRef.get();

    if (!tokenDoc.exists) {
        throw new ResponseError(400, "Permintaan reset password tidak valid atau sudah digunakan.");
    }

    const tokenData = tokenDoc.data();

    if (tokenData.token !== token) {
        throw new ResponseError(400, "Token reset password tidak valid.");
    }

    const usersSnapshot = await database
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (usersSnapshot.empty) {
        throw new ResponseError(404, "User tidak ditemukan.");
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    try {
        await admin.auth().updateUser(userId, {
            password: password
        });
        await admin.auth().revokeRefreshTokens(userId);

    } catch (error) {
        throw new ResponseError(500, `Gagal mengupdate password: ${error.message}`);
    }

    await tokenDocRef.delete();

    return {
        message: "Password berhasil diubah. Silakan login dengan password baru."
    };
};

export default {
    register,
    login,
    logout,
    getMe,
    sendVerificationEmail,
    verifyEmail,
    forgotPassword,
    resetPassword
}