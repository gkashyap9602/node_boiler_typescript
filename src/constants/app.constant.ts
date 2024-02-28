import dotenv from "dotenv";
import path from "path";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}
import services from "../services";
import { AwsCredential, RoleType } from "../utils/interfaces.util";

let AWS_CREDENTIAL: AwsCredential

async function initializeAWSCredentials() {
  try {

    let ACCESSID = await services.awsService.getParameterFromAWS({ name: "ACCESSID" })
    let REGION = await services.awsService.getParameterFromAWS({ name: "REGION" })
    let BUCKET_NAME = await services.awsService.getParameterFromAWS({ name: "DIGISMART-BUCKET" })
    let AWS_SECRET: any = await services.awsService.getSecretFromAWS("digismart")

    if (typeof ACCESSID == 'string' && typeof REGION == 'string' && typeof BUCKET_NAME == 'string' && AWS_SECRET) {

      AWS_CREDENTIAL = {
        ACCESSID,
        REGION,
        BUCKET_NAME,
        AWS_SECRET: AWS_SECRET.SecretString,
      };

      return { status: true, message: "Aws credential Fetched Successfully" }

    } else {

      return { status: false, message: "Error initializing AWS credentials" }
    }

  } catch (error) {
    return { status: false, message: "Error initializing AWS credentials" }
  }
}


const APP = {
  ACCESS_EXPIRY: "1d",
  REFRESH_EXPIRY: "30d",
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.SECRET || "secret",
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  FRONTEND_URL: process.env.FRONTEND_URL,
  BITBUCKET_URL: process.env.BITBUCKET_URL,

};

const DB = {
  DBNAME: process.env.DBNAME,
  MONGODB_URI: process.env.MONGODB_URI,
};

const EMAIL_CREDENTIAL = {
  SENDGRID_API: process.env.SENDGRID_API,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_HOST: process.env.EMAIL_HOST
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


export { DB, APP, ROLE, REDIS_CREDENTIAL, LOGS, USER_STATUS, AWS_CREDENTIAL, EMAIL_CREDENTIAL, initializeAWSCredentials };
