import { ResponseError } from "../error/response-error.js";

const verifiedMiddleware = (req, res, next) => {
    const user = req.user;

    if (!user) {
        next(new ResponseError(401, "Unauthorized"));
        return;
    }

    if (user.email_verified) {
        next();
    } else {
        next(new ResponseError(403, "Email Anda belum diverifikasi. Silakan cek inbox email Anda."));
    }
};

export { verifiedMiddleware };