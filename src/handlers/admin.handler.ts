import { ApiResponse } from "../utils/interfaces.util";
import { showResponse } from "../utils/response.util";
import { findOne } from "../helpers/db.helpers";
import adminModel from "../models/admin.model";
import { generateJwtToken } from "../utils/auth.util";
import { verifyBycryptHash } from "../helpers/common.helper";

const AdminHandler = {

    async login(data: any, file: any): Promise<ApiResponse> {
        try {
            const { email, password } = data;

            const exists = await findOne(adminModel, { email });
            if (!exists.status) {
                return showResponse(false, 'Admin Does not exist', null, null, 400)
                // throw new Error ('Admin doesn\'t exists!');
            }

            const isValid = await verifyBycryptHash(password, exists.data.password);
            if (!isValid) {
                return showResponse(false, 'Password seems to be incorrect', null, null, 400)
                // throw new Error('Password seems to be incorrect');
            }

            const token = await generateJwtToken(exists.data._id)
            delete exists.data.password

            return showResponse(true, 'Login Successfully', { ...exists.data, token }, null, 200)


        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, err?.message ?? err, null, null, 400)
        }
    }

}

export default AdminHandler 
