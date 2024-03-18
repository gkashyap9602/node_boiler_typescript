import services from "../services";
import dotenv from "dotenv";
import path from "path";
import { AwsCredential, RoleType, AppConstant, DbConstant, EmailConstant, SMSConstant } from "../utils/interfaces.util";
import { getEnvironmentParams } from "../utils/config.util";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

let { db_name, db_uri, bucket, admin_email } = getEnvironmentParams(process.env.ENV_MODE, 'boilerplate') //2nd parm is project name 
console.log(db_name, db_uri, bucket, admin_email, "parmsFetchFromAws")


let AWS_CREDENTIAL: AwsCredential

const APP: AppConstant = {
  ACCESS_EXPIRY: "1d",
  REFRESH_EXPIRY: "30d",
  PORT: process.env.PORT || 8000,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  BITBUCKET_URL: process.env.BITBUCKET_URL || '',
  JWT_SECRET: process.env.SECRET || "secret",
  ADMIN_CRED_EMAIL: admin_email

};

const DB: DbConstant = {
  DB_NAME: process.env.DB_NAME || '',
  MONGODB_URI: process.env.MONGODB_URI || '',
};

const EMAIL_CREDENTIAL: EmailConstant = {
  SENDGRID_API: process.env.SENDGRID_API,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST
}

const SMS_CREDENTIAL: SMSConstant = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  SEND_FROM_HOST: process.env.SEND_FROM_HOST,
}


const ROLE: RoleType = {
  ADMIN: 1,
  SUB_ADMIN: 2,
  USER: 3,
};

const USER_STATUS = {
  ACTIVE: 1,
  DELETED: 2,
  DEACTIVATED: 3,
};


const LOGS = {
  morgan: process.env.MORGAN,
};

const REDIS_CREDENTIAL = {
  URI: "127.0.0.1",
  PORT: 6379,
};


//call this function when paramters are stored to aws 
let initializeAwsCredential = async () => {

  // DB.MONGODB_URI = services.awsService.getParameterFromAWS({ name: db_uri })
  // DB.DB_NAME = services.awsService.getParameterFromAWS({ name: db_name })

  APP.JWT_SECRET = services.awsService.getParameterFromAWS({ name: "API_SECRET" })
  EMAIL_CREDENTIAL.SENDGRID_API = services.awsService.getParameterFromAWS({ name: 'STMP_EMAIL' })
  EMAIL_CREDENTIAL.SENDGRID_API_KEY = services.awsService.getParameterFromAWS({ name: 'SMTP_APP_PASSWORD' })
  
  // SMS_CREDENTIAL.TWILIO_AUTH_TOKEN = services.awsService.getParameterFromAWS({ name: 'TWILIO_AUTH_TOKEN' })
  // SMS_CREDENTIAL.TWILIO_AUTH_TOKEN = services.awsService.getParameterFromAWS({ name: 'TWILIO_AUTH_TOKEN' })

  AWS_CREDENTIAL = {
    ACCESSID: services.awsService.getParameterFromAWS({ name: "ACCESSID" }),
    REGION: services.awsService.getParameterFromAWS({ name: "REGION" }),
    AWS_SECRET: services.awsService.getSecretFromAWS("digismart"),
    BUCKET_NAME: services.awsService.getParameterFromAWS({ name: 'DIGISMART-BUCKET' }),
  };


}



export { DB, APP, ROLE, REDIS_CREDENTIAL, LOGS, USER_STATUS, AWS_CREDENTIAL, EMAIL_CREDENTIAL,SMS_CREDENTIAL, initializeAwsCredential };
