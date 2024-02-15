
import { IResponse } from "../utils/interfaces.util";

const AdminHandler = {

    async login(data: any, file: any): Promise<IResponse> {
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
            return {
                data: {},
                error: "",
                message: "Login Success",
                status: 200,
            };
        } catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`);
            return {
                data: null,
                error: err.message ? err.message : err,
                message: "",
                status: 400,
            };
        }
    }

}

export default AdminHandler 
