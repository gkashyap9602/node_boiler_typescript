
export interface ApiResponse {
    status: boolean;
    message: string;
    data?: any;
    code: number;
}


export interface AwsCredential {
    ACCESSID: any;
    REGION: any;
    BUCKET_NAME: any;
    AWS_SECRET: any;
}


export interface AppConstant {
    ACCESS_EXPIRY: string;
    REFRESH_EXPIRY: string;
    PORT: number | string;
    API_PREFIX: string;
    FRONTEND_URL: string;
    BITBUCKET_URL: string;
    ADMIN_CRED_EMAIL:string
    JWT_SECRET: any,
    FILE_SIZE: number
}

export interface DbConstant {
    DB_NAME: any;
    MONGODB_URI: any;

}

export interface EmailConstant {
    SENDGRID_API: any;
    SENDGRID_API_KEY: any;
    EMAIL_HOST: any;
}

export interface SMSConstant {
    TWILIO_ACCOUNT_SID: any;
    TWILIO_AUTH_TOKEN: any;
    SEND_FROM_HOST: any;
}


export interface postParameter {
    name: string;
    value: string;
}

export interface getParameter {
    name: string;
}

export interface RoleType {
    ADMIN: number;
    SUB_ADMIN: number;
    USER: number;
}

