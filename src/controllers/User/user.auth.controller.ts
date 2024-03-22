import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, UploadedFile, FormField, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateRegister, validateResetPassword, validateUser, validateResendOtp, validateVerifyOtp } from '../../validations/User/user.auth.validator';
import handlers from '../../handlers/User/user.auth.handler'
import { showResponse } from '../../utils/response.util';
import { APP } from '../../constants/app.constant'



@Tags('User Auth')
@Route('/user/auth')

export default class UserAuthController extends Controller {
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
     * Get User login
     */
    @Post("/login")
    public async login(@Body() request: { email: string, password: string, os_type: string }): Promise<ApiResponse> {
        try {

            const validatedUser = validateUser(request);

            if (validatedUser.error) {
                return showResponse(false, validatedUser.error.message, null, null, 400)
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
    * Save a User
    */

    @Post("/register")
    public async register(@FormField() first_name: string, @FormField() last_name: string, @FormField() email: string, @FormField() password: string, @FormField() os_type: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        try {
            let body = { first_name, last_name, email, password, phone_number, country_code, os_type }

            const validatedSignup = validateRegister(body);

            if (validatedSignup.error) {
                return showResponse(false, validatedSignup.error.message, null, null, 400)
            }

            return handlers.register(body, profile_pic)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
    * Upload a file
    */
    @Security('Bearer')
    @Post("/upload_file")
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {
        try {

            return handlers.uploadFile({ file })

        }

        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }


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
    public async resetPassword(@Body() request: { email: string, new_password: string }): Promise<ApiResponse> {
        try {

            const validatedResetPassword = validateResetPassword(request);

            if (validatedResetPassword.error) {
                return showResponse(false, validatedResetPassword.error.message, null, null, 400)
            }

            return handlers.resetPassword(request)

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

            return handlers.verifyOtp(request)

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

            return handlers.resendOtp(request)

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
    @Get("/details")
    public async getUserDetails(): Promise<ApiResponse> {
        try {
            // console.log(req.body.user, "")

            return handlers.getUserDetails(this.userId)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Update User Profile
*/
    @Security('Bearer')
    @Put("/profile")
    public async updateUserProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        try {

            let body = { first_name, last_name, phone_number, country_code }

            const validatedUpdateProfile = validateUpdateProfile(body);

            if (validatedUpdateProfile.error) {
                return showResponse(false, validatedUpdateProfile.error.message, null, null, 400)
            }

            return handlers.updateUserProfile(body, this.userId, profile_pic)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends


}





