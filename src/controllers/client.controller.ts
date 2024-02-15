// @ts-ignore
import { Route, Controller, Tags, Post, Body, Security, Query, UploadedFile, Get, Put } from 'tsoa'
import handlebar from 'handlebars';
import path from 'path';
import { Request, Response } from 'express'
import { validateChangePassword, validateProfile, validateResetPassword, validateAdmin } from '../validations/admin.validator';


import { IResponse } from '../utils/interfaces.util';
import { findOne, getById, upsert, getAll, getAllBySort, findAll, getFilterMonthDateYear, deleteById, getAllWithoutPaging, deleteMany } from '../helpers/db.helpers';
import { genHash, camelize, verifyHash, signToken } from '../utils/common.util';
import clientModel from '../models/client.model';
import otpModel from '../models/otp.model';
import logger from '../configs/logger.config';
// import { sendEmail } from '../configs/nodemailer';
import { readHTMLFile, getCSVFromJSON, generateRandomOtp } from '../services/utils';
import { registrationEmailTemplate } from './../template/newRegistration';
import { createClientDataBase, deleteClientDataBase } from '../helpers/common.helper';
import { validateUser } from '../validations/user.validator';
import { validateObjectId } from '../validations/objectId.validator';

import mongoose from 'mongoose';
import moment from 'moment'
import { validateForgotPassword } from '../validations/admin.validator';
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
    public async save(@Body() request: { email: string, firstName: string, lastName: string, password: string, phoneNumber: number, language: string }): Promise<IResponse> {
        try {
            const { email, firstName, lastName, password, phoneNumber, language } = request;
            // check if client exists
            const userEmail = await findOne(clientModel, { email });
            if (userEmail) {
                throw new Error(`Email ${email} is already exists`)
            }
            const userNumber = await findOne(clientModel, { phoneNumber });
            if (userNumber) {
                throw new Error(`Number ${phoneNumber} is already exists`)
            }
            let hashed = await genHash(password);
            const userOtp = await findOne(otpModel, { email: email, isActive: true });
            if (!userOtp) {
                throw new Error(`Please verify Otp first!!`)
            }
            let referCodeCreate = firstName.toUpperCase().slice(0, 4) + generateRandomOtp()
            let saveResponse = await upsert(clientModel, { email, firstName, lastName, password: hashed, phoneNumber, language, status: "APPROVED", partnerCode: referCodeCreate })
            await deleteMany(otpModel, { email: email })
            return {
                data: { ...saveResponse.toObject() },
                error: '',
                message: 'User registered successfully',
                status: 200

            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }


    /**
* Generate otp for Users
*/
    @Post("/generateOtp")
    public async generateOtp(@Body() request: { email: string }): Promise<IResponse> {
        try {
            const { email } = request;
            // create random otp
            const otp = generateRandomOtp()
            // Check User Found or Not
            const exists = await findOne(otpModel, { email: email })
            if (exists) {
                await upsert(otpModel, { otp, email }, exists._id)
            }
            // check email exists 
            if (exists) {
                throw new Error('Email already registered with us!!')
            }
            else {
                await upsert(otpModel, { otp, email })
                // send a mail with otp
                const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'otp_email.html'))
                const template = handlebar.compile(html)
                const [otp1, otp2, otp3, otp4, otp5, otp6] = otp.split('');
                const tempData = template({ otp1, otp2, otp3, otp4, otp5, otp6, email })
                // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'OTP for Verification', email, tempData)
            }
            return {
                data: {},
                error: '',
                message: 'Otp successfully sent, please check your mail!!',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }


    /**
* Verify otp for user
*/
    @Put("/verifyOtp")
    public async verifyOtp(@Body() request: { email: string, otp: number }): Promise<IResponse> {
        try {
            const { email, otp } = request;
            // Check User Found or Not
            const exists = await findOne(otpModel, { email: email })
            if (!exists) {
                throw new Error('OTP not generated!!')
            }
            // check Otp
            if (otp != exists.otp) {
                throw new Error('Wrong Otp Entered, please check your otp!!')
            }
            else {
                await upsert(otpModel, { isActive: true }, exists._id)
            }
            return {
                data: null,
                error: '',
                message: 'Verified successfully!!',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }


    /**
    * User login
    */
    @Post("/login")
    public async login(@Body() request: { email: string, password: string }): Promise<IResponse> {
        try {
            const { email, password } = request;
            const validatedUser = validateUser({ email, password });
            if (validatedUser.error) {
                throw new Error(validatedUser.error.message)
            }
            // Check User Found or Not
            const exists = await findOne(clientModel, { email });
            if (!exists) {
                throw new Error('User doesn\'t exists!!');
            }
            // check if User Verify
            if (exists.status != "APPROVED") {
                throw new Error('User not verrifyed yet!');
            }

            const isValid = await verifyHash(password, exists.password);
            if (!isValid) {
                throw new Error('Password seems to be incorrect');
            }
            const token = await signToken(exists._id)
            delete exists.password
            return {
                data: { ...exists, token },
                error: '',
                message: 'Login Success',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }


    /**
* Client Forgot Password
*/
    @Post("/forgotPassword")
    public async forgotPassword(@Body() request: { email: string, domain: string }): Promise<IResponse> {
        try {
            const { email, domain } = request;
            const validatedForgotPassword = validateForgotPassword({ email });
            if (validatedForgotPassword.error) {
                throw new Error(validatedForgotPassword.error.message)
            }
            // check if user exists
            const exists = await findOne(clientModel, { email: email });
            if (!exists) {
                throw new Error('Invalid User')
            }
            //   sign a token with userid & purpose
            const token = await signToken(exists._id, { purpose: 'reset' }, '1h')
            //   send an email
            const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'reset-password.html'))
            const template = handlebar.compile(html)
            // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'Reset Your Password', email, template({ link: `${domain}reset-password?resetId=${token}`, firstName: exists.firstName }))
            return {
                data: {},
                error: '',
                message: 'Password reset Link successfully sent to ' + email,
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }


    /**
* verify Link
*/
    @Security('Bearer')
    @Put("/verifyForgetLink")
    public async verifyForgetLink(@Body() request: { id?: string }): Promise<IResponse> {
        try {
            const { id } = request
            // Check User Found or Not
            const exists = await findOne(clientModel, { _id: this.userId })
            if (!exists) {
                throw new Error('User not found, please check your email again')
            }
            return {
                data: null,
                error: '',
                message: ' Successfully verified!!',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }



    /**
* Forgot password api endpoint
*/
    @Security('Bearer')
    @Post("/resetPassword")
    public async resetPassword(@Body() request: { password: string }): Promise<IResponse> {
        try {
            const { password } = request;
            const validatedResetPassword = validateResetPassword({ password });
            if (validatedResetPassword.error) {
                throw new Error(validatedResetPassword.error.message)
            }
            // convert password to encrypted format
            const hashed = await genHash(password)
            await upsert(clientModel, { password: hashed }, this.userId)

            return {
                data: {},
                error: '',
                message: 'Password reset successfully!',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }

    /**
     * Verify otp
     */
    @Put("/resendOtp")
    public async resendOtp(@Body() request: { id: string }): Promise<IResponse> {
        try {
            const { id } = request;
            const validatedObjectIdRes = validateObjectId(id);
            if (validatedObjectIdRes.error) {
                throw new Error(validatedObjectIdRes.error.message)
            }
            // Check User Found or Not
            const exists = await findOne(clientModel, { _id: mongoose.Types.ObjectId(id) })
            if (!exists) {
                throw new Error('User not found !')
            }
            // Create Random Otp
            const otp = generateRandomOtp()
            // Save Otp in Otp Model
            await upsert(otpModel, { otp: otp, email: exists.email }, id)
            // send email
            const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'otp_email.html'))
            const template = handlebar.compile(html)
            const [otp1, otp2, otp3, otp4, otp5, otp6] = otp.split('');
            const tempData = template({ otp1, otp2, otp3, otp4, otp5, otp6, firstName: exists.firstName })
            // await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'OTP for Verification', exists.email, tempData)
            return {
                data: null,
                error: '',
                message: 'Email has been sent successfully!',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }

      /**
     * Get user info
     */
      @Security('Bearer')
      @Get("/me")
      public async me(): Promise<IResponse> {
          try {
              //   check for a valid id
              const getResponse = await findOne(clientModel, {_id: this.userId});
              return {
                  data: getResponse || {},
                  error: '',
                  message: 'User info fetched Successfully',
                  status: 200
              }
          }
          catch (err: any) {
              logger.error(`${this.req.ip} ${err.message}`)
              return {
                  data: null,
                  error: err.message ? err.message : err,
                  message: '',
                  status: 400
              }
          }
      }

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

    //     /**
    //          * Get Users Analytics list by Admin auth
    //          */
    //     @Security('Bearer')
    //     @Get("/user-dashboard-analytics")
    //     public async usersAnalytics(): Promise<IResponse> {
    //         try {
    //             //   check for a valid id
    //             let [getResponse] = await clientModel.aggregate([
    //                 {
    //                     $facet: {
    //                         kycStatusCompleted: [
    //                             {
    //                                 $match: {
    //                                     kycStatus: KYC_STATUS.COMPLETED
    //                                 }
    //                             }
    //                         ],
    //                         kycStatusPending: [
    //                             {
    //                                 $match: {
    //                                     kycStatus: KYC_STATUS.PENDING
    //                                 }
    //                             }
    //                         ],
    //                         kycStatusInProgress: [
    //                             {
    //                                 $match: {
    //                                     kycStatus: KYC_STATUS.INPROGRESS
    //                                 }
    //                             }
    //                         ],
    //                         totalUser: [
    //                             {
    //                                 $match:{}
    //                             }
    //                         ]
    //                     }
    //                 },
    //                 {
    //                     $project:{
    //                         kycStatusCompleted:{$size:'$kycStatusCompleted'},
    //                         kycStatusInProgress:{$size:'$kycStatusInProgress'},
    //                         kycStatusPending:{$size:'$kycStatusPending'},
    //                         totalUsers:{$size:'$totalUser'}
    //                     }
    //                 }
    //             ])
    //             return {
    //                 data: getResponse || {},
    //                 error: '',
    //                 message: 'User Analytics fetched Successfully',
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
    //   * Create Mpin
    //   */
    //       @Security('Bearer')
    //       @Post("/creatempin")
    //       public async createMpin(@Body() request: { mpin: string }): Promise<IResponse> {
    //           try {3
    //               let { mpin } = request;
    //               const exists = await getById(clientModel, this.userId)
    //               if (!exists) {
    //                   throw new Error('Invalid User')
    //               }
    //               if (exists.mpin) {
    //                   throw new Error('Mpin already exists')
    //               }
    //               const hashed = await genHash(mpin);
    //               await upsert(clientModel, { mpin: hashed}, exists._id);
    //               const otp = generateRandomOtp()
    //               await deleteMany(otpModel, { email: exists.email });
    //               await upsert(otpModel, { otp, email: exists.email });
    //               // send a mail with otp
    //               const html = await readHTMLFile(path.join(process.cwd(), 'src', 'template', 'otp_email.html'))
    //               const template = handlebar.compile(html)
    //               const [otp1, otp2, otp3, otp4, otp5, otp6] = otp.split('');
    //               const tempData = template({ otp1, otp2, otp3, otp4, otp5, otp6, email: exists.email, firstName: exists.firstName })
    //               await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'OTP for verify Mpin', exists.email, tempData)
    //               return {
    //                   data: {},
    //                   error: '',
    //                   message: 'Email sent successfully, please verify MPIN otp!!',
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


    //       /**
    // * verify Mpin
    // */
    //     @Security('Bearer')
    //     @Post("/verifyMpin")
    //     public async verifyMpin(@Body() request: { otp: number }): Promise<IResponse> {
    //         try {
    //             let { otp } = request;
    //             let exists = await getById(clientModel, this.userId)
    //             if (!exists) {
    //                 throw new Error('Invalid User')
    //             }
    //             if (exists.mpinMode == true) {
    //                 throw new Error('Mpin already verified')
    //             }
    //             const otpData = await findOne(otpModel, { email: exists.email });

    //             if (!otpData || otpData.otp !== otp) {
    //                 throw new Error('Invalid OTP')
    //             }
    //             await upsert(clientModel, { mpinMode: true }, exists._id);
    //             await deleteMany(otpModel, { email: exists.email });
    //             return {
    //                 data: {},
    //                 error: '',
    //                 message: 'Mpin verified successfully',
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
    //   * Create Mpin
    //   */
    //     @Post("/creatempin")
    //     public async createMpin(@Body() request: { mpin: string }): Promise<IResponse> {
    //         try {
    //             const { mpin } = request;

    //             return {
    //                 data: {},
    //                 error: '',
    //                 message: 'Mpin create successfully',
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





    /**
     * Invitation Link
    */




    //     /**
    //     * register a client
    //     */
    //     @Post("/registerClient")
    //     public async registerClient(@Body() request: {
    //         email: string, firstName: string, lastName: string, websiteDomain: string, workPhoneNumber: string, adminDomain: string,
    //         stripCustomerId: string, address: string, phoneNumber: number, country: string, city: string, state: string, businessName: string, postCode: number,
    //         subscriptionPlanId: string, admin_Domain: string, lp_Domain: string, templateUniqueId: string, networkKey: string, paymentKey: any, emailTempKey: any
    //     }): Promise<IResponse> {
    //         try {
    //             let businessName = request.businessName;
    //             let templateData = null;
    //             let networkData = null;
    //             let paymentData = [];
    //             let emailTempData = [];

    //             let email, firstName, lastName, phoneNumber, country, city, state, websiteDomain, adminDomain, workPhoneNumber, stripCustomerId, address, postCode, subscriptionPlanId,
    //                 admin_Domain, lp_Domain, networkKey, paymentKey, emailTempKey;

    //             const checkBusinessName = businessName.toLowerCase().split(' ').join('-');

    //             const userBusinessName = await findOne(clientModel, { businessName: checkBusinessName, isProspect: true });
    //             if (userBusinessName) {

    //                 email = userBusinessName.email;
    //                 firstName = userBusinessName.firstName;
    //                 lastName = userBusinessName.lastName;
    //                 phoneNumber = userBusinessName.phoneNumber;
    //                 country = userBusinessName.country;
    //                 city = userBusinessName.city;
    //                 state = userBusinessName.state;
    //                 websiteDomain = request.websiteDomain;
    //                 adminDomain = request.adminDomain;
    //                 workPhoneNumber = userBusinessName.workPhoneNumber;
    //                 stripCustomerId = request.stripCustomerId;
    //                 address = userBusinessName.address;
    //                 postCode = userBusinessName.postCode;
    //                 subscriptionPlanId = request.subscriptionPlanId;
    //                 admin_Domain = request.admin_Domain;
    //                 lp_Domain = request.lp_Domain;
    //             } else {

    //                 email = request.email;
    //                 firstName = request.firstName;
    //                 lastName = request.lastName;
    //                 phoneNumber = request.phoneNumber;
    //                 country = request.country;
    //                 city = request.city;
    //                 state = request.state;
    //                 websiteDomain = request.websiteDomain;
    //                 adminDomain = request.adminDomain;
    //                 workPhoneNumber = request.workPhoneNumber;
    //                 stripCustomerId = request.stripCustomerId;
    //                 address = request.address;
    //                 postCode = request.postCode;
    //                 subscriptionPlanId = request.subscriptionPlanId;
    //                 admin_Domain = request.admin_Domain;
    //                 lp_Domain = request.lp_Domain;

    //                 // const { email, firstName, lastName, phoneNumber, country, city, state, websiteDomain, adminDomain, workPhoneNumber, stripCustomerId, address, postCode, subscriptionPlanId, admin_Domain, lp_Domain } = request;                

    //                 const userBusinessName = await findOne(clientModel, { businessName: checkBusinessName, isProspect: false });
    //                 if (userBusinessName) {
    //                     throw new Error(`Business name  ${userBusinessName.businessName} is already exists`)
    //                 }
    //             }
    //             if (request.templateUniqueId) {
    //                 templateData = await findOne(templateModel, { uniqueId: request.templateUniqueId })
    //             }

    //             if (request.networkKey) {
    //                 networkData = await findOne(networkModel, { networkKey: request.networkKey })
    //             }
    //             if (Array.isArray(request.paymentKey)) {
    //                 const data = await getAllWithoutPaging(paymentMethodModel, { paymentKey: request.paymentKey })
    //                 paymentData = data.items
    //             }

    //             if (Array.isArray(request.emailTempKey)) {
    //                 const data = await getAllWithoutPaging(emailTemplateModel, { emailTempKey: request.emailTempKey })
    //                 console.log("data", data)
    //                 emailTempData = data.items
    //             }


    //             const clientAdminDomain = await findOne(clientModel, { adminDomain });
    //             if (clientAdminDomain) {
    //                 throw new Error(`This AdminDomain ${adminDomain} is already exists`)
    //             }

    //             let admindomain = `https://${checkBusinessName}-admin.block-brew.com/`;
    //             let webDomain = `https://${checkBusinessName}.block-brew.com/`;

    //             let keyValue = [];

    //             if (subscriptionPlanId) {
    //                 let subscriptionPlanFeatures = await findAll(subscriptionPlanFeatureModel, { planId: mongoose.Types.ObjectId(subscriptionPlanId) });
    //                 for (let subscriptionPlanFeature of subscriptionPlanFeatures) {
    //                     let features = await findOne(featureModel, { _id: subscriptionPlanFeature.featureId, isDeleted: false });
    //                     if (features && features.keyValue && features.keyValue.length > 0) {
    //                         let featuerType = await findOne(featureTypeModel, { _id: features.typeId });
    //                         for (let key of features.keyValue) {
    //                             delete key._id
    //                             key.name = features.name
    //                             key.key = await key.key.split(' ').join('_')
    //                             key.featureType = featuerType.name
    //                             key.isActive = true
    //                             key.value = null
    //                             keyValue.push(key)
    //                         }
    //                     }
    //                 }
    //             }
    //             var password = Math.random().toString(36).slice(-8);
    //             var databaseName = `${checkBusinessName}-client`;

    //             var encrypt_database = await encrypt(databaseName);

    //             let saveResponse;

    //             if (userBusinessName) {
    //                 saveResponse = await upsert(clientModel, { email, firstName, lastName, phoneNumber, country, city, state, address, stripCustomerId, workPhoneNumber, businessName: checkBusinessName, websiteDomain: webDomain, adminDomain: admindomain, postCode, subscriptionPlanId, databaseName: databaseName, dbSecretKey: encrypt_database, isProspect: false }, userBusinessName._id)
    //             } else {
    //                 saveResponse = await upsert(clientModel, { email, firstName, lastName, phoneNumber, country, city, state, address, stripCustomerId, workPhoneNumber, businessName: checkBusinessName, websiteDomain: webDomain, adminDomain: admindomain, postCode, subscriptionPlanId, databaseName: databaseName, dbSecretKey: encrypt_database })
    //             }
    //             await createClientDataBase({ email, firstName, lastName, phoneNumber, password, admindomain, webDomain, saveResponse }, databaseName, encrypt_database, templateData, networkData, keyValue, paymentData, emailTempData);
    //             //   send an email
    //             const html = await readHTMLFile(path.join(__dirname, '../', 'template', 'newregistration.html'))
    //             const template = handlebar.compile(registrationEmailTemplate)

    //             // const template = 'hello'
    //             await sendEmail(process.env.EMAIL_NOTIFICATION_ADDRESS, 'Thanks for Register with us', email, template({ email, firstName, lastName, webDomain, admindomain, password }))


    //             return {
    //                 data: { ...saveResponse },
    //                 error: '',
    //                 message: 'User registered successfully',
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
    //    * update a client
    //    */
    //     @Post("/registerClientUpdate")
    //     public async registerClientUpdate(@Body() request: { email: string, firstName: string, lastName: string, phoneNumber: number, country: string, city: string, state: string, businessName: string, websiteDomain: string, adminDomain: string, clientId: string, subscriptionPlanId: string }): Promise<IResponse> {
    //         try {

    //             const { firstName, lastName, email, clientId, phoneNumber, websiteDomain, adminDomain, country, city, state, subscriptionPlanId } = request;

    //             // check if user exists
    //             const exists = await findOne(clientModel, { _id: clientId });
    //             if (!exists) {
    //                 throw new Error('Invalid Client ')
    //             }

    //             var payload: { [k: string]: any } = {};
    //             if (firstName)
    //                 payload.firstName = firstName;

    //             if (lastName)
    //                 payload.lastName = lastName;

    //             if (email)
    //                 payload.email = email;

    //             if (phoneNumber)
    //                 payload.phoneNumber = phoneNumber;
    //             if (websiteDomain)
    //                 payload.websiteDomain = websiteDomain;
    //             if (adminDomain)
    //                 payload.adminDomain = adminDomain;

    //             if (country)
    //                 payload.country = country;

    //             if (city)
    //                 payload.city = city;

    //             if (state)
    //                 payload.state = state;

    //             if (subscriptionPlanId)
    //                 payload.subscriptionPlanId = subscriptionPlanId;


    //             const saveResponse = await upsert(clientModel, payload, clientId)
    //             // create a temp token
    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: 'Client successfully updated!',
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
    //     * Update client
    //     */
    //     @Security('Bearer')
    //     @Post("/update")
    //     public async update(@Body() request: { email: string, firstName: string, lastName: string, phoneNumber: number, businessName: string, websiteDomain: string, adminDomain: string, clientId: string }): Promise<IResponse> {
    //         try {

    //             const { firstName, lastName, email, clientId, phoneNumber, websiteDomain, adminDomain } = request;

    //             // check if user exists
    //             const exists = await findOne(clientModel, { _id: clientId });

    //             if (!exists) {
    //                 throw new Error('Invalid Client')
    //             }

    //             // if (email) {
    //             //     const emailExists = await findOne(clientModel, { _id: { $ne: clientId }, email: email });
    //             //     if (emailExists) {
    //             //         throw new Error(`Email ${email} is already registered with us`)
    //             //     }
    //             // }

    //             var payload: { [k: string]: any } = {};
    //             if (firstName)
    //                 payload.firstName = firstName;

    //             if (lastName)
    //                 payload.lastName = lastName;

    //             if (email)
    //                 payload.email = email;

    //             if (phoneNumber)
    //                 payload.phoneNumber = phoneNumber;
    //             if (websiteDomain)
    //                 payload.websiteDomain = websiteDomain;
    //             if (adminDomain)
    //                 payload.adminDomain = adminDomain;


    //             const saveResponse = await upsert(clientModel, payload, clientId)
    //             // create a temp token
    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: 'Client successfully updated!',
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
    //     * Update client
    //     */
    //     @Post("/updateLinks")
    //     public async updateLinks(@Body() request: { godClientId: string, admin_Domain: string, lp_Domain: string }): Promise<IResponse> {
    //         try {

    //             const { godClientId, admin_Domain, lp_Domain } = request;
    //             var payload: { [k: string]: any } = {};
    //             if (admin_Domain)
    //                 payload.admin_Domain = admin_Domain;

    //             if (lp_Domain)
    //                 payload.lp_Domain = lp_Domain;



    //             const saveResponse = await upsert(clientModel, payload, godClientId)
    //             // create a temp token
    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: 'Client successfully updated!',
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
    //    * Block client
    //    */
    //     @Security('Bearer')
    //     @Post("/block-unblock")
    //     public async block(@Body() request: { clientId: string }): Promise<IResponse> {
    //         try {
    //             const { clientId } = request;
    //             let responseError = '';
    //             // check if user exists
    //             const block = await findOne(clientModel, { _id: clientId, isBlocked: false });
    //             if (block) {
    //                 const blockClient = await upsert(clientModel, {
    //                     _id: clientId,
    //                     $set: { isBlocked: true }
    //                 }, clientId)
    //                 var saveResponse = await upsert(clientModel, blockClient, clientId)
    //                 let errorMessage = 'Client  successfully Blocked!'
    //                 responseError += errorMessage
    //             }
    //             else {
    //                 const unblock = await findOne(clientModel, { _id: clientId, isBlocked: true });
    //                 const unblockClient = await upsert(clientModel, {
    //                     _id: clientId,
    //                     $set: { isBlocked: false }
    //                 }, clientId)

    //                 if (!unblock) {
    //                     throw new Error('Invalid Client')
    //                 }
    //                 var saveResponse = await upsert(clientModel, unblockClient, clientId)
    //                 let errorMessage = 'Client  successfully UnBlocked!'
    //                 responseError += errorMessage
    //             }

    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: responseError,
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
    //     * Getlist client
    //     */
    //     @Security('Bearer')
    //     @Get("/getlist")
    //     public async getlist(@Query() pageNumber: string, @Query() pageSize: string, @Query() startDate = null, @Query() endDate = null, @Query() searchByName = null, @Query() exportRequest = 'false'): Promise<IResponse> {
    //         try {
    //             const query: any = [{ isDeleted: false, isProspect: false }];
    //             if (searchByName) {
    //                 query.push({
    //                     "$or": [
    //                         { "firstName": { $regex: searchByName, $options: 'i' } },
    //                         { "businessName": { $regex: searchByName, $options: 'i' } },
    //                         { "email": { $regex: searchByName, $options: 'i' } },
    //                     ]
    //                 })
    //             }
    //             if (startDate && endDate) {
    //                 query.push({

    //                     ...((startDate || endDate) ? {
    //                         createdAt: {

    //                             ...(startDate ? {
    //                                 $gte: new Date(`${startDate}T00:00:00Z`)
    //                             } : null),
    //                             ...(endDate ? {
    //                                 $lte: `${getFilterMonthDateYear(endDate)}T00:00:00Z`
    //                             } : null),
    //                         }
    //                     } : null),

    //                     // createdAt: {
    //                     //     $gte: new Date(`${startDate}T00:00:00Z`),
    //                     //     $lte: new Date(`${endDate}T00:00:00Z`)
    //                     // }
    //                 });
    //             }

    //             const getAllresponse = await getAllBySort(clientModel, { $and: query }, Number(pageNumber), Number(pageSize), {}, exportRequest === 'false' ? true : false, { createdAt: -1 })
    //             for (const data of getAllresponse.items) {
    //                 data.PlanDetails = [];
    //                 if (Array.isArray(data.subscriptionPlanId)) {
    //                     data.subscriptionPlanId = data.subscriptionPlanId[0]
    //                 }
    //                 let subdata = await findOne(subscriptionPalnModel, { _id: mongoose.Types.ObjectId(data.subscriptionPlanId), isDeleted: false })
    //                 data.PlanDetails.push(subdata)
    //             }

    //             if (exportRequest == 'true') {
    //                 // create csv and send to client
    //                 const csv = getCSVFromJSON(['Sno', 'Name', 'Business Name', 'Email', 'Package', 'Register On'],
    //                     getAllresponse.items.map((val, index) => {
    //                         return { ...val, Sno: index + 1, "Name": val.firstName || '-', "Business Name": val.businessName || '-', "Email": val.email || '-', "Package": val.PlanDetails[0].price || '-', "Register On": val.createdAt || '-' }
    //                     })

    //                 )
    //                 this.res.header('Content-Type', 'text/csv');
    //                 this.res.attachment(`clients.csv`);
    //                 return {
    //                     data: csv,
    //                     error: '',
    //                     message: 'Fetched Successfully',
    //                     status: 200
    //                 }
    //             }
    //             return {
    //                 data: getAllresponse,
    //                 error: '',
    //                 message: 'Fetched Successfully',
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
    //     * getPlanAndFeature client
    //     */
    //     @Security('Bearer')
    //     @Post("/getPlanAndFeature")
    //     public async getPlanAndFeature(@Body() request: { websiteDomain: string }): Promise<IResponse> {
    //         try {
    //             const { websiteDomain } = request;

    //             // check if user exists
    //             const exists = await findOne(clientModel, { $or: [{ websiteDomain: websiteDomain }, { adminDomain: websiteDomain }] });

    //             if (!exists) {
    //                 throw new Error('Invalid Domain')
    //             }

    //             const [getAllresponse] = await clientModel.aggregate([
    //                 {
    //                     $match: { $or: [{ websiteDomain: websiteDomain }, { adminDomain: websiteDomain }] }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'subscription_plans',
    //                         localField: 'subscriptionPlanId',
    //                         foreignField: '_id',
    //                         as: 'subDetails'
    //                     }
    //                 },
    //                 {
    //                     $unwind: '$subDetails'
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'subscription_plan_features',
    //                         localField: 'subscriptionPlanId',
    //                         foreignField: 'planId',
    //                         as: 'featureDetails'
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'features',
    //                         localField: 'featureDetails.featureId',
    //                         foreignField: '_id',
    //                         as: 'featureAssigned'
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         subDetails: '$subDetails',
    //                         fetaureDetails: '$featureAssigned',
    //                     }
    //                 },

    //             ])

    //             return {
    //                 data: getAllresponse,
    //                 error: '',
    //                 message: 'Fetched Successfully',
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
    //     * Getdetails client
    //     */
    //     @Security('Bearer')
    //     @Post("/details")
    //     public async details(@Body() request: { clientId: string }): Promise<IResponse> {
    //         try {
    //             const { clientId } = request;

    //             // check if user exists
    //             const exists = await findOne(clientModel, { _id: clientId, isDeleted: false });

    //             if (!exists) {
    //                 throw new Error('Invalid Client')
    //             }

    //             const saveResponse = await upsert(clientModel, exists, clientId)

    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: 'Fetched Successfully',
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
    //     *  client delete
    //     */
    //     @Security('Bearer')
    //     @Post("/clientDelete")
    //     public async clientDelete(@Body() request: { clientId: string }): Promise<IResponse> {
    //         try {
    //             const { clientId } = request;
    //             let saveResponse;
    //             // check if user exists
    //             const exists = await findOne(clientModel, { _id: clientId, isDeleted: false });
    //             if (!exists) {
    //                 throw new Error('Invalid Client')
    //             }
    //             if (exists.dbSecretKey) {
    //                 const checkDataBase = await deleteClientDataBase(exists.databaseName, exists.dbSecretKey)
    //                 if (checkDataBase) {
    //                     saveResponse = await deleteById(clientModel, clientId)
    //                 }
    //             } else {

    //                 saveResponse = await deleteById(clientModel, clientId)
    //             }
    //             return {
    //                 data: saveResponse,
    //                 error: '',
    //                 message: 'Client successfully Deleted!',
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
    //     * Upload a file
    //     */
    //     @Security('Bearer')
    //     @Post("/uploadFile")
    //     public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<IResponse> {
    //         try {
    //             const saveResponse = await upsert(clientModel, { file: file.filename })
    //             return {
    //                 data: saveResponse.toObject(),
    //                 error: '',
    //                 message: 'File successfully uploaded',
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
    //     * Check businessName client
    //     */
    //     @Post("/businessName")
    //     public async businessName(@Body() request: { businessName: string }): Promise<IResponse> {
    //         try {
    //             const { businessName } = request;
    //             const checkBusinessName = businessName.toLowerCase().split(' ').join('-');
    //             // check if user exists
    //             let checkDefaultName = await findOne(domainModel, { domainName: businessName, isRestricted: true })
    //             if (checkDefaultName) {
    //                 throw new Error(`Business name not available`)
    //             }
    //             const exists = await findOne(clientModel, { businessName: checkBusinessName, isProspect: false });

    //             if (exists) {
    //                 throw new Error(`Business name ${businessName} is already registered with us`)
    //             }

    //             return {
    //                 data: '',
    //                 error: '',
    //                 message: 'Success',
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
    //     * Check email and number client
    //     */
    //     @Post("/email")
    //     public async email(@Body() request: { clientEmail: string, clientNumber: number }): Promise<IResponse> {
    //         try {
    //             const { clientEmail, clientNumber } = request;

    //             // check if user exists
    //             const exists = await findOne(clientModel, { email: clientEmail });
    //             const cNumber = await findOne(clientModel, { phoneNumber: clientNumber });
    //             if (exists) {
    //                 throw new Error(`Email ${clientEmail} is already registered with us`)
    //             }
    //             if (cNumber) {
    //                 throw new Error(`Number ${clientNumber} is already registered with us`)
    //             }
    //             return {
    //                 data: '',
    //                 error: '',
    //                 message: 'Success',
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
    //     * Get key according to link
    //     */
    //     @Get("/key")
    //     public async key(@Query() link: string): Promise<IResponse> {
    //         try {
    //             let link2 = link.replace(/^https?:\/\//, '').replace('/', '')
    //             const getAllresponse = await findOne(clientModel, { $or: [{ websiteDomain: link }, { adminDomain: link }, { lp_Domain: link }, { admin_Domain: link }, { websiteDomain: link2 }, { adminDomain: link2 }, { lp_Domain: link2 }, { admin_Domain: link2 }] }, { dbSecretKey: 1, databaseName: 1 })
    //             if (!getAllresponse) {
    //                 throw new Error(`Invalid link!!`)
    //             }
    //             return {
    //                 data: getAllresponse,
    //                 error: '',
    //                 message: 'Fetched Successfully',
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
    // * register a Prospect
    // */
    //     @Post("/registerProspect")
    //     public async registerProspect(@Body() request: { email: string, firstName: string, lastName: string, workPhoneNumber: string, address: string, phoneNumber: number, country: string, city: string, state: string, businessName: string, postCode: number }): Promise<IResponse> {
    //         try {


    //             const { email, firstName, lastName, phoneNumber, country, city, state, businessName, workPhoneNumber, address, postCode } = request;

    //             const checkBusinessName = businessName.toLowerCase().split(' ').join('-');

    //             let saveResponse;
    //             const userBusinessName = await findOne(clientModel, { businessName: checkBusinessName });
    //             if (!userBusinessName) {

    //                 saveResponse = await upsert(clientModel, { email, firstName, lastName, phoneNumber, country, city, state, address, workPhoneNumber, businessName: checkBusinessName, postCode, isProspect: true })
    //             }

    //             return {
    //                 data: saveResponse || {},
    //                 error: '',
    //                 message: 'User registered successfully',
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
    //     * Getlist client
    //     */
    //     @Security('Bearer')
    //     @Get("/getlistProspect")
    //     public async getlistProspect(@Query() pageNumber: string, @Query() pageSize: string, @Query() startDate = null, @Query() endDate = null, @Query() searchByName = null, @Query() exportRequest = 'false'): Promise<IResponse> {
    //         try {

    //             const query: any = [{ isDeleted: false, isProspect: true }];
    //             if (searchByName) {
    //                 query.push({
    //                     "$or": [
    //                         { "firstName": { $regex: searchByName, $options: 'i' } },
    //                         { "lastName": { $regex: searchByName, $options: 'i' } },
    //                         { "email": { $regex: searchByName, $options: 'i' } },

    //                     ]
    //                 })
    //             }
    //             if (startDate && endDate) {
    //                 query.push({

    //                     ...((startDate || endDate) ? {
    //                         createdAt: {

    //                             ...(startDate ? {
    //                                 $gte: new Date(`${startDate}T00:00:00Z`)
    //                             } : null),
    //                             ...(endDate ? {
    //                                 $lte: `${getFilterMonthDateYear(endDate)}T00:00:00Z`
    //                             } : null),
    //                         }
    //                     } : null),

    //                 });
    //             }

    //             const getAllresponse = await getAllBySort(clientModel, { $and: query }, Number(pageNumber), Number(pageSize), {}, exportRequest === 'false' ? true : false, { createdAt: -1 })
    //             if (exportRequest === 'true') {
    //                 // create csv and send to client
    //                 const csv = getCSVFromJSON(['Sno', 'Name', 'Business Name', 'Email', 'PhoneNumber', 'Register On'],
    //                     getAllresponse.items.map((val, index) => {
    //                         return { ...val, Sno: index + 1, "Name": val.firstName || '-', "Business Name": val.businessName || '-', "Email": val.email || '-', "Phone Number": val.phoneNumber || '-', "Register On": val.createdAt || '-' }
    //                     })

    //                 )
    //                 this.res.header('Content-Type', 'text/csv');
    //                 this.res.attachment('Investors.csv');
    //                 return {
    //                     data: csv,
    //                     error: '',
    //                     message: 'Fetched Successfully',
    //                     status: 200
    //                 }
    //             }
    //             return {
    //                 data: getAllresponse,
    //                 error: '',
    //                 message: 'Fetched Successfully',
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
