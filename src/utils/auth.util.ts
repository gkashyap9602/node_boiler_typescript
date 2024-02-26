import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { findOne } from "../helpers/db.helpers"
import Users from '../models/client.model'
import Admin from '../models/admin.model'
import { showResponse } from './response.util';
import responseMessage from '../constants/responseMessage.constant';

export const generateJwtToken = async (id: string, extras = {}, expiresIn = '24h') => {
    return new Promise((res, rej) => {
        jwt.sign({ id, ...extras }, process.env.SECRET as string, {
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

        let token: any = req.headers['access_token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

        if (!token) {
            return res.status(401).json({ status: false, message: "Something went wrong with token" });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        if (token) {

            let API_SECRET = 'jhh'
            // await helpers.getParameterFromAWS({ name: "API_SECRET" })

            let decoded = jwt.verify(token, API_SECRET as string, async (err: any, decoded: any) => {

                if (err) {
                    return res.status(401).json({ status: false, message: responseMessage?.middleware?.token_expired, StatusCode: 401 });
                }
                // if (decoded?.type == "refresh") {
                //     return res.status(403).json({ status: false, message: 'ResponseMessages?.middleware?.use_access_token', StatusCode: 401 });
                // }
                if (decoded?.user_type == "user") {

                    let response: any = await findOne(Users, { _id: decoded._id });
                    if (!response.status) {
                        return res.status(401).json({ status: false, message: responseMessage?.users?.invalid_user, StatusCode: 401 });
                    }
                    let userData = response?.data
                    console.log(userData.status, "status jwt side");

                    if (userData.status == 2) {
                        return res.status(451).json({ status: false, message: responseMessage?.middleware?.deleted_account, StatusCode: 451 });
                    }

                    if (userData.status == 4) {
                        return res.status(451).json({ status: false, message: responseMessage?.middleware?.deactivated_account, StatusCode: 451 });
                    }

                    decoded = { ...decoded, user_id: userData._id }
                    return showResponse(true, 'data is', decoded, null, 200)

                } else if (decoded?.user_type == "admin") {

                    let response: any = await findOne(Admin, { _id: decoded._id });
                    if (!response.status) {
                        return res.status(401).json({ status: false, message: responseMessage?.users?.invalid_user, StatusCode: 401 });
                    }

                    let userData = response?.data
                    console.log(userData.status, "status jwt side");

                    if (userData.status == 2) {
                        return res.status(451).json({ status: false, message: responseMessage?.middleware?.deleted_account, StatusCode: 451 });
                    }

                    if (userData.status == 4) {
                        return res.status(451).json({ status: false, message: responseMessage?.middleware?.deactivated_account, StatusCode: 451 });
                    }
                    decoded = { ...decoded, user_id: userData._id }

                    return showResponse(true, 'data is', decoded, null, 200)

                } else {

                    return res.status(401).json({ status: false, message: responseMessage?.middleware?.invalid_user, StatusCode: 401 });
                }
            })

            return decoded
        } else {
            return res.status(401).json({ status: false, message: responseMessage?.middleware?.token_expired, StatusCode: 401 });
            return showResponse(false, 'ResponseMessages?.middleware?.token_expired', null, null, 401)
        }

    }
    catch (err) {
        return null;
    }
}

