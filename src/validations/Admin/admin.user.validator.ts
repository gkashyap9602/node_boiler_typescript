import joi from '@hapi/joi';


const getCustomerDetails = joi.object({
    user_id: joi.string().required(),
})

const updateUserStatus = joi.object({
    user_id: joi.string().required(),
    status: joi.number().valid(1, 2, 3).required(),

})


export const validateGetCustomerDetails = (admin: any) => {
    return getCustomerDetails.validate(admin)
}
export const validateUpdateUserStatus = (admin: any) => {
    return updateUserStatus.validate(admin)
}
