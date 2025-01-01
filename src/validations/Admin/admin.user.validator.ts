import joi from 'joi';
import { USER_STATUS } from '../../constants/workflow.constant';
const userStatusValues = Object.values(USER_STATUS)

export const validateGetCustomerDetails = (admin: any) => {
    return joi.object({
        user_id: joi.string().required(),
    }).validate(admin)
}
export const validateUpdateUserStatus = (admin: any) => {
    return joi.object({
        user_id: joi.string().required(),
        status: joi.number().valid(...userStatusValues).required(),

    }).validate(admin)
}

export const validateDashboard = (admin: any) => {
    return joi.object({
        past_day: joi.optional().valid('1M', '6M', '1Y', 'MAX'),
    }).validate(admin)
}

