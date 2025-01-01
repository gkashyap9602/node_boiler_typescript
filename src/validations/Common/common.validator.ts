import joi from 'joi';

export const validateStoreParmeterToAws = (common: any) => {
    return joi.object({
        name: joi.string().trim().required(),
        value: joi.string().trim().required(),
    }).validate(common)
}

