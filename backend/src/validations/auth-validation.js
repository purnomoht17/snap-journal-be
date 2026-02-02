import Joi from "joi";

const registerUserValidation = Joi.object({
    name: Joi.string().min(5).max(100).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.min': 'Nama minimal 5 karakter',
        'string.max': 'Nama maksimal 100 karakter',
        'any.required': 'Nama wajib diisi'
    }),
    email: Joi.string().email().max(100).required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': 'Password minimal 6 karakter',
        'any.required': 'Password wajib diisi'
    })
});

const loginUserValidation = Joi.object({
    email: Joi.string().email().max(100).required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': 'Password minimal 6 karakter',
        'any.required': 'Password wajib diisi'
    })
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().max(100).required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    })
});

const resetPasswordValidation = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Token wajib disertakan'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib disertakan'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': 'Password minimal 6 karakter',
        'any.required': 'Password baru wajib diisi'
    }),
    password_confirmation: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'Konfirmasi password tidak cocok',
        'any.required': 'Konfirmasi password wajib diisi'
    })
});

export {
    registerUserValidation,
    loginUserValidation,
    forgotPasswordValidation,
    resetPasswordValidation
};