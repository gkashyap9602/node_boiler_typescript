import joi from 'joi';

export const validateCommonContent = (admin: any) => {
    return joi.object({
        about: joi.string().optional(),
        privacy_policy: joi.string().optional(),
        terms_conditions: joi.string().optional(),
    }).validate(admin)
}

export const validateAddQuestion = (admin: any) => {
    return joi.object({
        question: joi.string().required(),
        answer: joi.string().required(),
    }).validate(admin)
}

export const validateUpdateQuestion = (admin: any) => {
    return joi.object({
        question_id: joi.string().required(),
        question: joi.string().optional(),
        answer: joi.string().optional(),
    }).validate(admin)
}
export const validateDeleteQuestion = (admin: any) => {
    return joi.object({
        question_id: joi.string().required()
    }).validate(admin)
}

