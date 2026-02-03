import { parseMultipart } from "../utils/multipart-parser.js";

export const multipartMiddleware = async (req, res, next) => {
    try {
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return next(); 
        }

        const result = await parseMultipart(req);

        req.body = result.fields; 
        req.files = {}; 
        
        if (result.files && result.files.length > 0) {
            result.files.forEach(file => {
                if (!req.files[file.fieldname]) {
                    req.files[file.fieldname] = [];
                }
                req.files[file.fieldname].push(file);
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};