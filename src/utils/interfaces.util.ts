
export interface ApiResponse {
    status: boolean;
    message: string;
    data?: any;
    other?: any;
    code: number;
}

export interface AwsCredential {
    ACCESSID: string;
    REGION: string;
    BUCKET_NAME: string;
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
  
  