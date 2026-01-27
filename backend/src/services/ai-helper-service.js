import { model } from "../applications/gemini.js";
import { ResponseError } from "../error/response-error.js";
import { aiFormat } from "../utils/textFormatter.js"; 

/**
 * Meminta AI memperbaiki/mengembangkan teks jurnal
 * @param {Object} request - Body { text, instruction }
 */
const enhanceJournalText = async (request) => {
    const { text, instruction } = request;

    if (!model) {
        throw new ResponseError(500, "Layanan AI tidak terkonfigurasi (API Key missing).");
    }

    if (!text) {
        throw new ResponseError(400, "Field 'text' wajib diisi.");
    }

    let systemInstruction = "";
    
    switch (instruction) {
        case "fix_grammar":
            systemInstruction = "Perbaiki tata bahasa (grammar) dan ejaan (typo) teks berikut agar menjadi Bahasa Indonesia yang baku dan benar. Jangan ubah makna kalimat. Hanya berikan hasil perbaikan.";
            break;
        case "paraphrase":
            systemInstruction = "Tulis ulang (parafrase) teks berikut agar lebih mengalir dan natural, namun maknanya tetap sama. Hanya berikan hasil teks baru.";
            break;
        case "elaboration":
            systemInstruction = "Kembangkan teks jurnal pendek ini menjadi lebih panjang, deskriptif, dan menyentuh perasaan. Bayangkan Anda adalah penulis yang sedang mencurahkan isi hati di diary. Hanya berikan hasil teks.";
            break;
        default:
            systemInstruction = "Rapikan teks berikut ini. Hanya berikan hasilnya.";
            break;
    }

    const prompt = `${systemInstruction}\n\n---\nTeks Asli: "${text}"\n---`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let aiOutput = response.text();
        
        aiOutput = aiFormat(aiOutput); 

        return {
            original_text: text,
            enhanced_text: aiOutput,
            instruction: instruction || "general"
        };

    } catch (error) {
        console.error("Gemini Error:", error);
        throw new ResponseError(500, "Gagal memproses permintaan AI. Silakan coba lagi.");
    }
};

/**
 * Menganalisis teks untuk mendapatkan Emosi & Ekspresi (Emoji)
 * @param {String} text - Teks jurnal (Title + Note)
 */
const analyzeSentiment = async (text) => {
    if (!model) return null; 
    if (!text || text.length < 3) return null; 

    const prompt = `
        Analisis teks jurnal berikut sebagai seorang psikolog empati. Tentukan:
        1. "emotion": Satu kata sifat bahasa Inggris yang paling mewakili perasaan dominan penulis (contoh: Happy, Sad, Anxious, Grateful, Tired, Excited, Angry, Calm).
        2. "expression": Satu emoji yang paling tepat mewakili nuansa teks (contoh: 😊, 😢, 😴, 😡, 🧘).
        3. "confidence": Angka desimal 0.0 - 1.0 seberapa yakin kamu dengan analisis ini.

        Output WAJIB berupa JSON valid saja tanpa format markdown.
        Format JSON: {"emotion": "string", "expression": "string", "confidence": number}
        
        Teks Jurnal: "${text}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json|```/g, "").trim();

        const analysis = JSON.parse(jsonText);

        return {
            emotion: analysis.emotion || "Neutral",
            expression: analysis.expression || "😐",
            confidence: analysis.confidence || 0.5
        };

    } catch (error) {
        console.error("Gemini Sentiment Error:", error.message);
        return null; 
    }
};

export default {
    enhanceJournalText,
    analyzeSentiment
};