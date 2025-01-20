import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Query, } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import handler from '../../handlers/User/user.common.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';
import { validateAddContactUs } from '../../validations/Admin/admin.contactus.validator';

@Tags('User Common Routes')
@Route('/user/common')

export default class UserCommonController extends Controller {
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
     * Contact Us
     */
    // @Security('Bearer')
    @Post("/contactus/fill")
    public async contactUs(@Body() request: { name: string, email: string, message?: string }): Promise<ApiResponse> {

        const validate = validateAddContactUs(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.contactUs);
        return wrappedFunc(request); // Invoking the wrapped function 
    }

    /**
    * Search Product
    */
    @Get("/product/search")
    public async searchProduct(@Query() product_name: string, @Query() country?: string, @Query() result_per_page?: number): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.searchProduct);
        return wrappedFunc({ product_name, country, result_per_page }); // Invoking the wrapped function 
    }

    /**
     * Get Product Details
     */
    @Get("/product/details")
    public async getProductDetails(@Query() product_link: string): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.getProductDetails);
        return wrappedFunc({ product_link }); // Invoking the wrapped function 
    }
}





