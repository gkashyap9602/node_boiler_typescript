import services from "../services";
import dotenv from "dotenv";
import path from "path";
import { AwsCredential, RoleType, AppConstant, DbConstant, EmailConstant, SMSConstant, StripeCredential } from "../utils/interfaces.util";
import { getEnvironmentParams } from "../utils/config.util";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

//1st parm is Environment mode -> DEV,PROD,STAG 
//2nd parm is project name 
//3rd parm is project Initial 
const ENV_PARMAS = getEnvironmentParams(process.env.ENV_MODE, 'BOILERPLATE', 'BP')
console.log(ENV_PARMAS, "Parms For Aws Parameter store")

const { ADMIN_EMAIL } = ENV_PARMAS

let AWS_CREDENTIAL: AwsCredential
let STRIPE_CREDENTIAL: StripeCredential

const APP: AppConstant = {
  ACCESS_EXPIRY: "1d",
  REFRESH_EXPIRY: "30d",
  PORT: process.env.PORT || 8000,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  BITBUCKET_URL: process.env.BITBUCKET_URL || '',
  JWT_SECRET: process.env.SECRET || "secret",
  ADMIN_CRED_EMAIL: ADMIN_EMAIL,
  FILE_SIZE: 100, //SPECIFY IN MB
  PROJECT_NAME: 'Boilerplate',

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
const initializeAwsCredential = async () => {

  // DB.MONGODB_URI = services.awsService.getParameterFromAWS({ name: DB_URI })
  // DB.DB_NAME = services.awsService.getParameterFromAWS({ name: DB_NAME })

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

  // STRIPE_CREDENTIAL = {
  //   STRIPE_PB_KEY: services.awsService.getParameterFromAWS({ name: "STRIPE_PB_KEY" }),
  //   STRIPE_SEC_KEY: services.awsService.getParameterFromAWS({ name: 'STRIPE_SEC_KEY' }),
  //   STRIPE_VERSION: '2024-04-10'
  // };


}



export { STRIPE_CREDENTIAL, DB, APP, ROLE, REDIS_CREDENTIAL, LOGS, USER_STATUS, AWS_CREDENTIAL, EMAIL_CREDENTIAL, SMS_CREDENTIAL, initializeAwsCredential };
