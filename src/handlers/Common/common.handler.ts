import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findAll } from "../../helpers/db.helpers";
import responseMessage from '../../constants/ResponseMessage'
import commonContentModel from "../../models/Admin/commonContent.model";
import faqModel from "../../models/Admin/faq.model";
import services from "../../services";
import { tryCatchWrapper } from "../../utils/config.util";

const CommonHandler = {

    getCommonContent: tryCatchWrapper(async (): Promise<ApiResponse> => {

        let getResponse = await findOne(commonContentModel, {});

        if (!getResponse.status) {
            return showResponse(false, responseMessage.users.invalid_user, null, null, 400)
        }

        return showResponse(true, responseMessage.users.user_detail, getResponse.data, null, 200)

    }),

    getQuestions: tryCatchWrapper(async (): Promise<ApiResponse> => {

        let getResponse = await findAll(faqModel, {});

        if (getResponse.status) {
            return showResponse(true, responseMessage.admin.here_is_question, getResponse?.data, null, 200)
        }

        return showResponse(false, responseMessage.common.data_not_found, null, null, 400)

    }),

    storeParameterToAws: tryCatchWrapper(async (name: string, value: string): Promise<ApiResponse> => {

        let response = await services.awsService.postParameterToAWS({
            name: name,
            value: value
        })

        if (response) {
            return showResponse(true, responseMessage?.common.parameter_store_post_success, null, null, 200);
        }
        return showResponse(false, responseMessage?.common.parameter_store_post_error, null, null, 400);
    }),


}

export default CommonHandler 
