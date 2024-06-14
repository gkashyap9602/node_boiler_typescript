
//*************************** */ Uncomment And Use This Functions For Subscription Purchase *******************************************
//*************************** */ And ios Webhook for ios inapp purchase *******************************************


// import { ApiResponse } from "../../utils/interfaces.util";
// import { showResponse } from "../../utils/response.util";
// import { findOne, createOne, findOneAndUpdate, } from "../../helpers/db.helpers";
// import services from '../../services';
// import responseMessage from '../../constants/ResponseMessage'
// import statusCodes from '../../constants/statusCodes'
// import userAuthModel from "../../models/User/user.auth.model";
// import { SUBSCRIPTION_STATUS } from "../../constants/app.constant";
// import * as commonHelper from "../../helpers/common.helper";
// import moment from "moment";
// import { decodeRenewalInfo, decodeNotificationPayload } from "app-store-server-api";
// import userSubscriptionLogsModel from "../../models/User/user.subscriptionLogs.model";
// import { SUBSCRIPTION_PLANS } from "../../helpers/inAppPurchase.Android.helper";
// const { ANNUAL, QUATERLY, MONTHLY, DEFAULT } = SUBSCRIPTION_PLANS

// const UserSubscriptionHandler = {

//     purchaseSubscriptionIos: async (data: any, user_id: string): Promise<ApiResponse> => {
//         let { original_transaction_id, product_id, transaction_date } = data;
//         transaction_date = Number(transaction_date);

//         let queryObj = {
//             _id: user_id,
//             $or: [
//                 { 'subscription_details.purchase_token': { $ne: '' } }, //purchase token for android unique identity
//                 { 'subscription_details.is_subscribed': SUBSCRIPTION_STATUS.ACTIVE },
//                 { 'subscription_details.original_transaction_id': original_transaction_id } //original_transaction_id token for ios unique identity
//             ]
//         }

//         // Check if the subscription already exists
//         const existingSubscription = await findOne(userAuthModel, queryObj);

//         console.log(existingSubscription, "existingSubscription")
//         if (existingSubscription.status) {
//             return showResponse(false, responseMessage.users.subscription_already_purchased, null, statusCodes.API_ERROR);
//         }

//         // Determine the subscription duration
//         let value = 0;
//         let unit: any = ''

//         switch (product_id) {
//             case MONTHLY.NAME:
//                 unit = MONTHLY.UNIT;
//                 value = MONTHLY.VALUE;
//                 break;
//             case QUATERLY.NAME:
//                 unit = QUATERLY.UNIT;
//                 value = QUATERLY.VALUE;
//                 break;
//             case ANNUAL.NAME:
//                 unit = ANNUAL.UNIT;
//                 value = ANNUAL.VALUE;
//                 break;

//             default:
//                 unit = DEFAULT.UNIT;
//                 value = DEFAULT.VALUE;
//         }

//         // Calculate subscription end date
//         const transactionMoment = moment.unix(transaction_date);
//         const subscriptionEndsOn = transactionMoment.add(value, unit).unix();

//         // Prepare subscription data
//         const updateSubscriptionData = {
//             'subscription_details.original_transaction_id': original_transaction_id,
//             'subscription_details.subscription_ends_on': subscriptionEndsOn,
//             'subscription_details.product_id': product_id,
//             'subscription_details.purchased_in_device': 'ios',
//             'subscription_details.is_subscribed': SUBSCRIPTION_STATUS.ACTIVE,
//         };
//         console.log(updateSubscriptionData, "updateSubscriptionData")

//         // Update User Model With Subscription Data
//         let response = await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubscriptionData);
//         if (!response.status) {
//             return showResponse(false, responseMessage.users.subscription_purchase_failed, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, responseMessage.users.subscription_purchase_success, null, statusCodes.SUCCESS);
//     },

//     purchaseSubscriptionAndroid: async (data: any, user_id: string): Promise<ApiResponse> => {
//         let { purchase_token, product_id, transaction_date } = data;

//         transaction_date = Number(transaction_date);

//         let queryObj = {
//             _id: user_id,

//             $or: [
//                 { 'subscription_details.purchase_token': purchase_token }, //purchase token for android unique identity
//                 { 'subscription_details.is_subscribed': SUBSCRIPTION_STATUS.ACTIVE },
//                 { 'subscription_details.original_transaction_id': { $ne: '' } } //original_transaction_id token for ios unique identity
//             ]
//         }

//         // Check if the subscription already exists
//         const existingSubscription = await findOne(userAuthModel, queryObj);
//         if (existingSubscription.status) {
//             return showResponse(false, responseMessage.users.subscription_already_purchased, null, statusCodes.API_ERROR);
//         }

//         // Determine the subscription duration
//         let value = 0;
//         let unit: any = ''

//         switch (product_id) {
//             case MONTHLY.NAME:
//                 unit = MONTHLY.UNIT;
//                 value = MONTHLY.VALUE;
//                 break;
//             case QUATERLY.NAME:
//                 unit = QUATERLY.UNIT;
//                 value = QUATERLY.VALUE;
//                 break;
//             case ANNUAL.NAME:
//                 unit = ANNUAL.UNIT;
//                 value = ANNUAL.VALUE;
//                 break;

//             default:
//                 unit = DEFAULT.UNIT;
//                 value = DEFAULT.VALUE;
//         }

//         // Calculate subscription end date from the transaction date
//         const transactionMoment = moment.unix(transaction_date);
//         const subscriptionEndsOn = transactionMoment.add(value, unit).unix();

//         // Prepare subscription data
//         const updateSubscriptionData = {
//             'subscription_details.purchase_token': purchase_token,
//             'subscription_details.subscription_ends_on': subscriptionEndsOn,
//             'subscription_details.product_id': product_id,
//             'subscription_details.purchased_in_device': 'android',
//             'subscription_details.is_subscribed': SUBSCRIPTION_STATUS.ACTIVE,
//         };

//         // Update User Model With Subscription Data
//         let response = await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubscriptionData);
//         if (!response.status) {
//             return showResponse(false, responseMessage.users.subscription_purchase_failed, null, statusCodes.API_ERROR);
//         }
//         return showResponse(true, responseMessage.users.subscription_purchase_success, null, statusCodes.SUCCESS);
//     },

//     iosSubscriptionWebhook: async (event_data: any) => {
//         try {
//             console.log(event_data, "event_dataIosWebhook")

//             const { signedPayload } = event_data

//             if (signedPayload) {
//                 const notification_data: any = await decodeNotificationPayload(signedPayload);

//                 if (notification_data) {
//                     let renewalInfo = await decodeRenewalInfo(notification_data?.data?.signedRenewalInfo);
//                     if (renewalInfo) {

//                         if (notification_data.notificationType == "SUBSCRIBED") {

//                             let user_id = null
//                             let userDetails = await findOne(userAuthModel, { 'subscription_details.original_transaction_id': renewalInfo?.originalTransactionId })
//                             user_id = userDetails?.status ? userDetails?.data?._id : null

//                             let subs_logs = {
//                                 original_transaction_id: renewalInfo?.originalTransactionId,
//                                 product_id: renewalInfo?.productId,
//                                 renewal_date: renewalInfo?.renewalDate,
//                                 subscription_status: notification_data?.notificationType,
//                                 user_id,
//                                 device_type: "ios"
//                             }
//                             let saveLogsRef = new userSubscriptionLogsModel(subs_logs);
//                             let saveLogs = await createOne(saveLogsRef);
//                             // if (!saveLogs.status) {
//                             //     return showResponse(false, saveLogs?.message, null, 400);
//                             // }
//                             // return showResponse(true, "Subscription Log Record Added Successfully", null, 200);
//                         } else if (notification_data.notificationType == "DID_RENEW" || notification_data.notificationType == "DID_CHANGE_RENEWAL_PREF") {
//                             let user_id = null
//                             let userDetails = await findOne(userAuthModel, { 'subscription_details.original_transaction_id': renewalInfo?.originalTransactionId })
//                             user_id = userDetails?.status ? userDetails?.data?._id : null

//                             let subs_logs = {
//                                 original_transaction_id: renewalInfo?.originalTransactionId,
//                                 product_id: renewalInfo?.productId,
//                                 renewal_date: renewalInfo?.renewalDate,
//                                 subscription_status: notification_data?.notificationType,
//                                 user_id,
//                                 device_type: "ios"
//                             }

//                             let saveLogsRef = new userSubscriptionLogsModel(subs_logs);
//                             let saveLogs = await createOne(saveLogsRef);

//                             if (user_id) {
//                                 let updateSubscriptionObj = { 'subscription_details.subscription_ends_on': renewalInfo?.renewalDate }
//                                 await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubscriptionObj)
//                             }
//                             // return showResponse(true, "Subscription Auto Renewal Success", null, 200);

//                         } else if ((notification_data.notificationType == "DID_CHANGE_RENEWAL_STATUS" && notification_data.subtype == "AUTO_RENEW_DISABLED")) {
//                             let user_id = null
//                             let userDetails = await findOne(userAuthModel, { 'subscription_details.original_transaction_id': renewalInfo?.originalTransactionId })
//                             user_id = userDetails?.status ? userDetails?.data?._id : null

//                             let subs_logs = {
//                                 original_transaction_id: renewalInfo?.originalTransactionId,
//                                 product_id: renewalInfo?.productId,
//                                 renewal_date: renewalInfo?.renewalDate,
//                                 subscription_status: notification_data?.notificationType,
//                                 user_id,
//                                 device_type: "ios"
//                             }

//                             let saveLogsRef = new userSubscriptionLogsModel(subs_logs);
//                             let saveLogs = await createOne(saveLogsRef);

//                             if (user_id) {
//                                 let updateSubscriptionObj = {
//                                     'subscription_details.original_transaction_id': "",
//                                     'subscription_details.is_cancelled': true
//                                 }

//                                 await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubscriptionObj)
//                             }
//                             // return showResponse(true, "Subscription Auto Renewal Stopped Successfully", null, 200);
//                         }
//                     }
//                 }
//             }

//             return showResponse(true, "notification Webhook Ios", event_data, 200);

//         } catch (error) {
//             console.log(error, 'error Webhook ios',)
//             return showResponse(false, "error Webhook ios", error, 400);

//         }
//     },

// }

// export default UserSubscriptionHandler;
