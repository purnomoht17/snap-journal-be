import Joi from "joi";

// Schema untuk Register (Butuh Nama, Email, Password)
const registerUserValidation = Joi.object({
    name: Joi.string().max(100).required().messages({
        'string.base': 'Nama harus berupa teks',
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

// Schema untuk Login (Cukup Email, Password)
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

// Schema untuk Request Forgot Password
const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().max(100).required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    })
});

// Schema untuk Reset Password
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