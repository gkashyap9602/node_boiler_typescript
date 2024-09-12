import { Parser } from 'json2csv'
import XLSX from 'xlsx'
import sharp from 'sharp';
import fs from 'fs'
import services from '../services';
import mm from 'music-metadata'
import { showResponse } from '../utils/response.util';
import { APP } from "../constants/app.constant";
import axios from 'axios';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg'
import responseMessage from "../constants/ResponseMessage";
import * as commonHelper from '../helpers/common.helper'


const convertImageToWebp = async (imageInBuffer: any) => {
    // console.log(imageInBuffer, "imageinbuffer")
    return new Promise((resolve) => {
        sharp(imageInBuffer)
            .webp({ quality: 50 })
            .toBuffer()
            .then(async (newBuffer) => {
                resolve(newBuffer);
            })
            .catch(() => {
                resolve(false);
            });
    });
};

function readFileAsyncChunks(filePath: string, bufferSize = 64 * 1024) { //64kb each chunk size
    return new Promise((resolve) => {
        const stream = fs.createReadStream(filePath, { highWaterMark: bufferSize }); //each chunk buffer size will be 64 kb max
        const chunks: any = [];

        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on('error', (error) => {
            resolve(error);
        });

    });
}


const exportJsonToExcel = (filteredData: any) => {
    return new Promise((resolve) => {
        try {
            const filePath = `worksheet/${"Order"}-${new Date().getTime()}.xlsx`;
            const workbook = XLSX.utils.book_new();

            const orderStatus: any = {
                1: "new",
                2: "inProduction",
                3: "shipped",
                4: "error",
                5: "recieved",
                6: "cancelled"
            }

            const sheetArray = [
                'Merch Maker ID', 'Order Id', 'Customer Name', 'Customer Email', 'Customer Phone',
                'Order Amount', 'Order Date', 'Order Status', "Shipping Method", 'Shipping Address',
                "Shipping State", 'Shipping Country', "Freight Amount", "Tracking", "Ship Date",
                "Shipment Weight", "Dimensions", "SKU", "Product Name", 'Quantity',
            ];

            const sheet: any = XLSX.utils.aoa_to_sheet([sheetArray]);

            const rowData = [];

            for (let k = 0; k < filteredData?.length; k++) {
                const row = [];
                row.push(filteredData[k].displayId ?? '');
                row.push(filteredData[k].mwwOrderId ?? '');
                row.push(filteredData[k].userData.firstName ?? '');
                row.push(filteredData[k].userData.email ?? '');
                row.push(filteredData[k].shippingAddress.companyPhone ?? '');
                row.push(filteredData[k].amount ?? '');
                row.push(filteredData[k].orderDate ?? '');
                row.push(orderStatus[filteredData[k].status] ?? '');
                row.push(filteredData[k].shipMethodData.name ?? '');
                row.push(filteredData[k].shippingAddress.address1 ?? '');
                row.push(filteredData[k].shippingAddress.stateName ?? '');
                row.push(filteredData[k].shippingAddress.country ?? '');
                row.push(filteredData[k].freightAmount ?? '');
                row.push(filteredData[k].tracking ?? '');
                row.push(filteredData[k].shipDate ?? '');
                row.push(filteredData[k].shipmentWeight ?? '');
                row.push(filteredData[k].dimensions ?? '');
                row.push(filteredData[k].sku ?? '');

                if (filteredData[k]?.orderItems && filteredData[k]?.orderItems.length > 0) {
                    for (let j = 0; j < filteredData[k]?.orderItems?.length; j++) {
                        row.push(filteredData[k]?.orderItems[j]?.productTitle ?? '');
                        row.push(filteredData[k]?.orderItems[j]?.quantity ?? '');
                    }
                }

                rowData.push(row);
            }

            let counter = 1;
            for (let k = 0; k < rowData.length; k++) {
                XLSX.utils.sheet_add_aoa(sheet, [rowData[k]], { origin: counter + 1 });
                counter++;
            }

            XLSX.utils.book_append_sheet(workbook, sheet, 'Orders Data');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            // Handling asynchronous operation directly inside Promise constructor
            services.awsService.uploadToS3ExcelSheet(buffer, filePath)
                .then(excelLink => {
                    resolve({ status: true, message: "Excel for members created Successfully!", data: excelLink, code: 200 });
                })
                .catch(err => {
                    resolve({ status: false, message: "Error Occurred while uploading to S3", data: err.message, code: 200 });
                });

        } catch (err: any) {
            console.log(err);
            resolve({ status: false, message: "Error Occurred, please try again", data: err.message, code: 200 });
        }
    });
}


const getAudioMetadata = (mediaBuffer: any, mediaFileObj: any) => {
    const mimeType = mediaFileObj?.mimeType || 'audio/mpeg'; // Default to MPEG audio if mimeType is not provided

    return new Promise((resolve) => {
        mm.parseBuffer(mediaBuffer, mimeType)
            .then(metadata => {
                // console.log(metadata, "metadataaaAudio");
                const durationInSeconds = metadata.format.duration || 0;
                const formattedDuration = commonHelper.formatDuration(durationInSeconds);

                const song_title = metadata?.common?.title

                const musicMetadata = { duration: formattedDuration, title: song_title }

                resolve(showResponse(true, `Duration: ${durationInSeconds} seconds`, musicMetadata, 200));

            })
            .catch(error => {
                console.error('Error while getting metadata:', error);
                resolve(showResponse(false, 'Error while getting metadata', error, 400));

            });
    });
};


const getCSVFromJSON = (fields: any, json: any) => {
    const parser = new Parser({ fields });
    return parser.parse(json);
}


const createVideoThumbnail = async (video_file_name: string, file_url: string) => {

    console.log(video_file_name, "videoFileName")
    console.log(file_url, "file_url")

    const aws_file_link = `${APP.BITBUCKET_URL}/${file_url}`
    const response = await axios.get(aws_file_link, {
        responseType: 'arraybuffer',
    });

    return new Promise((resolve) => {
        try {

            const output_file_name = `${video_file_name}-thumbnail.jpg`;

            const mediaBuffer = Buffer.from(response.data);

            console.log(mediaBuffer, "mediaBufferYH ")

            // Create a Readable stream from the video buffer
            const videoStream = new Readable();
            videoStream.push(mediaBuffer);
            videoStream.push(null); // Signal the end of the stream

            const thumbnail_saved_path = `${process.cwd()}/public/thumbnails`

            ffmpeg()
                .input(videoStream)
                .outputOptions(['-vframes 1', '-ss 00:00:04'])
                .output(`${thumbnail_saved_path}/${output_file_name}`)
                .on('end', async () => {
                    // Upload the thumbnail to S3
                    const thumbnail_file_path = `${thumbnail_saved_path}/${output_file_name}`;
                    const thumbnail_file_content = fs.readFileSync(thumbnail_file_path);

                    const thumbnailUploadParams = {
                        // Bucket: BUCKET_NAME,
                        Key: `thumbnails/${output_file_name}`,
                        Body: thumbnail_file_content
                    };

                    return services.awsService.uploadThumbnail(thumbnailUploadParams, thumbnail_file_path)
                })
                .on('error', (err) => {
                    console.error('FFmpeg thumbanil error:', err);
                    return resolve(showResponse(false, responseMessage?.common?.thumbnail_error, err, 200));
                })
                .run();

        } catch (err) {
            return resolve(showResponse(false, responseMessage?.common?.thumbnail_error, err, 200));
        }
    });
};//ends

export {
    getCSVFromJSON,
    convertImageToWebp,
    exportJsonToExcel,
    readFileAsyncChunks,
    getAudioMetadata,
    createVideoThumbnail

}