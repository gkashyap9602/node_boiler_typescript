import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../utils/interfaces.util";
import { showResponse } from "../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate } from "../helpers/db.helpers";
import { generateJwtToken } from "../utils/auth.util";
import commonHelper from "../helpers/common.helper";
import userModel from "../models/user.model";
import responseMessage from "../constants/responseMessage.constant";
import { APP } from '../constants/app.constant';
import services from '../services';

const UserHandler = {

    async login(data: any): Promise<ApiResponse> {
        try {
            const { email, password } = data;

            const exists = await findOne(userModel, { email });
            if (!exists.status) {
                return showResponse(false, responseMessage.users.invalid_email, null, null, 400)
            }

            const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
            if (!isValid) {
                return showResponse(false, responseMessage.common.password_incorrect, null, null, 400)
            }

            const token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access" }, APP.ACCESS_EXPIRY)
            delete exists.data.password

            return showResponse(true, responseMessage.users.login_success, { ...exists.data, token }, null, 200)


        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    },

    async register(data: any): Promise<ApiResponse> {
        try {
            let { first_name, last_name, email, password } = data;

            // check if user exists
            const exists = await findOne(userModel, { email });

            if (exists.status) {
                return showResponse(false, responseMessage.common.email_already, null, null, 400)
            }

            let hashed = await commonHelper.bycrptPasswordHash(password);

            let userObj = {
                first_name,
                last_name,
                email,
                password: hashed
            }

            let userRef = new userModel(userObj)
            let result = await createOne(userRef)

            if (!result.status) {
                return showResponse(false, responseMessage.common.error_while_create_acc, null, null, 400)

            }

            let otp = commonHelper.generateRandomOtp(4)

            const template = await ejs.renderFile(path.join(__dirname, '../templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
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

            return showResponse(true, responseMessage.users.register_success, {}, null, 200)

        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    },

    async forgotPassword(data: any): Promise<ApiResponse> {
        try {
            const { email } = data;
            // check if admin exists
            const exists = await findOne(userModel, { email });

            if (!exists.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)
            }

            let otp = commonHelper.generateRandomOtp(4);
            const template = await ejs.renderFile(path.join(__dirname, '../templates', 'forgotPassword.ejs'), { user_name: exists?.data?.first_name, cidLogo: 'unique@Logo', otp });
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

                return showResponse(true, responseMessage.users.otp_send, null, null, 200);
            }

            return showResponse(false, responseMessage.users.forgot_password_email_error, null, null, 400)
        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

    async uploadFile(data: any): Promise<ApiResponse> {
        try {
            const { file } = data;

            const s3Upload = await services.awsService.uploadFileToS3([file])
            if (!s3Upload.status) {
                return showResponse(false, responseMessage?.common.file_upload_error, {}, null, 203);
            }

            return showResponse(true, responseMessage.common.file_upload_success, s3Upload?.data, null, 200)
        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

    async resetPassword(data: any): Promise<ApiResponse> {
        try {
            const { email, new_password } = data;

            let queryObject = { email, status: { $ne: 2 } }
            // is_verified: true

            let result = await findOne(userModel, queryObject);
            if (!result.status) {
                return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, null, 400);
            }

            const hashed = await commonHelper.bycrptPasswordHash(new_password)

            let updateObj = {
                otp: '',
                password: hashed,
                updated_on: moment().unix()
            }

            const updated = await findByIdAndUpdate(userModel, updateObj, result?.data?._id)

            if (!updated.status) {
                return showResponse(false, responseMessage.users.password_reset_error, null, null, 400)

            }

            return showResponse(true, responseMessage.users.password_reset_success, null, null, 200)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)


        }
    },

    async verifyOtp(data: any): Promise<ApiResponse> {
        try {
            const { email, otp } = data;

            let queryObject = { email, otp, status: { $ne: 2 } }

            let findUser = await findOne(userModel, queryObject)

            if (findUser.status) {
                await findOneAndUpdate(userModel, queryObject, { is_verified: true })

                return showResponse(true, responseMessage.users.otp_verify_success, null, null, 200);

            }

            return showResponse(false, `${responseMessage.users.invalid_otp} or email`, null, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)


        }
    },

    async resendOtp(data: any): Promise<ApiResponse> {
        try {
            const { email } = data;
            let queryObject = { email, status: { $ne: 2 } }

            let result = await findOne(userModel, queryObject);

            if (result.status) {

                let otp = commonHelper.generateRandomOtp(4);

                const template = await ejs.renderFile(path.join(__dirname, '../templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
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

                    return showResponse(true, responseMessage.users.otp_resend, null, null, 200);
                }

            }

            return showResponse(false, responseMessage.users.invalid_email, null, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    },

    async changePassword(data: any, userId: string): Promise<ApiResponse> {
        try {
            const { old_password, new_password } = data;

            const exists = await findOne(userModel, { _id: userId })

            if (!exists.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)

            }

            const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
            if (!isValid) {
                return showResponse(false, responseMessage.users.invalid_password, null, null, 400)
            }

            const hashed = await commonHelper.bycrptPasswordHash(new_password)


            const updated = await findByIdAndUpdate(userModel, { password: hashed }, userId)

            if (!updated.status) {
                return showResponse(false, responseMessage.users.password_change_failed, null, null, 400)
            }
            return showResponse(true, responseMessage.users.password_change_successfull, null, null, 200)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },
    async getUserDetails(userId: string): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(userModel, { _id: userId }, { password: 0 });

            if (!getResponse.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)
            }

            return showResponse(true, responseMessage.users.user_detail, getResponse.data, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }

}

export default UserHandler 
