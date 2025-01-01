import { Schema, model } from 'mongoose';
import { ROLE, USER_STATUS } from '../../constants/workflow.constant';

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

        //******Use When Social Login Used******/
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

        //*****Use When InApp Purchase Used *****/
        // subscription_details: {
        //     product_id: {
        //         type: String,
        //         default: '',
        //         Comment: "Subscription Plan Product id"
        //     },
        //     purchased_in_device: {
        //         type: String,
        //         default: null,
        //         Comment: "ios and android will be device type"
        //     },
        //     is_subscribed: {
        //         type: Number,
        //         default: SUBSCRIPTION_STATUS.INACTIVE //subscription status will be in number
        //     },
        //     is_cancelled: {
        //         type: Boolean,
        //         default: false,
        //     },
        //     original_transaction_id: {
        //         type: String,
        //         default: '',
        //         Comment: "it is for ios device type"
        //     },
        //     purchase_token: {
        //         type: String,
        //         default: '',
        //         Comment: "it is for android device type"
        //     },
        //     subscription_ends_on: {
        //         type: Number,
        //         default: 0,
        //         Comment: "moment unix "
        //     },
        // },

        //*****Use When Stripe Subscription Used ******/
        // subscription_details: {
        //     is_subscribed: {
        //         type: Boolean,
        //         default: false
        //     },
        //     subscription_id: {
        //         type: String,
        //         default: null
        //     },
        //     subscription_status: {
        //         type: String,
        //         default: ''
        //     },
        //     invoice_url: {
        //         type: String,
        //         default: null
        //     },
        //     plan_type: {
        //         type: String,
        //         default: null,
        //         Comment: "Product id or package id"
        //     },
        //     plan_start_date: {
        //         type: Number,
        //         default: null
        //     },
        //     plan_end_date: {
        //         type: Number,
        //         default: null
        //     },
        // },
        deactivate_by: { type: String },
        status: { type: Number, default: USER_STATUS.ACTIVE },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        versionKey: false,
        timestamps: true
    },

)

// Define the virtual property for full name
UserSchema.virtual('full_name').get(function () {
    return `${this.first_name} ${this.last_name}`.trim();
});


export default model('user', UserSchema)