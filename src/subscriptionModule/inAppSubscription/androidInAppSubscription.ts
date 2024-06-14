
//*************************** */ Uncomment And Use This Functions For Android Subscription *******************************************

//apply this command in package json file
//export GOOGLE_APPLICATION_CREDENTIALS=./public/androidCerts/androidInAppPurchase.json


// import { createOne, findOne, findOneAndUpdate } from "./db.helpers";
// import userAuthModel from "../models/User/user.auth.model";
// import { convertToObjectId } from "./common.helper";
// import moment from "moment";
// import userSubscriptionLogsModel from "../models/User/user.subscriptionLogs.model";
// import { showResponse } from "../utils/response.util";
// import Verifier from "google-play-billing-validator";
// import ab1AndroidSubscriptionFile from '../../public/androidCerts/androidInAppPurchase.json'
// import { PubSub } from "@google-cloud/pubsub";
// // import { ANDROID_SUBSCRIPTION_DATA, APP, SUBSCRIPTION_STATUS } from "../constants/app.constant";



// const SUBSCRIPTION_STATUS = {
//     ACTIVE: 1,
//     INACTIVE: 2,
//     CANCELLED: 3,
//     EXPIRED: 4,
// };

// const ANDROID_SUBSCRIPTION_DATA = {
//     SUBSCRIPTION_APN: process.env.SUBSCRIPTION_APN, //FOR ANDROID
//     SUBSCRIPTION_NAME: process.env.SUBSCRIPTION_NAME,
// };

// //instance to trigger android play store subscription notification (like event listen) 
// // const pubsub = new PubSub({});

// //subscription plans with its id call product_id
// const SUBSCRIPTION_PLANS = {
//     MONTHLY: { NAME: "month_plan", UNIT: "M", VALUE: 1 },
//     QUATERLY: { NAME: "quater_plan", UNIT: "M", VALUE: 3 },
//     ANNUAL: { NAME: "annual_plan", UNIT: "y", VALUE: 12 },
//     DEFAULT: { NAME: "", UNIT: "days", VALUE: 0 },
// };


// //android subscription verification payload to validate subscription service account file is valid or not
// const options = {
//     email: String(ab1AndroidSubscriptionFile.client_email),
//     key: String(ab1AndroidSubscriptionFile.private_key)
// };

// //verifier instance 
// // const verifier = new Verifier(options);

// //***** Function Used To save Subscription Logs In database ****** */
// const saveAndroidSubscriptionLogs = async (decoded_data: any, subscriptionData: any, device_type: any) => {
//     try {
//         let latest_purchased_on = decoded_data?.eventTimeMillis;
//         let notification_type = decoded_data?.subscriptionNotification?.notificationType;
//         let subscription_id = decoded_data?.subscriptionNotification?.subscriptionId;
//         let purchase_token = decoded_data?.subscriptionNotification?.purchaseToken;

//         let getUserDetails = await findOne(userAuthModel, { 'subscription_details.purchase_token': purchase_token, status: { $ne: 2 } });
//         if (getUserDetails?.status) {
//             let user_id = getUserDetails?.data?._id;

//             let log_data = {
//                 user_id: convertToObjectId(user_id),
//                 product_id: subscription_id,
//                 subscription_status: notification_type,
//                 purchase_token,
//                 device_type,
//                 created_at: moment().unix()
//             }

//             let resultObj = new userSubscriptionLogsModel(log_data);
//             let result = await createOne(resultObj);

//             if (!result.status) {
//                 console.log("Unable to save subscription log");
//             }

//             if (notification_type == 4 || notification_type == 7 || notification_type == 2) {
//                 if (subscriptionData?.payload?.acknowledgementState == 1) {

//                     let updateSubObj = {
//                         'subscription_details.is_subscribed': SUBSCRIPTION_STATUS.ACTIVE,
//                         'subscription_details.subscription_ends_on': parseInt(subscriptionData?.payload?.expiryTimeMillis),
//                         'subscription_details.purchase_token': purchase_token,
//                         // updated_on: moment().unix()
//                     }
//                     let update_user = await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubObj);
//                     if (update_user.status) {
//                         return showResponse(true, "subscription renewal success", null, 200);
//                     }
//                     return showResponse(false, "Unable to renew subscription at the moment", null, 200);
//                 }
//             } else if (notification_type == 3 || notification_type == 12 || notification_type == 13) {

//                 let updateSubObj = {
//                     // 'subscription_details.subscription_ends_on': parseInt(latest_purchased_on),
//                     'subscription_details.is_cancelled': true,    //subscription cancelled
//                     // updated_on: moment().unix()
//                 }

//                 let update_user = await findOneAndUpdate(userAuthModel, { _id: user_id }, updateSubObj);
//                 if (update_user.status) {
//                     return showResponse(true, "Operation performed successfully", null, 200);
//                 }
//             }
//             return showResponse(true, "log added success", null, 200);
//         } else {

//             let log_data = {
//                 purchase_token,
//                 product_id: subscription_id,
//                 subscription_status: notification_type,
//                 device_type,
//                 // created_at: moment().unix()
//             }

//             let resultObj = new userSubscriptionLogsModel(log_data);
//             let result = await createOne(resultObj);
//             return showResponse(true, "Log added without userId", result, 200);
//         }

//     } catch (error: any) {
//         return showResponse(false, error?.message ? error?.message : error, null, 200);

//     }
// }//ends



// //*****Decode Messages From Play Store Subscription Notifications ****** */
// const decodeAndroidSubscriptionMessage = async (data: any) => {
//     try {
//         const decoded_data = JSON.parse(Buffer.from(data, 'base64').toString());
//         let receipt: any = {
//             packageName: ANDROID_SUBSCRIPTION_DATA.SUBSCRIPTION_APN,
//             productId: decoded_data?.subscriptionNotification?.subscriptionId,
//             purchaseToken: decoded_data?.subscriptionNotification?.purchaseToken,
//         };

//         let subscriptionData = await verifier.verifySub(receipt)

//         console.log(subscriptionData, "Android webhook_subscriptionData")
//         if (subscriptionData) {
//             await saveAndroidSubscriptionLogs(decoded_data, subscriptionData, 'android')
//         }
//     } catch (error: any) {
//         console.log("error_decodeAndroidSubscriptionMessage", error)
//         return showResponse(false, error?.message ? error?.message : error, null, 200);
//     }
// } //ends



// //*****Call In server File When Project Starts To Listen Subscription Notification From Play Store ****** */
// const initializeAndroidSubscriptionListner = async () => {
//     try {
//         const messageHandler = async (message: any) => {
//             if (message?.data) {
//                 console.log("messagedata------>>>>>>>", message?.data, "<<<<<<<------")
//                 await decodeAndroidSubscriptionMessage(message?.data);
//             }
//             message.ack();
//         };

//         const receiveNotifications = async () => {
//             try {
//                 console.log("subscriptionRecieveNotification------------>>>>>>>>>>>>>>>>>", ANDROID_SUBSCRIPTION_DATA.SUBSCRIPTION_NAME)
//                 const subscription = pubsub.subscription(ANDROID_SUBSCRIPTION_DATA.SUBSCRIPTION_NAME as string);
//                 subscription.on('message', messageHandler);
//             } catch (error) {
//                 console.error("receiveNotifications subscription_Error", error);

//             }
//         }

//         receiveNotifications()

//     } catch (error: any) {
//         return showResponse(false, error?.message ? error?.message : error, null, 200);
//     }
// } //ends initialization

// //**********************************ends**************************************************** */

// //android subscription notification type constant
// const NOTIFICATION_TYPE = {
//     SUBSCRIPTION_RECOVERED: {
//         code: 1,
//         description: "A subscription was recovered from account hold."
//     },
//     SUBSCRIPTION_RENEWED: {
//         code: 1,
//         description: "An active subscription was renewed."
//     },
//     SUBSCRIPTION_CANCELED: {
//         code: 3,
//         description: "A subscription was either voluntarily or involuntarily cancelled. For voluntary cancellation, sent when the user cancels."
//     },
//     SUBSCRIPTION_PURCHASED: {
//         code: 4,
//         description: "A new subscription was purchased."
//     },
//     SUBSCRIPTION_ON_HOLD: {
//         code: 5,
//         description: "A subscription has entered account hold (if enabled)."
//     },
//     SUBSCRIPTION_IN_GRACE_PERIOD: {
//         code: 6,
//         description: "A subscription has entered grace period (if enabled)."
//     },
//     SUBSCRIPTION_RESTARTED: {
//         code: 7,
//         description: "User has restored their subscription from Play > Account > Subscriptions. The subscription was canceled but had not expired yet when the user restores. For more information, see Restorations."
//     },
//     SUBSCRIPTION_PRICE_CHANGE_CONFIRMED: {
//         code: 8,
//         description: "A subscription price change has successfully been confirmed by the user."
//     },
//     SUBSCRIPTION_DEFERRED: {
//         code: 9,
//         description: "A subscription's recurrence time has been extended."
//     },
//     SUBSCRIPTION_PAUSED: {
//         code: 10,
//         description: "A subscription has been paused."
//     },
//     SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED: {
//         code: 11,
//         description: "A subscription pause schedule has been changed."
//     },
//     SUBSCRIPTION_REVOKED: {
//         code: 12,
//         description: "A subscription has been revoked from the user before the expiration time."
//     },
//     SUBSCRIPTION_EXPIRED: {
//         code: 13,
//         description: "A subscription has expired."
//     },
//     SUBSCRIPTION_PENDING_PURCHASE_CANCELED: {
//         code: 20,
//         description: "A pending transaction of a subscription has been canceled."
//     }
// };


// export {
//     saveAndroidSubscriptionLogs,
//     decodeAndroidSubscriptionMessage,
//     initializeAndroidSubscriptionListner,
//     SUBSCRIPTION_PLANS,
//     NOTIFICATION_TYPE
// }