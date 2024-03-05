import { Schema, model } from 'mongoose';

const CommonContent = new Schema(
    {
        about: {
            type: String,
            default: ''
        },
        privacy_policy: {
            type: String,
            default: ''
        },
        terms_conditions: {
            type: String,
            default: ''
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
export default model('common_content', CommonContent)