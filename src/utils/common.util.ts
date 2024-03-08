import rateLimit from 'express-rate-limit'
import Queue from 'bull'
import { REDIS_CREDENTIAL } from '../constants/app.constant'

//get params according to your environment
export const getEnvironmentParams = (env: any, project_name: string) => {
    if (env === "PROD") {
        return { db: "MONGODB_URI_PROD", bucket: `${project_name}_BUCKET_PROD` }
    } else if (env === "STAG") {
        return { db: "MONGODB_URI_STAG", bucket: `${project_name}_BUCKET_STAG` }

    } else {
        return { db: "MONGODB_URI_DEV", bucket: `${project_name}_BUCKET_DEV` }
    }
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
});


