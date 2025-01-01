import joi from 'joi';

export const validateFileUpload = (user: any) => {
    return joi.object({
        media_type: joi.number().valid(1, 2).error(new Error('media_type 1 for image 2 for video')).required(),
    }).validate(user)
}

export const validateVerifyOtp = (user: any) => {
    return joi.object({
        email: joi.string().trim().email().min(4).max(35).required(),
        otp: joi.string().min(4).max(20).required(),
    }).validate(user)
}
export const validateResendOtp = (user: any) => {
    return joi.object({
        email: joi.string().trim().email().min(4).max(35).required(),
    }).validate(user)
}


export const validateAdminLogin = (admin: any) => {
    return joi.object({
        email: joi.string().trim().email().min(4).max(35).required(),
        password: joi.string().min(4).max(20).required(),
    }).validate(admin)
}

export const validateRegister = (admin: any) => {
    return joi.object({
        first_name: joi.string().trim().min(4).max(20).required(),
        last_name: joi.string().min(4).max(20).required(),
        email: joi.string().trim().email().min(4).max(35).required(),
        password: joi.string().min(4).max(20).required(),
    }).validate(admin)
}

export const validateForgotPassword = (admin: any) => {
    return joi.object({
        email: joi.string().trim().email().min(4).max(35).required()
    }).validate(admin)
}

export const validateResetPassword = (admin: any) => {
    return joi.object({
        email: joi.string().trim().email().min(4).max(35).required(),
        new_password: joi.string().min(4).max(20).required(),
        otp: joi.string().required(),
    }).validate(admin)
}

export const validateChangePassword = (admin: any) => {
    return joi.object({
        old_password: joi.string().min(4).max(20).required(),
        new_password: joi.string().min(4).max(20).required(),
    }).validate(admin)
}

export const validateUpdateProfile = (admin: any) => {
    return joi.object({
        first_name: joi.string().optional().allow(''),
        last_name: joi.string().optional().allow(''),
        phone_number: joi.string().optional().allow(''),
        country_code: joi.string().optional().allow(''),
        greet_msg: joi.boolean().optional().allow(''),
    }).validate(admin)
}