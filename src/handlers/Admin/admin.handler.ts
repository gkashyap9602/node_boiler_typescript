import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, updateMany } from "../../helpers/db.helpers";
import { generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import adminModel from "../../models/Admin/admin.model";
import commonContentModel from "../../models/Admin/commonContent.model";
import services from '../../services';
import responseMessage from "../../constants/responseMessage.constant";
import { APP } from '../../constants/app.constant';
import faqModel from '../../models/Admin/faq.model';
import userModel from '../../models/User/user.model';
import { ROLE, USER_STATUS } from '../../constants/app.constant'

const AdminHandler = {

    async login(data: any): Promise<ApiResponse> {
        try {
            const { email, password } = data;

            const exists = await findOne(adminModel, { email });
            if (!exists.status) {
                return showResponse(false, responseMessage.admin.does_not_exist, null, null, 400)
            }

            const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
            if (!isValid) {
                return showResponse(false, responseMessage.common.password_incorrect, null, null, 400)
            }

            const token = await generateJwtToken(exists.data._id, { user_type: 'admin', type: "access" }, APP.ACCESS_EXPIRY)
            delete exists.data.password

            return showResponse(true, responseMessage.admin.login_success, { ...exists.data, token }, null, 200)


        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    },

    async register(data: any): Promise<ApiResponse> {
        try {
            let { first_name, last_name, email, password } = data;

            // check if user exists
            const exists = await findOne(adminModel, { email });

            if (exists.status) {
                return showResponse(false, responseMessage.common.email_already, null, null, 400)
            }

            password = await commonHelper.bycrptPasswordHash(password);

            let adminRef = new adminModel(data)

            let save = await createOne(adminRef)

            if (!save.status) {
                return showResponse(false, responseMessage.common.error_while_create_acc, null, null, 400)

            }

            return showResponse(true, responseMessage.admin.admin_created, null, null, 200)

        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    },

    async forgotPassword(data: any): Promise<ApiResponse> {
        try {
            const { email } = data;
            // check if admin exists
            const exists = await findOne(adminModel, { email });

            if (!exists.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)
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

                await findByIdAndUpdate(adminModel, userObj, (exists?.data?._id));

                return showResponse(true, responseMessage.users.otp_send, null, null, 200);
            }

            return showResponse(false, responseMessage.users.forgot_password_email_error, null, null, 400)
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

            let result = await findOne(adminModel, queryObject);
            if (!result.status) {
                return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, null, 400);
            }

            const hashed = await commonHelper.bycrptPasswordHash(new_password)

            let updateObj = {
                otp: '',
                password: hashed,
                updated_on: moment().unix()
            }

            const updated = await findByIdAndUpdate(adminModel, updateObj, result?.data?._id)

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

            let findUser = await findOne(adminModel, queryObject)

            if (findUser.status) {
                await findOneAndUpdate(adminModel, queryObject, { is_verified: true })

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

            let result = await findOne(adminModel, queryObject);

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
                    await findOneAndUpdate(adminModel, queryObject, { otp })

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

            const exists = await findOne(adminModel, { _id: userId })

            if (!exists.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)

            }

            const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
            if (!isValid) {
                return showResponse(false, responseMessage.users.invalid_password, null, null, 400)
            }

            const hashed = await commonHelper.bycrptPasswordHash(new_password)


            const updated = await findByIdAndUpdate(adminModel, { password: hashed }, userId)

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
    async getAdminDetails(userId: string): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(adminModel, { _id: userId }, { password: 0 });

            if (!getResponse.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400)
            }

            return showResponse(true, responseMessage.admin.admin_details, getResponse.data, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },


    async updateAdminProfile(data: any, admin_id: string, profile_pic: any): Promise<ApiResponse> {
        try {

            let { first_name, last_name, phone_number, country_code } = data

            let findAdmin = await findOne(adminModel, { user_type: ROLE.ADMIN, _id: admin_id })

            if (!findAdmin.status) {
                return showResponse(false, responseMessage.admin.invalid_admin, null, null, 400);
            }

            let updateObj: any = {
                updated_on: moment().unix()
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
                    return showResponse(false, responseMessage?.common.file_upload_error, null, null, 203);
                }

                updateObj.profile_pic = s3Upload?.data[0]
            }


            let result = await findByIdAndUpdate(adminModel, updateObj, admin_id);
            if (result.status) {
                delete result.data.password
                return showResponse(true, responseMessage.admin.admin_details_updated, result.data, null, 200);
            }
            return showResponse(false, responseMessage.admin.admin_details_update_error, null, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

    async getUserDetails(user_id: string): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(userModel, { _id: user_id }, { password: 0 });

            if (!getResponse.status) {
                return showResponse(false, responseMessage.users.invalid_user, null, null, 400)
            }

            return showResponse(true, responseMessage.users.user_detail, getResponse.data, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },

    async getUsersList(sort_column: string = 'created_on', sort_direction: string = 'desc', page: number = 1, limit: number = 10, search_key: string = '', status?: number): Promise<ApiResponse> {
        try {
            page = Number(page)
            limit = Number(limit)

            let matchObj: any = {
                user_type: ROLE.USER, // 3 for users
                $or: [
                    { email: { $regex: search_key, $options: 'i' } },
                    { first_name: { $regex: search_key, $options: 'i' } },
                ]
            }

            if (status) {
                matchObj.status = status
            }

            let aggregate = [
                {
                    $match: {
                        ...matchObj
                    }
                },
                {
                    $sort: {
                        [sort_column]: sort_direction == 'asc' ? 1 : -1
                    }
                },
                {
                    $project: {
                        password: 0,
                        device_info: 0,
                        social_account: 0
                    }
                }

            ]

            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await commonHelper.getCountAndPagination(userModel, aggregate, page, limit)

            let result = await userModel.aggregate(aggregation)

            return showResponse(true, responseMessage?.common.data_retreive_sucess, { result, totalCount }, null, 200);

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },
    async updateUserStatus(data: any): Promise<ApiResponse> {
        try {
            let { user_id, status } = data;

            status = Number(status)
            let queryObject = { _id: user_id, user_type: ROLE.USER } //usertype should be USER  = 3

            let result = await findOne(userModel, queryObject);

            if (!result.status) {
                return showResponse(false, responseMessage.users.invalid_user, null, null, 400);
            }
            let editObj = {
                status,
                updated_on: moment().unix()
            }

            let response = await findOneAndUpdate(userModel, queryObject, editObj);
            if (response.status) {
                let msg = status == 2 ? "Deleted" : status == 1 ? "Activated" : "Deactivated"
                return showResponse(true, `User Account Has Been ${msg}`, {}, null, 200);
            }

            return showResponse(false, "Error While Updating User Status", null, null, 400);


        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

    async addQuestion(data: any): Promise<ApiResponse> {
        try {
            const { question, answer } = data;

            const exists = await findOne(faqModel, { question })

            if (exists.status) {
                return showResponse(false, responseMessage.common.already_existed, null, null, 400)

            }

            let newObj = {
                question,
                answer,
                status: 1,
                created_on: moment().unix()
            }
            let quesRef = new faqModel(newObj)
            let response = await createOne(quesRef);

            if (response.status) {
                return showResponse(true, responseMessage.admin.question_added, null, null, 200);
            }
            return showResponse(false, responseMessage.admin.failed_question_add, response, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },
    async updateQuestion(data: any): Promise<ApiResponse> {
        try {
            const { answer, question, question_id } = data;

            let updateObj: any = {
                updated_on: moment().unix()
            }

            if (answer) {
                updateObj.answer = answer
            }
            if (question) {
                updateObj.question = question
            }

            let response = await findByIdAndUpdate(faqModel, updateObj, question_id);
            if (response.status) {
                return showResponse(true, responseMessage.common.update_sucess, null, null, 200);
            }
            return showResponse(false, responseMessage.common.update_failed, null, null, 400);


        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },


    async updateCommonContent(data: any): Promise<ApiResponse> {
        try {

            data.updated_on = moment().unix()
            let response = await updateMany(commonContentModel, data, {});
            if (response.status) {
                return showResponse(true, responseMessage.admin.common_content_updated, null, null, 200);
            }

            return showResponse(false, responseMessage.common.update_failed, {}, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

}

export default AdminHandler 
