import Joi from "joi";

const createJournalValidation = Joi.object({
    title: Joi.string().max(255).required().messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
        'any.required': 'Judul wajib diisi',
        'string.empty': 'Judul tidak boleh kosong'
    }),
    note: Joi.string().required().messages({
        'string.base': 'Catatan harus berupa teks',
        'any.required': 'Catatan (Note) wajib diisi',
        'string.empty': 'Catatan tidak boleh kosong'
    })
});

const updateJournalValidation = Joi.object({
    title: Joi.string().max(255).required().messages({
        'string.empty': 'Judul tidak boleh kosong'
    }),
    note: Joi.string().required().messages({
        'string.empty': 'Catatan tidak boleh kosong'
    })
});

export {
    createJournalValidation,
    updateJournalValidation
};