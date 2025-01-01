import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, UploadedFile, FormField, Put, Delete } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateRefreshToken, validateDeleteOrDeactivation, validateUpdateProfile, validateRegister, validateResetPassword, validateResendOtp, validateVerifyOtp, validateSocialLogin, validateLoginUser } from '../../validations/User/user.auth.validator';
import handler from '../../handlers/User/user.auth.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';

@Tags('User Auth Routes')
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
    public async login(@Body() request: { email: string, password: string }): Promise<ApiResponse> {

        const validate = validateLoginUser(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.login);
        return wrappedFunc(request); // Invoking the wrapped function 

    }
    //ends

    //     /**
    //   * User Social login 
    //   */
    //     @Post("/social_login")
    //     public async socialLogin(@FormField() login_source: string, @FormField() social_auth: string, @FormField() email: string, @FormField() user_type: number, @FormField() name?: string, @FormField() os_type?: string): Promise<ApiResponse> {
    //         const request = { login_source, social_auth, email, name, user_type, os_type }

    //         const validate = validateSocialLogin(request);
    //         if (validate.error) {
    //             return showResponse(false, validate.error.message, null, statusCodes.API_ERROR)
    //         }

    //         const wrappedFunc = tryCatchWrapper(handler.social_login);
    //         return wrappedFunc(request); // Invoking the wrapped function 
    //     }
    //     //ends

    /**
    * Save a User
    */
    @Post("/register")
    public async register(@FormField() first_name: string, @FormField() last_name: string, @FormField() email: string, @FormField() password: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        const body = { first_name, last_name, email, password, phone_number, country_code }

        const validate = validateRegister(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.register);
        return wrappedFunc(body, profile_pic); // Invoking the wrapped function 

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
    public async verifyOtp(@Body() request: { email: string, otp: string }): Promise<ApiResponse> {

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
   * Get User info
   */
    @Security('Bearer')
    @Get("/details")
    public async getUserDetails(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.getUserDetails);
        return wrappedFunc(this.userId); // Invoking the wrapped function 
    }
    //ends

    /**
* Update User Profile
*/
    @Security('Bearer')
    @Put("/profile")
    public async updateUserProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        const body = { first_name, last_name, phone_number, country_code }

        const validate = validateUpdateProfile(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateUserProfile);
        return wrappedFunc(body, this.userId, profile_pic); // Invoking the wrapped function 
    }
    //ends

    /**
* delete or deactivate user account
* 2 for delete 3 for deactivate
*/
    @Security('Bearer')
    @Delete("/delete_deactivate")
    public async deleteOrDeactivateAccount(@Body() request: { status: number }): Promise<ApiResponse> {

        const validate = validateDeleteOrDeactivation(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.deleteOrDeactivateAccount);
        return wrappedFunc(request, this.userId); // Invoking the wrapped function 
    } //ends

    /**
*  Refresh tokne api
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
    //ends

    /**
* Logout User 
*/
    @Post("/logout")
    public async logoutUser(): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.logoutUser);
        return wrappedFunc(); // Invoking the wrapped function 
    }
    //ends


    /**
 * Upload a file
 */
    @Post("/upload_file")
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {
        return handler.uploadFile({ file })
    }
    //ends
}





