import joi from '@hapi/joi';

const addContactUsSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    message: joi.string().optional(),
});

const getContactDetailSchema = joi.object({
    contact_id: joi.string().required()
});

const deleteContactUsSchema = joi.object({
    contact_id: joi.string().required(),
});

const listContactDetailsSchema = joi.object({
    sort_column: joi.string().optional().allow(''),
    sort_direction: joi.string().optional().allow(''),
    page: joi.string().optional().allow(''),
    limit: joi.string().optional().allow(''),
    search_key: joi.string().optional().allow(''),
});

const replyContactUsSchema = joi.object({
    contact_id: joi.string().required(),
    html: joi.string().required()
});

export const validateAddContactUs = (admin: any) => {
    return addContactUsSchema.validate(admin);
}

export const validateGetContactDetail = (admin: any) => {
    return getContactDetailSchema.validate(admin);
}

export const validateDeleteContactUs = (admin: any) => {
    return deleteContactUsSchema.validate(admin);
}

export const validateListContactDetails = (admin: any) => {
    return listContactDetailsSchema.validate(admin);
}

export const validateReplyContactUs = (admin: any) => {
    return replyContactUsSchema.validate(admin);
}