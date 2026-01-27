import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logging.js";

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} else {
    logger.error("GEMINI_API_KEY belum diset di .env");
}

export { model };