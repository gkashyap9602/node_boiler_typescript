import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, FormField, Request as TSOA_Request } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
// import { validateChangePassword, validateForgotPassword, validateRegister, validateResetPassword, validateAdmin, validateResendOtp, validateVerifyOtp } from '../../validations/admin.validator';
import handlers from '../../handlers/Common/common.handler'
import { showResponse } from '../../utils/response.util';
import { validateStoreParmeterToAws } from '../../validations/Common/common.validator';

@Tags('Common')
@Route('api/v1/common')

export default class CommonController extends Controller {
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
   * Get Common Content info
   */
    @Security('Bearer')
    @Get("/common_content")
    public async getCommonContent(): Promise<ApiResponse> {
        try {

            return handlers.getCommonContent()

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
   * Get Faq Questions
   */
    @Security('Bearer')
    @Get("/questions")
    public async getQuestions(): Promise<ApiResponse> {
        try {

            return handlers.getQuestions()

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Post parameter to aws 
*/

    @Post("/store_paramter_to_aws")
    public async storeParameterToAws(@FormField() name: string, @FormField() value: string): Promise<ApiResponse> {
        try {

            console.log(name, "nameeeeeee")
            console.log(value, "valueeeeeee")
            const validatedStoreParmeterToAws = validateStoreParmeterToAws({ name, value });

            if (validatedStoreParmeterToAws.error) {
                return showResponse(false, validatedStoreParmeterToAws.error.message, null, null, 400)
            }

            return handlers.storeParameterToAws(name, value)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

}





