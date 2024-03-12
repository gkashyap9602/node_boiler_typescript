import ejs from 'ejs'
import path from 'path'
import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, updateMany } from "../../helpers/db.helpers";
import { generateJwtToken } from "../../utils/auth.util";
import * as commonHelper from "../../helpers/common.helper";
import adminModel from "../../models/Admin/admin.model";
import commonContentModel from "../../models/Admin/commonContent.model";
import services from '../../services';
import responseMessage from "../../constants/responseMessage.constant";
import { APP } from '../../constants/app.constant';
import faqModel from '../../models/Admin/faq.model';
import userModel from '../../models/User/user.model';
import { ROLE, USER_STATUS } from '../../constants/app.constant'

const AdminUserHandler = {

    async getUserDetails(user_id: string): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(userModel, { _id: user_id }, { password: 0 });

            if (!getResponse.status) {
                return showResponse(false, responseMessage.users.invalid_user, null, null, 400)
            }

            return showResponse(true, responseMessage.users.user_detail, getResponse.data, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },

    async getUsersList(sort_column: string = 'created_on', sort_direction: string = 'desc', page: number = 1, limit: number = 10, search_key: string = '', status?: number): Promise<ApiResponse> {
        try {
            page = Number(page)
            limit = Number(limit)

            let matchObj: any = {
                user_type: ROLE.USER, // 3 for users
                $or: [
                    { email: { $regex: search_key, $options: 'i' } },
                    { first_name: { $regex: search_key, $options: 'i' } },
                ]
            }

            if (status) {
                matchObj.status = status
            }

            let aggregate = [
                {
                    $match: {
                        ...matchObj
                    }
                },
                {
                    $sort: {
                        [sort_column]: sort_direction == 'asc' ? 1 : -1
                    }
                },
                {
                    $project: {
                        password: 0,
                        device_info: 0,
                        social_account: 0
                    }
                }

            ]

            //add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
            let { totalCount, aggregation } = await commonHelper.getCountAndPagination(userModel, aggregate, page, limit)

            let result = await userModel.aggregate(aggregation)

            return showResponse(true, responseMessage?.common.data_retreive_sucess, { result, totalCount }, null, 200);

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },
    async updateUserStatus(data: any): Promise<ApiResponse> {
        try {
            let { user_id, status } = data;

            status = Number(status)
            let queryObject = { _id: user_id, user_type: ROLE.USER } //usertype should be USER  = 3

            let result = await findOne(userModel, queryObject);

            if (!result.status) {
                return showResponse(false, responseMessage.users.invalid_user, null, null, 400);
            }
            let editObj = {
                status,
                updated_on: moment().unix()
            }

            let response = await findOneAndUpdate(userModel, queryObject, editObj);
            if (response.status) {
                let msg = status == 2 ? "Deleted" : status == 1 ? "Activated" : "Deactivated"
                return showResponse(true, `User Account Has Been ${msg}`, {}, null, 200);
            }

            return showResponse(false, "Error While Updating User Status", null, null, 400);


        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },


}

export default AdminUserHandler 
