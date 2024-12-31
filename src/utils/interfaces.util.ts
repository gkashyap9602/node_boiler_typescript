
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
    COLLECTION_ID_AWS_REKOGNITION: any;

}

export interface StripeCredential {
    STRIPE_PB_KEY: any;
    STRIPE_SEC_KEY: any;
    STRIPE_VERSION: any;

}

export interface AppConstant {
    ACCESS_EXPIRY: string;
    REFRESH_EXPIRY: string;
    PORT: number | string;
    API_PREFIX: string;
    FRONTEND_URL: string;
    OUTPUT_BITBUCKET_URL: string;
    BITBUCKET_URL: string;
    ADMIN_CRED_EMAIL: string
    JWT_SECRET: any,
    FILE_SIZE: number,
    PROJECT_NAME: string
    PROJECT_LOGO: string
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

// Define an enum for the email send types
export enum EmailSendType {
    REGISTER_EMAIL = 'register',
    FORGOT_PASSWORD_EMAIL = 'forgot_password',
    SEND_OTP_EMAIL = 'resend_otp',
}


export interface IRecordOfAny {
    [key: string]: any; // Allows any type but still provides an index signature
}
