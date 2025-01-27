import { ApiResponse } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { createOne, } from "../../helpers/db.helpers";
import responseMessage from '../../constants/responseMessages'
import statusCodes from '../../constants/statusCodes'
import adminContactusModel from '../../models/Admin/admin.contactus.model';
import axios from "axios";
const GOOGLE_SERP_API_KEY = 'MrUrDBSIaz0SvWvgmQhmZAX4lwQ9aWR9'
const WEB_SCRAPER_API_KEY = 'eeba97490fa099fb3ac08e5b6c183dbb'
import * as cheerio from 'cheerio';
const GOOGLE_SERP_API = (api_key: string, query: string, options: any = {}) => {
    // Base URL with mandatory parameters
    let url = `https://serpapi.webscrapingapi.com/v2?engine=google&api_key=${api_key}&q=${query}`;

    // Add optional parameters if they are provided
    if (options.country) {
        url += `&gl=${options.country}`;
    }
    if (options.result_per_page) {
        url += `&num=${options.result_per_page}`;
    }
    if (options.display_lang) {
        url += `&hl=${options.display_lang}`;
    }

    return url;
};

const WEB_SCRAPER_API = (apiKey: string, productUrl: string, parseToJson: boolean = true) => `https://api.scraperapi.com/?api_key=${apiKey}&url=${productUrl}&autoparse=${parseToJson}`

const UserCommonHandler = {

    contactUs: async (data: any): Promise<ApiResponse> => {
        const contactUsRef = new adminContactusModel(data);

        const response = await createOne(contactUsRef);
        if (!response.status) {
            return showResponse(false, responseMessage?.common?.contactUs_error, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage?.common?.contactUs_success, null, statusCodes.SUCCESS)
    },

    searchProduct: async (data: any): Promise<ApiResponse> => {
        try {
            const { product_name, country, result_per_page = 5 } = data
            const itemSize = Number(result_per_page)
            console.log(data, "paylaod")
            const options = {
                country,
                result_per_page: itemSize,
                display_lang: 'en'
            }

            const apiUrl = GOOGLE_SERP_API(GOOGLE_SERP_API_KEY, product_name, options)

            const response = await axios.get(apiUrl)
            if (!response.data?.organic) {
                return showResponse(false, 'Failed to search or no products found', null, statusCodes.API_ERROR);
            }

            const organicItems = response.data.organic;
            const item_count = organicItems.length;

            // Fetch product details for each item concurrently
            const result = await Promise.all(organicItems.map(async (item: any) => {
                // Check if the item has a link
                if (!item.link) {
                    // Return an object with empty images if link is missing
                    return {
                        link: item.link,
                        display_link: item.display_link,
                        title: item.title,
                        description: item.description,
                        images: [],
                        product_details: {} // Ensure empty object
                    };
                }

                // If link exists, fetch product details
                let productDetails: any;
                productDetails = await UserCommonHandler.getProductDetails({ product_link: item.link });
                console.log(productDetails.data)
                // Check if product details were successfully fetched
                if (!productDetails?.status) {
                    return {
                        link: item.link,
                        display_link: item.display_link,
                        title: item.title,
                        description: item.description,
                        images: [], // Return empty images array if product details fetch failed
                        product_details: {} // Ensure empty object
                    };
                }

                // Return the item with product details
                return {
                    link: item.link,
                    display_link: item.display_link,
                    title: item.title,
                    description: item.description,
                    images: productDetails?.data?.images || [], // Ensure empty array if no images
                    product_details: productDetails?.data || {} // Ensure empty object
                };
            }));


            // Filter out any null entries in the result
            const filteredResult = result.filter(item => item !== null);

            return showResponse(true, 'here are list of products', { result: filteredResult, item_count }, statusCodes.SUCCESS)
        } catch (err: any) {
            console.log(err, "ercatch")
            const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
            return showResponse(false, error, null, statusCodes.API_ERROR)
        }
    },
    //end
    getProductDetails: async (data: any): Promise<ApiResponse> => {
        try {
            const { product_link } = data

            const apiUrl = WEB_SCRAPER_API(WEB_SCRAPER_API_KEY, product_link, true)

            const response = await axios.get(apiUrl)
            if (!response.data) {
                return showResponse(false, 'failed to get product details', null, statusCodes.API_ERROR)
            }

            // const result = {
            //     product_name: response?.data?.product_name,
            //     product_short_description: response?.data?.product_short_description,
            //     product_url: response?.data?.product_url,
            //     sold_by: response?.data?.sold_by,
            //     brand: response?.data?.brand,
            //     images: response?.data?.images,
            //     price: response?.data?.price,
            //     price_currency: response?.data?.price_currency,
            //     average_rating: response?.data?.average_rating,
            // }


            // // L
            

            // return showResponse(true, 'here is product details', result, statusCodes.SUCCESS)
            return showResponse(true, 'here is product details', response?.data, statusCodes.SUCCESS)

        } catch (err: any) {
            console.log(err, "ercatch")
            console.log(err?.response?.data?.Message, "MessageMessage")
            const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
            return showResponse(false, error, null, statusCodes.API_ERROR)
        }
    },
    //end
}

export default UserCommonHandler 
