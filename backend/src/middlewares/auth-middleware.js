import { admin } from "../applications/firebase.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ errors: "Unauthorized" }).end();
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token, true);
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.code === 'auth/id-token-revoked') {
            res.status(401).json({ errors: "Unauthorized (Token Revoked/Logout)" }).end();
        } else {
            res.status(401).json({ errors: "Unauthorized (Invalid Token)" }).end();
        }
    }
};

export { authMiddleware };