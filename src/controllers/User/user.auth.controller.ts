import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, UploadedFile, FormField, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateRegister, validateResetPassword, validateUser, validateResendOtp, validateVerifyOtp } from '../../validations/User/user.auth.validator';
import handler from '../../handlers/User/user.auth.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';


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

        const validate = validateUser(request);

        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.login);
        return wrappedFunc(request); // Invoking the wrapped function 

    }
    //ends

    /**
    * Save a User
    */
    @Post("/register")
    public async register(@FormField() first_name: string, @FormField() last_name: string, @FormField() email: string, @FormField() password: string, @FormField() os_type: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {

        const body = { first_name, last_name, email, password, phone_number, country_code, os_type }

        const validate = validateRegister(body);

        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.register);
        return wrappedFunc(body, profile_pic); // Invoking the wrapped function 

    }
    //ends

    /**
    * Upload a file
    */
    @Security('Bearer')
    @Post("/upload_file")
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {


        return handler.uploadFile({ file })
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
    @Security('Bearer')
    @Post("/reset_password")
    public async resetPassword(@Body() request: { email: string, new_password: string }): Promise<ApiResponse> {

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
    @Security('Bearer')
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
    @Security('Bearer')
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
    public async getUserDetails(): Promise<ApiResponse> {
        // console.log(req.body.user, "")
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


}





