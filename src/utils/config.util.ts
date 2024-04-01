import rateLimit from 'express-rate-limit'
import Queue from 'bull'
import { APP, REDIS_CREDENTIAL } from '../constants/app.constant'
import { showResponse } from './response.util';
import statusCodes from 'http-status-codes'
import { NextFunction, Response, Request } from 'express';
import multer from 'multer'


//get params according to your environment
export const getEnvironmentParams = (env: any, project_name: string, project_initial: string) => {

    project_name = project_name.toUpperCase()
    const admin_email = project_name.toLowerCase()
    const initial_for_aws = project_initial.toUpperCase()

    console.log(admin_email, "admin_email")
    const env_obj = <any>{
        'PROD': {
            DB_NAME: `${initial_for_aws}_DB_NAME_PROD`,
            DB_URI: `${initial_for_aws}_MONGODB_URI_PROD`,
            BUCKET: `${initial_for_aws}_BUCKET_PROD`,
            ADMIN_EMAIL: `admin${admin_email}@yopmail.com`,
            REGION: `${initial_for_aws}_REGION`,
            ACCESSID: `${initial_for_aws}_ACCESSID`,
            STMP_EMAIL: `${initial_for_aws}_STMP_EMAIL`,
            SMTP_APP_PASSWORD: `${initial_for_aws}_SMTP_APP_PASSWORD`,
        },
        'STAG': {
            DB_NAME: `${initial_for_aws}_DB_NAME_STAG`,
            DB_URI: `${initial_for_aws}_MONGODB_URI_STAG`,
            BUCKET: `${initial_for_aws}_BUCKET_STAG`,
            ADMIN_EMAIL: `admin${admin_email}@yopmail.com`,
            REGION: `${initial_for_aws}_REGION`,
            ACCESSID: `${initial_for_aws}_ACCESSID`,
            STMP_EMAIL: `${initial_for_aws}_STMP_EMAIL`,
            SMTP_APP_PASSWORD: `${initial_for_aws}_SMTP_APP_PASSWORD`,
        },
        'DEV': {
            DB_NAME: `${initial_for_aws}_DB_NAME_DEV`,
            DB_URI: `${initial_for_aws}_MONGODB_URI_DEV`,
            BUCKET: `${initial_for_aws}_BUCKET_DEV`,
            ADMIN_EMAIL: `admin${admin_email}@yopmail.com`,
            REGION: `${initial_for_aws}_REGION`,
            ACCESSID: `${initial_for_aws}_ACCESSID`,
            STMP_EMAIL: `${initial_for_aws}_STMP_EMAIL`,
            SMTP_APP_PASSWORD: `${initial_for_aws}_SMTP_APP_PASSWORD`,
        },

    }

    return env_obj[env] //return matched environment and send its object
};


//generate bull queue 
export const generateQueue = (queueName: string) => {
    const queue = new Queue(queueName, {
        redis: {
            port: REDIS_CREDENTIAL.PORT,
            host: REDIS_CREDENTIAL.URI,
        }
    })

    return queue
}



// Define the rate limit options
export const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    statusCode: statusCodes.TOO_MANY_REQUESTS
});

// Define your tryCatchWrapper function
export const tryCatchWrapper = (func: any) => {
    return async (...args: any[]) => {
        try {
            // console.log("Entering try block with arguments:", ...args);
            const result = await func(...args);
            console.log("Exiting try block with result:", result);
            return result;
        } catch (err: any) {
            console.error("Caught an error:", err);
            return showResponse(false, err?.message ?? err, null, statusCodes.BAD_REQUEST);
        }
    };
};

// Error handler middleware for handling file size limit exceeded error
export const handleFileSize = (err: any, req: Request, res: Response, next: NextFunction) => {
    // console.log(err, "errrrrfileside")

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        // File size limit exceeded error
        return res.status(400).send({ message: `File size limit exceeded (Max: ${APP.FILE_SIZE}MB)` });
    }
    next(err);
}
