import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/common.util'
import { responseWithStatus } from '../utils/response.util';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded = verifyToken(authHeader);
        if (decoded) {
            req.body.user = decoded;
            next();
        } else {
            return responseWithStatus(res, 400, {
                data: null,
                error: 'Unauthorized',
                message: '',
                status: 401
            })
        }
    } else {
        return responseWithStatus(res, 400, {
            data: null,
            error: 'Unauthorized',
            message: '',
            status: 401
        })
    }
}

export const authenticateAdmin = async(req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded = verifyToken(authHeader);
        // @ts-ignore
        if (decoded && decoded?.access=='admin') {
            req.body.user = decoded;
            next();
        } else {
            return responseWithStatus(res, 400, {
                data: null,
                error: 'Unauthorized',
                message: '',
                status: 401
            })
        }
    } else {
        return responseWithStatus(res, 400, {
            data: null,
            error: 'Unauthorized',
            message: '',
            status: 401
        })
    }
}

export const authenticateBoth = async(req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const decoded = verifyToken(authHeader);
        // @ts-ignore
        if (decoded && decoded?.access=='subAdmin' || decoded?.access=='admin' ) {
            req.body.user = decoded;
            next();
        } else {
            return responseWithStatus(res, 400, {
                data: null,
                error: 'Unauthorized',
                message: '',
                status: 401
            })
        }
    } else {
        return responseWithStatus(res, 400, {
            data: null,
            error: 'Unauthorized',
            message: '',
            status: 401
        })
    }
}

