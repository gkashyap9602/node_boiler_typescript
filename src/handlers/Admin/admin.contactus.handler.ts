import { ApiResponse } from "../../utils/interfaces.util";
import ejs from 'ejs'
import { showResponse } from "../../utils/response.util";
import { findOne, findByIdAndUpdate, findOneAndDelete } from "../../helpers/db.helpers";
import adminContactUsModel from "../../models/Admin/admin.contactus.model";
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'
import { APP, USER_STATUS } from "../../constants/app.constant";
import { getCountAndPagination } from "../../helpers/common.helper";
import path from 'path';
import services from "../../services";

const AdminContactUsHandler = {
    async listContactDetails(sort_column: string = 'createdAt', sort_direction: string = 'desc', page = null, limit = null, search_key: string = ''): Promise<ApiResponse> {

        const matchObj: any = {
            status: { $ne: USER_STATUS.DELETED },
            name: { $regex: search_key, $options: 'i' }
        }

        const aggregate = [
            {
                $match: {
                    ...matchObj
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    message: 1,
                    createdAt: 1
                }
            },
            { $sort: { [sort_column]: sort_direction === 'asc' ? 1 : -1 } },

        ];

        const { totalCount, aggregation } = await getCountAndPagination(adminContactUsModel, aggregate, page, limit);
        const result = await adminContactUsModel.aggregate(aggregation)
        return showResponse(true, responseMessage?.common.data_retreive_sucess, { result, totalCount }, statusCodes.SUCCESS);

    },

    async getContactDetail(data: any): Promise<ApiResponse> {
        const { contact_id } = data;
        
        const response = await findOne(adminContactUsModel, { _id: contact_id, status: { $ne: USER_STATUS.DELETED } }, {});
        if (!response.status) {
            return showResponse(false, responseMessage?.common?.contactUs_not_found, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage?.common?.contactUs_detail, response.data, statusCodes.SUCCESS);

    },

    async deleteContactUs(data: any): Promise<ApiResponse> {
        const { contact_id } = data;

        const response = await findOneAndDelete(adminContactUsModel, { _id: contact_id });
        if (!response.status) {
            return showResponse(false, 'error while deleting', null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessage?.common?.contactUs_deleted, null, statusCodes.SUCCESS);

    },

    replyContactus: async (data: any): Promise<ApiResponse> => {
        const { contact_id, html } = data;

        const exists = await findOne(adminContactUsModel, { _id: contact_id, status: { $ne: USER_STATUS.DELETED } });
        if (!exists.status) {
            return showResponse(false, responseMessage.common.not_exist, null, statusCodes.API_ERROR)
        }

        const logo = `${APP.BITBUCKET_URL}/${APP.PROJECT_LOGO}`;
        const email_payload = { project_name: APP.PROJECT_NAME, user_name: exists?.data?.name, exists, project_logo: logo, reply: html }
        const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'contactUs.ejs'), email_payload);
        //send email of attachment to admin
        const to = `${exists?.data?.email}`
        const subject = `Reply To Your Query `

        const sendReply = await services.emailService.nodemail(to, subject, template)

        if (sendReply.status) {
            const userObj = { is_reply: true }

            await findByIdAndUpdate(adminContactUsModel, userObj, (exists?.data?._id));
            return showResponse(true, 'reply sent successfully', null, statusCodes.SUCCESS);
        }

        return showResponse(false, 'error while sending reply', null, statusCodes.API_ERROR)

    },
}

export default AdminContactUsHandler;