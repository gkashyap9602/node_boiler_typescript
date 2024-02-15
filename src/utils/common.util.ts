import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
// import { CRYPTO }  from '../constants/user.constants'
// import crypto from 'crypto';
 
// export const encrypt = (db_password: string) => {
//     // console.log("==========algorithm and password=========",typeof algorithm,typeof password,algorithm,password)
//     return new Promise((resolve, reject) => {``
//         var cipher = crypto.createCipher(CRYPTO.ALGO, CRYPTO.PWD)
//         var crypted = cipher.update(db_password, 'utf8', 'hex')
//         crypted += cipher.final('hex');
//         resolve(crypted);
//     })
// }


// export const decrypt = (db_password: string) => {
//     var decipher = crypto.createDecipher(CRYPTO.ALGO, CRYPTO.PWD);
//     var crypt = decipher.update(db_password, 'hex', 'utf8') + decipher.final('utf8');
//     return crypt;
// }

export const genHash = (stringValue: string): Promise<string> => {
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
export const verifyHash = (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
}

export const convertIdToObjectId = (id: string) => {
    return Types.ObjectId(id);
}


export const signToken = async (id: string, extras ={}, expiresIn = '24h') => {
    return new Promise((res, rej) => {
        jwt.sign({id, ...extras}, process.env.SECRET as string, {
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

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.SECRET as string);
        return decoded;
    }
    catch(err) {
        return null;
    }
}

export const camelize = (str: string) => {
    try {
        str = str.trim().split(' ').join('_')
        return str
    }
    catch(err) {
        return null;
    }
}