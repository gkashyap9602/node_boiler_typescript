import moment from 'moment'
import { Parser } from 'json2csv'
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';


const bycrptPasswordHash = (stringValue: string): Promise<string> => {
    return new Promise((res, rej) => {
        bcrypt.genSalt(10, function (err: any, salt: string) {
            if (err) {
                rej(err.message)
            }
            bcrypt.hash(stringValue, salt, async (err: any, hash: string) => {
                if (err) {
                    rej(err.message)
                }
                res(hash);
            });
        });
    })
}


const verifyBycryptHash = (password: string, hash_password: string) => {
    return bcrypt.compare(password, hash_password);
}



const convertIdToObjectId = (id: string) => {
    return Types.ObjectId(id);
}

const generateRandomOtp = (len: number) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    if (OTP.length < len || OTP.length > len) {
        generateRandomOtp(len);
    }
    return (OTP);
}

// export const generateRandomOtp = () => {
//     const digits = '0123456789';
//     let OTP = '';
//     for (let i = 0; i < 6; i++) {
//         OTP += digits[Math.floor(Math.random() * 10)];
//     }
//     return OTP;
// }

const camelize = (str: string) => {
    try {
        str = str.trim().split(' ').join('_')
        return str
    }
    catch (err) {
        return null;
    }
}


const getFilterMonthDateYear = (date: string) => {
    return moment(date).add(1, 'day').format('YYYY-MM-DD')
}

const getCSVFromJSON = (fields: any, json: any) => {
    const parser = new Parser({ fields });
    return parser.parse(json);
}


export default {
    bycrptPasswordHash,
    verifyBycryptHash,
    convertIdToObjectId,
    generateRandomOtp,
    camelize,
    getFilterMonthDateYear,
    getCSVFromJSON


}
