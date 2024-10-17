import { Request, Response } from 'express'
import { Route, Controller, Tags, Body, Get, Security, Query, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateUserStatus, validateGetCustomerDetails, validateDashboard, } from '../../validations/Admin/admin.user.validator';
import handler from '../../handlers/Admin/admin.user.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from '../../constants/statusCodes'
import { tryCatchWrapper } from '../../utils/config.util';


@Tags('Admin User Routes')
@Route('/admin/user')

export default class AdminUserController extends Controller {
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
* Get User List
*/
    @Security('Bearer')
    @Get("/list")
    public async getUsersList(@Query() sort_column?: string, @Query() sort_direction?: string, @Query() page?: number, @Query() limit?: number, @Query() search_key?: string, @Query() status?: number): Promise<ApiResponse> {
        const wrappedFunc = tryCatchWrapper(handler.getUsersList);
        return wrappedFunc(sort_column, sort_direction, page, limit, search_key, status); // Invoking the wrapped function 

    }
    //ends

    /**
* Get User Details
*/
    @Security('Bearer')
    @Get("/details")
    public async getUserDetails(@Query() user_id: string): Promise<ApiResponse> {

        const validate = validateGetCustomerDetails({ user_id });
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.getUserDetails);
        return wrappedFunc(user_id); // Invoking the wrapped function 
    }
    //ends

    /**
* Update User Status
*/
    @Security('Bearer')
    @Put("/status")
    public async updateUserStatus(@Body() request: { user_id: string, status: number }): Promise<ApiResponse> {

        const validate = validateUpdateUserStatus(request);
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.updateUserStatus);
        return wrappedFunc(request); // Invoking the wrapped function 

    }
    //ends

    /**
* Get Dashboard data
*/
    @Security('Bearer')
    @Get("/dashboard")
    public async getDashboardData(@Query() past_day?: string): Promise<ApiResponse> {

        const validate = validateDashboard({ past_day });
        if (validate.error) {
            return showResponse(false, validate.error.message, null, statusCodes.VALIDATION_ERROR)
        }

        const wrappedFunc = tryCatchWrapper(handler.getDashboardData);
        return wrappedFunc(past_day); // Invoking the wrapped function 

    }
    //ends
}





