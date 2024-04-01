import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, UploadedFile, FormField, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateRegister, validateResetPassword, validateUser, validateResendOtp, validateVerifyOtp } from '../../validations/User/user.auth.validator';
import handlers from '../../handlers/User/user.auth.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from 'http-status-codes'


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

        const validatedUser = validateUser(request);

        if (validatedUser.error) {
            return showResponse(false, validatedUser.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.login(request)

    }
    //ends

    /**
    * Save a User
    */
    @Post("/register")
    public async register(@FormField() first_name: string, @FormField() last_name: string, @FormField() email: string, @FormField() password: string, @FormField() os_type: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {

        const body = { first_name, last_name, email, password, phone_number, country_code, os_type }

        const validatedSignup = validateRegister(body);

        if (validatedSignup.error) {
            return showResponse(false, validatedSignup.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.register(body, profile_pic)

    }
    //ends

    /**
    * Upload a file
    */
    @Security('Bearer')
    @Post("/upload_file")
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {


        return handlers.uploadFile({ file })
    }
    //ends

    /**
    * Forgot password api endpoint
    */
    @Post("/forgot_password")
    public async forgotPassword(@Body() request: { email: string }): Promise<ApiResponse> {

        const validatedForgotPassword = validateForgotPassword(request);

        if (validatedForgotPassword.error) {
            return showResponse(false, validatedForgotPassword.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.forgotPassword(request)

    }
    //ends

    /**
* Reset password api endpoint
*/
    @Security('Bearer')
    @Post("/reset_password")
    public async resetPassword(@Body() request: { email: string, new_password: string }): Promise<ApiResponse> {

        const validatedResetPassword = validateResetPassword(request);

        if (validatedResetPassword.error) {
            return showResponse(false, validatedResetPassword.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.resetPassword(request)

    }
    //ends

    /**
    * Verify Otp Route  api endpoint
    */
    @Security('Bearer')
    @Post("/verify_otp")
    public async verifyOtp(@Body() request: { email: string, otp: number }): Promise<ApiResponse> {

        const validatedVerifyOtp = validateVerifyOtp(request);

        if (validatedVerifyOtp.error) {
            return showResponse(false, validatedVerifyOtp.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.verifyOtp(request)

    }
    //ends

    /**
  * Resend Otp Route  api endpoint
  */
    @Security('Bearer')
    @Post("/resend_otp")
    public async resendOtp(@Body() request: { email: string }): Promise<ApiResponse> {

        const validatedResendOtp = validateResendOtp(request);

        if (validatedResendOtp.error) {
            return showResponse(false, validatedResendOtp.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.resendOtp(request)
    }
    //ends

    /**
    * Change Password endpoint
    */
    @Security('Bearer')
    @Post("/change_password")
    public async changePassword(@Body() request: { old_password: string, new_password: string }): Promise<ApiResponse> {

        const { old_password, new_password } = request;

        const validatedChangePassword = validateChangePassword({ old_password, new_password });

        if (validatedChangePassword.error) {
            return showResponse(false, validatedChangePassword.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.changePassword({ old_password, new_password }, this.userId)
    }
    //ends

    /**
   * Get Admin info
   */
    @Security('Bearer')
    @Get("/details")
    public async getUserDetails(): Promise<ApiResponse> {
        // console.log(req.body.user, "")
        return handlers.getUserDetails(this.userId)

    }
    //ends

    /**
* Update User Profile
*/
    @Security('Bearer')
    @Put("/profile")
    public async updateUserProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {

        const body = { first_name, last_name, phone_number, country_code }

        const validatedUpdateProfile = validateUpdateProfile(body);

        if (validatedUpdateProfile.error) {
            return showResponse(false, validatedUpdateProfile.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlers.updateUserProfile(body, this.userId, profile_pic)


    }
    //ends


}





