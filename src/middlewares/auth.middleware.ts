import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util'
import { showOutput } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers;
    if (authHeader) {
        const decoded: ApiResponse = await (await verifyToken(req, res))
        // .data;
        console.log(decoded, "decodeddddddddUser")

        if (decoded.status && decoded?.data?.user_type == 'user') {
            console.log("underrrrDeco")
            req.body.user = decoded?.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code)
            // return showOutput(res, { status: false, message: decoded?.message, data: null, other: null, code: decoded?.code }, decoded?.code)
        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 401 }, 401)

    }
}//ends


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers;

    if (authHeader) {
        const decoded: ApiResponse = await verifyToken(req, res);
        // @ts-ignore
        if (decoded.status && decoded?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code)
            // return showOutput(res, { status: false, message: decoded.message, data: null, other: null, code: decoded?.code }, decoded?.code)

        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 401 }, 401)

    }
}

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded: ApiResponse = await verifyToken(req, res);
        console.log(decoded, "decodeddddddd")
        // @ts-ignore
        if (decoded.status && decoded?.data?.data?.user_type == 'user' || decoded?.data?.data?.user_type == 'admin') {
            req.body.user = decoded.data;
            next();
        } else {
            return showOutput(res, decoded, decoded?.code)
            // return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

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

