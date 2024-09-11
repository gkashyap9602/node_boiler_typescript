import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, findAndUpdatePushOrSet } from "../../helpers/db.helpers";
import { decodeToken, generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import userModel from "../../models/User/user.auth.model";
import { APP, ROLE, USER_STATUS } from '../../constants/app.constant';
import services from '../../services';
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'

const UserAuthHandler = {

    login: async (data: any): Promise<ApiResponse> => {
        const { email, password, os_type } = data;
        const exists = await findOne(userModel, { email, status: { $ne: USER_STATUS.DELETED } });

        //if social login is used in project then user this query 
        // const exists = await findOne(userModel, { email, account_source: 'email', status: { $ne: USER_STATUS.DELETED } });

        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        if (exists?.data?.status == USER_STATUS.DEACTIVATED) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.API_ERROR);
        }

        const isValid = await commonHelper.verifyBycryptHash(password, exists.data.password);
        if (!isValid) {
            return showResponse(false, responseMessage.common.password_incorrect, null, statusCodes.API_ERROR)
        }

        const os_update = await findOneAndUpdate(userModel, { _id: exists?.data?._id }, { os_type })
        if (!os_update) {
            return showResponse(false, responseMessage.users.login_error, null, statusCodes.API_ERROR)
        }

        const token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access", role: exists?.data?.user_type }, APP.ACCESS_EXPIRY)
        delete exists.data.password
        const refresh_token = await generateJwtToken(exists.data._id, { user_type: 'user', type: "access", role: exists?.data?.user_type }, APP.REFRESH_EXPIRY)


        return showResponse(true, responseMessage.users.login_success, { ...exists.data, token, refresh_token }, statusCodes.SUCCESS)

    },

    // social_login: async (data: any) => {
    //     const { login_source, social_auth, email, name, user_type, profile_pic } = data;
    //     const model = ROLE_TYPE[user_type]

    //     const matchObj = {
    //         status: { $ne: USER_STATUS.DELETED }, //user not deleted
    //         $or: [
    //             {
    //                 social_account: {
    //                     $elemMatch: { email: email }
    //                 }

    //             },
    //             {
    //                 social_account: {
    //                     $elemMatch: { token: social_auth }
    //                 }

    //             },

    //         ]
    //     } //match condition ends 

    //     //check user exist or not 
    //     const findUser = await findOne(model, matchObj);
    //     if (findUser.status) {
    //         //check status of user
    //         if (findUser.data?.status == USER_STATUS.DEACTIVATED) {
    //             return showResponse(false, "Your account has been deactivated contact support!!", null, statusCodes.API_ERROR);
    //         }

    //         //update social account array 
    //         const updateSocialInfo = await advisorClientSpAuthhandler.update_social_info(findUser, model, data)
    //         if (updateSocialInfo.status) {
    //             const token_payload = { user_type: 'user', type: "access", role: findUser?.data?.user_type }
    //             const access_token = await generateJwtToken(findUser.data._id, token_payload, APP.ACCESS_EXPIRY)
    //             const refresh_token = await generateJwtToken(findUser.data._id, token_payload, APP.REFRESH_EXPIRY)
    //             const userData = { ...findUser?.data, token: access_token, refresh_token }

    //             return showResponse(true, `${responseMessage.users.login_success}`, userData, statusCodes.SUCCESS);
    //         }

    //         return showResponse(false, `${responseMessage.users.login_error}`, null, statusCodes.API_ERROR);

    //     } else { //else register new user 

    //         let newObj = {
    //             social_account: [
    //                 {
    //                     source: login_source,
    //                     email: email,
    //                     token: social_auth,
    //                     name: name
    //                 }
    //             ],
    //             email,
    //             first_name: name ?? '',
    //             account_source: login_source,
    //             is_verified: false,
    //         };

    //         const userRef = new model(newObj)
    //         const result = await createOne(userRef);
    //         if (result.status) {
    //             delete result?.data?.password
    //             const token_payload = { user_type: 'user', type: "access", role: result?.data?.user_type }
    //             const access_token = await generateJwtToken(result.data._id, token_payload, APP.ACCESS_EXPIRY)
    //             const refresh_token = await generateJwtToken(result.data._id, token_payload, APP.REFRESH_EXPIRY)
    //             const userData = { ...result?.data, token: access_token, refresh_token }

    //             return showResponse(true, responseMessage.users.login_success, userData, statusCodes.SUCCESS);

    //         }

    //     }

    //     return showResponse(false, responseMessage.users.login_error, null, statusCodes.API_ERROR);
    // },
    update_social_info: async (findUser: any, model: any, data: any) => {
        try {
            const { login_source, social_auth, email, name } = data

            const editObj: any = {
                updated_on: moment().unix(),
            }

            const social_account = {
                email,
                source: login_source,
                token: social_auth,
                name: name
            }

            // Check if social account exists in device_info array
            const accountIndex = findUser?.data?.social_account.findIndex((info: any) => info?.source === data?.login_source);

            //if exist then update else add new
            if (accountIndex !== -1) {
                editObj[`social_account.${accountIndex}`] = social_account;
            } else {
                editObj.$push = { social_account: social_account }
            }

            const response = await findAndUpdatePushOrSet(model, { _id: findUser.data._id }, editObj);
            //return update result
            if (response.status) {
                return { status: true, data: response.data }

            } else {
                return { status: false, data: null }
            }

        } catch (error) {
            console.log(error, "error update_device_id")
            return { status: false }
        }

    },

    register: async (data: any, profile_pic: any): Promise<ApiResponse> => {
        const { email, password } = data;
        // check if user exists
        const exists = await findOne(userModel, { email });
        if (exists.status) {
            return showResponse(false, responseMessage.common.email_already, null, statusCodes.API_ERROR)
        }

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

        const userRef = new userModel(data)
        const result = await createOne(userRef)

        if (!result.status) {
            return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
        }

        const email_payload = { project_name: APP.PROJECT_NAME, user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
        const logoPath = path.join(process.cwd(), './public', 'logo.png');
        //send email of attachment to admin
        const to = `${result?.data?.email}`
        const subject = `New user registered`

        const attachments = [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ]

        await services.emailService.nodemail(to, subject, template, attachments)
        delete result?.data.password
        return showResponse(true, responseMessage.users.register_success, result?.data, statusCodes.SUCCESS)

    },//ends

    //user this register func if social login is used in project
    // async register(data: any, profile_pic: any): Promise<ApiResponse> {

    //     let { email, password } = data;

    //     //check if match or not by email
    //     let query = {
    //         status: { $ne: USER_STATUS.DELETED },
    //         $or: [
    //             { email },//if account email find then throw error already existed 
    //             {
    //                 social_account: {
    //                     $elemMatch: { email: email }  //if account finds with social email then create new if finds
    //                 }

    //             },
    //         ]
    //     }


    //     // check if user exists
    //     const existsUser = await findOne(userModel, query);

    //     let hashed = await commonHelper.bycrptPasswordHash(password);

    //     // let otp = 1234;
    //     let otp = commonHelper.generateOtp()
    //     if (existsUser.status) {

    //         //if user exist with same account source then throw error
    //         if (existsUser.data.account_source == 'email') {
    //             return showResponse(false, responseMessage.users.email_already, null, statusCodes.API_ERROR);
    //         }

    //         //if account source is different and user exist then update user details and its account source
    //         let editObj = { ...data }
    //         editObj.account_source = 'email'
    //         editObj.password = hashed
    //         editObj.otp = otp

    //         let response = await findOneAndUpdate(userModel, { _id: existsUser.data._id }, editObj);
    //         let user_name = response.data?.first_name

    //         const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), { user_name, cidLogo: 'unique@Logo', otp });
    //         const logoPath = path.join(process.cwd(), './public', 'logo.png');
    //         //send email of attachment to admin
    //         let to = `${response?.data?.email}`
    //         let subject = `New user registered`
    //         let attachments = [
    //             {
    //                 filename: 'logo.png',
    //                 path: logoPath,
    //                 cid: 'unique@Logo',
    //             }
    //         ]

    //         await services.emailService.nodemail(to, subject, template, attachments)

    //         if (response.status) {
    //             return showResponse(true, responseMessage.users.register_success, response.data, statusCodes.SUCCESS);
    //         }
    //         return showResponse(false, responseMessage.users.register_error, null, statusCodes.API_ERROR);

    //     } else {

    //         data.password = hashed;
    //         // data.otp = commonHelper.generateOtp()
    //         data.otp = otp;
    //         if (profile_pic) {
    //             //upload image to aws s3 bucket
    //             const s3Upload = await services.awsService.uploadFileToS3([profile_pic])
    //             if (!s3Upload.status) {
    //                 return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
    //             }
    //             data.profile_pic = s3Upload?.data[0]
    //         }
    //         let userRef = new userModel(data)
    //         let result = await createOne(userRef)
    //         if (!result.status) {
    //             return showResponse(false, responseMessage.common.error_while_create_acc, null, statusCodes.API_ERROR)
    //         }
    //         const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), { user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp });
    //         const logoPath = path.join(process.cwd(), './public', 'logo.png');
    //         //send email of attachment to admin
    //         let to = `${result?.data?.email}`
    //         let subject = `New user registered`
    //         let attachments = [
    //             {
    //                 filename: 'logo.png',
    //                 path: logoPath,
    //                 cid: 'unique@Logo',
    //             }
    //         ]
    //         await services.emailService.nodemail(to, subject, template, attachments)
    //         delete result?.data.password
    //         return showResponse(true, responseMessage.users.register_success, result?.data, statusCodes.SUCCESS)

    //     } //ends else part


    // },
    //ends
    forgotPassword: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        // check if admin exists
        const exists = await findOne(userModel, { email, status: { $ne: USER_STATUS.DELETED } });
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const otp = commonHelper.generateOtp();
        const email_payload = { project_name: APP.PROJECT_NAME, user_name: exists?.data?.first_name, cidLogo: 'unique@Logo', otp }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), email_payload);
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
                updated_on: moment().unix()
            }

            await findByIdAndUpdate(userModel, userObj, (exists?.data?._id));
            return showResponse(true, responseMessage.users.otp_send, null, statusCodes.SUCCESS);
        }

        return showResponse(false, responseMessage.users.forgot_password_email_error, null, statusCodes.API_ERROR)
    },

    uploadFile: async (data: any): Promise<ApiResponse> => {
        const { file } = data;
        const s3Upload = await services.awsService.uploadFileToS3([file])
        if (!s3Upload.status) {
            return showResponse(false, responseMessage?.common.file_upload_error, {}, statusCodes.FILE_UPLOAD_ERROR);
        }
        return showResponse(true, responseMessage.common.file_upload_success, s3Upload?.data, statusCodes.SUCCESS)

    },

    resetPassword: async (data: any): Promise<ApiResponse> => {
        const { email, new_password } = data;
        const queryObject = { email, status: { $ne: 2 } }

        const result = await findOne(userModel, queryObject);
        if (!result.status) {
            return showResponse(false, `${responseMessage.users.invalid_user} or email`, null, statusCodes.API_ERROR);
        }
        if (!result.data?.is_verified) {
            return showResponse(false, `Verify Email First`, null, statusCodes.API_ERROR);
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)

        const updateObj = {
            otp: '',
            password: hashed,
            updated_on: moment().unix()
        }

        const updated = await findByIdAndUpdate(userModel, updateObj, result?.data?._id)
        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_reset_error, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_reset_success, null, statusCodes.SUCCESS)

    },

    verifyOtp: async (data: any): Promise<ApiResponse> => {
        const { email, otp } = data;

        const queryObject = { email, otp, status: { $ne: USER_STATUS.DELETED } }

        const findUser = await findOne(userModel, queryObject)
        if (findUser.status) {
            await findOneAndUpdate(userModel, queryObject, { is_verified: true })
            return showResponse(true, responseMessage.users.otp_verify_success, null, statusCodes.SUCCESS);

        }
        return showResponse(false, responseMessage.users.invalid_otp, null, statusCodes.API_ERROR);

    },
    //ques
    resendOtp: async (data: any): Promise<ApiResponse> => {
        const { email } = data;
        const queryObject = { email, status: { $ne: 2 } }

        const result = await findOne(userModel, queryObject);
        if (result.status) {

            const otp = commonHelper.generateOtp();
            const email_payload = { project_name: APP.PROJECT_NAME, user_name: result?.data?.first_name, cidLogo: 'unique@Logo', otp }
            const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
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
                await findOneAndUpdate(userModel, queryObject, { otp })
                return showResponse(true, responseMessage.users.otp_resend, null, statusCodes.SUCCESS);
            }

        }

        return showResponse(false, responseMessage.users.invalid_email, null, statusCodes.API_ERROR);

    },

    changePassword: async (data: any, userId: string): Promise<ApiResponse> => {
        const { old_password, new_password } = data;

        const exists = await findOne(userModel, { _id: userId })
        if (!exists.status) {
            return showResponse(false, responseMessage.users.not_registered, null, statusCodes.API_ERROR)
        }

        const isValid = await commonHelper.verifyBycryptHash(old_password, exists.data?.password);
        if (!isValid) {
            return showResponse(false, responseMessage.users.invalid_old_password, null, statusCodes.API_ERROR)
        }

        const hashed = await commonHelper.bycrptPasswordHash(new_password)
        const updated = await findByIdAndUpdate(userModel, { password: hashed }, userId)
        if (!updated.status) {
            return showResponse(false, responseMessage.users.password_change_failed, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.password_change_successfull, null, statusCodes.SUCCESS)

    },

    getUserDetails: async (userId: string): Promise<ApiResponse> => {
        const getResponse = await findOne(userModel, { _id: userId }, { password: 0 });
        if (!getResponse.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.users.user_detail, getResponse.data, statusCodes.SUCCESS)

    },

    updateUserProfile: async (data: any, user_id: string, profile_pic: any): Promise<ApiResponse> => {
        const { first_name, last_name, phone_number, country_code } = data

        const findUser = await findOne(userModel, { user_type: ROLE.USER, _id: user_id, status: { $ne: USER_STATUS.DELETED } })
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR);
        }

        const updateObj: any = {}
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
                return showResponse(false, responseMessage?.common.file_upload_error, null, statusCodes.FILE_UPLOAD_ERROR);
            }
            updateObj.profile_pic = s3Upload?.data[0]
        }

        const result = await findByIdAndUpdate(userModel, updateObj, user_id);
        if (result.status) {
            delete result.data.password
            return showResponse(true, responseMessage.users.user_account_updated, result.data, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage.users.user_account_update_error, null, statusCodes.API_ERROR);

    },

    async refreshToken(data: any): Promise<ApiResponse> {
        const { refresh_token } = data

        const response: any = await decodeToken(refresh_token)
        if (!response.status) {
            return showResponse(false, responseMessage?.middleware?.token_expired, null, statusCodes.REFRESH_TOKEN_ERROR);
        }

        let user_id = response?.data?.id

        const findUser = await findOne(userModel, { _id: user_id });
        if (!findUser.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        if (findUser?.data?.status == USER_STATUS.DEACTIVATED) {
            return showResponse(false, responseMessage.middleware.deactivated_account, null, statusCodes.ACCOUNT_DISABLED);
        }
        if (findUser?.data?.status == USER_STATUS.DELETED) {
            return showResponse(false, responseMessage.middleware.deleted_account, null, statusCodes.ACCOUNT_DELETED);
        }

        const accessToken = await generateJwtToken(findUser.data._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.ACCESS_EXPIRY)
        // const refreshToken = await generateJwtToken(findUser.data._id, { user_type: 'user', type: "access", role: findUser?.data?.user_type }, APP.REFRESH_EXPIRY)

        return showResponse(true, 'token generated successfully', { token: accessToken }, statusCodes.SUCCESS)

    },

    async logoutUser(): Promise<ApiResponse> {
        return showResponse(true, responseMessage.users.logout_success, null, statusCodes.SUCCESS)

    },

    async deleteAccount(data: any): Promise<ApiResponse> {
        const { user_id } = data
        const status = USER_STATUS.DELETED
        const result = await findByIdAndUpdate(userModel, { status }, user_id);

        if (result.status) {
            delete result.data.password
            const msg = status == 2 ? 'deleted' : 'deactivated'
            return showResponse(true, `User account has been ${msg} `, null, statusCodes.SUCCESS);
        }
        return showResponse(false, 'Error While Perform Operation', null, statusCodes.API_ERROR);

    }

}

export default UserAuthHandler 
