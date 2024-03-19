import { Request, Response } from 'express'
import { Route, Controller, Tags, Body, Get, Security, Query, Put } from 'tsoa'
import { ApiResponse } from '../../utils/interfaces.util';
import { validateUpdateUserStatus, validateGetCustomerDetails, validateDashboard, } from '../../validations/Admin/admin.user.validator';
import handlerAdminUser from '../../handlers/Admin/admin.user.handler'
import { showResponse } from '../../utils/response.util';

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
        try {

            return handlerAdminUser.getUsersList(sort_column, sort_direction, page, limit, search_key, status)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends



    /**
* Get User Details
*/
    @Security('Bearer')
    @Get("/details")
    public async getUserDetails(@Query() user_id: string): Promise<ApiResponse> {
        try {
            console.log(user_id, "useriddd")
            const validatedCustomerDetails = validateGetCustomerDetails({ user_id });

            if (validatedCustomerDetails.error) {
                return showResponse(false, validatedCustomerDetails.error.message, null, null, 400)
            }

            return handlerAdminUser.getUserDetails(user_id)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends


    /**
* Update User Status
*/
    @Security('Bearer')
    @Put("/status")
    public async updateUserStatus(@Body() request: { user_id: string, status: number }): Promise<ApiResponse> {
        try {

            const validatedUpdateUserStatus = validateUpdateUserStatus(request);

            if (validatedUpdateUserStatus.error) {
                return showResponse(false, validatedUpdateUserStatus.error.message, null, null, 400)
            }

            return handlerAdminUser.updateUserStatus(request)

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends

    /**
* Get Dashboard data
*/
    @Security('Bearer')
    @Get("/dashboard")
    public async getDashboardData(@Query() past_day?: string): Promise<ApiResponse> {
        try {

            const validatedDashboard = validateDashboard({ past_day });

            if (validatedDashboard.error) {
                return showResponse(false, validatedDashboard.error.message, null, null, 400)
            }


            return handlerAdminUser.getDashboardData(past_day)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }
    //ends





}





