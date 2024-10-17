import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Security, Put, FormField, Delete } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateQuestion, validateAddQuestion, validateCommonContent, validateDeleteQuestion } from '../../validations/Admin/admin.common.validator';
import handler from '../../handlers/Admin/admin.common.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';


@Tags('Admin Common Routes')
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

        const validate = validateAddQuestion(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.addQuestion);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
* Update Question endpoint
*/
    @Security('Bearer')
    @Put("/question")
    public async updateQuestion(@Body() request: { question_id: string, question: string, answer: string }): Promise<ApiResponse> {

        const validate = validateUpdateQuestion(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateQuestion);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends

    /**
    * Delete Question endpoint
    */
    @Security('Bearer')
    @Delete("/question")
    public async deleteQuestion(@FormField() question_id: string): Promise<ApiResponse> {

        const validate = validateDeleteQuestion({ question_id });
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.deleteQuestion);
        return wrappedFunc({ question_id }); // Invoking the wrapped function 
    }
    //ends

    /**
 * Update Common Content endpoint
 */
    @Security('Bearer')
    @Put("/common_content")
    public async updateCommonContent(@Body() request: { about: string, privacy_policy: string, terms_conditions: string }): Promise<ApiResponse> {

        const validate = validateCommonContent(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateCommonContent);
        return wrappedFunc(request); // Invoking the wrapped function 
    }
    //ends
}





