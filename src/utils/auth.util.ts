import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { findOne } from "../helpers/db.helpers"
import Users from '../models/user.model'
import adminModel from '../models/admin.model'
import { showResponse } from './response.util';
import responseMessage from '../constants/responseMessage.constant';
import { APP } from '../constants/app.constant';

export const generateJwtToken = async (id: string, extras = {}, expiresIn = '24h') => {
    return new Promise((res, rej) => {
        jwt.sign({ id, ...extras }, APP.JWT_SECRET as string, {
            expiresIn
        }, (err: any, encoded: any) => {
            if (err) {
                rej(err.message);
            } else {
                res(encoded);
            }
        })
    })
}



export const verifyToken = (req: Request, res: Response) => {
    try {
        let token: any = req.headers['access_token'] || req.headers['authorization'] || req.headers['Authorization']; // Express headers are auto converted to lowercase

        if (!token) {
            return showResponse(false, "Something went wrong with token", {}, {}, 401)
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        if (token) {
            let API_SECRET = APP.JWT_SECRET

            let decoded_result = jwt.verify(token, API_SECRET as string, async (err: any, decoded: any) => {

                if (err) {
                    return showResponse(false, responseMessage?.middleware?.token_expired, {}, {}, 401)
                }
                // if (decoded?.type == "refresh") {
                //     return res.status(403).json({ status: false, message: 'ResponseMessages?.middleware?.use_access_token', StatusCode: 401 });
                // }
                if (decoded?.user_type == "user") {

                    let response = await findOne(Users, { _id: decoded._id ?? decoded.id });
                    if (!response.status) {
                        return showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401)
                    }
                    let userData = response?.data

                    if (userData.status == 2) {
                        return showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451)
                    }

                    if (userData.status == 4) {
                        return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451)
                    }

                    decoded = { ...decoded, user_id: userData._id }
                    return showResponse(true, 'data is', decoded, {}, 200)

                } else if (decoded?.user_type == "admin") {

                    let response = await findOne(adminModel, { _id: decoded._id ?? decoded.id });
                    if (!response.status) {
                        return showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401)
                    }

                    let userData = response?.data

                    if (userData.status == 2) {
                        return showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451)
                    }

                    if (userData.status == 4) {
                        return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451)
                    }
                    decoded = { ...decoded, user_id: userData._id }

                    return showResponse(true, 'decoded data is', decoded, {}, 200)

                } else {
                    return showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401)
                }
            })

            return showResponse(true, 'decoded', decoded_result, {}, 200)

        } else {
            return showResponse(false, responseMessage?.middleware?.token_expired, {}, {}, 401)
        }

    }
    catch (err) {
        return showResponse(false, "Authentication error", {}, {}, 401)
    }
}

