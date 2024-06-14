
//*************************** */ Uncomment And Use This Functions For Stripe Subscription For Admin *******************************************



// import { showResponse } from "../../utils/response.util";
// import { findOne } from "../../helpers/db.helpers";
// import services from '../../services';
// import responseMessage from '../../constants/ResponseMessage'
// import statusCodes from '../../constants/statusCodes'
// import { ApiResponse } from "../../utils/interfaces.util";
// import * as stripeHelper from '../../helpers/stripe.helper'


// const AdminSubscriptionHandler = {

//     async addSubscriptionPackage(data: any, sponser_id: string): Promise<ApiResponse> {
//         let { package_name, price, description, base_coupon_limit, flash_coupon_limit, interval = 'year' } = data;
//         price = parseFloat(price);
//         base_coupon_limit = Number(base_coupon_limit);
//         flash_coupon_limit = Number(flash_coupon_limit);


//         let findProduct = await stripeHelper.getProductList()
//         if (findProduct.status) {
//             const existingProduct = findProduct?.data?.find((product: any) => product?.name === package_name);
//             if (existingProduct) {
//                 return showResponse(false, 'Package already exists', null, statusCodes.API_ERROR);
//             }
//         } //ends

//         const package_payload = {
//             ...data,
//             metadata: {
//                 base_coupon_limit,
//                 flash_coupon_limit
//             }
//         };

//         //create product on stripe
//         let createPackage = await stripeHelper.createProductPackage(package_payload)
//         // console.log(createPackage, "createPackage")
//         if (!createPackage.status) {
//             return showResponse(false, createPackage?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, 'Package Created Successfully', null, statusCodes.SUCCESS);

//     },

//     async getSubsciptionsPackagesList(): Promise<ApiResponse> {
//         let result = await stripeHelper.getProductList()

//         if (result.status) {
//             return showResponse(true, responseMessage?.common.data_retreive_sucess, result?.data, statusCodes.SUCCESS);
//         }

//         return showResponse(false, responseMessage.common.data_not_found, null, statusCodes.API_ERROR);

//     }, //ends

//     async getSubsciptionsPackageDetails(product_id: string): Promise<ApiResponse> {

//         let result = await stripeHelper.getSubscriptionProductDetails(product_id)
//         if (result.status) {
//             return showResponse(true, responseMessage?.common.data_retreive_sucess, result?.data, statusCodes.SUCCESS);
//         }

//         return showResponse(false, responseMessage.common.data_not_found, null, statusCodes.API_ERROR);

//     }, //ends

//     async updateSubscriptionPackage(data: any): Promise<ApiResponse> {
//         let { product_id, package_name, price, description, base_coupon_limit, flash_coupon_limit, status } = data;
//         price = parseFloat(price);
//         base_coupon_limit = Number(base_coupon_limit);
//         flash_coupon_limit = Number(flash_coupon_limit);

//         let findProduct = await stripeHelper.getSubscriptionProductDetails(product_id)
//         if (!findProduct.status) {
//             return showResponse(false, `Product ${responseMessage?.common.not_exist}`, null, statusCodes.API_ERROR);
//         }

//         const packageUpdatePayload: any = { product_id };

//         if (package_name) {
//             packageUpdatePayload.package_name = package_name
//         }

//         if (price && findProduct.data?.price_value !== price) {
//             packageUpdatePayload.price = price
//         }
//         if (description) {
//             packageUpdatePayload.description = description
//         }

//         //update metadata of subscription features
//         if (base_coupon_limit && flash_coupon_limit) {
//             packageUpdatePayload.metadata = { flash_coupon_limit, base_coupon_limit }
//         }

//         //update metadata of subscription features
//         if (base_coupon_limit && !flash_coupon_limit) {
//             let previousMetadata = findProduct?.data?.metadata
//             packageUpdatePayload.metadata = { flash_coupon_limit: previousMetadata?.flash_coupon_limit, base_coupon_limit }
//         }

//         //update metadata of subscription features
//         if (flash_coupon_limit && !base_coupon_limit) {
//             let previousMetadata = findProduct?.data?.metadata
//             packageUpdatePayload.metadata = { base_coupon_limit: previousMetadata?.base_coupon_limit, flash_coupon_limit }
//         }

//         //create product on stripe
//         let updatePackage = await stripeHelper.updateProductPackage(packageUpdatePayload)
//         // console.log(createPackage, "createPackage")
//         if (!updatePackage.status) {
//             return showResponse(false, updatePackage?.message, null, statusCodes.API_ERROR);
//         }

//         return showResponse(true, 'Package Updated Successfully', null, statusCodes.SUCCESS);

//     },

//     async activeInactiveSubscriptionPackage(data: any): Promise<ApiResponse> {
//         let { product_id, active } = data;
//         active = Boolean(active)
//         //create product on stripe
//         let updatePackage = await stripeHelper.updateProductPackage({ product_id, active })
//         // let deletePackages = await stripeHelper.deleteProductPackage(product_id)
//         console.log(updatePackage, "updatePackage")
//         if (!updatePackage.status) {
//             return showResponse(false, updatePackage?.message, null, statusCodes.API_ERROR);
//         }

//         let msg = 'Inactived'
//         if (active) {
//             msg = 'Activated'
//         }

//         return showResponse(true, `Package Successfully ${msg}`, null, statusCodes.SUCCESS);

//     },


// };

// export default AdminSubscriptionHandler;