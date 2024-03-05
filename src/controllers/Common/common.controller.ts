import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
// import { validateChangePassword, validateForgotPassword, validateRegister, validateResetPassword, validateAdmin, validateResendOtp, validateVerifyOtp } from '../../validations/admin.validator';
import handlers from '../../handlers/Common/common.handler'
import { showResponse } from '../../utils/response.util';

@Tags('Common')
@Route('api/common')

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
    @Get("/get_common_content")
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
    @Get("/get_questions")
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

}





