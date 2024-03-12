import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, Put, FormField, UploadedFile } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateQuestion, validateAddQuestion, validateCommonContent } from '../../validations/Admin/admin.common.validator';
import handlerAdminCommon from '../../handlers/Admin/admin.common.handler'
import { showResponse } from '../../utils/response.util';

@Tags('Admin Common')
@Route('api/v1/admin/common')

export default class AdminCommonController extends Controller {
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
* Add Question  endpoint
*/
    @Security('Bearer')
    @Post("/question")
    public async addQuestion(@Body() request: { question: string, answer: string }): Promise<ApiResponse> {
        try {
            // const { old_password, new_password } = request;

            console.log(request, "requesttttt")

            const validatedAddQuestion = validateAddQuestion(request);

            if (validatedAddQuestion.error) {
                return showResponse(false, validatedAddQuestion.error.message, null, null, 400)
            }

            return handlerAdminCommon.addQuestion(request)

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
    @Put("/question")
    public async updateQuestion(@Body() request: { question_id: string, question: string, answer: string }): Promise<ApiResponse> {
        try {

            const validatedUpdateQuestion = validateUpdateQuestion(request);

            if (validatedUpdateQuestion.error) {
                return showResponse(false, validatedUpdateQuestion.error.message, null, null, 400)
            }

            return handlerAdminCommon.updateQuestion(request)

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
    @Put("/common_content")
    public async updateCommonContent(@Body() request: { about: string, privacy_policy: string, terms_conditions: string }): Promise<ApiResponse> {
        try {

            const validatedCommonContent = validateCommonContent(request);

            if (validatedCommonContent.error) {
                return showResponse(false, validatedCommonContent.error.message, null, null, 400)
            }

            return handlerAdminCommon.updateCommonContent(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends






}





