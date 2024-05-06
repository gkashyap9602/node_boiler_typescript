const statusCodes = {
    SUCCESS: 200,                  // ok
    API_ERROR: 400,                // bad request 
    AUTH_TOKEN_ERROR: 401,         // Authentication error
    REFRESH_TOKEN_ERROR: 403,         // Refresh Token Expiry error
    FILE_UPLOAD_ERROR: 422,        // unprocessible entity
    VALIDATION_ERROR: 417,         // expectation failed
    ACCOUNT_DISABLED: 403,        //  no longer available
    ACCOUNT_DELETED: 410,        //  no longer available
    SERVER_TRYCATCH_ERROR: 500, // server error 
    TOO_MANY_REQUESTS: 429, // Too Many Request

}

export default statusCodes

