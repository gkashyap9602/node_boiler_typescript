import { Request, Response, NextFunction } from 'express';
import Busboy from 'busboy';
import fs from 'fs'


const busboyMultipleMedia = (req: Request) => {
    return new Promise(async (resolve, reject) => {
        try {
            const busboy = Busboy({ headers: req.headers });
            const files: any = []
            const fields: any = {};

            // Create a directory for uploads if it doesn't exist
            const uploadDir = `${process.cwd()}/public/uploads/media`;

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePromises: any = [];

            //start busboy
            busboy.on('file', function async(fieldName, fileStream, fileObject: any) {
                const fileName = `${(fieldName)}-${Date.now()}-${(fileObject?.filename)}`
                const filePath: any = uploadDir + '/' + fileName
                const writeStream = fs.createWriteStream(filePath);
                const fileBuffer: any = []; // Buffer to store file data

                // Write file data to buffer
                fileStream.on('data', (chunk) => {
                    fileBuffer.push(chunk);
                });


                filePromises.push(
                    new Promise((resolveFile, rejectFile) => {
                        writeStream.on('finish', async () => {
                            try {
                                fileObject = {
                                    ...fileObject,
                                    filename: fileName,
                                    filePath,
                                    fieldName,
                                    fileBuffer: Buffer.concat(fileBuffer) // Concatenate file buffer chunks

                                };
                                files.push(fileObject);
                                resolveFile(true);
                            } catch (error) {
                                rejectFile(error);
                            }
                        });

                        fileStream.pipe(writeStream);
                    })
                );
            }); //file promise ends


            busboy.on('field', function (fieldname, val) {
                fields[fieldname] = val;
            });

            busboy.on('finish', async () => {
                try {
                    await Promise.all(filePromises);
                    resolve({ files: files, fields: fields });
                } catch (error) {
                    reject(error);
                }
            });

            //handler busboy error
            busboy.on('error', err => reject(err));
            req.pipe(busboy);
        } catch (error: any) {
            resolve({ status: false, message: error.message });
        }
    });
} //ends busboy



const addToBusboy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("under busboy middleware")
        const response: any = await busboyMultipleMedia(req);
        console.log(response?.files.lenght, "lenghtresponse files")
        req.files = response?.files
        req.body = { ...response?.fields, uploading: true }
        next();
    } catch (error) {
        console.error('Error parsing form data:', error);
        res.status(500).json({ status: false, message: 'Busboy:Error parsing form data' });
    }
}

export default { addToBusboy }
