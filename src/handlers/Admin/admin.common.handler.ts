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

const AdminCommonHandler = {

    async addQuestion(data: any): Promise<ApiResponse> {
        try {
            const { question, answer } = data;

            const exists = await findOne(faqModel, { question })

            if (exists.status) {
                return showResponse(false, responseMessage.common.already_existed, null, null, 400)

            }

            let newObj = {
                question,
                answer,
                status: 1,
                created_on: moment().unix()
            }
            let quesRef = new faqModel(newObj)
            let response = await createOne(quesRef);

            if (response.status) {
                return showResponse(true, responseMessage.admin.question_added, null, null, 200);
            }
            return showResponse(false, responseMessage.admin.failed_question_add, response, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },
    async updateQuestion(data: any): Promise<ApiResponse> {
        try {
            const { answer, question, question_id } = data;

            let updateObj: any = {
                updated_on: moment().unix()
            }

            if (answer) {
                updateObj.answer = answer
            }
            if (question) {
                updateObj.question = question
            }

            let response = await findByIdAndUpdate(faqModel, updateObj, question_id);
            if (response.status) {
                return showResponse(true, responseMessage.common.update_sucess, null, null, 200);
            }
            return showResponse(false, responseMessage.common.update_failed, null, null, 400);


        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },


    async updateCommonContent(data: any): Promise<ApiResponse> {
        try {

            data.updated_on = moment().unix()
            let response = await findOneAndUpdate(commonContentModel, {}, data);
            if (response.status) {
                return showResponse(true, responseMessage.admin.common_content_updated, response?.data, null, 200);
            }

            return showResponse(false, responseMessage.common.update_failed, {}, null, 400);

        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return showResponse(false, err?.message ?? err, null, null, 400)

        }
    },

}

export default AdminCommonHandler 
