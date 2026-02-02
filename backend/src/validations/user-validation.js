import Joi from "joi";

const updateUserValidation = Joi.object({
    name: Joi.string().min(5).max(100).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.min': 'Nama minimal 5 karakter',
        'string.max': 'Nama maksimal 100 karakter',
        'any.required': 'Nama wajib diisi'}),
});

const updatePasswordValidation = Joi.object({
    oldPassword: Joi.string().min(6).max(100).required().label("Password Lama"),
    newPassword: Joi.string().min(6).max(100).required().label("Password Baru")
});

const fcmTokenValidation = Joi.object({
    token: Joi.string().required().messages({
        'string.base': 'Token harus berupa string',
        'any.required': 'Token wajib diisi',
        'string.empty': 'Token tidak boleh kosong'
    })
});

export {
    updateUserValidation,
    updatePasswordValidation,
    fcmTokenValidation
};