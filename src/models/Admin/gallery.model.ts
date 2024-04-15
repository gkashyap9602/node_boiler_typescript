import { Schema, model } from 'mongoose';

const Gallery = new Schema({
    url: {
        type: String,
        default: ''
    },
    media_type: {
        type: Number,
        default: null
    },
    status: {
        type: Number,
        default: 1
    },
},
    { timestamps: true, versionKey: false });

export default model('gallery', Gallery, 'gallery');