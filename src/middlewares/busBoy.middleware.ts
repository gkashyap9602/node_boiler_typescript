import { Request } from 'express';
// const Busboy 
import Busboy from 'busboy';

interface FileObject {
    fieldname: string;
    buffer: Buffer;
    // Add other properties as needed
}

// interface BusboyFileEvent {
//     fieldName: string;
//     fileStream: NodeJS.ReadableStream;
//     fileObject: FileObject;
// }

// interface BusboyErrorEvent {
//     error: Error;
// }

const busboyMultipart = (request: Request): Promise<{ status: boolean; message: string; data?: FileObject[] }> => {
    return new Promise((resolve, reject) => {
        try {
            const busboy = Busboy({ headers: request.headers });

            const fileArray: FileObject[] = [];

            busboy.on('file', async (fieldName: string, fileStream: NodeJS.ReadableStream, fileObject: FileObject) => {
                const chunks: Buffer[] = [];

                fileStream.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                fileStream.on('end', () => {
                    const fileBuffer = Buffer.concat(chunks);
                    fileObject.buffer = fileBuffer;
                    fileObject.fieldname = fieldName;

                    fileArray.push(fileObject);
                });
            });

            busboy.on('finish', () => {
                resolve({ status: true, message: 'busboy Object Created !!', data: fileArray });
            });

            busboy.on('error', (err: Error) => reject(err));

            request.pipe(busboy);
        } catch (error: any) {
            resolve({ status: false, message: error.message });
        }
    });
};

export default { busboyMultipart }