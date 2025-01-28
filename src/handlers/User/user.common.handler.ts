import { ApiResponse, IRecordOfAny } from "../../utils/interfaces.util";
import { showResponse } from "../../utils/response.util";
import { createOne, } from "../../helpers/db.helpers";
import responseMessage from '../../constants/responseMessages'
import statusCodes from '../../constants/statusCodes'
import adminContactusModel from '../../models/Admin/admin.contactus.model';
import axios from "axios";
const GOOGLE_SERP_API_KEY = 'MrUrDBSIaz0SvWvgmQhmZAX4lwQ9aWR9'
const WEB_SCRAPER_API_KEY = 'eeba97490fa099fb3ac08e5b6c183dbb'
import * as cheerio from 'cheerio';


function keysDeleteFromObject(userData: IRecordOfAny, keys: string[] = ['feature_bullets', 'review', 'reviews']) {
    keys.forEach((key) => {
        if (key in userData) {
            delete userData[key];
        }
    });

    return userData
}

// Helper function to fetch default details when no specific selectors are available
const fetchDefaultDetails = ($: any, product_link: string) => {
    return {
        name: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
        description: $('meta[name="description"]').attr('content') || '',
        link: product_link,
        sold_by: $('meta[name="seller"]').attr('content') || '',
        brand: $('[data-brand]').text() || '',
        images: $('img')
            .map((_: any, img: any) => $(img).attr('src'))
            .get()
            .filter((src: string) => src && src.startsWith('http')),
        pricing: $('[data-price]').text() || '',
        average_rating: $('[data-rating]').text() || '',
    };
};//ends


interface WebsiteSelectors {
    [domain: string]: {
        imageSelector: string;
        imageAttribute: string;
        priceSelector: string;
        descriptionSelector: string;
        titleSelector: string;
        ratingSelector: string;
        sellerMeta: string;
        brandSelector: string;
        currencyMeta: string;
        imageFetch: (cheerio: any, imageSelector: string, imageAttribute: string) => string[];
    };
}

const WebsiteSelectors: WebsiteSelectors = {
    "myfitness.in": {
        imageSelector: '.prd_img img',
        imageAttribute: 'srcset',
        priceSelector: '.sticky_discount_price bdi',
        descriptionSelector: '.product-single__description p',
        titleSelector: '.product-single__title',
        ratingSelector: '[data-testid="rating-summary-avg"]',
        sellerMeta: 'meta[name="seller"]',
        brandSelector: '[data-brand]',
        currencyMeta: 'meta[name="currency"]',
        imageFetch: ($: any, imageSelector: string, imageAttribute: string) => {
            const imageElement = $(imageSelector);
            const imageSrcset: any = imageElement.attr(imageAttribute);

            const images = imageSrcset
                ? imageSrcset.split(',').map((variant: any) => {
                    const [url] = variant.trim().split(' ');
                    return url.startsWith('//') ? `https:${url}` : url;
                })
                : [];

            return images
        },
    },
    "nike.com": {
        imageSelector: 'img',
        imageAttribute: 'src',
        priceSelector: '[data-testid="currentPrice-container"]',
        descriptionSelector: '[data-testid="product-description"]',
        titleSelector: '[data-testid="product_title"]',
        ratingSelector: '[data-testid="reviews-title-rating"]',
        sellerMeta: 'meta[name="vendor"]',
        brandSelector: '.brand-class',
        currencyMeta: 'meta[itemprop="priceCurrency"]',
        imageFetch: ($: any, imageSelector: string, imageAttribute: string) => {
            const images: any = [];
            $(imageSelector).each((index: any, element: any) => {
                const imgSrc = $(element).attr(imageAttribute);
                if (imgSrc) {
                    images.push(imgSrc);
                }
            });

            return images
        },
    }
};


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

            //when data already parsed then return json directly
            if (typeof response.data == 'object') {
                const responseData = keysDeleteFromObject(response.data, ['feature_bullets', 'customization_options', 'reviews', 'variants'])
                return showResponse(true, 'here is product details', responseData, statusCodes.SUCCESS)
            }
            //************************************ELSE Parse Html To JSON***************************************** */
            // Determine the website's domain
            const url = new URL(product_link);
            const domain: string = url.hostname.replace('www.', '');

            // Load the HTML response using Cheerio
            const $ = cheerio.load(response.data);

            // Get the selectors for the specific website
            const selectors = WebsiteSelectors[domain];
            if (selectors) {
                const images = selectors.imageFetch($, selectors.imageSelector, selectors.imageAttribute)

                const price = $(selectors.priceSelector).first().text().trim();
                // const price = $(selectors.priceSelector).text().trim();
                const description = $(selectors.descriptionSelector)
                    .map((_, element) => $(element).text().trim())
                    .get()
                    .join(' ');
                const productTitle = $(selectors.titleSelector).text().trim();
                const rating = $(selectors.ratingSelector).attr('aria-label') || '5.0';
                const soldBy = $(selectors.sellerMeta).attr('content') || '';
                const brand = $(selectors.brandSelector).text().trim() || '';
                // const priceCurrency = $(selectors.currencyMeta).attr('content') || 'USD';

                // Create the product details object
                const productDetails = {
                    name: productTitle,
                    description,
                    link: product_link,
                    sold_by: soldBy,
                    brand,
                    images,
                    pricing: price,
                    // size:'',
                    // price_currency: priceCurrency,
                    average_rating: rating
                };

                return showResponse(true, 'here is product details', productDetails, statusCodes.SUCCESS)
            } else {
                //if domain selectors not add in our side 
                const productDetails = fetchDefaultDetails($, product_link);
                return showResponse(true, 'Here is product details', productDetails, statusCodes.SUCCESS);
                // return showResponse(false, `Scraping not supported for ${domain}`, null, statusCodes.API_ERROR);
            }

        } catch (err: any) {
            console.log(err, "ercatch")
            console.log(err?.response?.data?.Message, "MessageMessage")
            const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
            return showResponse(false, error, null, statusCodes.API_ERROR)
        }
    },
    // getProductDetails: async (data: any): Promise<ApiResponse> => {
    //     try {
    //         const { product_link } = data
    //         const apiUrl = WEB_SCRAPER_API(WEB_SCRAPER_API_KEY, product_link, true)

    //         const response = await axios.get(apiUrl)
    //         if (!response.data) {
    //             return showResponse(false, 'failed to get product details', null, statusCodes.API_ERROR)
    //         }

    //         //when data already parsed then return json directly
    //         if (typeof response.data == 'object') {
    //             const responseData = keysDeleteFromObject(response.data, ['feature_bullets', 'customization_options', 'reviews', 'variants'])
    //             return showResponse(true, 'here is product details', responseData, statusCodes.SUCCESS)
    //         }
    //         //************************************ELSE Parse Html To JSON***************************************** */
    //         // Determine the website's domain
    //         const url = new URL(product_link);
    //         const domain: string = url.hostname.replace('www.', '');

    //         // Load the HTML response using Cheerio
    //         const $ = cheerio.load(response.data);

    //         // Get the selectors for the specific website
    //         const selectors = WebsiteSelectors[domain];
    //         if (selectors) {
    //             const images = selectors.imageFetch($, selectors.imageSelector, selectors.imageAttribute)

    //             const price = $(selectors.priceSelector).first().text().trim();
    //             // const price = $(selectors.priceSelector).text().trim();
    //             const description = $(selectors.descriptionSelector)
    //                 .map((_, element) => $(element).text().trim())
    //                 .get()
    //                 .join(' ');
    //             const productTitle = $(selectors.titleSelector).text().trim();
    //             const rating = $(selectors.ratingSelector).attr('aria-label') || '5.0';
    //             const soldBy = $(selectors.sellerMeta).attr('content') || '';
    //             const brand = $(selectors.brandSelector).text().trim() || '';
    //             // const priceCurrency = $(selectors.currencyMeta).attr('content') || 'USD';

    //             // Create the product details object
    //             const productDetails = {
    //                 name: productTitle,
    //                 description,
    //                 link: product_link,
    //                 sold_by: soldBy,
    //                 brand,
    //                 images,
    //                 pricing: price,
    //                 // size:'',
    //                 // price_currency: priceCurrency,
    //                 average_rating: rating
    //             };

    //             return showResponse(true, 'here is product details', productDetails, statusCodes.SUCCESS)
    //         } else {
    //             //if domain selectors not add in our side 
    //             // Extract product details
    //             const productDetails = {
    //                 name: $('meta[property="og:title"]').attr('content') || $('title').text() || '', // Extract title
    //                 description: $('meta[name="description"]').attr('content') || '', // Extract meta description
    //                 link: product_link, // Use the link you passed
    //                 sold_by: $('meta[name="seller"]').attr('content') || '', // Adjust based on site structure
    //                 brand: $('[data-brand]').text() || '', // Adjust selector for brand
    //                 images: $('img') // Extract images
    //                     .map((_, img) => $(img).attr('src'))
    //                     .get()
    //                     .filter((src) => src && src.startsWith('http')), // Filter for valid image URLs
    //                     pricing: $('[data-price]').text() || '', // Adjust selector for price
    //                 // price_currency: $('[data-currency]').attr('content') || 'USD', // Adjust selector for currency
    //                 average_rating: $('[data-rating]').text() || '', // Adjust selector for rating
    //             };

    //             return showResponse(true, 'here is product details', productDetails, statusCodes.SUCCESS)
    //             // return showResponse(false, `Scraping not supported for ${domain}`, null, statusCodes.API_ERROR);
    //         }

    //     } catch (err: any) {
    //         console.log(err, "ercatch")
    //         console.log(err?.response?.data?.Message, "MessageMessage")
    //         const error = err?.response?.data?.error ? err?.response?.data?.error : err?.message
    //         return showResponse(false, error, null, statusCodes.API_ERROR)
    //     }
    // },
    //end
}

export default UserCommonHandler 
