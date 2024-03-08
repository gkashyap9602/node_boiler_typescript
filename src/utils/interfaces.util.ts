
export interface ApiResponse {
    status: boolean;
    message: string;
    data?: any;
    other?: any;
    code: number;
}

export interface AwsCredential {
    MONGO_URI: any
    DB_NAME: any
    ACCESSID: any;
    REGION: any;
    BUCKET_NAME: any;
    AWS_SECRET: any;
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

