import NodeCache from "node-cache";
import AWS from 'aws-sdk'
import * as fsHelper from '../helpers/fs.helper'
// AWS.config.update({
//     region: "us-east-1",
//     credentials: new AWS.SharedIniFileCredentials({ profile: "digismart" }),
// });

import path from 'path'
import responseMessage from "../constants/ResponseMessage";
import * as mediaHelper from "../helpers/media.helper";
import fs from 'fs'
import { showResponse } from "../utils/response.util";
import { AWS_CREDENTIAL } from "../constants/app.constant";
import { postParameter, getParameter, ApiResponse } from "../utils/interfaces.util";
const cache = new NodeCache()
const ssm = new AWS.SSM()

const getParameterFromAWS = (input: getParameter) => {
    const cachedValue = cache.get(input?.name);
    if (cachedValue) {
        // Return the cached value
        return Promise.resolve(cachedValue);
    }
    return new Promise((resolve) => {
        try {
            const params = {
                Name: input.name,
                WithDecryption: true,
            };
            ssm.getParameter(params, (err: any, data: any) => {
                if (err) {
                    console.log("err", err);
                    return resolve(null);
                }
                cache.set(input.name, data.Parameter.Value);
                return resolve(data.Parameter.Value);
            });
        } catch (err) {
            console.log("in catch", err);
            return resolve(null);
        }
    });
};

const postParameterToAWS = (input: postParameter) => {
    return new Promise((resolve) => {
        try {
            const params = {
                Name: input?.name,
                Type: "String",
                Value: input?.value,
                Overwrite: true,
            };
            ssm.putParameter(params, () => {
                return resolve(true);
            });
        } catch (error) {
            console.log("in catch err", error);
            return resolve(false);
        }
    });
};

const getSecretFromAWS = async (secret_key_param: string) => {
    return new Promise((resolve) => {
        try {
            const client = new AWS.SecretsManager({
                region: 'use-east-1',
            });

            client.getSecretValue({ SecretId: secret_key_param }, (err: any, data: any) => {

                if (err) {
                    // console.error(err);
                    return resolve(false);
                }
                // console.log(data,"datadatadataAWSSECRET")
                const secretKey = JSON.parse(data.SecretString);
                // let response = { SecretString: secretKey?.digismart_secret }
                const response = secretKey[secret_key_param]
                return resolve(response);
            });
        } catch (e) {
            // console.log("err in catch", e);
            return resolve(false);
        }
    });
};


const sendSMSService = async (to: number, Message: string) => {
    return new Promise((resolve) => {
        try {
            const sns = new AWS.SNS();
            const params: any = {
                Message,
                PhoneNumber: to,
            };
            // Send the SMS
            sns.publish(params, (err, data) => {
                if (err) {
                    return resolve(
                        showResponse(
                            false,
                            responseMessage?.common?.sms_sent_error,
                            err,
                            200
                        )
                    );
                } else {
                    return resolve(
                        showResponse(
                            true,
                            responseMessage?.common?.sms_sent_success,
                            data,
                            200
                        )
                    );
                }
            });
        } catch (err) {
            console.log("in catch err", err);
            return resolve(
                showResponse(false, responseMessage?.common?.aws_error, err, 200)
            );
        }
    });
};

const uploadFileToS3 = async (files: [any]): Promise<ApiResponse> => {
    console.log(files, "filess>>>")
    return new Promise((resolve) => {
        try {
            const webpFilesArray: any = [];

            const promises = files.map(file => {
                const mime_type = file?.mimetype.split("/")[0];
                console.log(mime_type, "mimeTypess");
                if (mime_type == "image" && !file.originalname.endsWith(".psd")) {
                    console.log("under webp");
                    return mediaHelper.convertImageToWebp(file?.buffer).then(imageNewBuffer => {
                        if (imageNewBuffer) {
                            webpFilesArray.push({
                                fieldname: file.fieldname,
                                originalname: `${file.originalname}.webp`,
                                encoding: file.encoding,
                                mimetype: file.mimetype,
                                buffer: imageNewBuffer,
                                size: file.size,
                            });
                        }
                    });
                } else {
                    webpFilesArray.push(file);
                    return Promise.resolve(); // Return a resolved promise if no conversion is needed
                }
            });

            Promise.all(promises).then(() => {
                if (webpFilesArray.length > 0) {
                    uploadToS3(webpFilesArray).then(filesResponse => {
                        resolve(showResponse(true, responseMessage?.common?.file_upload_success, filesResponse, 200));
                    }).catch(error => {
                        console.log(`Error uploading files to S3`, error);
                        resolve(showResponse(false, responseMessage?.common?.file_upload_error, error, 200));
                    });
                } else {
                    resolve(showResponse(false, responseMessage?.common?.file_upload_error, null, 200));
                }
            }).catch(error => {
                console.log(`Error converting images to webp`, error);
                resolve(showResponse(false, responseMessage?.common?.file_upload_error, error, 200));
            });
        } catch (err) {
            console.log(`in catch error 472`, err);
            resolve(showResponse(false, responseMessage?.common?.file_upload_error, err, 200));
        }
    });

};

const uploadMultipleFilesToS3 = async (files: any) => {
    const s3 = new AWS.S3({
        accessKeyId: await AWS_CREDENTIAL.ACCESSID,
        secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
        region: await AWS_CREDENTIAL.REGION
    });

    const bucketName = await AWS_CREDENTIAL.BUCKET_NAME;

    try {
        const uploadedKeys: any = [];

        await Promise.all(files.map((fileData: any) => {
            return new Promise((resolve) => {
                const { filename, mimeType, fieldname, buffer } = fileData;

                const params: any = {
                    Bucket: bucketName
                };

                const mediaType = mimeType.split('/')[0];
                const extension = path.extname(filename);

                let bodyPromise;

                if (mediaType == 'image') {
                    params['ContentType'] = 'image/webp';
                    params['Key'] = `${fieldname}/${Math.floor(Math.random() * 10000000)}.webp`;
                    bodyPromise = mediaHelper.convertImageToWebp(Buffer.from(buffer));
                } else {
                    params['ContentType'] = mimeType;
                    params['Key'] = `${fieldname}/${Math.floor(Math.random() * 10000000)}${extension}`;
                    bodyPromise = Promise.resolve(Buffer.from(buffer));
                }

                bodyPromise.then(body => {
                    params['Body'] = body;
                    s3.upload(params).promise()
                        .then(uploadResult => {
                            uploadedKeys.push(uploadResult.Key);
                            resolve(uploadResult.Key);
                        })
                        .catch(err => resolve(err));
                }).catch(err => resolve(err));
            });
        }));

        return { status: true, data: uploadedKeys };
    } catch (err) {
        console.error('Error uploading files to S3:', err);
        return { status: false, data: err };
    }
};

const uploadQueueMediaToS3 = async (files: any) => { //files should be in an array 

    // console.log(AWS_CREDENTIAL, "AWS_CREDENTIALAWS_SECRET")
    const s3 = new AWS.S3({
        accessKeyId: await AWS_CREDENTIAL.ACCESSID,
        secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
        region: await AWS_CREDENTIAL.REGION,
    });

    const bucketName = await AWS_CREDENTIAL.BUCKET_NAME;

    return new Promise(async (resolve, reject) => {
        try {
            const uploadedKeys: any = [];

            await Promise.all(files.map(async (fileData: any) => {
                const { filename, mimeType, fieldName, filePath } = fileData;

                // const extension = path.extname(filename)
                const filepath = path.join(filePath)

                console.log(filePath, "filepthhh")

                const params: any = {
                    Bucket: bucketName,
                    ContentType: mimeType?.indexOf("image") >= 0 ? "image/webp" : mimeType,
                    Key: `${fieldName}/${filename}`,
                    Body: '',
                };

                if (mimeType?.indexOf("image") >= 0) {
                    params.Body = await mediaHelper.convertImageToWebp(fs.readFileSync(filepath))
                } else {
                    params.Body = fs.readFileSync(filepath)
                }

                const uploadResult: any = await s3.upload(params).promise();

                uploadedKeys.push(uploadResult.Key || uploadResult.key);

                // fs.unlinkSync(filepath)
                fs.unlink(filepath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                    console.log('File deleted successfully');
                });
            }));

            resolve(uploadedKeys); //success
        } catch (err) {
            console.error('Error uploading files to S3 ', err);
            reject(err); //error
        }
    });
}


const uploadToS3ExcelSheet = async (excelBuffer: any, fileName: any) => {

    const ACCESSID = await AWS_CREDENTIAL.ACCESSID
    const AWS_SECRET = await AWS_CREDENTIAL.AWS_SECRET
    const REGION = await AWS_CREDENTIAL.REGION
    const BUCKET_NAME = await AWS_CREDENTIAL.BUCKET_NAME

    return new Promise((resolve) => {
        try {

            const s3 = new AWS.S3({
                accessKeyId: ACCESSID,
                secretAccessKey: AWS_SECRET,
                region: REGION
            });

            const bucketName = BUCKET_NAME;

            const params: any = {
                Bucket: bucketName,
                ContentType: 'application/xlsx',
                Key: fileName,
                Body: excelBuffer
            };
            s3.upload(params, (error: any, data: any) => {
                if (error) {
                    resolve(null)
                } else {
                    resolve(data.key ? data?.key : data.Key);
                }
            });
        } catch (err: any) {
            resolve({ status: false, message: 'Error Occured!!', data: err.message, code: 200 });
        }
    });
}


const uploadToS3 = async (files: any[], key?: string) => {
    try {
        // console.log(AWS_CREDENTIAL, "AWS_CREDENTIALAWS_SECRET")
        const s3 = new AWS.S3({
            accessKeyId: await AWS_CREDENTIAL.ACCESSID,
            secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
            region: await AWS_CREDENTIAL.REGION,
        });

        const bucketName = await AWS_CREDENTIAL.BUCKET_NAME;

        const s3UploadPromises = files.map((file: any) => {
            return new Promise((resolve) => {
                const bufferImage = key ? file : file.buffer;
                const ext: any = path.extname(file?.originalname ?? file?.fieldname ?? file?.mimetype);
                let fileName: string = "";
                console.log(file.mimetype, "mimeeeeMMM");

                if (file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0) {
                    // image file
                    fileName = `${file.fieldname}-${Date.now().toString()}-${file?.originalname?.replace('.webp')}.webp`;
                } else {
                    fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;
                }
                fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;

                const params: any = {
                    Bucket: bucketName,
                    ContentType: file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0 ? "image/webp" : file?.mimetype,
                    Key: `${file.fieldname}/${fileName}`,
                    Body: bufferImage,
                };

                console.log(params, "paramsss")
                s3.upload(params, (error: Error, data: any) => {

                    console.log(error, "error");
                    console.log(data, "data");
                    if (error) {
                        console.log("bucketerror", error);
                        resolve(null);
                    } else {
                        console.log("bucketdata", data);
                        resolve(data.Key || data.key);
                    }
                });
            });
        });
        const s3UploadResults = await Promise.all(s3UploadPromises);
        // console.log(s3UploadResults, "s3UploadResults");
        return s3UploadResults;

    } catch (error) {
        console.log(error, "errorrr s3upload")
        return error
    }
};


const unlinkFromS3Bucket = async (fileUrls: any) => { //fileUrls should be array of urls and mandatory 
    try {
        // console.log(files, "filessss uploadToS3 side");
        const s3 = new AWS.S3({
            accessKeyId: await AWS_CREDENTIAL.ACCESSID,
            secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
            region: await AWS_CREDENTIAL.REGION,
        });

        const bucketName = await AWS_CREDENTIAL.BUCKET_NAME

        const unlinkFromS3Promises = fileUrls.map(async (url: any) => {

            return new Promise((resolve) => {
                const params = {
                    Bucket: bucketName,
                    Key: url,
                };
                console.log(params, "apramsss");
                //check if file exist in this path or not
                s3.headObject(params).promise()
                    .then(() => {
                        // console.log("File Found in S3", res)
                        s3.deleteObject(params, (err, data) => {
                            if (err) {
                                // console.error('Error deleting object:', err);
                                resolve(
                                    showResponse(
                                        false,
                                        'Error deleting object on s3 bucket',
                                        err,
                                        400
                                    ));
                            } else {
                                console.log('Object deleted successfully:', data);
                                resolve(
                                    showResponse(
                                        true,
                                        'Object deleted successfully from s3 bucket',
                                        data,
                                        200
                                    ));
                            }
                        });
                    })
                    .catch((err) => {
                        // console.log(err, "errerrerr");
                        resolve(
                            showResponse(
                                false,
                                'item not found on s3 bucket While unlinking from s3 bucket',
                                err,
                                400
                            ));
                    })

            })

        })

        const s3UnlinkResults = await Promise.all(unlinkFromS3Promises);
        console.log(s3UnlinkResults, "s3UnlinkResults");
        return s3UnlinkResults;

    } catch (error) {
        console.log(error, "errorrr s3upload")
        return error
    }
};//ends

//files -->> multer req.files  array of object 
const uploadVideoAndTranscode = async (files: any, media_type = 'videos') => {
    try {
        const ACCESSID = await AWS_CREDENTIAL.ACCESSID
        const AWS_SECRET = await AWS_CREDENTIAL.AWS_SECRET
        const REGION = await AWS_CREDENTIAL.REGION
        const output_bucket_name = await AWS_CREDENTIAL.BUCKET_NAME
        const input_bucket_name = await AWS_CREDENTIAL.BUCKET_NAME

        const s3 = new AWS.S3({
            accessKeyId: ACCESSID,
            secretAccessKey: AWS_SECRET,
            region: REGION,
        });

        const pipeline_id = await getParameterFromAWS({ name: "PIPELINE_ID" })
        const ElasticTranscoder = new AWS.ElasticTranscoder({ region: REGION, apiVersion: '2012-09-25' });

        // let preset_high_quality = await createPreset(ElasticTranscoder)
        // console.log(preset_high_quality, "preset_high_quality")
        // Get the URLs of the transcoded files
        // const transcoded_video_baseUrl = await getParameterFromAWS({ name: videoBaseName })
        // const transcoded_video_baseUrl = BUCKET_URL

        // let fileName = Date.now().toString() + Math.floor(Math.random() * 1000);

        const s3UploadPromises = files?.map(async (file: any) => {
            return new Promise(async (resolve) => {
                const ext: any = path.extname(file?.originalname ?? file?.fieldname ?? file?.mimetype);
                const fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;

                if (file?.mimetype.indexOf("image") >= 0) {
                    const imageNewBuffer = await mediaHelper.convertImageToWebp(file?.buffer);
                    if (imageNewBuffer) {
                        const params = {
                            Bucket: input_bucket_name,
                            ContentType: "image/webp",
                            Key: fileName + "/" + fileName + ".webp",
                            Body: imageNewBuffer,
                        };
                        s3.upload(params, (error: any, data: any) => {
                            if (error) {
                                console.log('bucketerror', error)
                                resolve(null);
                            } else {
                                resolve({ thumb_url: data.key });
                            }
                        });
                    }

                } else if (file?.mimetype.indexOf("video") >= 0) { //VIDEO TRANSCODE

                    console.log("videoTranscodeSIde")
                    // const fileExt = path.extname(file?.originalname)
                    const folder_Key = `${file.fieldname}/${media_type}/${fileName}`

                    const upload_params = {
                        Bucket: input_bucket_name,
                        ContentType: file?.mimetype,
                        Key: folder_Key,
                        Body: file?.buffer,
                    }
                    s3.upload(upload_params, async (error: any, data: any) => {
                        if (error) {
                            console.log('file upload to s3 error', error)
                            return resolve(null);
                        }

                        // Set output prefix
                        const OutputKeyPrefix = `${data?.Key.split('.')[0]}/`; //it is the path where files stored

                        console.log(OutputKeyPrefix, "OutputKeyPrefix")

                        // Set the output parameters
                        const outputs = [
                            {
                                Key: OutputKeyPrefix + 'hls_400k',
                                PresetId: '1351620000001-200050',
                                SegmentDuration: '10'
                            },
                            {
                                Key: OutputKeyPrefix + 'hls_1m',
                                PresetId: '1351620000001-200030',
                                SegmentDuration: '10'
                            },
                            {
                                Key: OutputKeyPrefix + 'hls_2m',
                                PresetId: '1351620000001-200010',
                                SegmentDuration: '10'
                            },
                            {
                                Key: OutputKeyPrefix + 'thumbnails',
                                PresetId: '1351620000001-200030', // Preset for generating thumbnails
                                ThumbnailPattern: OutputKeyPrefix + 'thumbnails/thumbnail-{count}', // Pattern for thumbnail file names
                            }
                        ];

                        // Set the input parameters
                        const input = { Key: data?.Key };

                        // Set the job parameters
                        const params: any = {
                            PipelineId: pipeline_id,
                            Input: input,
                            Outputs: outputs,
                        };

                        console.log('job_created')
                        // Create the transcoding job
                        const jobResponse = await ElasticTranscoder.createJob(params).promise();

                        console.log(jobResponse, "jobResponse")
                        // Extract thumbnail URLs from the job response
                        const hls400kUrl = `${OutputKeyPrefix}hls_400k.m3u8`;
                        const hls1mUrl = `${OutputKeyPrefix}hls_1m.m3u8`;
                        const hls2mUrl = `${OutputKeyPrefix}hls_2m.m3u8`;
                        // const hls400kUrl = `${transcoded_video_baseUrl}${OutputKeyPrefix}hls_400k.m3u8`;
                        // const hls1mUrl = `${transcoded_video_baseUrl}${OutputKeyPrefix}hls_1m.m3u8`;
                        // const hls2mUrl = `${transcoded_video_baseUrl}${OutputKeyPrefix}hls_2m.m3u8`;

                        // Create the playlist string
                        const playlistString = "#EXTM3U\n" +
                            "#EXT-X-VERSION:3\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360\n" +
                            hls400kUrl + "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=960x540\n" +
                            hls1mUrl + "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\n" +
                            hls2mUrl + "\n";

                        // Create playlist.m3u8 file
                        const playlistParams = {
                            Bucket: output_bucket_name,
                            Key: `${OutputKeyPrefix}playlist.m3u8`,
                            ContentType: 'application/x-mpegURL',
                            Body: playlistString
                        };

                        console.log("put objectt", playlistParams.Key)

                        const transcode_output = {
                            video_url: playlistParams.Key,
                            thumb_url: OutputKeyPrefix + 'thumbnails/thumbnail-{count}'
                        }

                        const transcode_res = await s3.putObject(playlistParams).promise();

                        if (transcode_res && transcode_res.ETag && transcode_res.ServerSideEncryption) {
                            resolve({ status: true, data: { ...transcode_output } });
                        } else {
                            resolve({ status: false, data: null });
                            console.log('Object upload failed:', transcode_res);
                        }

                    })
                } else {
                    resolve({ status: false, data: null });
                }
            })
        })

        //resolve all promises
        const s3UploadResults = await Promise.all(s3UploadPromises);

        console.log(s3UploadResults, "s3UploadResults")


        const trancode_result = {
            video_url: "",
            thumb_url: ""

        }

        s3UploadResults?.map((resp) => {
            if (resp && resp?.data?.video_url) {
                trancode_result.video_url = resp?.data?.video_url
                trancode_result.thumb_url = resp?.data?.thumb_url
            }
        })

        if (trancode_result?.video_url) {
            return showResponse(true, responseMessage?.common?.file_upload_success, trancode_result, 200)
        }

        return showResponse(false, responseMessage?.common?.file_upload_error, null, 200)
    } catch (err) {
        console.log(`Error creating transcoding job`, err);
        return showResponse(false, responseMessage?.common?.file_upload_error, err, 200)
    }
} //ends

const uploadThumbnail = async (thumbnailUploadParams: any, thumbnail_file_path: any) => {

    const s3 = new AWS.S3({
        accessKeyId: await AWS_CREDENTIAL.ACCESSID,
        secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
        region: await AWS_CREDENTIAL.REGION,
    });

    const bucketName = await AWS_CREDENTIAL.BUCKET_NAME;
    thumbnailUploadParams.Bucket = bucketName //define bucket name

    return new Promise((resolve, reject) => {
        s3.upload(thumbnailUploadParams, (err: any, data: any) => {
            fs.unlink(thumbnail_file_path, (unlinkErr: any) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                    reject(unlinkErr);
                    return;
                }
                console.log('File deleted successfully');

                if (err) {
                    console.error('Thumbnail upload error:', err);
                    resolve(showResponse(false, responseMessage?.common?.thumbnail_error, err, 200));
                    return;
                }
                resolve(showResponse(true, responseMessage?.common?.thumbnail_generated, data?.Key || data?.key, 200));
            });
        });
    });
}

export {
    getParameterFromAWS,
    postParameterToAWS,
    getSecretFromAWS,
    unlinkFromS3Bucket,
    sendSMSService,
    uploadVideoAndTranscode,
    uploadFileToS3,
    uploadMultipleFilesToS3,
    uploadToS3ExcelSheet,
    uploadToS3,
    uploadThumbnail,
    uploadQueueMediaToS3

}