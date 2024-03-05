import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { findOne, findAll } from "../../helpers/db.helpers";
import responseMessage from "../../constants/responseMessage.constant";
import commonContentModel from "../../models/Admin/commonContent.model";
import faqModel from "../../models/Admin/faq.model";

const CommonHandler = {

    async getCommonContent(): Promise<ApiResponse> {
        try {

            let getResponse = await findOne(commonContentModel, {});

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

    async getQuestions(): Promise<ApiResponse> {
        try {

            let getResponse = await findAll(faqModel, {});

            if (getResponse.status) {
                return showResponse(false, responseMessage.admin.here_is_question, getResponse?.data, null, 400)
            }

            return showResponse(true, responseMessage.common.data_not_found, null, null, 200)

        }
        catch (err: any) {
            //   logger.error(`${this.req.ip} ${err.message}`)
            return err

        }
    }

}

export default CommonHandler 
