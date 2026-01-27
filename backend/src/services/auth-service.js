import { database } from "../applications/database.js";
import { admin } from "../applications/firebase.js";
import { ResponseError } from "../error/response-error.js";
import axios from "axios";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const FIREBASE_API_KEY = process.env.FIREBASE_CLIENT_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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

    return {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at
    };
}

/**
 * Login user menggunakan Email & Password via Google Identity Toolkit
 * @param {Object} request - Body request (email, password)
 */
const login = async (request) => {
    const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

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
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
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

    const token = jwt.sign(
        { uid: user.uid, email: userData.email }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    const verificationLink = `${APP_URL}/api/v1/auth/email/verify?token=${token}`;

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to: userData.email,
        subject: "Verifikasi Email Akun Snap Journal",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Halo, ${userData.name}!</h2>
                <p>Terima kasih telah mendaftar di Snap Journal. Untuk mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifikasi Email Saya</a>
                </div>
                <p style="color: #666; font-size: 14px;">Tautan ini hanya berlaku selama 1 jam.</p>
                <p style="color: #666; font-size: 14px;">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Snap Journal Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("SMTP Error:", error);
        throw new ResponseError(500, "Gagal mengirim email verifikasi.");
    }

    await userRef.update({
        last_verification_sent_at: now.toISOString()
    });

    return {
        message: "Link verifikasi telah dikirim ke email Anda.",
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
        updatedAt: now
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

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to: request.email,
        subject: "Reset Password - Snap Journal",
        html: `
            <h3>Permintaan Reset Password</h3>
            <p>Seseorang meminta untuk mereset password akun Snap Journal Anda.</p>
            <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>Link ini berlaku selama 60 menit.</p>
            <p>Jika ini bukan Anda, abaikan email ini.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("SMTP Error:", error);
        throw new ResponseError(500, "Gagal mengirim email reset password.");
    }

    return {
        message: "Link reset password telah dikirim ke email Anda."
    };
}

/**
 * Proses Reset Password Baru (POST /reset-password)
 */
const resetPassword = async (request) => {
    const { email, token, password } = request;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.email !== email) {
            throw new ResponseError(400, "Token tidak valid untuk email ini.");
        }
    } catch (error) {
        throw new ResponseError(400, "Token tidak valid atau sudah kadaluarsa.");
    }

    const tokenDocRef = database.collection("password_reset_tokens").doc(email);
    const tokenDoc = await tokenDocRef.get();

    if (!tokenDoc.exists) {
        throw new ResponseError(400, "Permintaan reset password tidak valid atau sudah digunakan.");
    }

    const tokenData = tokenDoc.data();

    if (tokenData.token !== token) {
        throw new ResponseError(400, "Token tidak valid.");
    }

    const usersSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();
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
}

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