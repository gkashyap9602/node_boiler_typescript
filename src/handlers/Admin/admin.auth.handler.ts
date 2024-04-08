import ejs from 'ejs'
import path from 'path'
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate } from "../../helpers/db.helpers";
import { generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import adminModel from "../../models/Admin/admin.model";
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import { APP } from '../../constants/app.constant';
import { ROLE } from '../../constants/app.constant'
import statusCodes from '../../constants/statusCodes'


const AdminAuthHandler = {

    login: async (data: any): Promise<ApiResponse> => {

        const { email, password, os_type } = data;

        const exists = await findOne(adminModel, { email });

        if (!exists.status) {
            return showResponse(false, responseMessage.admin.does_not_exist, null, statusCodes.API_ERROR)
        }

        const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, statusCodes.API_ERROR)
        }

        const os_update = await findOneAndUpdate(adminModel, { _id: exists?.data?._id }, { os_type })

        if (!os_update.status) {
            return showResponse(false, responseMessage.users.login_error, null, statusCodes.API_ERROR)
        }

        const token = await generateJwtToken(exists.data._id, { user_type: 'admin', type: "access" }, APP.ACCESS_EXPIRY)
        delete exists.data.password

        return showResponse(true, responseMessage.admin.login_success, { ...exists.data, token }, statusCodes.SUCCESS)

    },

    register: async (data: any): Promise<ApiResponse> => {

        const { email, password } = data;

        // check if user exists
        const exists = await findOne(adminModel, { email });

        if (exists.status) {
            return showResponse(false, responseMessage.common.email_already, null, statusCodes.API_ERROR)
        }

        data.password = await commonHelper.bycrptPasswordHash(password);

        const adminRef = new adminModel(data)

        const save = await createOne(adminRef)

        if (!save.status) {
            return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.admin.admin_created, null, statusCodes.SUCCESS)

    },

    forgotPassword: async (data: any): Promise<ApiResponse> => {

        const { email } = data;
        // check if admin exists
        const exists = await findOne(adminModel, { email });

        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR)
        }

        const otp = commonHelper.generateRandomOtp(4);
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), { user_name: exists?.data?.first_name, cidLogo: 'unique@Logo', otp });
        const logoPath = path.join(process.cwd(), './public', 'logo.png');

        const to = `${exists?.data?.email}`
        const subject = `Forgot Password`

        const attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        const forgotPassMail = await services.emailService.nodemail(to, subject, template, attachments)

        if (forgotPassMail.status) {

            const userObj = {
                otp,
                // updated_on: moment().unix()
            }

            await findByIdAndUpdate(adminModel, userObj, (exists?.data?._id));

            return showResponse(true, responseMessage.users.otp_send, null, statusCodes.SUCCESS);
        }

        return showResponse(false, responseMessage.users.forgot_password_email_error, null, statusCodes.API_ERROR)

    },

    resetPassword: async (data: any): Promise<ApiResponse> => {

        const { email, new_password } = data;

        const queryObject = { email, status: { $ne: 2 } }

        const result = await findOne(adminModel, queryObject);
        if (!result.status) {
            return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, statusCodes.API_ERROR);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        const updateObj = {
            otp: '',
            password: hashed,
            // updated_on: moment().unix()
        }

        const updated = await findByIdAndUpdate(adminModel, updateObj, result?.data?._id)

        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_reset_error, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.users.password_reset_success, null, statusCodes.SUCCESS)

    },

    verifyOtp: async (data: any): Promise<ApiResponse> => {
        const { email, otp } = data;

        const queryObject = { email, otp, status: { $ne: 2 } }

        const findUser = await findOne(adminModel, queryObject)

        if (findUser.status) {
            await findOneAndUpdate(adminModel, queryObject, { is_verified: true })

            return showResponse(true, responseMessage.users.otp_verify_success, null, statusCodes.SUCCESS);
        }

        return showResponse(false, `${responseMessage.users.invalid_otp} or email`, null, statusCodes.API_ERROR);

    },

    resendOtp: async (data: any): Promise<ApiResponse> => {

        const { email } = data;
        const queryObject = { email, status: { $ne: 2 } }

        const result = await findOne(adminModel, queryObject);

        if (result.status) {

            const otp = commonHelper.generateRandomOtp(4);

            const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
            const logoPath = path.join(process.cwd(), './public', 'logo.png');

            const to = `${result?.data?.email}`
            const subject = `Resend Otp`

            const attachments = [
                {
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'unique@Logo',
                }
            ]

            const resendOtp = await services.emailService.nodemail(to, subject, template, attachments)

            if (resendOtp.status) {
                await findOneAndUpdate(adminModel, queryObject, { otp })

                return showResponse(true, responseMessage.users.otp_resend, null, statusCodes.SUCCESS);
            }
        }

        return showResponse(false, responseMessage.users.invalid_email, null, statusCodes.API_ERROR);

    },

    changePassword: async (data: any, adminId: string): Promise<ApiResponse> => {

        const { old_password, new_password } = data;

        const exists = await findOne(adminModel, { _id: adminId })

        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR)
        }

        const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!isValid) {
            return showResponse(false, responseMessage.users.invalid_password, null, statusCodes.API_ERROR)
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        const updated = await findByIdAndUpdate(adminModel, { password: hashed }, adminId)

        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_change_failed, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_change_successfull, null, statusCodes.SUCCESS)
    },

    getAdminDetails: async (adminId: string): Promise<ApiResponse> => {

        const getResponse = await findOne(adminModel, { _id: adminId }, { password: 0 });

        if (!getResponse.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.admin.admin_details, getResponse.data, statusCodes.SUCCESS)

    },

    updateAdminProfile: async (data: any, admin_id: string, profile_pic: any): Promise<ApiResponse> => {

        const { first_name, last_name, phone_number, country_code, greet_msg } = data

        const findAdmin = await findOne(adminModel, { user_type: ROLE.ADMIN, _id: admin_id })

        if (!findAdmin.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {
            // updated_on: moment().unix()
        }
        if (first_name) {
            updateObj.first_name = first_name
        }
        if (last_name) {
            updateObj.last_name = last_name
        }
        if (phone_number) {
            updateObj.phone_number = phone_number
        }
        if (country_code) {
            updateObj.country_code = country_code
        }
        if (greet_msg) {
            updateObj.greet_msg = greet_msg
        }

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }

            updateObj.profile_pic = s3Upload?.data[0]
        }

        const result = await findByIdAndUpdate(adminModel, updateObj, admin_id);
        if (result.status) {
            delete result.data.password
            return showResponse(true, responseMessage.admin.admin_details_updated, result.data, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage.admin.admin_details_update_error, null, statusCodes.API_ERROR);

    },


}

export default AdminAuthHandler 
