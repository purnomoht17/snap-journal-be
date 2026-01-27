import multer from "multer";
import { ResponseError } from "../error/response-error.js";

const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'video/webm' 
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {            
        cb(new ResponseError(400, 'Format video tidak valid. Wajib menggunakan format .webm (Realtime Camera).'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

export { upload };