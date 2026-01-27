/**
 * Memformat teks dari HTML/Rich Text menjadi Clean Markdown/Plain Text.
 * Berguna untuk membersihkan output AI sebelum disimpan ke database.
 * @param {string} text - Teks input
 * @returns {string} - Teks yang sudah diformat
 */
export const aiFormat = (text) => {
    if (!text) return "";

    let formatted = text;

    formatted = formatted.replace(/<(b|strong)>(.*?)<\/(b|strong)>/gi, '**$2**');
    formatted = formatted.replace(/<(i|em)>(.*?)<\/(i|em)>/gi, '*$2*');
    formatted = formatted.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
    formatted = formatted.replace(/<\/?(ul|ol)[^>]*>/gi, '');
    formatted = formatted.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    formatted = formatted.replace(/<br\s*\/?>/gi, '\n');
    formatted = formatted.replace(/<[^>]+>/g, '');
    formatted = formatted.replace(/[ \t]+/g, ' ');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
};