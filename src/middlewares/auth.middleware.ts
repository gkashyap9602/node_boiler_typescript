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
        } else if (!decoded.status) {
            return showOutput(res, { status: decoded.status, message: decoded?.message, data: null, code: decoded?.code }, decoded?.code)
        } else {
            return showOutput(res, { status: false, message: "Invalid User", data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
        }
    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.users.unauthorised_user, data: error, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
}//ends


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else {
            return showOutput(res, { status: false, message: "Invalid Admin", data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
        }
    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.admin.unauthorized_access, data: error, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
} //ends

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'user' || decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else if (!decoded.status) {
            return showOutput(res, { status: decoded.status, message: decoded?.message, data: null, code: decoded?.code }, decoded?.code)
        } else {
            return showOutput(res, { status: false, message: "Invalid User", data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
        }

    } catch (error) {
        return showOutput(res, { status: false, message: responseMessages.admin.unauthorized_access, data: error, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)
    }
} //ends

export default {
    verifyTokenAdmin,
    verifyTokenBoth,
    verifyTokenUser
}

