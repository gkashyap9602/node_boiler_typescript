import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, Put, FormField, UploadedFile } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateResetPassword, validateAdminLogin, validateResendOtp, validateVerifyOtp } from '../../validations/Admin/admin.auth.validator';
import handlerAdminAuth from '../../handlers/Admin/admin.auth.handler'
import { showResponse } from '../../utils/response.util';

@Tags('Admin Auth')
@Route('api/v1/admin/auth')

export default class AdminAuthController extends Controller {
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
    public async login(@Body() request: { email: string, password: string, os_type: string }): Promise<ApiResponse> {
        try {

            const validatedAdmin = validateAdminLogin(request);

            if (validatedAdmin.error) {
                return showResponse(false, validatedAdmin.error.message, null, null, 400)
            }

            return handlerAdminAuth.login(request)
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
    // @Post("/register")
    // public async register(@Body() request: { email: string, first_name: string, last_name: string, password: string }): Promise<ApiResponse> {
    //     try {
    //         const validatedSignup = validateRegister(request);

    //         if (validatedSignup.error) {
    //             return showResponse(false, validatedSignup.error.message, null, null, 400)
    //         }

    //         return handlerAdminAuth.register(request)

    //     }
    //     catch (err: any) {
    //         // logger.error(`${this.req.ip} ${err.message}`)
    //         return err

    //     }
    // }
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

            return handlerAdminAuth.forgotPassword(request)

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
    public async resetPassword(@Body() request: { email: string, new_password: string }): Promise<ApiResponse> {
        try {

            const validatedResetPassword = validateResetPassword(request);

            if (validatedResetPassword.error) {
                return showResponse(false, validatedResetPassword.error.message, null, null, 400)
            }

            return handlerAdminAuth.resetPassword(request)

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

            const validatedVerifyOtp = validateVerifyOtp(request);

            if (validatedVerifyOtp.error) {
                return showResponse(false, validatedVerifyOtp.error.message, null, null, 400)
            }

            return handlerAdminAuth.verifyOtp(request)

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

            const validatedResendOtp = validateResendOtp(request);

            if (validatedResendOtp.error) {
                return showResponse(false, validatedResendOtp.error.message, null, null, 400)
            }
            return handlerAdminAuth.resendOtp(request)

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
    @Post("/change_password")
    public async changePassword(@Body() request: { old_password: string, new_password: string }): Promise<ApiResponse> {
        try {
            const { old_password, new_password } = request;

            const validatedChangePassword = validateChangePassword({ old_password, new_password });

            if (validatedChangePassword.error) {
                return showResponse(false, validatedChangePassword.error.message, null, null, 400)
            }

            return handlerAdminAuth.changePassword({ old_password, new_password }, this.userId)

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
    @Get("/details")
    public async getAdminDetails(): Promise<ApiResponse> {
        try {

            return handlerAdminAuth.getAdminDetails(this.userId)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Update Admin Profile
*/
    @Security('Bearer')
    @Put("/profile")
    public async updateAdminProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @FormField() greet_msg?: boolean, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        try {
            let body = { first_name, last_name, phone_number, country_code, greet_msg }

            const validatedUpdateProfile = validateUpdateProfile(body);

            if (validatedUpdateProfile.error) {
                return showResponse(false, validatedUpdateProfile.error.message, null, null, 400)
            }

            return handlerAdminAuth.updateAdminProfile(body, this.userId, profile_pic)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends



}





