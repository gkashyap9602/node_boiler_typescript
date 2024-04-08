import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util'
import { showOutput } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';
import statusCodes from '../constants/statusCodes';

export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'user') {
            req.body.user = decoded.data;
            next();
        } else if (decoded.status && decoded?.data?.user_type == 'admin') {

            return showOutput(res, { status: false, message: "Invalid User", data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

        } else {
            return showOutput(res, decoded, decoded?.code)
        }
    } catch (error) {
        return showOutput(res, { status: false, message: 'Unauthorized_Access', data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

    }

}


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else if (decoded.status && decoded?.data?.user_type == 'user') {

            return showOutput(res, { status: false, message: "Invalid Admin", data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

        } else {
            return showOutput(res, decoded, decoded?.code)
        }
    } catch (error) {
        return showOutput(res, { status: false, message: 'Unauthorized_Access', data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

    }

}

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const decoded: ApiResponse = await verifyToken(req)

        if (decoded.status && decoded?.data?.user_type == 'user' || decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code)

        }

    } catch (error) {
        return showOutput(res, { status: false, message: 'Unauthorized_Access', data: null, code: statusCodes.AUTH_TOKEN_ERROR }, statusCodes.AUTH_TOKEN_ERROR)

    }


}

export default {
    verifyTokenAdmin,
    verifyTokenBoth,
    verifyTokenUser
}

