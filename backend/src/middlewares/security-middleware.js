import cors from "cors";
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: { errors: "Terlalu banyak request, silakan coba lagi nanti." }
});

const whitelist = [
    "http://localhost:5173", 
    "http://localhost:3001",
    "https://api-wwv42552ua-et.a.run.app"
];

export const corsOptions = cors({
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
});