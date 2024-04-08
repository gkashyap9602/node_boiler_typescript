import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Get, Security, FormField } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import handler from '../../handlers/Common/common.handler'
import { showResponse } from '../../utils/response.util';
import { validateStoreParmeterToAws } from '../../validations/Common/common.validator';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';


@Tags('Common')
@Route('/common')

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

        const wrappedFunc = tryCatchWrapper(handler.getCommonContent);
        return wrappedFunc(); // Invoking the wrapped function 

    }
    //ends

    /**
   * Get Faq Questions
   */
    @Security('Bearer')
    @Get("/questions")
    public async getQuestions(): Promise<ApiResponse> {

        const wrappedFunc = tryCatchWrapper(handler.getQuestions);
        return wrappedFunc(); // Invoking the wrapped function 
    }
    //ends

    /**
* Post parameter to aws 
*/

    @Post("/store_paramter_to_aws")
    public async storeParameterToAws(@FormField() name: string, @FormField() value: string): Promise<ApiResponse> {

        const validate = validateStoreParmeterToAws({ name, value });

        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.storeParameterToAws);
        return wrappedFunc(name, value); // Invoking the wrapped function 

    }
    //ends

}





