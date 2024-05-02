import Stripe from 'stripe';
import { STRIPE_CREDENTIAL } from "../constants/app.constant";
import { showResponse } from "../utils/response.util";


const initialiseStripe = async () => {
    const STRIPE_SEC_KEY = await STRIPE_CREDENTIAL.STRIPE_SEC_KEY

    let stripeInit = new Stripe(STRIPE_SEC_KEY, {
        // @ts-ignore
        apiVersion: STRIPE_CREDENTIAL.STRIPE_VERSION,
        typescript: true
    });

    return stripeInit

} //ends

const createPaymentIntentStripe = async (stripe_acc_id: string, metadata: any, amount: number) => {
    try {
        let paymentIntent: any = {
            currency: 'usd',
            customer: stripe_acc_id,
            amount: amount,
            automatic_payment_methods: {
                enabled: true
            },
            metadata: metadata
        }
        const stripe: any = await initialiseStripe()

        let stripePiResponse = await stripe.paymentIntents.create(paymentIntent);

        if (stripePiResponse) {
            return showResponse(true, 'Request success', stripePiResponse, 200);
        }

        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error) {
        return showResponse(false, 'Request failed Catch', null, 400);

    }

} //ends

const createCustomerIdStripe = async (email: string) => {

    const stripe: any = await initialiseStripe()

    let customer = await stripe.customers.create({ email: email }); //first tym acc create
    if (customer) {
        return showResponse(true, 'Request success', customer, 200);
    }

    return showResponse(false, 'Request failed!!', null, 400);

} //ends

const getPaymentIntentStripe = async (paymentIntentId: string) => {
    try {
        const stripe: any = await initialiseStripe()
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent) {
            return showResponse(true, 'Intent Status Is', paymentIntent, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error) {
        // Handle errors
        console.error('Error retrieving PaymentIntent:', error);
        return showResponse(false, 'Request failed!!', null, 400);

    }
} //ends

const paymentRefundStripe = async (charge_id: string, refund_amount: any, metadata_value_id: string) => {
    const stripe: any = await initialiseStripe()

    return new Promise((resolve) => {
        stripe.refunds.create({
            amount: refund_amount,
            charge: charge_id,
            // reason:"Refunded amount, because declined the request.",
            metadata: {
                refund_amount: refund_amount,
                charge_id: charge_id,
                appointment_id: metadata_value_id,
            }
        }).then((refund: any) => {
            // Resolve with the charge object if successful
            resolve({ status: true, message: "Amount refunded successfully", data: refund });
        }).catch((error: any) => {
            // Reject with the error if transfer fails
            resolve({ status: false, message: (error?.message) ?? "Unable to refunded amount", data: error });
        });
    });
} //ends


export { initialiseStripe, createPaymentIntentStripe, paymentRefundStripe, getPaymentIntentStripe, createCustomerIdStripe }
