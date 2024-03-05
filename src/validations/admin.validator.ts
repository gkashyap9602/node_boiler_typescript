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

const validateResetPasswordSchema = joi.object({
    email: joi.string().trim().email().min(4).max(35).required(),
    new_password: joi.string().min(4).max(20).required(),
})
const validateChangePasswordSchema = joi.object({
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

const commonContentSchema = joi.object({
    about: joi.string().required(),
    privacy_policy: joi.string().required(),
    terms_conditions: joi.string().required(),
})

const addQuestionSchema = joi.object({
    question: joi.string().required(),
    answer: joi.string().required(),
})
const updateQuestionSchema = joi.object({
    question_id: joi.string().required(),
    question: joi.string().optional(),
    answer: joi.string().optional(),
})




export const validateVerifyOtp = (user: any) => {
    return verifyOtpSchema.validate(user)
}
export const validateResendOtp = (user: any) => {
    return resendOtpSchema.validate(user)
}


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

export const validateCommonContent = (admin: any) => {
    return commonContentSchema.validate(admin)
}

export const validateAddQuestion = (admin: any) => {
    return addQuestionSchema.validate(admin)
}

export const validateUpdateQuestion = (admin: any) => {
    return updateQuestionSchema.validate(admin)
}