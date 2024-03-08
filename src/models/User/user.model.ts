import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../../constants/app.constant';

const UserSchema = new Schema(
    {
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        email: { type: String },
        password: { type: String },
        profile_pic: { type: String, default: "" },
        user_type: { type: Number, default: ROLE.USER },
        otp: { type: Number, default: null },
        phone_number: { type: String, default: null },
        country_code: { type: String, default: null },
        is_verified: { type: Boolean, default: false },
        // social_account: [{
        //     source: {
        //         type: String,
        //         default: null
        //     },
        //     email: {
        //         type: String,
        //         default: null
        //     },
        //     token: {
        //         type: String,
        //         default: null
        //     },
        //     name: {
        //         type: String,
        //         default: null
        //     }

        // }],
        // account_source: {
        //     type: String,
        //     default: 'email',
        //     Comment: "email for normal created google with google apple with apple "
        // },
        // device_info: [{
        //     os: {
        //         type: String,
        //         default: 'android'
        //     },
        //     device_id: {
        //         type: String
        //     },

        // }],
        status: { type: Number, default: USER_STATUS.ACTIVE },
        created_on: { type: Number, default: 0 },
        updated_on: { type: Number, default: 0 }

    },
    // { timestamps: true, versionKey: false }
)
export default model('user', UserSchema)