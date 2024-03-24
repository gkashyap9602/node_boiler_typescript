import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate } from "../../helpers/db.helpers";
import { generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import userModel from "../../models/User/user.model";
import { APP, ROLE, USER_STATUS } from '../../constants/app.constant';
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import { tryCatchWrapper } from '../../utils/config.util';
import statusCodes from 'http-status-codes'

const UserAuthHandler = {

    login: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { email, password, os_type } = data;
        console.log(email, password, "emailpassss")
        const exists = await findOne(userModel, { email });

        console.log(exists, "exists")
        if (!exists.status) {
            return showResponse(false, responseMessage.users.invalid_email, null, null, statusCodes.UNAUTHORIZED)
        }

        const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, null, statusCodes.UNAUTHORIZED)
        }

        let os_update = await findOneAndUpdate(userModel, { _id: exists?.data?._id }, { os_type })

        if (!os_update) {
            return showResponse(false, responseMessage.users.login_error, null, null, statusCodes.UNAUTHORIZED)
        }

        const token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access" }, APP.ACCESS_EXPIRY)
        delete exists.data.password

        return showResponse(true, responseMessage.users.login_success, { ...exists.data, token }, null, statusCodes.OK)

    }),

    register: tryCatchWrapper(async (data: any, profile_pic: any): Promise<ApiResponse> => {

        let { email, password } = data;

        // check if user exists
        const exists = await findOne(userModel, { email });

        if (exists.status) {
            return showResponse(false, responseMessage.common.email_already, null, null, statusCodes.CONFLICT)
        }

        let otp = commonHelper.generateRandomOtp(4)
        let hashed = await commonHelper.bycrptPasswordHash(password);
        data.password = hashed
        data.otp = otp
        data.created_on = moment().unix()

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, null, statusCodes.UNPROCESSABLE_ENTITY);
            }

            data.profile_pic = s3Upload?.data[0]
        }


        let userRef = new userModel(data)
        let result = await createOne(userRef)

        if (!result.status) {
            return showResponse(false, responseMessage.common.error_while_create_acc, null, null, statusCodes.BAD_REQUEST)

        }

        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
        const logoPath = path.join(process.cwd(), './public', 'logo.png');
        //send email of attachment to admin
        let to = `${result?.data?.email}`
        let subject = `New user registered`

        let attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        await services.emailService.nodemail(to, subject, template, attachments)
        delete result?.data.password
        return showResponse(true, responseMessage.users.register_success, result?.data, null, statusCodes.CREATED)

    }),
    //jhjk
    forgotPassword: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { email } = data;
        // check if admin exists
        const exists = await findOne(userModel, { email });

        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, null, statusCodes.UNAUTHORIZED)
        }

        let otp = commonHelper.generateRandomOtp(4);
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), { user_name: exists?.data?.first_name, cidLogo: 'unique@Logo', otp });
        const logoPath = path.join(process.cwd(), './public', 'logo.png');

        let to = `${exists?.data?.email}`
        let subject = `Forgot Password`

        let attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        let forgotPassMail = await services.emailService.nodemail(to, subject, template, attachments)

        if (forgotPassMail.status) {

            let userObj = {
                otp,
                updated_on: moment().unix()
            }

            await findByIdAndUpdate(userModel, userObj, (exists?.data?._id));

            return showResponse(true, responseMessage.users.otp_send, null, null, statusCodes.OK);
        }

        return showResponse(false, responseMessage.users.forgot_password_email_error, null, null, statusCodes.BAD_REQUEST)
    }),

    uploadFile: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { file } = data;

        console.log(file, "fileeeAw")

        const s3Upload = await services.awsService.uploadFileToS3([file])
        if (!s3Upload.status) {
            return showResponse(false, responseMessage?.common.file_upload_error, {}, null, statusCodes.UNPROCESSABLE_ENTITY);
        }

        return showResponse(true, responseMessage.common.file_upload_success, s3Upload?.data, null, statusCodes.OK)

    }),

    resetPassword: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { email, new_password } = data;

        let queryObject = { email, status: { $ne: 2 } }
        // is_verified: true

        let result = await findOne(userModel, queryObject);
        if (!result.status) {
            return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, null, statusCodes.UNAUTHORIZED);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        let updateObj = {
            otp: '',
            password: hashed,
            updated_on: moment().unix()
        }

        const updated = await findByIdAndUpdate(userModel, updateObj, result?.data?._id)

        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_reset_error, null, null, statusCodes.NOT_MODIFIED)
        }

        return showResponse(true, responseMessage.users.password_reset_success, null, null, statusCodes.OK)

    }),

    verifyOtp: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { email, otp } = data;

        let queryObject = { email, otp, status: { $ne: 2 } }

        let findUser = await findOne(userModel, queryObject)

        if (findUser.status) {
            await findOneAndUpdate(userModel, queryObject, { is_verified: true })

            return showResponse(true, responseMessage.users.otp_verify_success, null, null, statusCodes.OK);

        }

        return showResponse(false, `${responseMessage.users.invalid_otp} or email`, null, null, statusCodes.UNAUTHORIZED);

    }),
    //ques
    resendOtp: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { email } = data;
        let queryObject = { email, status: { $ne: 2 } }

        let result = await findOne(userModel, queryObject);

        if (result.status) {

            let otp = commonHelper.generateRandomOtp(4);

            const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
            const logoPath = path.join(process.cwd(), './public', 'logo.png');

            let to = `${result?.data?.email}`
            let subject = `Resend Otp`

            let attachments = [
                {
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'unique@Logo',
                }
            ]

            let resendOtp = await services.emailService.nodemail(to, subject, template, attachments)

            if (resendOtp.status) {
                await findOneAndUpdate(userModel, queryObject, { otp })

                return showResponse(true, responseMessage.users.otp_resend, null, null, statusCodes.OK);
            }

        }

        return showResponse(false, responseMessage.users.invalid_email, null, null, statusCodes.UNAUTHORIZED);

    }),

    changePassword: tryCatchWrapper(async (data: any, userId: string): Promise<ApiResponse> => {

        const { old_password, new_password } = data;

        const exists = await findOne(userModel, { _id: userId })

        if (!exists.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, null, statusCodes.UNAUTHORIZED)

        }

        const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!isValid) {
            return showResponse(false, responseMessage.users.invalid_password, null, null, statusCodes.UNAUTHORIZED)
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        const updated = await findByIdAndUpdate(userModel, { password: hashed }, userId)

        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_change_failed, null, null, statusCodes.NOT_MODIFIED)
        }
        return showResponse(true, responseMessage.users.password_change_successfull, null, null, statusCodes.OK)

    }),

    getUserDetails: tryCatchWrapper(async (userId: string): Promise<ApiResponse> => {

        let getResponse = await findOne(userModel, { _id: userId }, { password: 0 });

        if (!getResponse.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, null, statusCodes.UNAUTHORIZED)
        }

        return showResponse(true, responseMessage.users.user_detail, getResponse.data, null, statusCodes.OK)

    }),

    updateUserProfile: tryCatchWrapper(async (data: any, user_id: string, profile_pic: any): Promise<ApiResponse> => {

        let { first_name, last_name, phone_number, country_code } = data

        let findAdmin = await findOne(userModel, { user_type: ROLE.USER, _id: user_id, status: { $ne: USER_STATUS.DELETED } })

        if (!findAdmin.status) {
            return showResponse(false, responseMessage.admin.invalid_admin, null, null, statusCodes.UNAUTHORIZED);
        }

        let updateObj: any = {
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

        if (profile_pic) {
            //upload image to aws s3 bucket
            const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, null, null, statusCodes.UNPROCESSABLE_ENTITY);
            }

            updateObj.profile_pic = s3Upload?.data[0]
        }

        let result = await findByIdAndUpdate(userModel, updateObj, user_id);
        if (result.status) {
            delete result.data.password
            return showResponse(true, responseMessage.users.user_account_updated, result.data, null, statusCodes.OK);
        }
        return showResponse(false, responseMessage.users.user_account_update_error, null, null, statusCodes.NOT_MODIFIED);

    }),


}

export default UserAuthHandler 
