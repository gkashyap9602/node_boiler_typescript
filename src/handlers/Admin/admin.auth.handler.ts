import { ApiResponse, tokenUserTypeInterface } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findByIdAndUpdate, findOneAndUpdate } from "../../helpers/db.helpers";
import { decodeToken, generateAccessRefreshToken, generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import adminAuthModel from "../../models/Admin/admin.auth.model";
import services from '../../services';
import responseMessage from '../../constants/responseMessages'
import { APP } from '../../constants/app.constant';
import { EMAIL_SEND_TYPE, USER_STATUS } from '../../constants/workflow.constant';

import statusCodes from '../../constants/statusCodes'

const AdminAuthHandler = {

    login: async (data: any): Promise<ApiResponse> => {
        const { email, password } = data;

        const exists = await findOne(adminAuthModel, { email });
        if (!exists.status) {
            return showResponse(false, responseMessage.admin.not_registered, null, statusCodes.API_ERROR)
        }

        const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, statusCodes.API_ERROR)
        }

        const adminData = exists?.data

        const { access_token, refresh_token } = await generateAccessRefreshToken(adminData?._id, adminData?.user_type, tokenUserTypeInterface.ADMIN)

        commonHelper.keysDeleteFromObject(adminData) //delete password & other keys from response
        return showResponse(true, responseMessage.admin.login_success, { ...adminData, access_token, refresh_token }, statusCodes.SUCCESS)
    },//ends

    forgotPassword: async (data: any): Promise<ApiResponse> => {
        const { email } = data;

        // check if user exists
        const exists = await findOne(adminAuthModel, { email });
        if (!exists.status) {
            return showResponse(false, responseMessage.admin.not_registered, null, statusCodes.API_ERROR)
        }

        const userData = exists?.data;

        const otp = commonHelper.generateOtp();
        const to = `${exists?.data?.email}`
        const user_name = `${userData?.first_name} ${userData?.last_name}`
        const payload = { user_name, otp }

        const emailSend = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.FORGOT_PASSWORD_EMAIL, to, payload)
        if (!emailSend.status) {
            return showResponse(false, responseMessage.admin.forgot_password_email_error, null, statusCodes.API_ERROR)
        }

        await findByIdAndUpdate(adminAuthModel, userData?._id, { otp });  //update otp in database
        return showResponse(true, responseMessage.admin.otp_send, null, statusCodes.SUCCESS);
    },//ends

    resetPassword: async (data: any): Promise<ApiResponse> => {
        const { email, new_password, otp } = data;

        const queryObject = { email }

        const result = await findOne(adminAuthModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.admin.not_registered, null, statusCodes.API_ERROR);
        }

        if (result.data?.otp !== Number(otp)) {
            return showResponse(false, responseMessage.admin.invalid_otp, null, statusCodes.API_ERROR);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const updateObj = { otp: '', password: hashed }

        const updated = await findByIdAndUpdate(adminAuthModel, result?.data?._id, updateObj)
        if (!updated.status) {
            return showResponse(false, responseMessage.admin.password_reset_error, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.admin.password_reset_success, null, statusCodes.SUCCESS)
    },//ends

    verifyOtp: async (data: any): Promise<ApiResponse> => {
        const { email, otp } = data;

        const queryObject = { email, otp }

        const exists = await findOne(adminAuthModel, queryObject)
        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_otp, null, statusCodes.API_ERROR);
        }

        await findOneAndUpdate(adminAuthModel, queryObject, { is_verified: true })
        return showResponse(true, responseMessage.admin.otp_verify_success, null, statusCodes.SUCCESS);
    },//ends

    resendOtp: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        const queryObject = { email }

        const result = await findOne(adminAuthModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.admin.not_registered, null, statusCodes.API_ERROR);
        }

        const adminData = result?.data;

        const otp = commonHelper.generateOtp();
        const to = adminData?.email
        const user_name = `${adminData?.first_name} ${adminData?.last_name}`
        const payload = { user_name, otp }

        const emailSend = await services.emailService.sendEmailViaNodemail(EMAIL_SEND_TYPE.SEND_OTP_EMAIL, to, payload)
        if (!emailSend.status) {
            return showResponse(false, responseMessage.admin.otp_send_error, null, statusCodes.API_ERROR)
        }

        await findOneAndUpdate(adminAuthModel, queryObject, { otp })
        return showResponse(true, responseMessage.admin.otp_resend, null, statusCodes.SUCCESS);
    },//ends

    changePassword: async (data: any, adminId: string): Promise<ApiResponse> => {
        const { old_password, new_password } = data;

        const exists = await findOne(adminAuthModel, { _id: adminId })
        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR)
        }

        const comparePassword = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!comparePassword) {
            return showResponse(false, responseMessage.admin.invalid_old_password, null, statusCodes.API_ERROR)
        }

        //new password and old password cannot be same
        if (new_password === old_password) {
            return showResponse(false, responseMessage.admin.cannot_same_old_new_password, null, statusCodes.API_ERROR)
        }


        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const result = await findByIdAndUpdate(adminAuthModel, adminId, { password: hashed })
        if (!result.status) {
            return showResponse(false, responseMessage.admin.password_change_failed, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.admin.password_change_successfull, null, statusCodes.SUCCESS)
    },//ends

    getAdminDetails: async (adminId: string): Promise<ApiResponse> => {

        const result = await findOne(adminAuthModel, { _id: adminId }, { password: 0, createdAt: 0, updatedAt: 0, otp: 0 });
        if (!result.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.admin.admin_details, result.data, statusCodes.SUCCESS)
    },//ends

    updateAdminProfile: async (data: any, admin_id: string, profile_pic: any): Promise<ApiResponse> => {
        const { first_name, last_name, phone_number, country_code, greet_msg } = data

        const updateObj: any = {
            ...(first_name && { first_name }),
            ...(last_name && { last_name }),
            ...(phone_number && { phone_number }),
            ...(country_code && { country_code }),
            ...(greet_msg && { greet_msg }),
        };

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }

            updateObj.profile_pic = s3Upload?.data[0]
        }

        const result = await findByIdAndUpdate(adminAuthModel, admin_id, updateObj);
        if (!result.status) {
            return showResponse(false, responseMessage.admin.account_update_error, null, statusCodes.API_ERROR);
        }

        commonHelper.keysDeleteFromObject(result?.data)
        return showResponse(true, responseMessage.admin.account_update_success, result.data, statusCodes.SUCCESS);
    },//ends

    async refreshToken(data: any): Promise<ApiResponse> {
        const { refresh_token } = data

        const response: any = await decodeToken(refresh_token)
        if (!response.status) {
            return showResponse(false, responseMessage?.middleware?.token_expired, null, statusCodes.REFRESH_TOKEN_ERROR);
        }

        const admin_id = response?.data?.id

        const findAdmin = await findOne(adminAuthModel, { _id: admin_id });
        if (!findAdmin.status) {
            return showResponse(false, responseMessage.admin.admin_not_exist, null, statusCodes.API_ERROR)
        }

        const tokens = await generateAccessRefreshToken(findAdmin.data?._id, findAdmin.data?.user_type, tokenUserTypeInterface.ADMIN)

        return showResponse(true, 'Token Generated Successfully', { ...findAdmin?.data, access_token: tokens.access_token, refresh_token: tokens.refresh_token }, statusCodes.SUCCESS)
    },//ends

    async logoutUser(): Promise<ApiResponse> {
        return showResponse(true, responseMessage.admin.logout_success, null, statusCodes.SUCCESS)
    },//ends
}

export default AdminAuthHandler 
