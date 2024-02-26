import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query } from 'tsoa'
import { ApiResponse } from '../utils/interfaces.util';
// import { findOne, getById, upsert, getAll } from '../helpers/db.helpers';
// import { verifyHash, signToken, genHash } from '../utils/common.util';
import { validateChangePassword, validateForgotPassword, validateRegister, validateResetPassword, validateAdmin } from '../validations/admin.validator';
import adminModel from '../models/admin.model';
import logger from '../configs/logger.config';
// import { sendEmail } from '../configs/nodemailer';
// import { readHTMLFile } from '../services/utils';
// import path from 'path';
// import handlebar from 'handlebars'
import handlers from '../handlers/admin.handler'
import { showOutput, showResponse } from '../utils/response.util';

@Tags('Admin')
@Route('api/admin')

export default class AdminController extends Controller {
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
     * Get Admin login
     */
    @Post("/login")
    public async login(@Body() request: { email: string, password: string }): Promise<ApiResponse> {
        try {

            const validatedAdmin = validateAdmin(request);

            if (validatedAdmin.error) {
                return showResponse(false, validatedAdmin.error.message, null, null, 400)
            }

            return handlers.login(request)
        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err
        }
    }
    //ends

    /**
    * Save a Admin
    */
    @Post("/register")
    public async register(@Body() request: { email: string, first_name: string, last_name: string, password: string }): Promise<ApiResponse> {
        try {
            const { first_name, last_name, email, password } = request;

            const validatedSignup = validateRegister({ first_name, last_name, email, password });

            if (validatedSignup.error) {
                return showResponse(false, validatedSignup.error.message, null, null, 400)
            }

            return handlers.register({ first_name, last_name, email, password })

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends


    /**
    * Forgot password api endpoint
    */
    @Post("/forgot_password")
    public async forgotPassword(@Body() request: { email: string }): Promise<ApiResponse> {
        try {
            const validatedForgotPassword = validateForgotPassword(request);

            if (validatedForgotPassword.error) {
                return showResponse(false, validatedForgotPassword.error.message, null, null, 400)
            }

            return handlers.forgotPassword(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err


        }
    }
    //ends

    /**
* Reset password api endpoint
*/
    @Security('Bearer')
    @Post("/reset_password")
    public async resetPassword(@Body() request: { password: string }): Promise<ApiResponse> {
        try {
            const { password } = request;

            const validatedResetPassword = validateResetPassword({ password });

            if (validatedResetPassword.error) {
                return showResponse(false, validatedResetPassword.error.message, null, null, 400)
            }

            return handlers.resetPassword({ password }, this.userId)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
    * Verify Otp Route  api endpoint
    */
    @Security('Bearer')
    @Post("/verify_otp")
    public async verifyOtp(@Body() request: { email: string, otp: number }): Promise<ApiResponse> {
        try {
            const { email, otp } = request;

            // const validatedResetPassword = validateResetPassword({ password });

            // if (validatedResetPassword.error) {
            //     return showResponse(false, validatedResetPassword.error.message, null, null, 400)
            // }

            return handlers.verifyOtp({ email, otp })

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
  * Resend Otp Route  api endpoint
  */
    @Security('Bearer')
    @Post("/resend_otp")
    public async resendOtp(@Body() request: { email: string }): Promise<ApiResponse> {
        try {
            const { email } = request;

            // const validatedResetPassword = validateResetPassword({ password });

            // if (validatedResetPassword.error) {
            //     return showResponse(false, validatedResetPassword.error.message, null, null, 400)
            // }

            return handlers.resendOtp({ email })

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
    * Change Password endpoint
    */
    @Security('Bearer')
    @Post("/changePassword")
    public async changePassword(@Body() request: { old_password: string, new_password: string }): Promise<ApiResponse> {
        try {
            const { old_password, new_password } = request;

            const validatedChangePassword = validateChangePassword({ old_password, new_password });

            if (validatedChangePassword.error) {
                return showResponse(false, validatedChangePassword.error.message, null, null, 400)
            }

            return handlers.changePassword({ old_password, new_password }, this.userId)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
   * Get Admin info
   */
    @Security('Bearer')
    @Get("/getUserDetails")
    public async getUserDetails(): Promise<ApiResponse> {
        try {

            return handlers.getUserDetails(this.userId)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends




}





