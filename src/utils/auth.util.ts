import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { findOne } from "../helpers/db.helpers"
import Users from '../models/User/user.auth.model'
import adminModel from '../models/Admin/admin.auth.model'
import { showResponse } from './response.util';
import responseMessage from '../constants/responseMessages';
import { APP } from '../constants/app.constant';
import { USER_STATUS } from '../constants/workflow.constant';
import statusCodes from '../constants/statusCodes';
import { tokenUserTypeInterface } from './interfaces.util';

//
export const generateJwtToken = async (id: string, extras = {}, expiresIn = '24h') => {
    const API_SECRET = await APP.JWT_SECRET
    return new Promise((res, rej) => {
        jwt.sign({ id, ...extras }, API_SECRET as string, {
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

export const generateAccessRefreshToken = async (user_id: string, role: number, user_type: tokenUserTypeInterface) => {
    const access_token = await generateJwtToken(user_id, { user_type, type: "access", role }, APP.ACCESS_EXPIRY);
    const refresh_token = await generateJwtToken(user_id, { user_type, type: "refresh", role }, APP.REFRESH_EXPIRY);
    return { access_token, refresh_token }
};




export const verifyToken = async (req: Request) => {
    try {

        let token: any = req.headers['access_token'] || req.headers['authorization'] || req.headers['Authorization'];

        if (!token) {
            return showResponse(false, "Token not present in headers ", {}, statusCodes.AUTH_TOKEN_ERROR);
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        const API_SECRET = await APP.JWT_SECRET;

        const decoded: any = await new Promise((resolve, reject) => {
            jwt.verify(token, API_SECRET as string, async (err: any, decoded: any) => {
                if (err) {
                    reject(showResponse(false, responseMessage?.middleware?.token_expired, {}, statusCodes.AUTH_TOKEN_ERROR));
                }
                resolve(showResponse(true, 'decode success', decoded, statusCodes.SUCCESS));

            });
        });

        //return response if token is not decoded 
        if (!decoded.status) {
            return decoded
        }

        const decoded_data = decoded.data

        if (decoded_data.user_type === "user") {

            const response = await findOne(Users, { _id: decoded_data._id ?? decoded_data.id });
            if (!response.status) {
                return showResponse(false, responseMessage?.users?.invalid_user, {}, statusCodes.AUTH_TOKEN_ERROR);
            }
            const userData = response.data;
            if (userData.status === USER_STATUS.DELETED) {
                return showResponse(false, responseMessage?.middleware?.deleted_account, {}, statusCodes.ACCOUNT_DELETED);
            }
            if (userData.status === USER_STATUS.DEACTIVATED) {
                return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, statusCodes.ACCOUNT_DISABLED);
            }

            return showResponse(true, 'user data decoded ', { ...decoded_data, user_id: userData._id }, statusCodes.SUCCESS);

        } else if (decoded_data?.user_type === "admin") {

            const response = await findOne(adminModel, { _id: decoded_data._id ?? decoded_data.id });
            if (!response.status) {
                return showResponse(false, responseMessage?.admin?.admin_not_exist, {}, statusCodes.AUTH_TOKEN_ERROR);
            }
            const adminData = response.data;
            if (adminData.status === USER_STATUS.DELETED) {
                return showResponse(false, responseMessage?.middleware?.deleted_account, {}, statusCodes.ACCOUNT_DELETED);
            }
            if (adminData.status === USER_STATUS.DEACTIVATED) {
                return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, statusCodes.ACCOUNT_DISABLED);
            }

            return showResponse(true, 'admin data decoded', { ...decoded_data, admin_id: adminData._id }, statusCodes.SUCCESS);

        } else {

            return showResponse(false, responseMessage?.users?.invalid_user, {}, statusCodes.AUTH_TOKEN_ERROR);
        }
    } catch (err: any) {
        const errorMsg = err?.message ? err.message : err
        return showResponse(false, errorMsg, {}, statusCodes.AUTH_TOKEN_ERROR);
    }
}

export const decodeToken = async (token: string) => {
    try {
        const API_SECRET = await APP.JWT_SECRET;

        return jwt.verify(token, API_SECRET, async (err: any, decoded: any) => {
            if (err) {
                return showResponse(false, responseMessage?.middleware?.token_expired, null, statusCodes.AUTH_TOKEN_ERROR);
            }

            return showResponse(true, responseMessage?.users?.token_verification_sucess, decoded, statusCodes.SUCCESS);

        })
    } catch (error) {
        console.log("in catch middleware check token error : ", error)
        return showResponse(false, responseMessage?.middleware?.invalid_access_token, null, statusCodes.SERVER_TRYCATCH_ERROR);
    }
}

