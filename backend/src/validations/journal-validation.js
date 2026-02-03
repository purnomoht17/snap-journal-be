import Joi from "joi";

const createJournalValidation = Joi.object({
    title: Joi.string().max(255).required().messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
        'any.required': 'Judul wajib diisi',
        'string.empty': 'Judul tidak boleh kosong'
    }),

    note: Joi.string().optional().allow('').messages({
        'string.base': 'Catatan harus berupa teks'
    })
});

const updateJournalValidation = Joi.object({

    title: Joi.string().max(255).optional().messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
        'string.empty': 'Judul tidak boleh kosong'
    }),
    note: Joi.string().optional().allow('').messages({
        'string.base': 'Catatan harus berupa teks'
    })
});

export {
    createJournalValidation,
    updateJournalValidation
};