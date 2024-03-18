import joi from '@hapi/joi';

const loginSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
    os_type: joi.string().required(),
})

const registerSchema = joi.object({
    first_name: joi.string().trim().min(4).max(20).required(),
    last_name: joi.string().min(4).max(20).required(),
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
    phone_number: joi.string().min(4).max(20).optional().allow(''),
    country_code: joi.string().min(1).max(4).optional().allow(''),
    os_type: joi.string().required(),
})


const forgotPasswordSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required()
})

const resetPasswordSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    new_password: joi.string().min(4).max(20).required(),
})

const changePasswordSchema = joi.object({
    old_password: joi.string().min(4).max(20).required(),
    new_password: joi.string().min(4).max(20).required(),
})


const verifyOtpSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    otp: joi.string().min(4).max(20).required(),
})


const resendOtpSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
})

const updateProfileSchema = joi.object({
    first_name: joi.string().optional().allow(''),
    last_name: joi.string().optional().allow(''),
    phone_number: joi.string().optional().allow(''),
    country_code: joi.string().optional().allow(''),
})

export const validateVerifyOtp = (user: any) => {
    return verifyOtpSchema.validate(user)
}
export const validateResendOtp = (user: any) => {
    return resendOtpSchema.validate(user)
}

export const validateUser = (user: any) => {
    return loginSchema.validate(user)
}

export const validateRegister = (user: any) => {
    return registerSchema.validate(user)
}

export const validateForgotPassword = (user: any) => {
    return forgotPasswordSchema.validate(user)
}

export const validateResetPassword = (user: any) => {
    return resetPasswordSchema.validate(user)
}

export const validateChangePassword = (user: any) => {
    return changePasswordSchema.validate(user)
}

export const validateUpdateProfile = (user: any) => {
    return updateProfileSchema.validate(user)
}