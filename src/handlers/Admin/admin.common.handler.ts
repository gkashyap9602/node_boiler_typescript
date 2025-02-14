import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, findByIdAndRemove } from "../../helpers/db.helpers";
import commonContentModel from "../../models/Admin/commonContent.model";
import responseMessage from '../../constants/responseMessages'
import faqModel from '../../models/Admin/faq.model';
import statusCodes from '../../constants/statusCodes'

const AdminCommonHandler = {

    addQuestion: async (data: any): Promise<ApiResponse> => {
        const { question, answer } = data;

        const exists = await findOne(faqModel, { question })
        if (exists.status) {
            return showResponse(false, responseMessage.common.already_existed, null, statusCodes.API_ERROR)
        }

        const newObj = { question, answer }
        const quesRef = new faqModel(newObj)
        const response = await createOne(quesRef);

        if (response.status) {
            return showResponse(true, responseMessage.admin.question_added, null, statusCodes.SUCCESS);
        }

        return showResponse(false, responseMessage.admin.failed_question_add, response, statusCodes.API_ERROR);
    },

    updateQuestion: async (data: any): Promise<ApiResponse> => {
        const { answer, question, question_id } = data;

        const updateObj = {
            ...(answer && { answer }),
            ...(question && { question }),
        };

        const response = await findByIdAndUpdate(faqModel, question_id, updateObj);
        if (response.status) {
            return showResponse(true, responseMessage.common.update_sucess, null, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage.common.update_failed, null, statusCodes.API_ERROR);
    },

    deleteQuestion: async (data: any): Promise<ApiResponse> => {
        const { question_id } = data;

        const exists = await findOne(faqModel, { _id: question_id })
        if (!exists.status) {
            return showResponse(false, responseMessage.common.not_exist, null, statusCodes.API_ERROR)
        }

        const response = await findByIdAndRemove(faqModel, question_id)
        if (response.status) {
            return showResponse(true, responseMessage.common.delete_sucess, null, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage.common.delete_failed, response, statusCodes.API_ERROR);
    },

    updateCommonContent: async (data: any): Promise<ApiResponse> => {
        const { about, privacy_policy, terms_conditions } = data

        const updateObj: any = {
            ...(about && { about }),
            ...(privacy_policy && { privacy_policy }),
            ...(terms_conditions && { terms_conditions })
        };

        let message = '';
        if (about) {
            message = responseMessage.admin.about_updated;
        }
        if (privacy_policy) {
            message = responseMessage.admin.privacy_policy_updated;
        }
        if (terms_conditions) {
            message = responseMessage.admin.terms_conditions_updated;
        }

        const response = await findOneAndUpdate(commonContentModel, {}, updateObj);
        if (response.status) {
            return showResponse(true, message, response?.data, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage.common.update_failed, {}, statusCodes.API_ERROR)
    },
}

export default AdminCommonHandler;
