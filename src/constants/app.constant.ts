import services from "../services";
import dotenv from "dotenv";
import path from "path";
import { AwsCredential, AppConstant, DbConstant, EmailConstant, SMSConstant, StripeCredential } from "../utils/interfaces.util";
import { getEnvironmentParams } from "../utils/config.util";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

//1st parm is Environment mode -> DEV,PROD,STAG 
//2nd parm is project name 
//3rd parm is project Initial 
const ENV_PARMAS = getEnvironmentParams(process.env.ENV_MODE, 'BOILERPLATE', 'BP')
console.log(ENV_PARMAS, "Parms_For_Aws_Parameter_store")

const { ADMIN_EMAIL, ACCESSID, REGION, DB_URI, BUCKET, SMTP_API_KEY, STMP_EMAIL } = ENV_PARMAS

let AWS_CREDENTIAL: AwsCredential
let STRIPE_CREDENTIAL: StripeCredential

const APP: AppConstant = {
  ACCESS_EXPIRY: "1d",
  REFRESH_EXPIRY: "30d",
  PORT: process.env.PORT || 8000,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  BITBUCKET_URL: process.env.BITBUCKET_URL || 'https://d3es0oifverjtu.cloudfront.net',
  OUTPUT_BITBUCKET_URL: process.env.OUTPUT_BITBUCKET_URL || '',
  JWT_SECRET: process.env.SECRET || "secretOrangeLionShadowPaperFrostWindowGloveSkyrocket",
  ADMIN_CRED_EMAIL: ADMIN_EMAIL,
  FILE_SIZE: 100, //SPECIFY IN MB
  PROJECT_NAME: 'Boilerplate',
  PROJECT_LOGO: 'file/file-1735634891680.webp'
};

const DB: DbConstant = {
  DB_NAME: process.env.DB_NAME || '',
  MONGODB_URI: process.env.MONGODB_URI || '',
};

const EMAIL_CREDENTIAL: EmailConstant = {
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_API_KEY: process.env.SMTP_API_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST
}

const SMS_CREDENTIAL: SMSConstant = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  SEND_FROM_HOST: process.env.SEND_FROM_HOST,
}

const LOGS = {
  morgan: process.env.MORGAN,
};

const REDIS_CREDENTIAL = {
  URI: "127.0.0.1",
  PORT: 6379,
};

//***** MAKE SURE FOR  DEV, PROD, AND STAGE ENVIOREMENENT USER ENV_PARMAS THAT ABOVE SHOWS AND SAVE IT IN AWS WITH SAME NAME  ******/
const initializeAwsCredential = async () => {
  //call this function when paramters are stored to aws 
  DB.MONGODB_URI = services.awsService.getParameterFromAWS({ name: DB_URI })
  APP.JWT_SECRET = services.awsService.getParameterFromAWS({ name: "API_SECRET" })
  EMAIL_CREDENTIAL.SMTP_EMAIL = services.awsService.getParameterFromAWS({ name: STMP_EMAIL })
  EMAIL_CREDENTIAL.SMTP_API_KEY = services.awsService.getParameterFromAWS({ name: SMTP_API_KEY })
  AWS_CREDENTIAL = {
    ACCESSID: services.awsService.getParameterFromAWS({ name: ACCESSID }),
    REGION: services.awsService.getParameterFromAWS({ name: REGION }),
    AWS_SECRET: services.awsService.getSecretFromAWS("digismart_secret"),
    BUCKET_NAME: services.awsService.getParameterFromAWS({ name: BUCKET }),
    COLLECTION_ID_AWS_REKOGNITION: process.env.COLLECTION_ID_AWS_REKOGNITION, //use it if want to use image search in project
  };


  //************If Twilio Used In Project**************** */
  // SMS_CREDENTIAL.TWILIO_AUTH_TOKEN = services.awsService.getParameterFromAWS({ name: 'TWILIO_AUTH_TOKEN' })
  // SMS_CREDENTIAL.TWILIO_AUTH_TOKEN = services.awsService.getParameterFromAWS({ name: 'TWILIO_AUTH_TOKEN' })

  //************If Stripe Used In Project**************** */
  // STRIPE_CREDENTIAL = {
  //   STRIPE_PB_KEY: services.awsService.getParameterFromAWS({ name: ENV_PARMAS.STRIPE_PB_KEY }),
  //   STRIPE_SEC_KEY: services.awsService.getParameterFromAWS({ name: ENV_PARMAS.STRIPE_SEC_KEY }),
  //   STRIPE_VERSION: '2024-04-10'
  // };

}

export {
  STRIPE_CREDENTIAL,
  DB,
  APP,
  REDIS_CREDENTIAL,
  LOGS,
  AWS_CREDENTIAL,
  EMAIL_CREDENTIAL,
  SMS_CREDENTIAL,
  initializeAwsCredential
};
