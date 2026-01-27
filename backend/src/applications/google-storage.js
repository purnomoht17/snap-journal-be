import { Storage } from "@google-cloud/storage";
import path from "path";
import { ResponseError } from "../error/response-error.js";

const storage = new Storage({
    keyFilename: path.resolve(process.env.FIREBASE_CREDENTIALS), 
    projectId: 'journal-app-project'
});

const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Upload file buffer dari Multer ke Google Cloud Storage
 * @param {Object} file - Object file dari req.file (Multer)
 * @param {String} folder - Nama folder tujuan (misal: 'journals/videos')
 * @returns {Promise<String>} - URL Public file yang berhasil diupload
 */
const uploadToGCS = (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new ResponseError(400, "File wajib diupload."));
        }

        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const destination = `${folder}/${fileName}`;
        
        const blob = bucket.file(destination);
        
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error("GCS Upload Error:", err);
            reject(new ResponseError(500, `Gagal upload ke storage: ${err.message}`));
        });

        blobStream.on('finish', () => {            
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

/**
 * Menghapus file fisik dari Google Cloud Storage
 * @param {String} fileUrl - Full URL file (https://storage.googleapis.com/...)
 */
const deleteFromGCS = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        const prefix = `https://storage.googleapis.com/${bucketName}/`;
        
        if (!fileUrl.startsWith(prefix)) {
            console.warn(`URL tidak valid atau bukan dari bucket ini: ${fileUrl}`);
            return;
        }

        const filePath = fileUrl.replace(prefix, '');

        await bucket.file(filePath).delete();
        console.log(`Berhasil menghapus file GCS: ${filePath}`);

    } catch (error) {
        if (error.code === 404) {
            console.warn(`File GCS tidak ditemukan (skip): ${fileUrl}`);
        } else {
            console.error(`Gagal menghapus file GCS: ${error.message}`);
        }
    }
};

export {
    uploadToGCS,
    deleteFromGCS
}