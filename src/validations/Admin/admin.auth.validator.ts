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
    greet_msg: joi.boolean().optional().allow(''),
})


const verifyFileUpload = joi.object({
    media_type: joi.number().valid(1, 2).error(new Error('media_type 1 for image 2 for video')).required(),
})

export const validateFileUpload = (user: any) => {
    return verifyFileUpload.validate(user)
}



export const validateVerifyOtp = (user: any) => {
    return verifyOtpSchema.validate(user)
}
export const validateResendOtp = (user: any) => {
    return resendOtpSchema.validate(user)
}


export const validateAdminLogin = (admin: any) => {
    return loginSchema.validate(admin)
}

export const validateRegister = (admin: any) => {
    return registerSchema.validate(admin)
}

export const validateForgotPassword = (admin: any) => {
    return forgotPasswordSchema.validate(admin)
}

export const validateResetPassword = (admin: any) => {
    return resetPasswordSchema.validate(admin)
}

export const validateChangePassword = (admin: any) => {
    return changePasswordSchema.validate(admin)
}

export const validateUpdateProfile = (admin: any) => {
    return updateProfileSchema.validate(admin)
}