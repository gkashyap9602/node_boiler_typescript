import dotenv from "dotenv";
import path from "path";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

import services from "../services";
import { AwsCredential, RoleType } from "../utils/interfaces.util";
import { getEnvironmentParams } from "../utils/common.util";

let parmsFetchFromAws = getEnvironmentParams(process.env.ENV_MODE, 'BOILERPLATE') //2nd parm is project name 
// console.log(parmsFetchFromAws, "parmsFetchFromAws")


let AWS_CREDENTIAL: AwsCredential = {
  MONGO_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DBNAME,
  ACCESSID: services.awsService.getParameterFromAWS({ name: "ACCESSID" }),
  REGION: services.awsService.getParameterFromAWS({ name: "REGION" }),
  BUCKET_NAME: services.awsService.getParameterFromAWS({ name: "DIGISMART-BUCKET" }),
  AWS_SECRET: services.awsService.getSecretFromAWS("digismart_secret"),
};


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


export { DB, APP, ROLE, REDIS_CREDENTIAL, LOGS, USER_STATUS, AWS_CREDENTIAL, EMAIL_CREDENTIAL };
