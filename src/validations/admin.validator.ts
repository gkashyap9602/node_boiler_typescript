import joi from '@hapi/joi';

const loginSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
})

const registerSchema = joi.object({
    firstName: joi.string().trim().min(4).max(20).required(),
    lastName: joi.string().min(4).max(20).required(),
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
})



const forgotPasswordSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required()
})

const validateResetPasswordSchema = joi.object({
    password: joi.string().min(4).max(20).required(),
})
const validateChangePasswordSchema = joi.object({
    oldPassword: joi.string().min(4).max(20).required(),
    newPassword: joi.string().min(4).max(20).required(),
})



export const validateAdmin = (admin: any) => {
    return loginSchema.validate(admin)
}

export const validateRegister = (admin: any) => {
    return registerSchema.validate(admin)
}

export const validateForgotPassword = (admin: any) => {
    return forgotPasswordSchema.validate(admin)
}

export const validateResetPassword = (admin: any) => {
    return validateResetPasswordSchema.validate(admin)
}

export const validateChangePassword = (admin: any) => {
    return validateChangePasswordSchema.validate(admin)
}