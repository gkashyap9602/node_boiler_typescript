import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../../constants/app.constant';

const FAQ = new Schema(
    {
        question: {
            type: String,
            default: ''
        },
        answer: {
            type: String,
            default: ''
        },
        status: {
            type: Number,
            default: 1
        },
        created_on: {
            type: Number,
            default: 0
        },
        updated_on: {
            type: Number,
            default: 0
        }
    },
    // { timestamps: true, versionKey: false }
)
export default model('faq', FAQ)