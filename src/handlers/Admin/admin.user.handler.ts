import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findOneAndUpdate, getCount } from "../../helpers/db.helpers";
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
    async getDashboardData(past_day: string = 'MAX'): Promise<ApiResponse> {
        try {
            // Calculate the timestamps for 30 days ago, 180 days ago, and 365 days ago
            let thirtyDaysAgo = moment().subtract(30, 'days').unix()  //last 30 days timestamp
            let sixMonthAgo = moment().subtract(180, 'days').unix() //last 180 days timestamp
            let oneYearAgo = moment().subtract(365, 'days').unix() //last 365 days timestamp
            let maxDate = moment().unix(); //today timestamp
            console.log(oneYearAgo, "oneYearAgo")
            console.log(past_day, "past_day")

            let dates: any = {
                '1M': { $gte: thirtyDaysAgo },//greater then last  1 month  date users registeration data
                '6M': { $gte: sixMonthAgo }, //greater then last 6 month  date users registeration data
                '1Y': { $gte: oneYearAgo }, //greater then last year date users registeration data
                'MAX': { $lte: maxDate }, //if max then less then equal to current date users data
            }

            let fetch_data_date: any = dates[past_day]

            let dashboard = await userModel.aggregate([
                {
                    $match: {
                        user_type: ROLE.USER,
                        created_on: fetch_data_date // Filter documents within the last 30 days
                    }
                },
                {
                    $addFields: {
                        created_date: { $toDate: { $multiply: ["$created_on", 1000] } } // Convert timestamp to date format
                    }
                },
                {
                    $group: {
                        _id: { $dayOfMonth: "$created_date" }, // Group by day of the month
                        count: { $sum: 1 } // Count documents for each day
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude _id field
                        day: "$_id",
                        count: 1
                    }
                },
                {
                    $sort: { day: 1 } // Sort by day of the month
                }
            ]);

            let all_users = await getCount(userModel, { status: { $ne: 2 } })
            let all_active_users = await getCount(userModel, { status: 1 })


            return showResponse(true, 'Dashboard data is here', { all_users: all_users.data, all_active_users: all_active_users.data, dashboard }, null, 200);
        } catch (err: any) {
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    }
 
}

export default AdminUserHandler 
