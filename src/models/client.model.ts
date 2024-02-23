import { Schema, model } from 'mongoose';

import {  ROLE } from '../constants/index';

const ClientSchema = new Schema(
    {
        role: { type: Number, enum: [ROLE.ADMIN, ROLE.USER], default: ROLE.USER },
        email: { type: String, required: false, default: null },
        firstName: { type: String, required: false, minLength: 2, default: null },
        lastName: { type: String, required: false },
        password: { type: String, minLength: 4, maxLength: 80, default: null },
        phoneNumber: { type: String, required: true },
        language: { type: String, required: false, default: null },
        profile: { type: String, defalut: null },
        mPinMode: { type: Boolean, defalut: false },
        mPin: { type: String, defalut: null },
        partnerCode: { type: String, defalut: null },
        isBlocked: { type: Boolean, default: false },
        // status: { type: String, enum: [USER_STATUS.PENDING, USER_STATUS.APPROVED, USER_STATUS.DECLINED], default: USER_STATUS.PENDING }
    }, { timestamps: true, versionKey: false }
)
export default model('client', ClientSchema)



