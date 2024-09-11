import Stripe from 'stripe';
import { STRIPE_CREDENTIAL } from "../constants/app.constant";
import { showResponse } from "../utils/response.util";
import { generateTenDigitNumber } from './common.helper';


const initialiseStripe = async () => {
    try {
        const STRIPE_SEC_KEY = await STRIPE_CREDENTIAL.STRIPE_SEC_KEY
        const stripeInit = new Stripe(STRIPE_SEC_KEY, {
            // @ts-ignore
            apiVersion: STRIPE_CREDENTIAL.STRIPE_VERSION,
            typescript: true
        });

        return stripeInit
    } catch (error) {
        console.log(error, "eroorrr Stripe")
    }

}

const createPaymentIntent = async (user_data: any, metadata: any, amount: number) => {

    const paymentIntent: any = {
        currency: 'usd',
        customer: user_data?.stripe_cus_id,
        amount: amount,
        automatic_payment_methods: {
            enabled: true
        },
        metadata: metadata
    }
    const stripe: any = await initialiseStripe()

    const stripePiResponse = await stripe.paymentIntents.create(paymentIntent);
    if (stripePiResponse) {
        return showResponse(true, 'Request success', stripePiResponse, 200);
    }

    return showResponse(false, 'Request failed!!', null, 400);


}
const createCustomerId = async (email: string) => {

    const stripe: any = await initialiseStripe()

    const customer = await stripe.customers.create({ email: email }); //first tym acc create
    if (customer) {
        return showResponse(true, 'Request success', customer, 200);
    }

    return showResponse(false, 'Request failed!!', null, 400);

}

const getCustomerDetails = async (data: any) => {
    try {
        const { stripe_customer_id, default_payment_source = false } = data

        const stripe: any = await initialiseStripe()
        const customer = await stripe.customers.retrieve(stripe_customer_id);

        if (customer) {
            //if default_payment_source is true then check default source of payment is added by the customer or not
            if (default_payment_source) {
                if (!customer.default_source && !customer.invoice_settings.default_payment_method) {
                    // Customer does not have a default payment source or payment method
                    return showResponse(false, 'Customer does not have a valid payment source or default payment method.', null, 400);
                }
            }

            return showResponse(true, 'Customer Details is', customer, 200);

        }
        return showResponse(false, 'stripe customer get Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const getPaymentIntent = async (paymentIntentId: string) => {
    try {
        const stripe: any = await initialiseStripe()
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent) {
            return showResponse(true, 'Intent Status Is', paymentIntent, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const stripePaymentRefund = async (transferId: string, refundAmountInCents: any, appointmentId: any) => {
    const stripe: any = await initialiseStripe()

    return new Promise((resolve) => {
        stripe.refunds.create({
            amount: refundAmountInCents, // already in cents
            charge: transferId,
            // reason:"Refunded amount, because spa-owner has declined appointment request.",
            metadata: {
                refund_amount: refundAmountInCents,
                charge_id: transferId,
                appointment_id: appointmentId,
            }
        }).then((refund: any) => {
            // Resolve with the charge object if successful
            resolve({ status: true, message: "Amount refunded successfully", data: refund });
        }).catch((error: any) => {
            // Reject with the error if transfer fails
            resolve({ status: false, message: (error?.message) ?? "Unable to refunded amount", data: error });
        });
    });
}


//subscription that user subscribes list
const getSubscriptionList = async () => {
    try {
        const stripe: any = await initialiseStripe()

        const subscriptionList = await stripe.subscriptions.list({
            limit: 10
        });

        if (subscriptionList) {
            return showResponse(true, 'Subscription List  is', subscriptionList, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const getProductList = async (limit = 10) => {
    try {
        const stripe: any = await initialiseStripe()

        const subscriptionList = await stripe.products.list({
            limit: limit
        });

        if (subscriptionList) {

            const listPayload = await Promise.all(subscriptionList?.data?.map(async (val: any) => {
                const price_value = await getPriceValue(val?.default_price);

                const obj = { ...val, price_value: price_value?.data }; // Assuming price_value is an array, use price_value[0].data if you want the first element
                return obj;
            }))

            // Sort the subscription list
            const sortedSubscriptionList = listPayload.sort((a, b) => {
                return a.price_value - b.price_value
            });


            return showResponse(true, 'Subscription List is Status Is', sortedSubscriptionList, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}


const getSubscriptionProductDetails = async (product_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const subscriptionProduct = await stripe.products.retrieve(product_id)
        if (subscriptionProduct) {

            const priceValueData = await getPriceValue(subscriptionProduct?.default_price);
            const productData = { ...subscriptionProduct, price_value: priceValueData?.data }

            return showResponse(true, 'Product Details Found ', productData, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, 'Product DetailsRequest failed!!', 400);

    }
}


const purchaseSubscriptionStripe = async (stripe_customer_id: string, price_id: string, metadata: any, payment_source_id?: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const subscription_options: any = {
            customer: stripe_customer_id,
            items: [{ price: price_id }],
            metadata: metadata,
            expand: ['latest_invoice.payment_intent'],
        }

        //if payment source id is not present then  payment should be from default payment source 
        //but first check default source is addedd or not else throw error
        if (!payment_source_id) {
            // checking default payment source is present or not
            const customer = await getCustomerDetails({ stripe_customer_id, default_payment_source: true })
            if (!customer.status) {
                return showResponse(false, customer?.message, customer?.data, 400);
            }

            //add default payment method card to pay if default card is set 
            subscription_options.payment_settings = { payment_method_types: ['card'] }

        } //ends

        //if payment source id is present then cut payment from that source
        if (payment_source_id) {
            //add payment method card to pay  
            subscription_options.default_source = payment_source_id
        }

        const subscription = await stripe.subscriptions.create(subscription_options);
        if (subscription) {
            return showResponse(true, 'Subscription Created Successfully', subscription, 200);
        }
        return showResponse(false, 'Subscription Creation Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const getPriceValue = async (price_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const getPrice = await stripe.prices.retrieve(price_id)
        if (getPrice) {
            // Extract the numeric value
            const amount = getPrice.unit_amount_decimal / 100  // Divide by 100 to convert from cents to dollars
            return showResponse(true, 'Price is', amount, 200);

        }
        return showResponse(false, 'Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const saveCardStripe = async (customer_id: string, token_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const savecard = await stripe.customers.createSource(customer_id, { source: token_id });
        if (savecard) {
            return showResponse(true, 'Card Saved Successfully', savecard, 200);
        }
        return showResponse(false, 'Card Saved Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        // console.error('Error Card Saved :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, 'Card Saved Request failed!!', 400);

    }
}


const getSavedResourceList = async (customer_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const cardList = await stripe.customers.listSources(customer_id, { object: 'card' });
        if (cardList) {
            return showResponse(true, 'Card List Fetched Successfully', cardList?.data, 200);
        }
        return showResponse(false, 'get Resource List Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Resource List Request failed :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const cancelUserSubscription = async (subscription_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const subscriptionCancel = await stripe.subscriptions.cancel(subscription_id);
        if (subscriptionCancel) {
            return showResponse(true, 'Subscription Cancel Successfully', subscriptionCancel, 200);
        }
        return showResponse(false, 'Error While Subscription Cancel ', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Subscription Cancel Request failed :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const deleteCardStripe = async (customer_id: string, card_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const deleteCard = await stripe.customers.deleteSource(customer_id, card_id);
        if (deleteCard) {
            return showResponse(true, 'Card Deleted Successfully', deleteCard, 200);
        }
        return showResponse(false, 'Card Deleted Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Error Card Deleted :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, 'Card Deleted Request failed!!', 400);

    }
}

const getCardTokenDetails = async (token_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        const getToken = await stripe.tokens.retrieve(token_id);
        if (getToken) {
            return showResponse(true, 'Token Details fetch Successfully', getToken, 200);
        }
        return showResponse(false, 'token Details Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('token Details Request failed :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, 'token Details Request failed!!', 400);

    }
}

const getCustomerCardDetails = async (customer_id: string, token_id: string) => {
    try {
        const stripe: any = await initialiseStripe()

        // const getCard = await stripe.customers.retrieveSource(customer_id, token_id);
        const getCard = await stripe.customers.retrieveSource(customer_id, token_id);
        if (getCard) {
            return showResponse(true, 'Card Details fetch Successfully', getCard, 200);
        }
        return showResponse(false, 'Card Details Request failed!!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Card Details Request failed :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, 'Card Details Request failed!!', 400);

    }
}


const checkDuplicateCardStripe = async (customer_id: string, token_id: string) => {
    try {
        const cardData = await getCardTokenDetails(token_id)
        const cardFingerPrint = cardData?.data?.card?.fingerprint
        const cardList = await getSavedResourceList(customer_id)

        if (cardList?.data?.length > 0) {
            const cardsDataList = cardList?.data
            const isDuplicate = cardsDataList.some((card: any) => card.fingerprint === cardFingerPrint)
            if (isDuplicate) {
                return showResponse(true, 'Card is already added', null, 200);
            }
        }
        return showResponse(false, 'Failed To Check Card Details', null, 400);

    } catch (error: any) {
        console.error('Failed Check Card Details :', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
} //ends

const createProductPackage = async (payload: any) => { //interval is like month year package
    try {
        //set default interval to year if interval not provided
        const { package_name, description, metadata = {}, interval = 'year' } = payload
        const price = Math.round(payload?.price * 100)
        const stripe: any = await initialiseStripe();

        // Create the product
        const productPayload = {
            name: package_name,
            description,
            metadata: metadata,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
                recurring: {
                    interval: interval,
                }
            }
        };

        const product = await stripe.products.create(productPayload);
        if (product) {
            return showResponse(true, 'Product and Price Created Successfully', product, 200);
        }

        return showResponse(false, 'Product creation failed!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Error creating product and price:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
};

const updateProductPackage = async (payload: any) => { //interval is like month year package
    try {
        //product is by default set to true if payload not provide to false means inactivate/archive the product 
        //interval year by default if interval is not provided
        const { product_id, package_name, description, metadata, interval = 'year', active = true } = payload
        let price = payload?.price
        const stripe: any = await initialiseStripe();

        const productUpdatePayload: any = { active }
        let default_price: any

        //if price yet to be chnage than create price and update product
        if (price) {
            price = Math.round(price * 100)

            const pricePayload: any = {
                product: product_id,
                unit_amount: price,
                currency: 'usd',
            };

            if (interval) {
                pricePayload.recurring = {
                    interval: interval,
                }
            }

            const newPriceObj = await stripe.prices.create(pricePayload);
            if (newPriceObj) {
                default_price = newPriceObj?.id
            }
        } //ends

        if (package_name) {
            productUpdatePayload.name = package_name
        }

        if (description) {
            productUpdatePayload.description = description
        }

        if (default_price) {
            productUpdatePayload.default_price = default_price
        }

        if (metadata) {
            productUpdatePayload.metadata = metadata
        }

        const productUpdate = await stripe.products.update(product_id, productUpdatePayload);
        if (productUpdate) {
            return showResponse(true, 'Product Updated Successfully', productUpdate, 200);
        }

        return showResponse(false, 'Product Updation failed!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Error updating product and price:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
};

const deleteProductPackage = async (product_id: string) => { //interval is like month year package
    try {
        const stripe: any = await initialiseStripe();

        const productDelete = await stripe.products.del(product_id);
        if (productDelete && productDelete?.deleted) {
            return showResponse(true, 'Product Deleted Successfully', productDelete, 200);
        }

        return showResponse(false, 'Product Deleted failed!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Error Deleted product and price:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
};

//archive the product price so that it can not be used in future purchase or if wan to restore it set to active else false
const activeOrInactiveProductPrice = async (price_id: string, price_status: boolean) => { //interval is like month year package
    try {
        const stripe: any = await initialiseStripe();

        const priceUpdate = await stripe.prices.update(price_id, { lookup_key: 'MY_LOOKUP_KEY', active: price_status, });
        if (priceUpdate) {
            return showResponse(true, 'Product Price Update Successfully', priceUpdate, 200);
        }

        return showResponse(false, 'Product Price Update failed!', null, 400);

    } catch (error: any) {
        // Handle errors
        console.error('Error Update product and price:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
};

//----------connect stripe---------------------
const createPayout = async (data: any, currency = 'usd') => {
    try {
        const { amount, cardId } = data
        const stripe: any = await initialiseStripe()
        const payout = await stripe.payouts.create({
            amount: amount * 100, // Amount in cents
            currency: currency,
            method: 'instant',
            destination: cardId,
        });
        // return payout;
        return showResponse(true, 'payout create Successfully', payout, 200);
    } catch (error: any) {
        console.error('Error creating payout:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
}


const getCustomer = async (customerId: string) => {
    try {
        const stripe: any = await initialiseStripe()
        const customer = await stripe.customers.retrieve(customerId);

        return showResponse(true, 'customer Details Fetch Successfully', customer, 200);

        // return customer;
    } catch (error: any) {
        console.error('Error retrieving customer:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
}
const createStripeConnectedAccount = async (email: string) => {
    try {
        const stripe: any = await initialiseStripe(); // Initialise Stripe instance

        // Create Stripe account parameters
        const accountParams = {
            type: 'express',
            country: 'US',
            email: email,
            business_type: 'individual',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            }
        };

        // Create the Stripe account
        const account = await stripe.accounts.create(accountParams);
        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://dev.galileotax.com/setup',
            return_url: "https://dev.galileotax.com/setup",
            type: 'account_onboarding'
        });
        // Return the created account object
        if (!account) {
            return showResponse(false, 'account Creation failed', null, 400);
        }
        return showResponse(true, 'account Created Successfully', { account, accountLink }, 200);


    } catch (error: any) {
        console.error('Error creating Stripe account:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
};

const reteriveStripeConnectedAccount = async (account_id: string) => {
    try {

        const stripe: any = await initialiseStripe()
        const account = await stripe.accounts.retrieve(account_id);
        if (account) {
            return showResponse(true, 'account Details Fetch Successfully', account, 200);
        }
        return showResponse(false, 'account Details Fetch failed', null, 400);
    } catch (error: any) {
        console.error('Error creating Stripe account:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);
    }
}


const transferMoney = async (amount: number, account_id: string,) => {
    try {
        const transfer_id = generateTenDigitNumber();
        const transferObj = {
            amount: amount * 100, // Amount in cents
            currency: 'usd',
            destination: account_id, // Connected account ID
            transfer_group: transfer_id // Transfer group ID unique
        }
        const stripe: any = await initialiseStripe(); // Initialise Stripe instance
        const transferData = await stripe.transfers.create(transferObj);
        if (transferData?.transfer_group === transfer_id) {
            return showResponse(true, 'Transfer Successful', transferData, 200);
        }
        return showResponse(false, 'Transfer failed', null, 400);
    } catch (error: any) {
        console.error('Error transferring money:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const tranferList = async (limit: number = 10) => {
    try {
        const stripe: any = await initialiseStripe()
        const trnasferList = await stripe.transfers.list({
            limit: limit
        });
        if (trnasferList) {
            return showResponse(true, 'Tranfer List  is', trnasferList, 200);
        }
        return showResponse(false, 'Request failed!!', null, 400);
    } catch (error: any) {
        console.error('Error Listsing tranfered money:', error);
        const errorMessage = error.raw ? error.raw.message : error.message;
        return showResponse(false, errorMessage, null, 400);

    }
}

const connectExternalAccount = async (account_id: string, token_id: string) => {
    const stripe: any = await initialiseStripe()

    const externalAccountData = await stripe.accounts.createExternalAccount(account_id, { external_account: token_id });
    if (externalAccountData) {
        return showResponse(true, 'External Account Connected Successfully', externalAccountData, 200); // return account id starts with 'ba_
    }
    return showResponse(false, 'External Account Connection failed', null, 400);
}

const reteriveExternalAccount = async (account_id: string, external_account_id: string) => {
    const stripe: any = await initialiseStripe()

    const externalAccountData = await stripe.accounts.retrieveExternalAccount(account_id, external_account_id);
    if (externalAccountData) {
        return showResponse(true, 'External Account Details Fetched Successfully', externalAccountData, 200);
    }
    return showResponse(false, 'External Account Details Fetch failed', null, 400);
}

const deleteExternalAccount = async (account_id: string, external_account_id: string) => {

    const stripe: any = await initialiseStripe()
    const deleteAcc = await stripe.accounts.deleteExternalAccount(account_id, external_account_id);
    if (deleteAcc?.deleted) {
        return showResponse(true, 'External Account Deleted Successfully', null, 200);
    }
    return showResponse(false, 'External Account Deletion failed', null, 400);
}



export {
    //common functions
    initialiseStripe,
    createPaymentIntent,
    stripePaymentRefund,
    getPaymentIntent,
    createCustomerId,
    getPriceValue,
    getCustomerDetails,

    //Card Or Resource Functions
    saveCardStripe,
    deleteCardStripe,
    getSavedResourceList,//card list 
    getCardTokenDetails,
    checkDuplicateCardStripe,
    getCustomerCardDetails,
    //subscription or Product  Functions
    getSubscriptionList,
    getProductList,
    purchaseSubscriptionStripe,
    createProductPackage,
    updateProductPackage,
    getSubscriptionProductDetails,
    deleteProductPackage,
    cancelUserSubscription,
    activeOrInactiveProductPrice,
    //connect stripe Functions
    createPayout,
    getCustomer,
    createStripeConnectedAccount,
    //transfer fund Functions
    transferMoney,
    tranferList,
    //connect external account Functions
    connectExternalAccount,
    reteriveExternalAccount,
    deleteExternalAccount,
    reteriveStripeConnectedAccount
}
