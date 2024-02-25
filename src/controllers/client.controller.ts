// @ts-ignore
import { Route, Controller, Tags, Post, Body, Security, Query, UploadedFile, Get, Put } from 'tsoa'
import handlebar from 'handlebars';
import path from 'path';
import { Request, Response } from 'express'
import { validateChangePassword, validateProfile, validateResetPassword, validateAdmin } from '../validations/admin.validator';
import { ApiResponse } from '../utils/interfaces.util';
// import { IResponse } from '../utils/interfaces.util';
// import { findOne, getById, upsert, getAll, getAllBySort, findAll, getFilterMonthDateYear, deleteById, getAllWithoutPaging, deleteMany } from '../helpers/db.helpers';
// import { genHash, camelize, verifyHash, signToken } from '../utils/common.util';
// import clientModel from '../models/client.model';
import logger from '../configs/logger.config';
// import { sendEmail } from '../configs/nodemailer';
// import { readHTMLFile, getCSVFromJSON, generateRandomOtp } from '../services/utils';
import { registrationEmailTemplate } from '../templates/newRegistration';
// import { createClientDataBase, deleteClientDataBase } from '../helpers/common.helper';
// import { validateUser } from '../validations/user.validator';
// import { validateObjectId } from '../validations/objectId.validator';
import mongoose from 'mongoose';
import handler from '../handlers/client.handler'
// import moment from 'moment'
// import { validateForgotPassword } from '../validations/admin.validator';
// import { KYC_STATUS } from '../constants/user.constants';
@Tags('Client')
@Route('api/client')
export default class ClientController extends Controller {
    req: Request;
    res: Response;
    userId: string
    constructor(req: Request, res: Response) {
        super();
        this.req = req;
        this.res = res;
        this.userId = req.body.user ? req.body.user.id : ''
    }

    /**
    * Save a client
    */
    @Post("/save")
    public async save(@Body() request: { email: string, firstName: string, lastName: string, password: string, phoneNumber: number, language: string }): Promise<ApiResponse> {
        try {
            const { email, firstName, lastName, password, phoneNumber, language } = request;
            // check if client exists
            // const userEmail = await findOne(clientModel, { email });
            // if (userEmail) {
            //     throw new Error(`Email ${email} is already exists`)
            // }
            // const userNumber = await findOne(clientModel, { phoneNumber });
            // if (userNumber) {
            //     throw new Error(`Number ${phoneNumber} is already exists`)
            // }
            // let hashed = await genHash(password);
            // const userOtp = await findOne(otpModel, { email: email, isActive: true });
            // if (!userOtp) {
            //     throw new Error(`Please verify Otp first!!`)
            // }
            // let referCodeCreate = firstName.toUpperCase().slice(0, 4) + generateRandomOtp()
            // let saveResponse = await upsert(clientModel, { email, firstName, lastName, password: hashed, phoneNumber, language, status: "APPROVED", partnerCode: referCodeCreate })
            // await deleteMany(otpModel, { email: email })
            let result = handler.login({ email, password }, "file")
            return result
        }
        catch (err: any) {
            return err

            // logger.error(`${this.req.ip} ${err.message}`)
            // return {
            //     data: null,
            //     error: err.message ? err.message : err,
            //     message: '',
            //     status: 400
            // }
        }
    }


    /**
* Generate otp for Users
*/
//     @Post("/generateOtp")
//     public async generateOtp(@Body() request: { email: string }): Promise<IResponse> {
//         try {
//             const { email } = request;
//             // create random otp
//             const otp = generateRandomOtp()
//             // Check User Found or Not
//             const exists = await findOne(otpModel, { email: email })
//             if (exists) {
//                 await upsert(otpModel, { otp, email }, exists._id)
//             }
//             // check email exists 
//             if (exists) {
//                 throw new Error('Email already registered with us!!')
//             }
//             else {
//                 await upsert(otpModel, { otp, email })
//                 // send a mail with otp
//                 const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'otp_email.html'))
//                 const template = handlebar.compile(html)
//                 const [otp1, otp2, otp3, otp4, otp5, otp6] = otp.split('');
//                 const tempData = template({ otp1, otp2, otp3, otp4, otp5, otp6, email })
//                 // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'OTP for Verification', email, tempData)
//             }
//             return {
//                 data: {},
//                 error: '',
//                 message: 'Otp successfully sent, please check your mail!!',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }


//     /**
// * Verify otp for user
// */
//     @Put("/verifyOtp")
//     public async verifyOtp(@Body() request: { email: string, otp: number }): Promise<IResponse> {
//         try {
//             const { email, otp } = request;
//             // Check User Found or Not
//             const exists = await findOne(otpModel, { email: email })
//             if (!exists) {
//                 throw new Error('OTP not generated!!')
//             }
//             // check Otp
//             if (otp != exists.otp) {
//                 throw new Error('Wrong Otp Entered, please check your otp!!')
//             }
//             else {
//                 await upsert(otpModel, { isActive: true }, exists._id)
//             }
//             return {
//                 data: null,
//                 error: '',
//                 message: 'Verified successfully!!',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }


//     /**
//     * User login
//     */
//     @Post("/login")
//     public async login(@Body() request: { email: string, password: string }): Promise<IResponse> {
//         try {
//             const { email, password } = request;
//             const validatedUser = validateUser({ email, password });
//             if (validatedUser.error) {
//                 throw new Error(validatedUser.error.message)
//             }
//             // Check User Found or Not
//             const exists = await findOne(clientModel, { email });
//             if (!exists) {
//                 throw new Error('User doesn\'t exists!!');
//             }
//             // check if User Verify
//             if (exists.status != "APPROVED") {
//                 throw new Error('User not verrifyed yet!');
//             }

//             const isValid = await verifyHash(password, exists.password);
//             if (!isValid) {
//                 throw new Error('Password seems to be incorrect');
//             }
//             const token = await signToken(exists._id)
//             delete exists.password
//             return {
//                 data: { ...exists, token },
//                 error: '',
//                 message: 'Login Success',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }


//     /**
// * Client Forgot Password
// */
//     @Post("/forgotPassword")
//     public async forgotPassword(@Body() request: { email: string, domain: string }): Promise<IResponse> {
//         try {
//             const { email, domain } = request;
//             const validatedForgotPassword = validateForgotPassword({ email });
//             if (validatedForgotPassword.error) {
//                 throw new Error(validatedForgotPassword.error.message)
//             }
//             // check if user exists
//             const exists = await findOne(clientModel, { email: email });
//             if (!exists) {
//                 throw new Error('Invalid User')
//             }
//             //   sign a token with userid & purpose
//             const token = await signToken(exists._id, { purpose: 'reset' }, '1h')
//             //   send an email
//             const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'reset-password.html'))
//             const template = handlebar.compile(html)
//             // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'Reset Your Password', email, template({ link: `${domain}reset-password?resetId=${token}`, firstName: exists.firstName }))
//             return {
//                 data: {},
//                 error: '',
//                 message: 'Password reset Link successfully sent to ' + email,
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }


//     /**
// * verify Link
// */
//     @Security('Bearer')
//     @Put("/verifyForgetLink")
//     public async verifyForgetLink(@Body() request: { id?: string }): Promise<IResponse> {
//         try {
//             const { id } = request
//             // Check User Found or Not
//             const exists = await findOne(clientModel, { _id: this.userId })
//             if (!exists) {
//                 throw new Error('User not found, please check your email again')
//             }
//             return {
//                 data: null,
//                 error: '',
//                 message: ' Successfully verified!!',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }



//     /**
// * Forgot password api endpoint
// */
//     @Security('Bearer')
//     @Post("/resetPassword")
//     public async resetPassword(@Body() request: { password: string }): Promise<IResponse> {
//         try {
//             const { password } = request;
//             const validatedResetPassword = validateResetPassword({ password });
//             if (validatedResetPassword.error) {
//                 throw new Error(validatedResetPassword.error.message)
//             }
//             // convert password to encrypted format
//             const hashed = await genHash(password)
//             await upsert(clientModel, { password: hashed }, this.userId)

//             return {
//                 data: {},
//                 error: '',
//                 message: 'Password reset successfully!',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }

//     /**
//      * Verify otp
//      */
//     @Put("/resendOtp")
//     public async resendOtp(@Body() request: { id: string }): Promise<IResponse> {
//         try {
//             const { id } = request;
//             const validatedObjectIdRes = validateObjectId(id);
//             if (validatedObjectIdRes.error) {
//                 throw new Error(validatedObjectIdRes.error.message)
//             }
//             // Check User Found or Not
//             const exists = await findOne(clientModel, { _id: mongoose.Types.ObjectId(id) })
//             if (!exists) {
//                 throw new Error('User not found !')
//             }
//             // Create Random Otp
//             const otp = generateRandomOtp()
//             // Save Otp in Otp Model
//             await upsert(otpModel, { otp: otp, email: exists.email }, id)
//             // send email
//             const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'otp_email.html'))
//             const template = handlebar.compile(html)
//             const [otp1, otp2, otp3, otp4, otp5, otp6] = otp.split('');
//             const tempData = template({ otp1, otp2, otp3, otp4, otp5, otp6, firstName: exists.firstName })
//             // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'OTP for Verification', exists.email, tempData)
//             return {
//                 data: null,
//                 error: '',
//                 message: 'Email has been sent successfully!',
//                 status: 200
//             }
//         }
//         catch (err: any) {
//             logger.error(`${this.req.ip} ${err.message}`)
//             return {
//                 data: null,
//                 error: err.message ? err.message : err,
//                 message: '',
//                 status: 400
//             }
//         }
//     }

//       /**
//      * Get user info
//      */
//       @Security('Bearer')
//       @Get("/me")
//       public async me(): Promise<IResponse> {
//           try {
//               //   check for a valid id
//               const getResponse = await findOne(clientModel, {_id: this.userId});
//               return {
//                   data: getResponse || {},
//                   error: '',
//                   message: 'User info fetched Successfully',
//                   status: 200
//               }
//           }
//           catch (err: any) {
//               logger.error(`${this.req.ip} ${err.message}`)
//               return {
//                   data: null,
//                   error: err.message ? err.message : err,
//                   message: '',
//                   status: 400
//               }
//           }
//       }

    //     /**
    // * Change Password endpoint
    // */
    //     @Security('Bearer')
    //     @Post("/changePassword")
    //     public async changePassword(@Body() request: { oldPassword: string, newPassword: string }): Promise<IResponse> {
    //         try {
    //             const { oldPassword, newPassword } = request;
    //             const validatedChangePassword = validateChangePassword({ oldPassword, newPassword });;
    //             if (validatedChangePassword.error) {
    //                 throw new Error(validatedChangePassword.error.message)
    //             }
    //             const exists = await getById(clientModel, this.userId)
    //             if (!exists) {
    //                 throw new Error('Invalid Admin')
    //             }
    //             const isValid = await verifyHash(oldPassword, exists.password);
    //             if (!isValid) {
    //                 throw new Error('Password is incorrect')
    //             }
    //             const hashed = await genHash(newPassword)
    //             const updated = await upsert(clientModel, { password: hashed }, this.userId)

    //             return {
    //                 data: {},
    //                 error: '',
    //                 message: 'Password changed successfully!',
    //                 status: 200
    //             }
    //         }
    //         catch (err: any) {
    //             logger.error(`${this.req.ip} ${err.message}`)
    //             return {
    //                 data: null,
    //                 error: err.message ? err.message : err,
    //                 message: '',
    //                 status: 400
    //             }
    //         }
    //     }

    //     /**
    //          * Get Users list by Admin auth
    //          */
    //     @Security('Bearer')
    //     @Get("/users")
    //     public async users(@Query('pageNumber') pageNumber?: number, @Query('pageSize') pageSize?: number, @Query('search') search?: string, @Query('status') status?: string, @Query('kycStatus') kycStatus?: string): Promise<IResponse> {
    //         try {
    //             //   check for a valid id
    //             let query: any = {};
    //             if (search) {
    //                 query.$or = [{ email: { $regex: search, $options: 'i' } }, { firstName: { $regex: search, $options: 'i' } }];
    //             }
    //             if (status) {
    //                 query.status = status;
    //             }
    //             if (kycStatus) {
    //                 query.kycStatus = kycStatus;
    //             }
    //             console.log(query);

    //             const getResponse = await getAllBySort(clientModel, query, pageNumber, pageSize, {}, true, { createdAt: -1 })
    //             return {
    //                 data: getResponse || {},
    //                 error: '',
    //                 message: 'Sub Admins info fetched Successfully',
    //                 status: 200
    //             }
    //         }
    //         catch (err: any) {
    //             logger.error(`${this.req.ip} ${err.message}`)
    //             return {
    //                 data: null,
    //                 error: err.message ? err.message : err,
    //                 message: '',
    //                 status: 400
    //             }
    //         }
    //     }

}
