import moment from 'moment';
import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, updateMany, findByIdAndRemove } from "../../helpers/db.helpers";
import commonContentModel from "../../models/Admin/commonContent.model";
import responseMessage from '../../constants/ResponseMessage'
import faqModel from '../../models/Admin/faq.model';
import { tryCatchWrapper } from '../../utils/config.util';
import statusCodes from 'http-status-codes'

const AdminCommonHandler = {

    addQuestion: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { question, answer } = data;

        const exists = await findOne(faqModel, { question })

        if (exists.status) {
            return showResponse(false, responseMessage.common.already_existed, null, null, statusCodes.CONFLICT)
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
            return showResponse(true, responseMessage.admin.question_added, null, null, statusCodes.CREATED);
        }
        return showResponse(false, responseMessage.admin.failed_question_add, response, null, statusCodes.BAD_REQUEST);
    }),

    updateQuestion: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { answer, question, question_id } = data;

        let updateObj: any = {
            // updated_on: moment().unix()
        }

        if (answer) {
            updateObj.answer = answer
        }
        if (question) {
            updateObj.question = question
        }

        let response = await findByIdAndUpdate(faqModel, updateObj, question_id);
        if (response.status) {
            return showResponse(true, responseMessage.common.update_sucess, null, null, statusCodes.OK);
        }
        return showResponse(false, responseMessage.common.update_failed, null, null, statusCodes.NOT_MODIFIED);
    }),

    deleteQuestion: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        const { question_id } = data;

        const exists = await findOne(faqModel, { _id: question_id })

        if (!exists.status) {
            return showResponse(false, responseMessage.common.not_exist, null, null, statusCodes.NOT_FOUND)
        }

        let response = await findByIdAndRemove(faqModel, question_id)
        if (response.status) {
            return showResponse(true, responseMessage.common.delete_sucess, null, null, statusCodes.OK);
        }
        return showResponse(false, responseMessage.common.delete_failed, response, null, statusCodes.BAD_REQUEST);
    }),

    updateCommonContent: tryCatchWrapper(async (data: any): Promise<ApiResponse> => {

        // data.updated_on = moment().unix()
        let response = await findOneAndUpdate(commonContentModel, {}, data);
        if (response.status) {
            return showResponse(true, responseMessage.admin.common_content_updated, response?.data, null, statusCodes.OK);
        }
        return showResponse(false, responseMessage.common.update_failed, {}, null, statusCodes.BAD_REQUEST)
    }),

}

export default AdminCommonHandler;
