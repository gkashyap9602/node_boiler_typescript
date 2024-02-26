import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../constants/app.constant';

const AdminSchema = new Schema(
    {
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        email: { type: String },
        password: { type: String },
        profile_pic: { type: String, default: "" },
        user_type: { type: Number, default: ROLE.ADMIN },
        otp: { type: Number, default: null },
        is_verified: { type: Boolean, default: true },
        status: { type: Number, default: USER_STATUS.ACTIVE },
        created_on: { type: Number, default: 0 },
        updated_on: { type: Number, default: 0 }

    },
    // { timestamps: true, versionKey: false }
)
export default model('admin', AdminSchema)