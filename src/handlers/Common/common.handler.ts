import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findAll } from "../../helpers/db.helpers";
import responseMessage from '../../constants/ResponseMessage'
import commonContentModel from "../../models/Admin/commonContent.model";
import faqModel from "../../models/Admin/faq.model";
import services from "../../services";
import statusCodes from '../../constants/statusCodes'

const CommonHandler = {

    getCommonContent: async (): Promise<ApiResponse> => {
        const getResponse = await findOne(commonContentModel, {});
        if (!getResponse.status) {
            return showResponse(false, responseMessage.common.data_not_found, null, statusCodes.API_ERROR)
        }
        return showResponse(true, responseMessage.common.data_retreive_sucess, getResponse.data, statusCodes.SUCCESS)

    },

    getQuestions: async (): Promise<ApiResponse> => {
        const getResponse = await findAll(faqModel, {});
        if (getResponse.status) {
            return showResponse(true, responseMessage.admin.here_is_question, getResponse?.data, statusCodes.SUCCESS)
        }
        return showResponse(false, responseMessage.common.data_not_found, null, statusCodes.API_ERROR)

    },

    storeParameterToAws: async (name: string, value: string): Promise<ApiResponse> => {
        const response = await services.awsService.postParameterToAWS({
            name: name,
            value: value
        })

        if (response) {
            return showResponse(true, responseMessage?.common.parameter_store_post_success, null, statusCodes.SUCCESS);
        }
        return showResponse(false, responseMessage?.common.parameter_store_post_error, null, statusCodes.API_ERROR);
    },


}

export default CommonHandler 
