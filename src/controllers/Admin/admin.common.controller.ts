import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query, Put, FormField, UploadedFile, Delete } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateQuestion, validateAddQuestion, validateCommonContent, validateDeleteQuestion } from '../../validations/Admin/admin.common.validator';
import handlerAdminCommon from '../../handlers/Admin/admin.common.handler'
import { showResponse } from '../../utils/response.util';

@Tags('Admin Common')
@Route('/admin/common')

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

        const validatedAddQuestion = validateAddQuestion(request);

        if (validatedAddQuestion.error) {
            return showResponse(false, validatedAddQuestion.error.message, null, null, 400)
        }

        return handlerAdminCommon.addQuestion(request)
    }
    //ends

    /**
* Update Question endpoint
*/
    @Security('Bearer')
    @Put("/question")
    public async updateQuestion(@Body() request: { question_id: string, question: string, answer: string }): Promise<ApiResponse> {

        const validatedUpdateQuestion = validateUpdateQuestion(request);

        if (validatedUpdateQuestion.error) {
            return showResponse(false, validatedUpdateQuestion.error.message, null, null, 400)
        }

        return handlerAdminCommon.updateQuestion(request)
    }
    //ends

    /**
    * Delete Question endpoint
    */
    @Security('Bearer')
    @Delete("/question")
    public async deleteQuestion(@FormField() question_id: string): Promise<ApiResponse> {

        const validatedDeleteQuestion = validateDeleteQuestion({ question_id });

        if (validatedDeleteQuestion.error) {
            return showResponse(false, validatedDeleteQuestion.error.message, null, null, 400)
        }

        return handlerAdminCommon.deleteQuestion({ question_id })
    }
    //ends

    /**
 * Update Common Content endpoint
 */
    @Security('Bearer')
    @Put("/common_content")
    public async updateCommonContent(@Body() request: { about: string, privacy_policy: string, terms_conditions: string }): Promise<ApiResponse> {

        const validatedCommonContent = validateCommonContent(request);

        if (validatedCommonContent.error) {
            return showResponse(false, validatedCommonContent.error.message, null, null, 400)
        }

        return handlerAdminCommon.updateCommonContent(request)
    }
    //ends






}





