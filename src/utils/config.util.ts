import rateLimit from 'express-rate-limit'
import Queue from 'bull'
import { REDIS_CREDENTIAL, APP } from '../constants/app.constant'

//get params according to your environment
export const getEnvironmentParams = (env: any, project_name: string) => {

    let admin_email = project_name.toLowerCase()

    console.log(admin_email, "admin_email")

    if (env === "PROD") {
        return { db_name: "DB_NAME_PROD", db_uri: "MONGODB_URI_PROD", bucket: `${project_name.toUpperCase()}_BUCKET_PROD`, admin_email: `admin${admin_email}@yopmail.com` }
    } else if (env === "STAG") {
        return { db_name: "DB_NAME_STAG", db_uri: "MONGODB_URI_STAG", bucket: `${project_name.toUpperCase()}_BUCKET_STAG`, admin_email: `admin${admin_email}@yopmail.com` }

    } else {
        return { db_name: "DB_NAME_DEV", db_uri: "MONGODB_URI_DEV", bucket: `${project_name.toUpperCase()}_BUCKET_DEV`, admin_email: `admin${admin_email}@yopmail.com` }
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


