import { Response } from 'express'
import { ApiResponse } from '../utils/interfaces.util'

export const showResponse = (status: boolean, message: string, data: any = null, other: any = null, code: number | null = null) => {

    const response: ApiResponse = {
        status: status,
        message: message,
        code: 400
    };

    if (code !== null) {
        response.code = code;
    }
    if (data !== null) {
        response.data = data;
    }
    if (other !== null) {
        response.other = other;
    }
    return response;
};

export const showOutput = (res: Response, showResponse: ApiResponse, code: number) => {
    // delete response.code;
    const res_msg: any = {
        message: showResponse.message,
        data: showResponse.data
    }

    if (showResponse.other) {
        res_msg.other = showResponse.other
    }
    res.status(code).json(res_msg);
};