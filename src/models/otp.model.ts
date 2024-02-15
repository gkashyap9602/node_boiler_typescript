import { Schema, model } from 'mongoose';

const OtpSchema = new Schema(
    {
        email: { type: String, required: false, default: null },
        otp: { type: String, required: false, default: '0' },
        isActive: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }
)
export default model('otps', OtpSchema)



