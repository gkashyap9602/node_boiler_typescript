const common_messages = {
    parameter_store_post_success: "Parameter Stored to AWS Successfully",
    parameter_store_post_error: "Error while Parameter Store to AWS",
    parameter_data_found: "Here is a parameter data",
    parameter_data_not_found: "Invalid Parameter Name",
    aws_error: "AWS Authenitication Failure",
    email_sent_error: "Error while sending email",
    email_sent_success: "Email Action Triggered",
    sms_sent_error: "Error while sending sms",
    sms_sent_success: "SMS Action Triggered",
    file_upload_error: "Unable to upload file to AWS S3",
    file_save_error: "Unable to save file ",
    file_upload_success: "File uploaded to AWS S3",
    no_video_file: "Please select a video file to proceed",
    no_video_thumb_file: "Please select a video thumb file to proceed",
    no_file: "Please select a file to upload",
    thumbnail_error: "Unable to create thumbnail at the moment",
    added_success: "Added Successfully",
    thumbnail_generated: "Thumbnail generated",
    server_error: "server error",
    updated_sucessfully: "updated sucessfully",
    data: "Data fetched successfully",
    database_error: "Data fetch unsucessfull",
    data_retreive_sucess: "Data retrieve successfully",
    data_not_found: "Data not found",
    data_save: "Data Saved Successfully",
    save_failed: "Error Occured while saving Data",
    already_existed: "Data already existed",
    not_exist: "Data not existed or invalid id",
    invalid_id: "invalid id",
    invalid_type: "invalid type",
    created_successfully: "created Successfully",
    update_sucess: "Updated Successfully",
    update_failed: "Error occured while updating",
    delete_failed: "Error occured while deleting",
    delete_sucess: "Deleted Successfully",
    img_save_err: "Error occured while saving Image",
    img_save_sucess: "Image Saved Successfully",
    password_incorrect: "Password Seems to be Incorrect",
    email_already: "Email is already registered with us",
    error_while_create_acc: "Error While Creating Account",
    contactUs_success: "We have received your query, we will get back to you soon",
    contactUs_error: "Oops! Something went wrong, Please try again",
    contactUs_list: "Contact Us List",
    contactUs_detail: "Contact Us Detail",
    contactUs_deleted: "Contact Us Deleted",
    contactUs_not_found: "Contact Us Not Found"
}

const middleware = {
    use_access_token: "Please use access token for identification not refresh token",
    use_refresh_token: "Please use refresh token to refresh your access token",
    invalid_access_token: "Invalid access token",
    disabled_account: "Your account login has been disabled by admin !!! contact support",
    deleted_account: "Your account is deleted permanent !!! contact support",
    deactivated_account: "Your account is deactivated contact support",
    token_expired: "your token has been expired or not valid",
    access_refreshed: "Access token is refreshed",
    invalid_admin: "Invalid Admin",
    invalid_user: "Invalid User",
}

export = {
    ...common_messages,
    middleware,
}