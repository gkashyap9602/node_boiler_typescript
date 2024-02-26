import joi from '@hapi/joi';

const loginSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
})

const registerSchema = joi.object({
    first_name: joi.string().trim().min(4).max(20).required(),
    last_name: joi.string().min(4).max(20).required(),
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
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