import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findOneAndUpdate } from "../../helpers/db.helpers";
import * as commonHelper from "../../helpers/common.helper";
import responseMessage from "../../constants/responseMessage.constant";
import userModel from '../../models/User/user.model';
import { ROLE, USER_STATUS } from '../../constants/app.constant'

const AdminUserHandler = {

    async getUserDetails(user_id: string): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(userModel, { _id: user_id, status: { $ne: USER_STATUS.DELETED } }, { password: 0 });

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
                status: { $ne: USER_STATUS.DELETED },
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
                    $addFields: {
                        full_name: { $concat: ["$first_name", " ", "$last_name"] }
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
    async getDashboardData(): Promise<ApiResponse> {
        try {
            let dashboard = await userModel.aggregate([
                { $match: { user_type: ROLE.USER } },
                {
                    $addFields: {
                        total_app_users: 1, // Increment total_app_users for each matched document
                        total_active_users: { $cond: { if: { $eq: ["$status", 1] }, then: 1, else: 0 } }
                    }
                },
                { $addFields: { created_on_date: { $toDate: { $multiply: ["$created_on", 1000] } } } },
                // Group to calculate totals
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_on_date" } }, // Group by registration date
                        total_app_users: { $sum: "$total_app_users" },
                        total_active_users: { $sum: "$total_active_users" }
                    }
                },
                // Calculate max registered users
                {
                    $group: {
                        _id: null,
                        total_app_users: { $sum: "$total_app_users" },
                        total_active_users: { $sum: "$total_active_users" },
                        max_registered_users: { $max: "$total_app_users" } // Find max total app users
                    }
                }

            ]);


            return showResponse(true, 'dashboard data is here ', dashboard, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    },



}

export default AdminUserHandler 
