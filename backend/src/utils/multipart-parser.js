import Busboy from 'busboy';

export const parseMultipart = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const contentType = req.headers['content-type'] || '';
            if (!contentType.includes('multipart/form-data')) {
                return resolve({ fields: req.body || {}, files: [] });
            }

            const busboy = Busboy({ 
                headers: req.headers,
                defParamCharset: 'utf8',
                limits: {
                    fileSize: 50 * 1024 * 1024
                }
            });

            const result = { 
                fields: {}, 
                files: [] 
            };

            busboy.on('file', (fieldname, file, info) => {
                const { filename, encoding, mimeType } = info;
                const buffers = [];
                let safeFilename = filename;
                
                if (filename) {
                    safeFilename = filename
                        .replace(/\s+/g, '-')       
                        .replace(/[^a-zA-Z0-9.\-_]/g, '') 
                        .replace(/-+/g, '-')        
                        .toLowerCase();             
                } else {
                    safeFilename = `file-${Date.now()}`; 
                }

                file.on('data', (data) => {
                    buffers.push(data);
                });

                file.on('end', () => {
                    if (buffers.length > 0) {
                        result.files.push({
                            fieldname,
                            originalname: safeFilename, 
                            originalNameRaw: filename,  
                            encoding,
                            mimetype: mimeType,
                            buffer: Buffer.concat(buffers),
                            size: Buffer.concat(buffers).length
                        });
                    }
                });
            });

            busboy.on('field', (fieldname, val) => {
                result.fields[fieldname] = val;
            });

            busboy.on('finish', () => {
                resolve(result);
            });

            busboy.on('error', (err) => {
                console.error("❌ Busboy Error:", err);
                resolve(result);
            });

            if (req.rawBody) {
                busboy.end(req.rawBody);
            } else {
                req.pipe(busboy);
            }
        } catch (error) {
            console.error("❌ Multipart Init Error:", error);
            resolve({ fields: {}, files: [] }); 
        }
    });
};