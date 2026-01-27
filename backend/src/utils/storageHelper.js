/**
 * Menghasilkan URL Publik Google Cloud Storage
 * Mengkonversi relative path menjadi full URL.
 * @param {string} path - Relative path file (contoh: "journals/videos/file.webm")
 * @returns {string|null} - Full URL atau null jika path kosong
 */
const getGcsUrl = (path) => {
    if (!path) return null;

    const cleanPath = path.replace(/^\/+/, '');
    const bucketName = process.env.GCS_BUCKET_NAME; 

    return `https://storage.googleapis.com/${bucketName}/${cleanPath}`;
};

export {
    getGcsUrl
};