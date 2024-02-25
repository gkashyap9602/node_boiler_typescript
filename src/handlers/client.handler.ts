import { ApiResponse } from "../utils/interfaces.util";
import { showResponse } from "../utils/response.util";

const ClientHandler = {

    async login(data: any, file: any): Promise<ApiResponse> {
        try {

            const { email, password } = data;

            // const exists = await findOne(adminModel, { email });
            // if (!exists) {
            //     throw new Error('Admin doesn\'t exists!');
            // }
            // check if blocked
            // if (exists.isBlocked) {
            //     throw new Error('Admin is not approved yet!');
            // }

            // const isValid = await verifyHash(password, exists.password);
            // if (!isValid) {
            //     throw new Error('Password seems to be incorrect');
            // }
            // const token = await signToken(exists._id)
            // delete exists.password

            return showResponse(false, 'ResponseMessages?.middleware?.token_expired', null, null, 401)


        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return showResponse(false, 'ResponseMessages?.middleware?.token_expired', null, null, 401)
        }
    }

}

export default ClientHandler 
