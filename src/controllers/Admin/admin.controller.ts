import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, Put, FormField, UploadedFile } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateChangePassword, validateForgotPassword, validateUpdateProfile, validateUpdateUserStatus, validateGetCustomerDetails, validateUpdateQuestion, validateAddQuestion, validateCommonContent, validateResetPassword, validateAdmin, validateResendOtp, validateVerifyOtp } from '../../validations/admin.validator';
import handlers from '../../handlers/Admin/admin.handler'
import { showResponse } from '../../utils/response.util';

@Tags('Admin')
@Route('api/v1/admin')

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
    // @Post("/register")
    // public async register(@Body() request: { email: string, first_name: string, last_name: string, password: string }): Promise<ApiResponse> {
    //     try {
    //         const validatedSignup = validateRegister(request);

    //         if (validatedSignup.error) {
    //             return showResponse(false, validatedSignup.error.message, null, null, 400)
    //         }

    //         return handlers.register(request)

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
    @Get("/get_details")
    public async getAdminDetails(): Promise<ApiResponse> {
        try {

            return handlers.getAdminDetails(this.userId)

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
    @Put("/update_profile")
    public async updateAdminProfile(@FormField() first_name?: string, @FormField() last_name?: string, @FormField() phone_number?: string, @FormField() country_code?: string, @UploadedFile() profile_pic?: Express.Multer.File): Promise<ApiResponse> {
        try {

            let body = { first_name, last_name, phone_number, country_code }

            const validatedUpdateProfile = validateUpdateProfile(body);

            if (validatedUpdateProfile.error) {
                return showResponse(false, validatedUpdateProfile.error.message, null, null, 400)
            }

            return handlers.updateAdminProfile(body, this.userId, profile_pic)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Get User List
*/
    @Security('Bearer')
    @Get("/get_users_list")
    public async getUsersList(@Query() sort_column?: string, @Query() sort_direction?: string, @Query() page?: number, @Query() limit?: number, @Query() search_key?: string, @Query() status?: number): Promise<ApiResponse> {
        try {

            return handlers.getUsersList(sort_column, sort_direction, page, limit, search_key, status)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends



    /**
* Get User Details
*/
    @Security('Bearer')
    @Get("/get_user_details")
    public async getUserDetails(@Query() user_id: string): Promise<ApiResponse> {
        try {
            console.log(user_id, "useriddd")
            const validatedCustomerDetails = validateGetCustomerDetails({ user_id });

            if (validatedCustomerDetails.error) {
                return showResponse(false, validatedCustomerDetails.error.message, null, null, 400)
            }

            return handlers.getUserDetails(user_id)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends


    /**
* Update User Status
*/
    @Security('Bearer')
    @Put("/update_user_status")
    public async updateUserStatus(@Body() request: { user_id: string, status: number }): Promise<ApiResponse> {
        try {

            const validatedUpdateUserStatus = validateUpdateUserStatus(request);

            if (validatedUpdateUserStatus.error) {
                return showResponse(false, validatedUpdateUserStatus.error.message, null, null, 400)
            }

            return handlers.updateUserStatus(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends


    /**
* Add Question  endpoint
*/
    @Security('Bearer')
    @Post("/add_question")
    public async addQuestion(@Body() request: { question: string, answer: string }): Promise<ApiResponse> {
        try {
            // const { old_password, new_password } = request;

            console.log(request, "requesttttt")

            const validatedAddQuestion = validateAddQuestion(request);

            if (validatedAddQuestion.error) {
                return showResponse(false, validatedAddQuestion.error.message, null, null, 400)
            }

            return handlers.addQuestion(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Update Question endpoint
*/
    @Security('Bearer')
    @Put("/update_question")
    public async updateQuestion(@Body() request: { question_id: string, question: string, answer: string }): Promise<ApiResponse> {
        try {

            const validatedUpdateQuestion = validateUpdateQuestion(request);

            if (validatedUpdateQuestion.error) {
                return showResponse(false, validatedUpdateQuestion.error.message, null, null, 400)
            }

            return handlers.updateQuestion(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
 * Update Common Content endpoint
 */
    @Security('Bearer')
    @Put("/update_common_content")
    public async updateCommonContent(@Body() request: { about: string, privacy_policy: string, terms_conditions: string }): Promise<ApiResponse> {
        try {

            const validatedCommonContent = validateCommonContent(request);

            if (validatedCommonContent.error) {
                return showResponse(false, validatedCommonContent.error.message, null, null, 400)
            }

            return handlers.updateCommonContent(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends






}





