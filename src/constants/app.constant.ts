import dotenv from "dotenv";
import path from "path";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
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

interface RoleType {
  ADMIN: number;
  SUB_ADMIN: number;
  USER: number;
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

export { DB, APP, ROLE, REDIS_CREDENTIAL, LOGS, USER_STATUS };
