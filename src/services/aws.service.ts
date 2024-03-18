import NodeCache from "node-cache";
import AWS from 'aws-sdk'

AWS.config.update({
    region: "us-east-1",
    credentials: new AWS.SharedIniFileCredentials({ profile: "digismart" }),
});

import mimeTypes from 'mime-types'
import path from 'path'
import responseMessage from "../constants/responseMessage.constant";
import * as commonHelper from "../helpers/common.helper";
import ffmpeg from 'fluent-ffmpeg'
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
    return new Promise(async (resolve, reject) => {
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
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Name: input?.name,
                Type: "String",
                Value: input?.value,
                Overwrite: true,
            };
            ssm.putParameter(params, (err, output) => {
                return resolve(true);
            });
        } catch (error) {
            console.log("in catch err", error);
            return resolve(false);
        }
    });
};

const getSecretFromAWS = (secret_key_param: string) => {
    return new Promise((resolve, reject) => {
        try {
            const client = new AWS.SecretsManager({
                region: "us-east-1",
            });

            client.getSecretValue({ SecretId: secret_key_param }, (err: any, data: any) => {

                if (err) {
                    console.error(err);
                    return resolve(false);
                }
                // console.log(data,"datadatadataAWSSECRET")
                let secretKey = JSON.parse(data.SecretString);
                // let response = { SecretString: secretKey?.digismart_secret }
                let response = secretKey?.digismart_secret
                return resolve(response);
            });
        } catch (e) {
            console.log("err in catch", e);
            return resolve(false);
        }
    });
};


const sendSMSService = async (to: number, Message: string) => {
    return new Promise(async (resolve, reject) => {
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
                            null,
                            200
                        )
                    );
                } else {
                    return resolve(
                        showResponse(
                            true,
                            responseMessage?.common?.sms_sent_success,
                            data,
                            null,
                            200
                        )
                    );
                }
            });
        } catch (err) {
            console.log("in catch err", err);
            return resolve(
                showResponse(false, responseMessage?.common?.aws_error, err, null, 200)
            );
        }
    });
};



const uploadVideoToS3 = async (files: []) => {
    try {

        const s3 = new AWS.S3({
            accessKeyId: await AWS_CREDENTIAL.ACCESSID,
            secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
            region: await AWS_CREDENTIAL.REGION,
        });


        let fileName = Date.now().toString() + Math.floor(Math.random() * 1000);
        const VideoOutputBucket = await getParameterFromAWS({
            name: "VideoOutputBucket",
        });
        const s3UploadPromises = files?.map(async (file: any) => {
            return new Promise(async (resolve, reject) => {
                if (file?.mimetype.indexOf("image") >= 0) {
                    let imageNewBuffer = await commonHelper.convertImageToWebp(file?.buffer);
                    if (imageNewBuffer) {
                        const params: any = {
                            Bucket: VideoOutputBucket,
                            ContentType: "image/webp",
                            Key: fileName + "/" + fileName + ".webp",
                            Body: imageNewBuffer,
                        };
                        s3.upload(params, (error: any, data: any) => {
                            if (error) {
                                console.log("bucketerror", error);
                                resolve(null);
                            } else {
                                resolve({ thumb_url: data.key });
                            }
                        });
                    }
                } else if (file?.mimetype.indexOf("video") >= 0) {
                    let fileExt = path.extname(file?.originalname);
                    const ElasticTranscoder = new AWS.ElasticTranscoder({
                        region: await AWS_CREDENTIAL.REGION,
                        apiVersion: "2012-09-25",
                    });
                    let VideoInputBucket = await getParameterFromAWS({
                        name: "VideoInputBucket",
                    });
                    let filePath = fileName + fileExt;
                    const params: any = {
                        Bucket: VideoInputBucket,
                        ContentType: file?.mimetype,
                        Key: filePath,
                        Body: file?.buffer,
                    };
                    s3.upload(params, async (error: any, data: any) => {
                        if (error) {
                            console.log("file upload to s3 error", error);
                            return resolve(null);
                        }
                        // Set the pipeline ID and output prefix
                        const PipeLineId = await getParameterFromAWS({
                            name: "PipeLineId",
                        });
                        const OutputKeyPrefix = `${data?.Key.split(".")[0]}/`;
                        // Set the output parameters
                        const outputs = [
                            {
                                Key: OutputKeyPrefix + "hls_400k",
                                PresetId: "1351620000001-200050",
                                SegmentDuration: "10",
                            },
                            {
                                Key: OutputKeyPrefix + "hls_1m",
                                PresetId: "1351620000001-200030",
                                SegmentDuration: "10",
                            },
                            {
                                Key: OutputKeyPrefix + "hls_2m",
                                PresetId: "1351620000001-200010",
                                SegmentDuration: "10",
                            },
                        ];
                        // Set the input parameters
                        const input = {
                            Key: data?.Key,
                        };
                        // Set the job parameters
                        const params: any = {
                            PipelineId: PipeLineId,
                            Input: input,
                            Outputs: outputs,
                        };
                        // Create the transcoding job
                        await ElasticTranscoder.createJob(params).promise();
                        // Get the URLs of the transcoded files
                        const VideoBase = await getParameterFromAWS({ name: "VideoBase" });
                        const hls400kUrl = `${VideoBase}${OutputKeyPrefix}hls_400k.m3u8`;
                        const hls1mUrl = `${VideoBase}${OutputKeyPrefix}hls_1m.m3u8`;
                        const hls2mUrl = `${VideoBase}${OutputKeyPrefix}hls_2m.m3u8`;
                        // Create the playlist string
                        const playlistString =
                            "#EXTM3U\n" +
                            "#EXT-X-VERSION:3\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360\n" +
                            hls400kUrl +
                            "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=960x540\n" +
                            hls1mUrl +
                            "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\n" +
                            hls2mUrl +
                            "\n";
                        // Create playlist.m3u8 file
                        const playlistParams: any = {
                            Bucket: VideoOutputBucket,
                            Key: `${OutputKeyPrefix}playlist.m3u8`,
                            ContentType: "application/x-mpegURL",
                            Body: playlistString,
                        };
                        await s3.putObject(playlistParams).promise();
                        resolve({ video_url: playlistParams.Key });
                    });
                } else {
                    resolve(null);
                }
            });
        });
        const s3UploadResults = await Promise.all(s3UploadPromises);
        let video_url = null;
        s3UploadResults?.map((resp: any) => {
            if (resp && resp?.video_url) {
                video_url = resp?.video_url;
            }
        });
        if (video_url) {
            return showResponse(
                true,
                responseMessage?.common?.file_upload_success,
                video_url,
                null,
                200
            );
        }
        return showResponse(
            false,
            responseMessage?.common?.file_upload_error,
            null,
            null,
            200
        );
    } catch (err) {
        console.log(`Error creating transcoding job`, err);
        return showResponse(
            false,
            responseMessage?.common?.file_upload_error,
            err,
            null,
            200
        );
    }
};

// using ffmpeg and its too much time
const createVideoThumbnail = async (videoFileName: any, fileExt: any) => {
    return new Promise(async (resolve, reject) => {
        try {

            const s3 = new AWS.S3({
                accessKeyId: await AWS_CREDENTIAL.ACCESSID,
                secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
                region: await AWS_CREDENTIAL.REGION
            });

            let VideoInputBucket = await AWS_CREDENTIAL.BUCKET_NAME

            const inputFileName = `${videoFileName}${fileExt}`;
            const outputFileName = `${videoFileName}-thumbnail.jpg`;
            const stream = s3
                .getObject({ Bucket: VideoInputBucket, Key: inputFileName })
                .createReadStream();
            ffmpeg(stream)
                .screenshots({
                    count: 1,
                    filename: outputFileName,
                    folder: "/tmp",
                    timemarks: ["4"],
                })
                .on("end", async () => {
                    // Upload the thumbnail to S3
                    const thumbnailPath = `/tmp/${outputFileName}`;
                    const thumbnailFileContent = fs.readFileSync(thumbnailPath);

                    const thumbnailUploadParams: any = {
                        Bucket: await getParameterFromAWS({ name: "VideoOutputBucket" }),
                        Key: `${videoFileName}/${outputFileName}`,
                        Body: thumbnailFileContent,
                    };
                    s3.upload(thumbnailUploadParams, (err: any, data: any) => {
                        if (err) {
                            return resolve(
                                showResponse(
                                    false,
                                    responseMessage?.common?.thumbnail_error,
                                    err,
                                    null,
                                    200
                                )
                            );
                        }
                        return resolve(
                            showResponse(
                                true,
                                responseMessage?.common?.thumbnail_generated,
                                data,
                                null,
                                200
                            )
                        );
                    });
                })
                .on("error", (err) => {
                    return resolve(
                        showResponse(
                            false,
                            responseMessage?.common?.thumbnail_error,
                            err,
                            null,
                            200
                        )
                    );
                });
        } catch (err) {
            return resolve(
                showResponse(
                    false,
                    responseMessage?.common?.thumbnail_error,
                    err,
                    null,
                    200
                )
            );
        }
    });
};

// const uploadAudioToS3 = async (files) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (files?.length > 0) {
//         let filesResponse = await uploadToS3(files);
//         resolve(filesResponse);
//       } else {
//         resolve(null);
//       }
//     } catch (err) {
//       console.log(`in catch error 472`, err);
//       return resolve(null);
//     }
//   });
// };
const uploadFileToS3 = async (files: [any]): Promise<ApiResponse> => {
    console.log(files, "filess>>>")
    return new Promise(async (resolve, reject) => {
        try {
            let webpFilesArray = [];
            for (let i = 0; i < files?.length; i++) {
                let file = files[i];
                let mime_type = file?.mimetype.split("/")[0];
                console.log(mime_type, "mimeTypess");
                if (mime_type == "image" && !file.originalname.endsWith(".psd")) {
                    console.log("under webp");
                    let imageNewBuffer = await commonHelper.convertImageToWebp(file?.buffer);

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
                }
                else {
                    webpFilesArray.push(file);
                }

            }
            // console.log(webpFilesArray,"webfilesss")
            if (webpFilesArray?.length > 0) {

                let filesResponse = await uploadToS3(webpFilesArray);
                // console.log(filesResponse, "fileresponse")
                return resolve(
                    showResponse(
                        true,
                        responseMessage?.common?.file_upload_success,
                        filesResponse,
                        null,
                        200
                    )
                );
            }
            // console.log(webpFilesArray, "webpFiles")
            return resolve(
                showResponse(
                    false,
                    responseMessage?.common?.file_upload_error,
                    null,
                    null,
                    200
                )
            );
        } catch (err) {
            console.log(`in catch error 472`, err);
            return resolve(
                showResponse(
                    false,
                    responseMessage?.common?.file_upload_error,
                    err,
                    null,
                    200
                )
            );
        }
    });
};

const uploadMultipleFilesToS3 = async (files: any) => {
    const s3 = new AWS.S3({
        accessKeyId: await AWS_CREDENTIAL.ACCESSID,
        secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
        region: await AWS_CREDENTIAL.REGION
    });

    let bucketName = await AWS_CREDENTIAL.BUCKET_NAME

    return new Promise(async (resolve, reject) => {
        try {
            const uploadedKeys: any = [];
            await Promise.all(files.map(async (fileData: any) => {
                let { filename, mimeType, fieldname, buffer } = fileData;

                let params: any = {
                    Bucket: bucketName
                };

                let mediaType = mimeType.split('/')[0];
                let extension = path.extname(filename);

                if (mediaType == 'image') {
                    params['ContentType'] = 'image/webp';
                    params['Key'] = `${fieldname}/${Math.floor(Math.random() * 10000000)}.webp`;
                    params['Body'] = await commonHelper.convertImageToWebp(Buffer.from(buffer));
                } else {
                    params['ContentType'] = mimeType;
                    params['Key'] = `${fieldname}/${Math.floor(Math.random() * 10000000)}${extension}`;
                    params['Body'] = Buffer.from(buffer)
                }

                const uploadResult = await s3.upload(params).promise();
                uploadedKeys.push(uploadResult.Key);
            }));

            resolve({ status: true, data: uploadedKeys });
        } catch (err) {
            console.error('Error uploading files to S3:', err);
            reject({ status: false, data: err });
        }
    });
}

const uploadToS3ExcelSheet = async (excelBuffer: any, fileName: any) => {
    return new Promise(async (resolve, reject) => {
        try {


            const s3 = new AWS.S3({
                accessKeyId: await AWS_CREDENTIAL.ACCESSID,
                secretAccessKey: await AWS_CREDENTIAL.AWS_SECRET,
                region: await AWS_CREDENTIAL.REGION
            });

            let bucketName = await AWS_CREDENTIAL.BUCKET_NAME;

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


        let bucketName = await AWS_CREDENTIAL.BUCKET_NAME;

        interface filee {
            fieldname: string,
            originalname: any,
            encoding: string,
            buffer: any,
            size: any,
            mimetype: any

        }

        const s3UploadPromises = files.map(async (file: any) => {
            return new Promise((resolve, reject) => {
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

        let bucketName = await AWS_CREDENTIAL.BUCKET_NAME

        const unlinkFromS3Promises = fileUrls.map(async (url: any) => {

            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: bucketName,
                    Key: url,
                };
                console.log(params, "apramsss");
                //check if file exist in this path or not
                s3.headObject(params).promise()
                    .then((res) => {
                        // console.log(res, "resssss");
                        // console.log("File Found in S3", res)
                        s3.deleteObject(params, (err, data) => {
                            if (err) {
                                // console.error('Error deleting object:', err);
                                resolve(
                                    showResponse(
                                        false,
                                        'Error deleting object on s3 bucket',
                                        null,
                                        err,
                                        400
                                    ));
                            } else {
                                console.log('Object deleted successfully:', data);
                                resolve(
                                    showResponse(
                                        true,
                                        'Object deleted successfully from s3 bucket',
                                        null,
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
                                null,
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
};

export {
    getParameterFromAWS,
    postParameterToAWS,
    getSecretFromAWS,
    unlinkFromS3Bucket,
    sendSMSService,
    uploadVideoToS3,
    createVideoThumbnail,
    uploadFileToS3,
    uploadMultipleFilesToS3,
    uploadToS3ExcelSheet,
    uploadToS3

}