import joi from '@hapi/joi';

// @ts-ignore
joi['objectId'] = require('joi-objectid')(joi)

// @ts-ignore
const schema = joi.objectId()


const storeParmeterToAws = joi.object({
    name: joi.string().trim().required(),
    value: joi.string().trim().required(),
})



export const validateStoreParmeterToAws = (common: any) => {
    return storeParmeterToAws.validate(common)
}


export const validateObjectId = (id: string) => {
    return schema.validate(id)
}
