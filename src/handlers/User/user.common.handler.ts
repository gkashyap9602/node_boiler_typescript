import { ApiResponse, IRecordOfAny } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { createOne, } from "../../helpers/db.helpers";
import responseMessage from '../../constants/responseMessages'
import statusCodes from '../../constants/statusCodes'
import adminContactusModel from '../../models/Admin/admin.contactus.model';
import axios from "axios";
const WEB_SCRAPER_API_KEY = '4076997fd5412bfeccb441029b4c6426'//9602@

function keysDeleteFromObject(userData: IRecordOfAny, keys: string[] = ['feature_bullets', 'review', 'reviews']) {
    keys.forEach((key) => {
        if (key in userData) {
            delete userData[key];
        }
    });

    return userData
}

//AMAZON PRODUCT SCRAPPING APIS 
const PRODUCT_SEARCH_SCRAPER_API = (apiKey: string, query: string, country_code: string, parseToJson: boolean = true) => `https://api.scraperapi.com/structured/amazon/search?api_key=${apiKey}&query=${query}&autoparse=${parseToJson}&output_format=json&country_code=${country_code}`
const PRODUCT_DETAILS_SCRAPER_API = (apiKey: string, asin: string, parseToJson: boolean = true) => `https://api.scraperapi.com/structured/amazon/product?api_key=${apiKey}&asin=${asin}&autoparse=${parseToJson}&output_format=json`

const UserCommonHandler = {

    contactUs: async (data: any): Promise<ApiResponse> => {
        const contactUsRef = new adminContactusModel(data);

        const response = await createOne(contactUsRef);
        if (!response.status) {
            return showResponse(false, responseMessage?.common?.contactUs_error, null, statusCodes.API_ERROR)
        }

        return showResponse(true, responseMessage?.common?.contactUs_success, null, statusCodes.SUCCESS)
    },

    //
    searchProduct: async (data: any): Promise<ApiResponse> => {
        try {
            const { product_name, country, result_per_page = 5, page_number = 1 } = data
            const itemSize = Number(result_per_page)
            console.log(data, "paylaod")
            const apiUrl = PRODUCT_SEARCH_SCRAPER_API(WEB_SCRAPER_API_KEY, product_name, country, true)

            const response = await axios.get(apiUrl)
            console.log(response, "responseapi")
            if (!response.data?.results || response.data?.results.length === 0) {
                return showResponse(false, 'No products found', null, statusCodes.API_ERROR);
            }

            // Sort products by lowest price first
            const sortedResults = response.data.results.sort((a: any, b: any) => a.price - b.price);

            // Apply pagination
            const startIndex = (page_number - 1) * itemSize;
            const endIndex = startIndex + itemSize;
            const paginatedResults = sortedResults.slice(startIndex, endIndex);
            const responseResult = {
                result: paginatedResults,
                total_items: sortedResults.length,
                current_page: page_number,
                total_pages: Math.ceil(sortedResults.length / itemSize)
            }

            return showResponse(true, 'here are list of products', responseResult, statusCodes.SUCCESS)
        } catch (err: any) {
            console.log(err, "ercatch")
            const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
            return showResponse(false, error, null, statusCodes.API_ERROR)
        }
    },
    //end
    //
    getProductDetails: async (data: any): Promise<ApiResponse> => {
        try {
            const { product_id } = data

            const apiUrl = PRODUCT_DETAILS_SCRAPER_API(WEB_SCRAPER_API_KEY, product_id, true)

            const response = await axios.get(apiUrl)
            if (!response.data) {
                return showResponse(false, 'failed to get product details', null, statusCodes.API_ERROR)
            }

            const responseData = keysDeleteFromObject(response.data, ['feature_bullets', 'customization_options', 'reviews', 'variants', 'shipping_time', 'shipping_condition', 'shipping_details_url', '5_star_percentage', '4_star_percentage', '3_star_percentage', '2_star_percentage', '1_star_percentage', 'ships_from', 'aplus_present', 'total_ratings'])
            return showResponse(true, 'here is product details', responseData, statusCodes.SUCCESS)

        } catch (err: any) {
            console.log(err, "ercatch")
            console.log(err?.response?.data?.Message, "MessageMessage")
            const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
            return showResponse(false, error, null, statusCodes.API_ERROR)
        }
    },
}

export default UserCommonHandler 
