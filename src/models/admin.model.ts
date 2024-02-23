import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../constants/index';

const AdminSchema = new Schema(
    {
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        email: { type: String },
        password: { type: String },
        profile_pic: { type: String, default: "" },
        user_type: { type: Number, default: ROLE.ADMIN },
        is_verified: { type: Boolean, default: false },
        status: { type: Number, default: USER_STATUS.ACTIVE },
        created_on: { type: Number, default: 0 },
        updated_on: { type: Number, default: 0 }

    },
    { timestamps: true, versionKey: false }
)
export default model('admin', AdminSchema)