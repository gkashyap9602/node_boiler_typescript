import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Put, FormField, UploadedFile } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateResetPassword, validateAdminLogin, validateResendOtp, validateVerifyOtp } from '../../validations/Admin/admin.auth.validator';
import handler from '../../handlers/Admin/admin.auth.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';
import { validateRefreshToken } from '../../validations/User/user.auth.validator';

@Tags('Admin Auth Routes')
@Route('/admin/auth')

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
    public async login(@Body() request: { email: string, password: string }): Promise<ApiResponse> {

        const validate = validateAdminLogin(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.login);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
    * Forgot password api endpoint
    */
    @Post("/forgot_password")
    public async forgotPassword(@Body() request: { email: string }): Promise<ApiResponse> {

        const validate = validateForgotPassword(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.forgotPassword);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
* Reset password api endpoint
*/
    @Post("/reset_password")
    public async resetPassword(@Body() request: { email: string, new_password: string, otp: string }): Promise<ApiResponse> {

        const validate = validateResetPassword(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.resetPassword);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
    * Verify Otp Route  api endpoint
    */
    @Post("/verify_otp")
    public async verifyOtp(@Body() request: { email: string, otp: number }): Promise<ApiResponse> {

        const validate = validateVerifyOtp(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.verifyOtp);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
  * Resend Otp Route  api endpoint
  */
    @Post("/resend_otp")
    public async resendOtp(@Body() request: { email: string }): Promise<ApiResponse> {

        const validate = validateResendOtp(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.resendOtp);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
    * Change Password endpoint
    */
    @Security('Bearer')
    @Post("/change_password")
    public async changePassword(@Body() request: { old_password: string, new_password: string }): Promise<ApiResponse> {
        const { old_password, new_password } = request;

        const validate = validateChangePassword({ old_password, new_password });
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.changePassword);
        return wrappedFunc({ old_password, new_password }, this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
   * Get Admin info
   */
    @Security('Bearer')
    @Get("/details")
    public async getAdminDetails(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.getAdminDetails);
        return wrappedFunc(this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
* Update Admin Profile
*/
    @Security('Bearer')
    @Put("/profile")
    public async updateAdminProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @FormField() greet_msg?: boolean, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        const body = { first_name, last_name, phone_number, country_code, greet_msg }

        const validate = validateUpdateProfile(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateAdminProfile);
        return wrappedFunc(body, this.userId, profile_pic); // Invoking the wrapped function 
    }
    //ends

    /**
    *  Refresh token api
    * provide refresh token in this api and get new access token 
    */
    @Post("/refresh_token")
    public async refreshToken(@FormField() refresh_token: string): Promise<ApiResponse> {
        const body = { refresh_token }

        const validate = validateRefreshToken(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.refreshToken);
        return wrappedFunc(body); // Invoking the wrapped function 

    }

    /**
* Logout User 
*/
    @Post("/logout")
    public async logoutUser(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.logoutUser);
        return wrappedFunc(); // Invoking the wrapped function 
    }
    //ends
}





