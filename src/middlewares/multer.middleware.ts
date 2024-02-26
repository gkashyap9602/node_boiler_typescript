import { Request, Response, NextFunction } from 'express'

const multer = require("multer");
const path = require('path')


const addToMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: any, file: any, callback: any) => {
        callback(null, true); // Accept the file
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
})


const storage = multer.diskStorage({

    destination: function (req: any, file: any, cb: any) {

        if (file.fieldname === 'documents') {
            cb(null, `${process.cwd()}/public/uploads/documents`);
        } else {
            cb(null, `${__dirname}/public/uploads`);
        }

    },

    filename(req: any, file: any, cb: any) {
        let num = Math.round(Math.pow(36, 10 + 1) - Math.random() * Math.pow(36, 10)).toString(36).slice(1);
        const fileName = num + file.originalname;
        cb(null, fileName);
    },
});

const fileFilter = function (req: any, file: Express.Multer.File, callback: any) {
    const mime = file.mimetype;

    // if (!mime.includes('image') && !mime.includes('pdf')) {
    //     return callback(new Error("Only image or pdf files are allowed"));
    // }

    callback(null, true);
}

const multerUpload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1048576 }, // 5 mb
    fileFilter
});

export default {
    addToMulter,
    multerUpload
}