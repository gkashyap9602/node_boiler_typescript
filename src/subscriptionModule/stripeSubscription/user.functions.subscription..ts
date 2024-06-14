
//*************************** */ Uncomment And Use This Functions For Stripe Subscription For User *******************************************

// import { showResponse } from "../../utils/response.util";
// import { findOne, createOne, findByIdAndUpdate, findOneAndUpdate, } from "../../helpers/db.helpers";
// import services from '../../services';
// import responseMessage from '../../constants/ResponseMessage'
// import statusCodes from '../../constants/statusCodes'
// import { ApiResponse } from "../../utils/interfaces.util";
// import * as stripeHelper from '../../helpers/stripe.helper'
// import sponserAuthModel from "../../models/Sponser/sponser.auth.model";
// import { APP, USER_STATUS } from "../../constants/app.constant";
// import sponserSubscriptionLogsModel from "../../models/Sponser/sponser.subscriptionLogs.model";
// import moment from "moment";
// import path from "path";
// import ejs from 'ejs'

// const sponserSubscriptionHandler = {

//     async getSubsciptionsPackagesList(): Promise<ApiResponse> {
//         let result = await stripeHelper.getProductList()

//         //filter those product that does not have  metadata info about flash and base coupon limit
//         const filteredProducts = result?.data?.filter((product: any) => {
//             const metadata = product.metadata;
//             return metadata.base_coupon_limit && metadata.flash_coupon_limit && product?.active //show only active products
//         });

//         if (result.status) {
//             return showResponse(true, responseMessage?.common.data_retreive_sucess, filteredProducts, statusCodes.SUCCESS);
//         }

//         return showResponse(false, responseMessage.common.data_not_found, null, statusCodes.API_ERROR);

//     }, //ends


//     async purchaseSubscription(data: any, sponser_id: string, upgrade_subscription: any = false): Promise<ApiResponse> {
//         let { total_amount, product_id, price_id, card_id } = data;
//         total_amount = parseFloat(total_amount);

//         //aquring the user details
//         const findProduct = await stripeHelper.getSubscriptionProductDetails(product_id)
//         // console.log(findProduct, "productFind")
//         if (!findProduct.status) {
//             return showResponse(false, findProduct?.message, null, statusCodes.API_ERROR);
//         }

//         //aquring the user details
//         const findSponser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } });
//         if (!findSponser.status) {
//             return showResponse(false, `Sponser ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }


//         let sponserSubscriptionDetails = findSponser.data?.subscription_details
//         //if sponser already purchased subscription then throw error
//         if (sponserSubscriptionDetails?.is_subscribed) {
//             return showResponse(false, `Subscription Already Purchased`, null, statusCodes.API_ERROR);
//         }

//         //if stripe acount not exist then create for user
//         if (findSponser.data?.stripe_acc_id == "") {
//             const sponserData = findSponser?.data
//             const customer = await stripeHelper.createCustomerId(sponserData?.email)
//             if (customer.status) {
//                 await findByIdAndUpdate(sponserAuthModel, { stripe_acc_id: customer?.data?.id }, sponserData?._id);
//             }
//         } //ends

//         const subscription_metadata = {
//             sponser_id: sponser_id?.toString(),
//             base_coupon_limit: findProduct?.data?.metadata?.base_coupon_limit,
//             flash_coupon_limit: findProduct?.data?.metadata?.flash_coupon_limit,
//             total_amount,
//             upgrade_subscription
//         };

//         //payment deduct from card_id
//         let subscriptionCreated = await stripeHelper.purchaseSubscriptionStripe(findSponser.data?.stripe_acc_id, price_id, subscription_metadata, card_id)
//         if (!subscriptionCreated.status) {
//             return showResponse(false, subscriptionCreated?.message, null, statusCodes.API_ERROR);
//         }

//         const editObj = {
//             'subscription_details.subscription_id': subscriptionCreated?.data?.id,
//             'subscription_details.invoice_url': subscriptionCreated?.data?.latest_invoice?.invoice_pdf,
//         };

//         await findByIdAndUpdate(sponserAuthModel, editObj, sponser_id);
//         return showResponse(true, responseMessage.common.subscription_purchased_success, null, statusCodes.SUCCESS);

//     },

//     async addCardStripe(data: any, sponser_id: string): Promise<ApiResponse> {
//         let { card_token_id } = data

//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { name: 1, profile_pic: 1, _id: 1, stripe_acc_id: 1 });
//         if (!findUser.status) {
//             return showResponse(false, `Sponser ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         // check for card already addedd or not
//         const findCard = await stripeHelper.checkDuplicateCardStripe(findUser?.data?.stripe_acc_id, card_token_id)
//         if (findCard.status) {
//             return showResponse(false, "Same Card Already Exists", null, statusCodes.API_ERROR);
//         }

//         //at last save card in stripe
//         let result = await stripeHelper.saveCardStripe(findUser?.data.stripe_acc_id, card_token_id)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, responseMessage.common.card_save_sucess, null, statusCodes.SUCCESS);


//     }, //ends

//     async getPaymentResourceList(sponser_id: string): Promise<ApiResponse> {

//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { name: 1, profile_pic: 1, _id: 1, stripe_acc_id: 1 });
//         if (!findUser.status) {
//             return showResponse(false, `Sponser ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         let result = await stripeHelper.getSavedResourceList(findUser?.data?.stripe_acc_id)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, responseMessage?.common.data_retreive_sucess, result?.data, statusCodes.SUCCESS);


//     }, //ends

//     async cancelSubscription(sponser_id: string): Promise<ApiResponse> {

//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { subscription_object: 0 });
//         if (!findUser.status) {
//             return showResponse(false, `Sponser ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         let { subscription_id, is_subscribed } = findUser?.data?.subscription_details

//         if (!is_subscribed && !subscription_id) {
//             return showResponse(false, `User Does Not Have Active Subscription`, null, statusCodes.API_ERROR);
//         }

//         let result = await stripeHelper.cancelUserSubscription(subscription_id)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, 'Subscription Cancel Successfully', result?.data, statusCodes.SUCCESS);


//     }, //ends

//     async upgradeSubscription(data: any, sponser_id: string): Promise<ApiResponse> {
//         let { total_amount, product_id, price_id, card_id } = data
//         console.log(sponser_id, "sponser_id")
//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { subscription_object: 0 });
//         if (!findUser.status) {
//             return showResponse(false, `Sponser ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         let { subscription_id, is_subscribed, plan_type } = findUser?.data?.subscription_details

//         if (!is_subscribed && !subscription_id) {
//             return showResponse(false, `User Does Not Have Active Subscription`, null, statusCodes.API_ERROR);
//         }

//         if (plan_type === product_id) {
//             return showResponse(false, `You Can Upgrade To higher-tier packages to enjoy additional features and services Only`, null, statusCodes.API_ERROR);
//         }

//         let result = await stripeHelper.cancelUserSubscription(subscription_id)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         let upgrade_subscription = true
//         let purchaseSubscription = await sponserSubscriptionHandler.purchaseSubscription(data, sponser_id, upgrade_subscription)
//         console.log(purchaseSubscription, "purchaseSubscription")
//         if (!purchaseSubscription.status) {
//             return showResponse(false, purchaseSubscription?.message, null, statusCodes.API_ERROR);
//         }
//         return showResponse(true, 'Subscription Upgrade Successfully', purchaseSubscription?.data, statusCodes.SUCCESS);


//     }, //ends

//     async deleteStripeCard(data: any, sponser_id: string): Promise<ApiResponse> {

//         let { card_id } = data

//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { name: 1, profile_pic: 1, _id: 1, stripe_acc_id: 1 });
//         if (!findUser.status) {
//             return showResponse(false, `User ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         //stripe make last recent card default if default card is deleted
//         //find all resources first atleaset 1 card is mandatory for subscription
//         let cardList = await stripeHelper.getSavedResourceList(findUser?.data?.stripe_acc_id)
//         if (!cardList.status) {
//             return showResponse(false, cardList?.message, null, statusCodes.API_ERROR);
//         }

//         //check if only one card is left
//         if (cardList?.data?.length == 1) {
//             return showResponse(false, responseMessage.common.atleast_one_card_required_for_subscription, null, statusCodes.API_ERROR);
//         }

//         let result = await stripeHelper.deleteCardStripe(findUser?.data?.stripe_acc_id, card_id)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, responseMessage?.common.delete_sucess, result?.data, statusCodes.SUCCESS);


//     }, //ends


//     // active subscription
//     async getActiveSubscription(sponser_id: string): Promise<ApiResponse> {

//         //aquring the user details
//         const findUser = await findOne(sponserAuthModel, { _id: sponser_id, status: { $ne: USER_STATUS.DELETED } }, { name: 1, profile_pic: 1, _id: 1, stripe_acc_id: 1 });
//         if (!findUser.status) {
//             return showResponse(false, `User ${responseMessage.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         let result = await stripeHelper.getSubscriptionProductDetails(findUser?.data?.subscription_details?.plan_type)
//         if (!result.status) {
//             return showResponse(false, result?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, responseMessage?.common.data_retreive_sucess, result?.data, statusCodes.SUCCESS);

//     }, //ends

//     //***********************************Webhook Update Function ******************************************* */

//     async updateSubscriptionDataWebhook(subscription: any, isSubscribed: boolean, eventType: string, isNewPurchase = false, isSubscriptionRenew = false, invoice_data?: any): Promise<ApiResponse> {
//         try {
//             console.log(eventType, "eventType")
//             console.log(isSubscribed, "isSubscribed")

//             let subscription_id = subscription?.id
//             let product = subscription?.plan?.product
//             let current_period_start = subscription?.current_period_start
//             let current_period_end = subscription?.current_period_end
//             const sponser_id = subscription?.metadata?.sponser_id;

//             if (!subscription_id) {
//                 console.log('subscription_id not available', subscription_id)
//             }

//             const base_coupon_limit = Number(subscription?.metadata?.base_coupon_limit);
//             const flash_coupon_limit = Number(subscription?.metadata?.flash_coupon_limit);

//             const updateObj: any = {
//                 'subscription_details.subscription_status': subscription.status,
//                 'subscription_details.is_subscribed': isSubscribed,
//                 'subscription_details.subscription_id': isSubscribed ? subscription_id : null,
//                 'subscription_details.plan_type': isSubscribed ? product : null,
//                 'subscription_details.plan_start_date': isSubscribed ? current_period_start : null,
//                 'subscription_details.plan_end_date': isSubscribed ? current_period_end : null,
//                 // 'subscription_details.invoice_url': subscription?.invoice_pdf ? subscription?.invoice_pdf : '',
//                 subscription_object: subscription,
//             };

//             if (base_coupon_limit) {
//                 updateObj.base_coupon_limit = base_coupon_limit
//             }
//             if (flash_coupon_limit) {
//                 updateObj.flash_coupon_limit = flash_coupon_limit
//             }

//             console.log(updateObj, "updateObjWebhhok")
//             console.log(subscription_id, "subscription_id")
//             const matchObj = {
//                 $or: [
//                     { 'subscription_details.subscription_id': subscription_id },
//                     { _id: sponser_id }  // Assuming 'sponser_id' is in the 'metadata' field
//                 ]
//             };

//             let updateSponser = await findOneAndUpdate(sponserAuthModel, matchObj, updateObj);
//             if (!updateSponser.status) {
//                 console.log("update failed", updateSponser)
//                 return showResponse(false, responseMessage?.common.save_failed, null, statusCodes.API_ERROR);
//             }

//             const logsObj = {
//                 sponser_id: sponser_id ?? updateSponser?.data?._id,
//                 subscription_object: subscription,
//                 subscription_status: subscription.status,
//                 event_type: eventType,
//                 is_new_purchase: isNewPurchase,
//                 is_subscription_renew: isSubscriptionRenew,
//                 hook_updated_on: moment().unix()
//             };

//             const refLog = new sponserSubscriptionLogsModel(logsObj);
//             const saveLogs = await createOne(refLog);
//             if (!saveLogs.status) {
//                 console.log("saveLogs failed", saveLogs)
//                 return showResponse(false, responseMessage?.common.save_failed, null, statusCodes.API_ERROR);
//             }

//             return showResponse(true, responseMessage?.common.added_success, null, statusCodes.SUCCESS);
//         } catch (err: any) {
//             // logger.error(`${this.req.ip} ${err.message}`)
//             return showResponse(false, err?.message ?? err, null, statusCodes.API_ERROR)
//         }

//     }, //ends

//     async sendInvoiceToUser(user_data: any, invoice_data: any,): Promise<ApiResponse> {
//         try {
//             // console.log(user_data, "user_data")
//             console.log(invoice_data, "invoice_data")
//             //send invoice as email to use
//             const logoPath = `${APP.BITBUCKET_URL}/${APP.PROJECT_LOGO}`;
//             const email_payload: any = {
//                 project_name: APP.PROJECT_NAME,
//                 user_name: user_data?.name,
//                 project_logo: logoPath,
//                 invoice_link: invoice_data?.invoice_link,
//                 invoice_type: invoice_data?.invoice_type

//             }

//             // console.log(email_payload, "email_payloadSend")

//             const template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'subscription_invoice.ejs'), email_payload);
//             //send email of attachment to admin
//             const to = user_data?.email
//             const subject = `Subscription Invoice`

//             const emailSend = await services.sendgridService.sendgridMail(to, subject, template)
//             console.log(emailSend, "emailSend")

//             return showResponse(true, 'success Send Invoice', null, statusCodes.SUCCESS);
//         } catch (err: any) {
//             // logger.error(`${this.req.ip} ${err.message}`)
//             return showResponse(false, err?.message ?? err, null, statusCodes.API_ERROR)
//         }

//     }, //ends

// };

// export default sponserSubscriptionHandler;