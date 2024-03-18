import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../../constants/app.constant';

const AdminSchema = new Schema(
    {
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        email: { type: String },
        password: { type: String },
        profile_pic: { type: String, default: "" },
        user_type: { type: Number, default: ROLE.ADMIN },
        otp: { type: Number, default: null },
        phone_number: { type: String, default: null },
        country_code: { type: String, default: null },
        is_verified: { type: Boolean, default: true },
        os_type: { type: String, default: '' },
        greet_msg: { type: Boolean, default: true },
        status: { type: Number, default: USER_STATUS.ACTIVE },
        created_on: { type: Number, default: 0 },
        updated_on: { type: Number, default: 0 }

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        versionKey: false,
        // collection: 'admin'
        // timestamps: true
    },
)


// Define a virtual property for full_name
AdminSchema.virtual('full_name').get(function () {
    return `${this.first_name} ${this.last_name}`.trim();
});



export default model('admin', AdminSchema)