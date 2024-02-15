import { Schema, model } from 'mongoose';
import { ROLE } from '../constants/index';

const AdminSchema = new Schema(
    {
        email: { type: String, required: true, minLength: 4, maxLength: 35, trim: true, unique: true },
        role: { type: Number, enum: [ROLE.ADMIN_ROLE, ROLE.USER_ROLE], default: ROLE.ADMIN_ROLE },
        firstName: { type: String, required: false, minLength: 4, maxLength: 20},
        lastName: { type: String, required: false, minLength: 4, maxLength: 20},
        password: { type: String, required: true, minLength: 4, maxLength: 80, trim: true },
        isBlocked: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }
)
export default model('admin', AdminSchema)