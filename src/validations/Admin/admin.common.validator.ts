import joi from '@hapi/joi';

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


export const validateCommonContent = (admin: any) => {
    return commonContentSchema.validate(admin)
}

export const validateAddQuestion = (admin: any) => {
    return addQuestionSchema.validate(admin)
}

export const validateUpdateQuestion = (admin: any) => {
    return updateQuestionSchema.validate(admin)
}

