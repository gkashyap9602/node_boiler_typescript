import auth from './auth.middleware'
import busboy from './busBoy.middleware'
import multer from './multer.middleware'
import joiValidation from './validation.middleware'


export default {
    fileUpload: {
        busboy,
        multer
    },
    auth,
    joiValidation
};