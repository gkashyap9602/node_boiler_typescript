import ResponseMessage from "../constants/ResponseMessage";
import statusCodes from "../constants/statusCodes";
import { ApiResponse } from "../utils/interfaces.util";
import { showResponse } from "../utils/response.util";
import * as processQueue from './redis.queue'

//thease files are multer uploaded files in array
const uploadFiles = async (files: any, media_type: number): Promise<ApiResponse> => {
    // console.log(files, "filesfiles")
    if (files?.length === 0) {
        return showResponse(false, ResponseMessage?.common.no_file, {}, statusCodes.FILE_UPLOAD_ERROR);
    }

    const QueryData = {
        media_type
    }

    // console.log(files?.length, "handlerlenghttt")
    files?.map((files: any, index: number) => {
        let fileBuffer = files.fileBuffer
        let fileObj = files
        delete fileObj.fileBuffer //delete fileBuffer from fileObj instead send it seperatly above
        processQueue.initizalizeMediaQueue(fileObj, index, fileBuffer, QueryData)
        // console.log(index, "indexxx Queue Init")
    })

    return showResponse(true, 'Uploading Process Starts Successfully', {}, statusCodes.SUCCESS)

}