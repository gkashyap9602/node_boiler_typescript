import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util'
import { showOutput } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers;
    if (authHeader) {
        const decoded: ApiResponse = await (await verifyToken(req, res))
        // .data;
        if (decoded.status && decoded?.data?.data?.user_type == 'user') {
            req.body.user = decoded?.data?.data;
            next();
        } else {

            if (decoded?.data?.data?.user_type == 'admin') {
                return showOutput(res, { status: false, message: "Unauthorized Access By Admin", data: null, other: null, code: 401 }, 401)
            }

            return showOutput(res, decoded, decoded?.code)
        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 401 }, 401)

    }
}//ends


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers;

    if (authHeader) {
        const decoded: ApiResponse = await (await verifyToken(req, res))
        // @ts-ignore
        if (decoded?.data?.status && decoded?.data?.data?.user_type == 'admin') {
            req.body.user = decoded.data?.data;
            next();
        } else {
            if (decoded?.data?.data?.user_type == 'user') {
                return showOutput(res, { status: false, message: "Unauthorized Access By User", data: null, other: null, code: 401 }, 401)
            }

            return showOutput(res, decoded, decoded?.code)

        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 401 }, 401)

    }
}

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded: ApiResponse = await (await verifyToken(req, res))
        // @ts-ignore
        if (decoded.status && decoded?.data?.data?.user_type == 'user' || decoded?.data?.data?.user_type == 'admin') {
            req.body.user = decoded.data?.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code)

        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 401 }, 401)

    }
}

export default {
    verifyTokenAdmin,
    verifyTokenBoth,
    verifyTokenUser
}

