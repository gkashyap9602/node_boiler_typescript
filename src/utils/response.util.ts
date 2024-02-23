import { Response } from 'express'
import { ApiResponse } from '../utils/Interfaces/showResponse'


// export const responseWithStatus = (res: Response, status: number, responseData: any) => {
//     return res.status(status).send(responseData);
// }


export const showResponse = (status: boolean, message: string, data: any = null, other: any = null, code: number | null = null) => {

    let response: ApiResponse = {
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
    res.status(code).json(showResponse);
};