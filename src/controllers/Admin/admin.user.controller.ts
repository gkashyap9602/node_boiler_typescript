import { Request, Response } from 'express'
import { Route, Controller, Tags, Body, Get, Security, Query, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateUserStatus, validateGetCustomerDetails, validateDashboard, } from '../../validations/Admin/admin.user.validator';
import handlerAdminUser from '../../handlers/Admin/admin.user.handler'
import { showResponse } from '../../utils/response.util';
import statusCodes from 'http-status-codes'


@Tags('Admin User')
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

        return handlerAdminUser.getUsersList(sort_column, sort_direction, page, limit, search_key, status)

    }
    //ends



    /**
* Get User Details
*/
    @Security('Bearer')
    @Get("/details")
    public async getUserDetails(@Query() user_id: string): Promise<ApiResponse> {

        console.log(user_id, "useriddd")
        const validatedCustomerDetails = validateGetCustomerDetails({ user_id });

        if (validatedCustomerDetails.error) {
            return showResponse(false, validatedCustomerDetails.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlerAdminUser.getUserDetails(user_id)

    }
    //ends


    /**
* Update User Status
*/
    @Security('Bearer')
    @Put("/status")
    public async updateUserStatus(@Body() request: { user_id: string, status: number }): Promise<ApiResponse> {

        const validatedUpdateUserStatus = validateUpdateUserStatus(request);

        if (validatedUpdateUserStatus.error) {
            return showResponse(false, validatedUpdateUserStatus.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }

        return handlerAdminUser.updateUserStatus(request)

    }
    //ends

    /**
* Get Dashboard data
*/
    @Security('Bearer')
    @Get("/dashboard")
    public async getDashboardData(@Query() past_day?: string): Promise<ApiResponse> {

        const validatedDashboard = validateDashboard({ past_day });

        if (validatedDashboard.error) {
            return showResponse(false, validatedDashboard.error.message, null, null, statusCodes.EXPECTATION_FAILED)
        }


        return handlerAdminUser.getDashboardData(past_day)
    }
    //ends





}





