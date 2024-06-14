
//*************************** */ Uncomment And Use This Webhook For Stripe Subscription Updatation *******************************************


// import { ApiResponse } from "../../utils/interfaces.util";
// import SubscriptionHandler from './user.functions.subscription.';

// const paymentWebHookAdmin = async (event: any): Promise<ApiResponse> => {
//     let eventObject: any = {};
//     let subscription: any = {}
//     let invoice: any = {}
//
//     switch (event.type) {
//         case 'payment_intent.succeeded':
//             eventObject = event?.data?.object;
//             // console.log(eventObject, "eventObject")
//             if (eventObject?.status == 'succeeded') {
//                 //make sure to pass payment_for key in metadata while create payment intent
//                 if (eventObject?.metadata?.payment_for == 'coupon_book') {
//                     await userCouponHandler.updateCouponBookDataWebhook({ eventObject, payment_status: 'success' })
//                 }

//                 if (eventObject?.metadata?.payment_for == 'donation') {
//                     await userDonationHandler.updateDonationDataWebhook({ eventObject, payment_status: 'success' })
//                 }
//             }
//             break;

//         case 'payment_intent.payment_failed':
//             eventObject = event?.data?.object;
//             if (eventObject?.status == 'failed') {
//                 //make sure to pass payment_for key in metadata while create payment intent
//                 if (eventObject?.metadata?.payment_for == 'coupon_book') {
//                     await userCouponHandler.updateCouponBookDataWebhook({ eventObject, payment_status: 'failed' })
//                 }

//                 if (eventObject?.metadata?.payment_for == 'donation') {
//                     await userDonationHandler.updateDonationDataWebhook({ eventObject, payment_status: 'failed' })
//                 }

//             }
//             break;
//         // This event is triggered when a new subscription is created for a customer.
//         case 'customer.subscription.created':
//             subscription = event.data.object;
//             await SubscriptionHandler.updateSubscriptionDataWebhook(subscription, true, 'customer.subscription.created', true, false);
//             break;

//         //This event is triggered when a subscription is canceled or deleted.
//         case 'customer.subscription.deleted':
//             subscription = event?.data?.object;
//             await SubscriptionHandler.updateSubscriptionDataWebhook(subscription, false, 'customer.subscription.deleted');
//             break;
//         //This can occur when a scheduled change to a subscription, such as a plan upgrade or downgrade, is completed
//         case 'customer.subscription.pending_update_applied':
//             subscription = event.data.object;
//             await SubscriptionHandler.updateSubscriptionDataWebhook(subscription, true, 'customer.subscription.pending_update_applied');
//             break;
//         //This event is triggered when a pending update to a subscription expires without being applied.
//         case 'customer.subscription.pending_update_expired':
//             subscription = event.data.object;
//             await SubscriptionHandler.updateSubscriptionDataWebhook(subscription, false, 'customer.subscription.pending_update_expired');
//             break;
//         //This event is triggered when a subscription is updated. This can include changes to the plan, billing cycle, or metadata
//         case 'customer.subscription.updated':
//             subscription = event.data.object;
//             await SubscriptionHandler.updateSubscriptionDataWebhook(subscription, true, 'customer.subscription.updated');
//             break;
//         // This event is triggered when an invoice payment succeeds.
//         case 'invoice.paid':
//             console.log('invoice.paid')
//             invoice = event.data.object;
//             let subscription_id = invoice?.subscription
//             const matchObj = { 'subscription_details.subscription_id': subscription_id }

//             let findSponser = await findOne(sponserAuthModel, matchObj);
//             if (findSponser.status) {
//                 // console.log("underif")
//                 let billing_reason = invoice?.billing_reason
//                 let invoice_link = invoice?.invoice_pdf
//                 let productData = invoice?.lines?.data?.filter((inv: any) => inv?.price?.product)
//                 console.log(productData, "productData")
//                 console.log(invoice?.lines?.data, "invoicedata")

//                 let product = productData?.length > 0 ? productData[0]?.price?.product : null

//                 console.log(billing_reason, "billing_reason")

//                 let invoice_data: any = {
//                     invoice_link,
//                 }

//                 if (billing_reason == 'subscription_create') {
//                     invoice_data.invoice_type = 'purchase'
//                 }

//                 if (billing_reason == 'subscription_cycle') {
//                     invoice_data.invoice_type = 'renewal'
//                 }

//                 const logsObj = {
//                     sponser_id: findSponser?.data?._id,
//                     payment_status: invoice?.status,
//                     event_type: 'invoice.paid',
//                     billing_reason: billing_reason,
//                     product_id: product,
//                     total_amount: Number(invoice?.total) / 100,
//                     is_subscription: product ? true : false,
//                     invoice_object: invoice
//                 };

//                 const refLog = new sponserPaymentInvoiceModel(logsObj);
//                 const saveLogs = await createOne(refLog);
//                 if (!saveLogs.status) {
//                     console.log("saveLogs failed", saveLogs)
//                     return showResponse(false, responseMessage?.common.save_failed, null, statusCodes.API_ERROR);
//                 }

//                 await SubscriptionHandler.sendInvoiceToUser(findSponser?.data, invoice_data);

//             } else {
//                 console.log("sponser not found webhhok invoice succedd")
//             } //ends

//             break;

//         //This event is triggered when an invoice payment failed. This often occurs for recurring subscription payments.
//         // case 'invoice.payment_failed': // It is for subscription renewal
//         //     invoice = event.data.object;
//         //     // subscription = invoice.subscription; // Subscription ID
//         //     // const stripe: any = await initialiseStripe()
//         //     // const subscriptionDetails = await stripe.subscriptions.retrieve(subscription);
//         //     // console.log(subscriptionDetails, "subscriptionDetailssubscriptionDetails")
//         //     // const product = subscriptionDetails?.items.data[0]?.price.product;
//         //     // const currentPeriodStart = subscriptionDetails?.current_period_start;
//         //     // const currentPeriodEnd = subscriptionDetails?.current_period_end;

//         //     let invoice_data = { product: null, currentPeriodStart, currentPeriodEnd }
//         //     await SubscriptionHandler.updateSubscriptionDataWebhook(invoice, false, 'invoice.payment_failed', false, true, invoice_data);
//         //     break;

//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     return showResponse(true, `Webhook Success: ${event?.data}`, null, 200);
// } //ends