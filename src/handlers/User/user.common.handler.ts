import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { createOne, } from "../../helpers/db.helpers";
import responseMessage from '../../constants/ResponseMessage'
import statusCodes from '../../constants/statusCodes'
import adminContactusModel from '../../models/Admin/admin.contactus.model';

const UserCommonHandler = {

    contactUs: async (data: any): Promise<ApiResponse> => {
        const contactUsRef = new adminContactusModel(data);

        const response = await createOne(contactUsRef);
        if (!response.status) {
            return showResponse(false, responseMessage?.common?.contactUs_error, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage?.common?.contactUs_success, null, statusCodes.SUCCESS)
    }


}

export default UserCommonHandler 
