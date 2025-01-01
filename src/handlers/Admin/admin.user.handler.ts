import moment from "moment";
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findOneAndUpdate, getCount } from "../../helpers/db.helpers";
import * as commonHelper from "../../helpers/common.helper";
import responseMessage from '../../constants/responseMessages'
import userModel from '../../models/User/user.auth.model';
import { ROLE, USER_STATUS } from '../../constants/workflow.constant'
import statusCodes from '../../constants/statusCodes'

const AdminUserHandler = {

    getUsersList: async (sort_column: string = 'createdAt', sort_direction: string = 'desc', page = null, limit = null, search_key: string = '', status?: number): Promise<ApiResponse> => {

        const matchObj: any = {
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

        const aggregate = [
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
        const { totalCount, aggregation } = await commonHelper.getCountAndPagination(userModel, aggregate, page, limit)
        const result = await userModel.aggregate(aggregation)

        return showResponse(true, responseMessage?.common.data_retreive_sucess, { result, totalCount }, statusCodes.SUCCESS);
    },

    getUserDetails: async (user_id: string): Promise<ApiResponse> => {

        const getResponse = await findOne(userModel, { _id: user_id, status: { $ne: USER_STATUS.DELETED } }, { password: 0 });
        if (!getResponse.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage.users.user_detail, getResponse.data, statusCodes.SUCCESS)
    },


    updateUserStatus: async (data: any): Promise<ApiResponse> => {
        const { user_id, status } = data;

        const parsedStatus = Number(status);
        const queryObject = { _id: user_id, user_type: ROLE.USER } //usertype should be USER  = 3

        const result = await findOne(userModel, queryObject);
        if (!result.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, statusCodes.API_ERROR);
        }

        const editObj = { status: parsedStatus }

        const response = await findOneAndUpdate(userModel, queryObject, editObj);
        if (!response.status) {
            return showResponse(false, "Error While Updating User Status", null, statusCodes.API_ERROR);
        }

        const msg = parsedStatus == 2 ? "Deleted" : parsedStatus == 1 ? "Activated" : "Deactivated"
        return showResponse(true, `User Account Has Been ${msg}`, {}, statusCodes.SUCCESS);

    },

    getDashboardData: async (past_day: string = 'MAX'): Promise<ApiResponse> => {

        // Calculate the timestamps for 30 days ago, 180 days ago, and 365 days ago
        const thirtyDaysAgo = moment().subtract(30, 'days').unix()  //last 30 days timestamp
        const sixMonthAgo = moment().subtract(180, 'days').unix() //last 180 days timestamp
        const oneYearAgo = moment().subtract(365, 'days').unix() //last 365 days timestamp
        const maxDate = moment().unix(); //today timestamp
        console.log(oneYearAgo, "oneYearAgo")
        console.log(past_day, "past_day")

        const dates: any = {
            '1M': { $gte: thirtyDaysAgo },//greater then last  1 month  date users registeration data
            '6M': { $gte: sixMonthAgo }, //greater then last 6 month  date users registeration data
            '1Y': { $gte: oneYearAgo }, //greater then last year date users registeration data
            'MAX': { $lte: maxDate }, //if max then less then equal to current date users data
        }

        const fetch_data_date: any = dates[past_day]

        const dashboard = await userModel.aggregate([
            {
                $match: {
                    user_type: ROLE.USER,
                    createdAt: fetch_data_date // Filter documents within the last 30 days
                }
            },
            {
                $addFields: {
                    created_date: { $toDate: { $multiply: ["$createdAt", 1000] } } // Convert timestamp to date format
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

        const all_users = await getCount(userModel, { status: { $ne: USER_STATUS.DELETED } })
        const active_users = await getCount(userModel, { status: USER_STATUS.ACTIVE })
        const deactivated_users = await getCount(userModel, { status: USER_STATUS.DEACTIVATED })

        const user_summary = {
            all_users: all_users.data,
            active_users: active_users.data,
            deactivated_users: deactivated_users.data
        }

        return showResponse(true, 'Dashboard data is here', { user_summary, dashboard }, statusCodes.SUCCESS);
    },
}

export default AdminUserHandler 
