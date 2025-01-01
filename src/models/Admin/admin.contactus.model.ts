import { Schema, model } from 'mongoose';
import { USER_STATUS } from '../../constants/workflow.constant';

const ContactUsSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: USER_STATUS.ACTIVE
    },
    is_reply: {
        type: Boolean,
        default: false
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        versionKey: false,
        timestamps: true
    }
);

export default model('contact_us', ContactUsSchema);