import Joi from "joi";

// Schema untuk Update Profile
const updateUserValidation = Joi.object({
    name: Joi.string().max(100).required()
});

// [BARU] Schema untuk Update Password
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