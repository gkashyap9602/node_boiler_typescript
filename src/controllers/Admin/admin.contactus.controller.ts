import { Request, Response } from 'express';
import { Route, Controller, Tags, Post, Body, Get, Security, Query, Put, FormField, UploadedFile, Delete } from 'tsoa';
import { ApiResponse } from '../../utils/interfaces.util';
import { validateGetContactDetail, validateDeleteContactUs, validateListContactDetails, validateReplyContactUs } from '../../validations/Admin/admin.contactus.validator';
import handlers from '../../handlers/Admin/admin.contactus.handler';
import statusCodes from '../../constants/statusCodes'
import { showResponse } from '../../utils/response.util';
import { tryCatchWrapper } from '../../utils/config.util';


@Tags('Admin ContactUs Routes')
@Route(`admin/contactus`)

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
    * List events.
    */
    @Security('Bearer')
    @Get("/list")
    public async listContactDetails(@Query() sort_column?: string, @Query() sort_direction?: string, @Query() page?: number, @Query() limit?: number, @Query() search_key?: string): Promise<ApiResponse> {
        const request = { sort_column, sort_direction, page, limit, search_key }

        const validate = validateListContactDetails(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handlers.listContactDetails);
        return wrappedFunc(sort_column, sort_direction, page, limit, search_key);

    }

    /**
    * List events.
    */
    @Security('Bearer')
    @Get("/details")
    public async getContactDetail(@Query() contact_id: string): Promise<ApiResponse> {
        let body = { contact_id };

        const validate = validateGetContactDetail(body);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handlers.getContactDetail);
        return wrappedFunc(body);
    }

    /**
    * Delete Contact.
    */
    @Security('Bearer')
    @Delete("/delete")
    public async deleteContactUs(@Body() request: { contact_id: string }): Promise<ApiResponse> {

        const validate = validateDeleteContactUs(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR);
        }

        const wrappedFunc = tryCatchWrapper(handlers.deleteContactUs);
        return wrappedFunc(request);

    }
    //ends

    /**
     * Reply TO Contact
     */
    @Security('Bearer') 
    @Post("/reply")
    public async replyContactus(@Body() request: { contact_id: string, html: string }): Promise<ApiResponse> {
        
        const validate = validateReplyContactUs(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR);
        }

        const wrappedFunc = tryCatchWrapper(handlers.replyContactus);
        return wrappedFunc(request);
    }
}