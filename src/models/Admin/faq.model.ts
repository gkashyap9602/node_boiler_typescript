import { Schema, model } from 'mongoose';

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
    },
    { timestamps: true, versionKey: false }
)
export default model('faq', FAQ)