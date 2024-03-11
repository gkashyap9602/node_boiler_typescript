import joi from '@hapi/joi';

const storeParmeterToAws = joi.object({
    name: joi.string().trim().required(),
    value: joi.string().trim().required(),
})

export const validateStoreParmeterToAws = (common: any) => {
    return storeParmeterToAws.validate(common)
}

