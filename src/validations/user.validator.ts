import joi from '@hapi/joi';


const walletAddres = joi.object({
    walletAddress: joi.string().min(42).max(43).required(),
})

const schema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
})

const userProfileSchema = joi.object({
    firstName: joi.string().trim().required(),
    lastName: joi.string().optional(),
    // userName: joi.string().min(4).max(20).required(),
    email: joi.string().trim().email().min(4).max(35).required(),
    password: joi.string().min(4).max(20).required(),
})

const verrifyOtpSchema = joi.object({
    otp: joi.number().required()
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

export const validateUser = (user: any) => {
    return schema.validate(user)
}

export const validateWalletAddressUser = (user: any) => {
    return walletAddres.validate(user)
}

export const validateProfile = (user: any) => {
    return userProfileSchema.validate(user)
}

export const validateForgotPassword = (user: any) => {
    return forgotPasswordSchema.validate(user)
}

export const validateVerrifyOtp = (user: any) => {
    return verrifyOtpSchema.validate(user)
}

export const validateResetPassword = (user: any) => {
    return validateResetPasswordSchema.validate(user)
}

export const validateChangePassword = (user: any) => {
    return validateChangePasswordSchema.validate(user)
}