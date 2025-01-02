import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findByIdAndUpdate, findOneAndUpdate, findAndUpdatePushOrSet, findOneAndDelete } from "../../helpers/db.helpers";
import { decodeToken, generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import userAuthModel from "../../models/User/user.auth.model";
import { APP } from '../../constants/app.constant';
import { DEACTIVATE_BY, EMAIL_SEND_TYPE, ROLE, USER_STATUS } from '../../constants/workflow.constant';
import services from '../../services';
import responseMessage from '../../constants/responseMessages'
import statusCodes from '../../constants/statusCodes'

const UserAuthHandler = {
    update_social_info: async (findUser: any, model: any, data: any) => {
        try {
            const { login_source, social_auth, email, name } = data

            const editObj: any = {}

            const social_account = {
                email,
                source: login_source,
                token: social_auth,
                name: name
            }

            // Check if social account exists in device_info array
            const accountIndex = findUser?.data?.social_account?.findIndex((info: any) => info?.source === data?.login_source);

            //if exist then update else add new
            if (accountIndex !== -1) {
                editObj[`social_account.${accountIndex}`] = social_account;
            } else {
                editObj.$push = { social_account: social_account }
            }

            const response = await findAndUpdatePushOrSet(model, { _id: findUser.data?._id }, editObj);
            //return update result
            if (response.status) {
                return { status: true, data: response.data }

            } else {
                return { status: false, data: null }
            }

        } catch (error) {
            console.log(error, "error update_device_idd")
            return { status: false }
        }
    },//ends

    login: async (data: any): Promise<ApiResponse> => {
        const { email, password } = data;

        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }
        //****if social login is used in project then user this query**** 
        // const queryObject = { email, account_source: 'email', status: { $ne: USER_STATUS.DELETED } }

        const findUser = await findOne(userAuthModel, queryObject);
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const userData = findUser?.data
        //if account deactivated by admin then throw error 
        if (userData?.status == USER_STATUS.DEACTIVATED && userData?.deactivate_by === DEACTIVATE_BY.ADMIN) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.API_ERROR);
        }

        const isValid = await commonHelper.verifyBycryptHash(password, userData?.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, statusCodes.API_ERROR)
        }

        commonHelper.keysDeleteFromObject(userData) //delete password & other keys from response
        const token = await generateJwtToken(userData?._id, { user_type: 'user', type: "access", role: userData?.user_type }, APP.ACCESS_EXPIRY)
        const refresh_token = await generateJwtToken(userData?._id, { user_type: 'user', type: "access", role: userData?.user_type }, APP.REFRESH_EXPIRY)
         
        //if account deactivated by user then reactivate account
        if (userData?.status == USER_STATUS.DEACTIVATED && userData?.deactivate_by === DEACTIVATE_BY.USER) {
            await findOneAndUpdate(userAuthModel, { _id: userData?._id }, { status: USER_STATUS.ACTIVE, deactivate_by: '' })   //activate user again
        }

        return showResponse(true, responseMessage.users.login_success, { ...userData, token, refresh_token }, statusCodes.SUCCESS)
    },//ends

    // social_login: async (data: any) => {
    //     const { login_source, social_auth, email, name = undefined, user_type, profile_pic } = data;

    //     const queryObject = {
    //         status: { $ne: USER_STATUS.DELETED }, //user not deleted
    //         $or: [
    //             {
    //                 email: email, //if main email match 
    //             },
    //             {
    //                 social_account: {
    //                     $elemMatch: { email: email } //if social email match
    //                 }

    //             },
    //             {
    //                 social_account: {
    //                     $elemMatch: { token: social_auth } //if social token match
    //                 }

    //             },

    //         ]
    //     } //match condition ends 

    //     //check user exist or not 
    //     const findUser = await findOne(userAuthModel, queryObject);
    //     //if account already existed then update details and return token with login success
    //     if (findUser.status) {
    //         //if account deactivate by admin throw error 
    //         if (findUser?.data?.status == USER_STATUS.DEACTIVATED && findUser.data?.deactivate_by === DEACTIVATE_BY.ADMIN) {
    //             return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.API_ERROR);
    //         }

    //         //update social account array 
    //         const updateSocialInfo = await UserAuthHandler.update_social_info(findUser, userAuthModel, data)
    //         if (!updateSocialInfo.status) {
    //             return showResponse(false, responseMessage.users.login_error, null, statusCodes.API_ERROR);
    //         }

    //         commonHelper.keysDeleteFromObject(findUser?.data)
    //         const token_payload = { user_type: 'user', type: "access", role: findUser?.data?.user_type }
    //         const access_token = await generateJwtToken(findUser.data?._id, token_payload, APP.ACCESS_EXPIRY)
    //         const refresh_token = await generateJwtToken(findUser.data?._id, token_payload, APP.REFRESH_EXPIRY)
    //         const userData = { ...findUser?.data, token: access_token, refresh_token }

    //         //if account deactivated by user then activate it again 
    //         if (findUser?.data?.status == USER_STATUS.DEACTIVATED && findUser.data?.deactivate_by === DEACTIVATE_BY.USER) {
    //             await findOneAndUpdate(userAuthModel, { _id: findUser.data?._id }, { status: USER_STATUS.ACTIVE, deactivate_by: '' })
    //         }

    //         return showResponse(true, responseMessage.users.login_success, userData, statusCodes.SUCCESS);

    //     } else {

    //         //if not exist then register new user 
    //         const newObj = {
    //             social_account: [
    //                 {
    //                     source: login_source,
    //                     email: email,
    //                     token: social_auth,
    //                     name: name
    //                 }
    //             ],
    //             email,
    //             first_name: name ? name : commonHelper.getFirstNameFromEmail(email),
    //             account_source: login_source,
    //             is_verified: false,
    //         };

    //         const userRef = new userAuthModel(newObj)
    //         const result = await createOne(userRef);

    //         if (!result.status) {
    //             return showResponse(false, responseMessage.users.login_error, null, statusCodes.API_ERROR);
    //         }

    //         commonHelper.keysDeleteFromObject(result?.data)
    //         const token_payload = { user_type: 'user', type: "access", role: result?.data?.user_type }
    //         const access_token = await generateJwtToken(result.data._id, token_payload, APP.ACCESS_EXPIRY)
    //         const refresh_token = await generateJwtToken(result.data._id, token_payload, APP.REFRESH_EXPIRY)
    //         const userData = { ...result?.data, token: access_token, refresh_token }

    //         return showResponse(true, responseMessage.users.login_success, userData, statusCodes.SUCCESS);
    //     }
    // },


    //***********SOCIAL LOGIN NOT USED : if social login not used in this project then use this function ************************ */
    register: async (data: any, profile_pic: any): Promise<ApiResponse> => {
        const { email, password } = data;

        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }
        // check if user exists && if email is verified 
        const exists = await findOne(userAuthModel, queryObject);
        if (exists.status && exists.data?.is_verified) {
            return showResponse(false, responseMessage.common.email_already, null, statusCodes.API_ERROR)
        }
        //else create or update new entry 
        const otp = commonHelper.generateOtp()
        const hashed = await commonHelper.bycrptPasswordHash(password);
        data.password = hashed
        data.otp = otp

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }

            data.profile_pic = s3Upload?.data[0]
        }

        const result = await findOneAndUpdate(userAuthModel, queryObject, data, true) //upsert true
        if (!result.status) {
            return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
        }

        commonHelper.keysDeleteFromObject(result?.data) //delete password & other keys from response
        const userData = result?.data
        const to = userData?.email
        const user_name = `${userData?.first_name} ${userData?.last_name}`
        const payload = { user_name, otp }
        const emailSend = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.REGISTER_EMAIL, to, payload)
        if (!emailSend.status) {
            await findOneAndDelete(userAuthModel, { _id: userData?._id })
            return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.users.register_success, {}, statusCodes.SUCCESS)

    },//ends

    //***********SOCIAL LOGIN USED : if social login used in this project then use this function ************************ */
    // async register(data: any, profile_pic: any): Promise<ApiResponse> {
    //     const { email, password } = data;

    //     //check if match or not by email
    //     const queryObject = {
    //         status: { $ne: USER_STATUS.DELETED },
    //         $or: [
    //             { email },//if account email find then throw error already existed 
    //             {
    //                 social_account: {
    //                     $elemMatch: { email: email }  //if account finds with social email then update account
    //                 }

    //             },
    //         ]
    //     }

    //     const hashed = await commonHelper.bycrptPasswordHash(password);
    //     const otp = commonHelper.generateOtp()
    //     const emailPayload = { user_name: data?.first_name, otp }
    //     const payload = { ...data, account_source: 'email', password: hashed, otp }

    //     if (profile_pic) {
    //         //upload image to aws s3 bucket
    //         const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
    //         if (!s3Upload.status) {
    //             return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
    //         }
    //         payload.profile_pic = s3Upload?.data[0]
    //     }

    //     // check if user exists
    //     const findUser = await findOne(userAuthModel, queryObject);
    //     //if user exist with same account source then throw error
    //     if (findUser.status && findUser?.data?.account_source == 'email') {
    //         return showResponse(false, responseMessage.users.email_already, null, statusCodes.API_ERROR);
    //     }

    //     //if exist with different source (through google apple login) then update details and account source else insert new account entry
    //     const result = await findOneAndUpdate(userAuthModel, queryObject, payload, true);//upsert true
    //     if (!result.status) {
    //         return showResponse(false, responseMessage.users.register_error, null, statusCodes.API_ERROR);
    //     }

    //     const sendEmail = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.REGISTER_EMAIL, email, emailPayload)
    //     if (!sendEmail.status) {
    //         return showResponse(false, responseMessage.users.register_error, null, statusCodes.API_ERROR);
    //     }

    //     return showResponse(true, responseMessage.users.register_success, null, statusCodes.SUCCESS);
    // },
    //ends

    forgotPassword: async (data: any): Promise<ApiResponse> => {
        const { email } = data;

        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }
        // check if user exists
        const exists = await findOne(userAuthModel, queryObject);
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const userData = exists?.data;

        const otp = commonHelper.generateOtp();
        const to = `${exists?.data?.email}`
        const user_name = `${userData?.first_name} ${userData?.last_name}`
        const payload = { user_name, otp }

        const emailSend = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.FORGOT_PASSWORD_EMAIL, to, payload)
        if (!emailSend.status) {
            return showResponse(false, responseMessage.users.forgot_password_email_error, null, statusCodes.API_ERROR)
        }

        await findByIdAndUpdate(userAuthModel, userData?._id, { otp });  //update otp in database
        return showResponse(true, responseMessage.users.otp_send, null, statusCodes.SUCCESS);

    },//ends

    resetPassword: async (data: any): Promise<ApiResponse> => {
        const { email, new_password, otp } = data;

        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }

        const result = await findOne(userAuthModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR);
        }

        if (result.data?.otp !== Number(otp)) {
            return showResponse(false, responseMessage.users.invalid_otp, null, statusCodes.API_ERROR);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const updateObj = { otp: '', password: hashed }

        const updated = await findByIdAndUpdate(userAuthModel, result?.data?._id, updateObj)
        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_reset_error, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_reset_success, null, statusCodes.SUCCESS)
    },//ends

    verifyOtp: async (data: any): Promise<ApiResponse> => {
        const { email, otp } = data;

        const queryObject = { email, otp, status: { $ne: USER_STATUS.DELETED } }

        const exists = await findOne(userAuthModel, queryObject)
        if (!exists.status) {
            return showResponse(false, responseMessage.users.invalid_otp, null, statusCodes.API_ERROR);
        }

        await findOneAndUpdate(userAuthModel, queryObject, { is_verified: true })
        return showResponse(true, responseMessage.users.otp_verify_success, null, statusCodes.SUCCESS);
    },//ends
    resendOtp: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        const queryObject = { email, status: { $ne: USER_STATUS.DELETED } }

        const result = await findOne(userAuthModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.users.invalid_email, null, statusCodes.API_ERROR);
        }
        const userData = result?.data;

        const otp = commonHelper.generateOtp();
        const to = userData?.email
        const user_name = `${userData?.first_name} ${userData?.last_name}`
        const payload = { user_name, otp }

        const emailSend = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.SEND_OTP_EMAIL, to, payload)
        if (!emailSend.status) {
            return showResponse(false, responseMessage.users.otp_send_error, null, statusCodes.API_ERROR)
        }

        await findOneAndUpdate(userAuthModel, queryObject, { otp })
        return showResponse(true, responseMessage.users.otp_resend, null, statusCodes.SUCCESS);
    },//ends

    changePassword: async (data: any, userId: string): Promise<ApiResponse> => {
        const { old_password, new_password } = data;

        const exists = await findOne(userAuthModel, { _id: userId })
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const comparePassword = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!comparePassword) {
            return showResponse(false, responseMessage.users.invalid_old_password, null, statusCodes.API_ERROR)
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const result = await findByIdAndUpdate(userAuthModel, userId, { password: hashed })
        if (!result.status) {
            return showResponse(false, responseMessage.users.password_change_failed, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_change_successfull, null, statusCodes.SUCCESS)
    },//ends

    getUserDetails: async (userId: string): Promise<ApiResponse> => {

        const result = await findOne(userAuthModel, { _id: userId }, { password: 0, createdAt: 0, updatedAt: 0, social_account: 0, otp: 0 });
        if (!result.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.users.user_detail, result.data, statusCodes.SUCCESS)
    },//ends

    updateUserProfile: async (data: any, user_id: string, profile_pic: any): Promise<ApiResponse> => {
        const { first_name, last_name, phone_number, country_code } = data

        const updateObj = {
            profile_pic: '',
            ...(first_name && { first_name }),
            ...(last_name && { last_name }),
            ...(phone_number && { phone_number }),
            ...(country_code && { country_code })
        };

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }
            updateObj.profile_pic = s3Upload?.data[0]
        }

        const result = await findByIdAndUpdate(userAuthModel, user_id, updateObj);
        if (!result.status) {
            return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
        }

        commonHelper.keysDeleteFromObject(result?.data)
        return showResponse(true, responseMessage.users.user_account_updated, result.data, statusCodes.SUCCESS);
    },//ends

    async deleteOrDeactivateAccount(data: any, user_id: string): Promise<ApiResponse> {
        const { status, reason } = data

        const updateObj = {
            status,
            deactivate_by: DEACTIVATE_BY.USER,
            ...(reason && { reason }),
        }

        const result = await findByIdAndUpdate(userAuthModel, user_id, updateObj);
        if (!result.status) {
            return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);
        }

        const msg = status == USER_STATUS.DELETED ? 'deleted' : 'deactivated'
        return showResponse(true, `${responseMessage.users.user_account_has_been} ${msg}`, null, statusCodes.SUCCESS);
    },//ends

    async refreshToken(data: any): Promise<ApiResponse> {
        const { refresh_token } = data

        const response: any = await decodeToken(refresh_token)
        if (!response.status) {
            return showResponse(false, responseMessage?.middleware?.token_expired, null, statusCodes.REFRESH_TOKEN_ERROR);
        }

        const user_id = response?.data?.id

        const findUser = await findOne(userAuthModel, { _id: user_id });
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        if (findUser?.data?.status == USER_STATUS.DEACTIVATED) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.ACCOUNT_DISABLED);
        }

        if (findUser?.data?.status == USER_STATUS.DELETED) {
            return showResponse(false, responseMessage.middleware.deleted_account, null, statusCodes.ACCOUNT_DELETED);
        }

        const accessToken = await generateJwtToken(findUser.data?._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.ACCESS_EXPIRY)
        const refreshToken = await generateJwtToken(findUser.data?._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.REFRESH_EXPIRY)

        return showResponse(true, 'Tokens Generated Successfully', { token: accessToken, refresh_token: refreshToken }, statusCodes.SUCCESS)
    },//ends

    async logoutUser(): Promise<ApiResponse> {
        return showResponse(true, responseMessage.users.logout_success, null, statusCodes.SUCCESS)
    },//ends

    uploadFile: async (data: any): Promise<ApiResponse> => {
        const { file } = data;

        const s3Upload = await services.awsService.uploadFileToS3([file])
        if (!s3Upload.status) {
            return showResponse(false, responseMessage?.common.file_upload_error, {}, statusCodes.FILE_UPLOAD_ERROR);
        }

        return showResponse(true, responseMessage.common.file_upload_success, s3Upload?.data, statusCodes.SUCCESS)
    },
}//ends

export default UserAuthHandler 
