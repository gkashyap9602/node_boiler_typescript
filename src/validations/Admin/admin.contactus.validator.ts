import joi from 'joi';


export const validateAddContactUs = (admin: any) => {
    return joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        message: joi.string().optional(),
    }).validate(admin);
}

export const validateGetContactDetail = (admin: any) => {
    return joi.object({
        contact_id: joi.string().required()
    }).validate(admin);
}

export const validateDeleteContactUs = (admin: any) => {
    return joi.object({
        contact_id: joi.string().required(),
    }).validate(admin);
}

export const validateListContactDetails = (admin: any) => {
    return joi.object({
        sort_column: joi.string().optional().allow(''),
        sort_direction: joi.string().optional().allow(''),
        page: joi.string().optional().allow(''),
        limit: joi.string().optional().allow(''),
        search_key: joi.string().optional().allow(''),
    }).validate(admin);
}

export const validateReplyContactUs = (admin: any) => {
    return joi.object({
        contact_id: joi.string().required(),
        html: joi.string().required()
    }).validate(admin);
}