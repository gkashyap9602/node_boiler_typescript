import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util'
import { showOutput } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers;

    if (authHeader) {
        const decoded = verifyToken(req, res);
        if (decoded) {
            req.body.user = decoded;
            next();
        } else {
            return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)
        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

    }
}//ends


export const verifyTokenAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded = verifyToken(req, res);
        // @ts-ignore
        if (decoded && decoded?.access == 'admin') {
            req.body.user = decoded;
            next();
        } else {
            return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

    }
}

export const verifyTokenBoth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded = verifyToken(req, res);
        // @ts-ignore
        if (decoded && decoded?.access == 'user' || decoded?.access == 'admin') {
            req.body.user = decoded;
            next();
        } else {
            return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

        }
    } else {
        return showOutput(res, { status: false, message: 'Unauthorized', data: null, other: null, code: 400 }, 400)

    }
}

