import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util'
import { showOutput } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';
import statusCodes from '../constants/statusCodes';
import responseMessages from '../constants/responseMessages';

export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'user') {
            req.body.user = decoded.data;
            next();
        } else if (decoded.status && decoded?.data?.user_type == 'admin') {
            return showOutput(res, { status: false, message: responseMessages.users.invalid_user, data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

        } else { //false case
            return showOutput(res, decoded, decoded?.code) //return error message if token expire account deactiavted etc... 
        }
    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.users.unauthorised_user, data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
}//ends


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else if (decoded.status && decoded?.data?.user_type == 'user') {

            return showOutput(res, { status: false, message: responseMessages.admin.invalid_admin, data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

        } else {
            return showOutput(res, decoded, decoded?.code) //return error message if token expire account deactiavted etc... 
        }
    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.admin.unauthorized_access, data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
} //ends

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'user' || decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code) //return error message if token expire account deactiavted etc...
        }

    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.admin.unauthorized_access, data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
} //ends

export default {
    verifyTokenAdmin,
    verifyTokenBoth,
    verifyTokenUser
}

