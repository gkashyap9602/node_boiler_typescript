import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { findOne } from "../helpers/db.helpers"
import Users from '../models/User/user.model'
import adminModel from '../models/Admin/admin.model'
import { showResponse } from './response.util';
import responseMessage from '../constants/responseMessage.constant';
import { APP } from '../constants/app.constant';
import { ApiResponse } from './interfaces.util';

export const generateJwtToken = async (id: string, extras = {}, expiresIn = '24h') => {
    let API_SECRET = await APP.JWT_SECRET
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


export const verifyToken = async (req: Request, res: Response): Promise<ApiResponse> => {
    try {

        const token: any = req.headers['access_token'] || req.headers['authorization'] || req.headers['Authorization'];
          
        if (!token) {
            return showResponse(false, "Token not provided ", {}, {}, 401);
        }

        const API_SECRET = await APP.JWT_SECRET;

        const decoded: any = await new Promise((resolve, reject) => {
            jwt.verify(token, API_SECRET as string, async (err: any, decoded: any) => {
                if (err) {
                    resolve(showResponse(false, responseMessage?.middleware?.token_expired, {}, {}, 401));
                }
                resolve(showResponse(true, 'decode success', decoded, {}, 200));

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
                return showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401);
            }
            const userData = response.data;
            if (userData.status === 2) {
                return showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451);
            }
            if (userData.status === 3) {
                return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451);
            }

            return showResponse(true, 'user data decoded ', { ...decoded_data, user_id: userData._id }, {}, 200);

        } else if (decoded_data?.user_type === "admin") {

            const response = await findOne(adminModel, { _id: decoded_data._id ?? decoded_data.id });
            if (!response.status) {
                return showResponse(false, responseMessage?.admin?.invalid_admin_msg, {}, {}, 401);
            }
            const adminData = response.data;
            if (adminData.status === 2) {
                return showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451);
            }
            if (adminData.status === 4) {
                return showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451);
            }

            return showResponse(true, 'admin data decoded', { ...decoded_data, admin_id: adminData._id }, {}, 200);

        } else {

            return showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401);
        }
    } catch (err) {
        console.error(err);
        return showResponse(false, "Authentication error", {}, {}, 401);
    }
}



// export const verifyToken = async (req: Request, res: Response): Promise<ApiResponse> => {
//     try {
//         let token: any = req.headers['access_token'] || req.headers['authorization'] || req.headers['Authorization']; // Express headers are auto converted to lowercase

//         if (typeof token !== 'string') {
//             return showResponse(false, "Something Wrong With Token ", {}, {}, 400);
//         }

//         if (token.startsWith('Bearer ')) {
//             token = token.slice(7, token.length);
//         }

//         if (token) {
//             let API_SECRET = await APP.JWT_SECRET

//             // Use await with jwt.verify and findOne as they are asynchronous
//             let decoded_result = await new Promise((resolve, reject) => {
//                 jwt.verify(token, API_SECRET as string, async (err: any, decoded: any) => {
//                     if (err) {
//                         resolve(showResponse(false, responseMessage?.middleware?.token_expired, {}, {}, 401));
//                     }
//                     if (decoded?.user_type == "user") {
//                         let response = await findOne(Users, { _id: decoded._id ?? decoded.id });
//                         if (!response.status) {
//                             resolve(showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401));
//                         }
//                         let userData = response?.data
//                         if (userData.status == 2) {
//                             resolve(showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451));
//                         }
//                         if (userData.status == 3) {
//                             resolve(showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451));
//                         }
//                         decoded = { ...decoded, user_id: userData._id };
//                         resolve(showResponse(true, 'data is', decoded, {}, 200));
//                     } else if (decoded?.user_type == "admin") {
//                         let response = await findOne(adminModel, { _id: decoded._id ?? decoded.id });
//                         if (!response.status) {
//                             resolve(showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401));
//                         }
//                         let userData = response?.data
//                         if (userData.status == 2) {
//                             resolve(showResponse(false, responseMessage?.middleware?.deleted_account, {}, {}, 451));
//                         }
//                         if (userData.status == 4) {
//                             resolve(showResponse(false, responseMessage?.middleware?.deactivated_account, {}, {}, 451));
//                         }
//                         decoded = { ...decoded, user_id: userData._id };
//                         resolve(showResponse(true, 'decoded data is', decoded, {}, 200));
//                     } else {
//                         resolve(showResponse(false, responseMessage?.users?.invalid_user, {}, {}, 401));
//                     }
//                 });
//             });

//             return showResponse(true, 'decoded', decoded_result, {}, 200)

//         } else {
//             return showResponse(false, responseMessage?.middleware?.token_expired, {}, {}, 401);
//         }

//     }
//     catch (err) {
//         return showResponse(false, "Authentication error", {}, {}, 401);
//     }
// }
