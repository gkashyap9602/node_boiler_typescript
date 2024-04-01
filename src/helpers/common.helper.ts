import moment from 'moment'
import { Parser } from 'json2csv'
import { Model } from 'mongoose'
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx'
import sharp from 'sharp';
import fs from 'fs'
import services from '../services';
import mongoose from 'mongoose'

const bycrptPasswordHash = (stringValue: string): Promise<string> => {
    console.log(stringValue, "stringValue")
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err: any, salt: string) {
            if (err) {
                reject(err.message)
            }
            bcrypt.hash(stringValue, salt, async (err: any, hash: string) => {
                if (err) {
                    reject(err.message)
                }
                resolve(hash);
            });
        });
    })
}


const verifyBycryptHash = (password: string, hash_password: string) => {
    return bcrypt.compare(password, hash_password);
}


const convertToObjectId = (id: string) => {
    return new mongoose.Types.ObjectId(id);
}

const generateRandomOtp = (len: number) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    if (OTP.length < len || OTP.length > len) {
        generateRandomOtp(len);
    }
    return (OTP);
}

const camelize = (str: string) => {
    try {
        str = str.trim().split(' ').join('_')
        return str
    }
    catch (err) {
        return null;
    }
}


const getFilterMonthDateYear = (date: string) => {
    return moment(date).add(1, 'day').format('YYYY-MM-DD')
}

const getCSVFromJSON = (fields: any, json: any) => {
    const parser = new Parser({ fields });
    return parser.parse(json);
}

const dynamicSort = (property: any) => {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a: any, b: any) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    };
};

const arraySort = (arr: any) => {
    arr.sort((a: any, b: any) =>
        a.index > b.index
            ? 1
            : a.index === b.index
                ? a.index > b.index
                    ? 1
                    : -1
                : -1
    );
    return arr;
};

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const deg2rad = (deg: any) => {
    return deg * (Math.PI / 180);
};

const getDistanceFromLatLonInKm = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const Comma_seprator = (x: any) => {
    if (x) {
        const parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    } else {
        return x;
    }
};


//add this function where we cannot add query to get count of document example searchKey and add pagination at the end of query
const getCountAndPagination = async (model: Model<any>, aggregate: any, page: number, limit: number) => {

    //this aggregation is for aggregate Model and add pagination at the end of the query aggregation
    const aggregation = [...aggregate]

    //This Aggregation is for totalCount of aggregation query 
    const pagePipelineCount = [...aggregate]

    pagePipelineCount.push({ $count: 'totalEntries' })
    const countResult = await model.aggregate(pagePipelineCount)
    const totalCount = countResult?.[0]?.totalEntries || 0;

    //add pagination at the end of the queuries
    aggregation?.push(

        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    );
    //ends 


    return { totalCount, aggregation }
}




function generateRandomAlphanumeric(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function generateRandomNumeric(length: number) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}


function generateUniqueCustomerId() {
    // Generate an alphanumeric part (e.g., using random characters)
    const alphanumericPart = generateRandomAlphanumeric(14); // 14 characters long

    // Generate a numeric counter (e.g., using random numbers)
    const numericCounter = generateRandomNumeric(8); // 8 digits long

    // Combine the alphanumeric and numeric parts to create the unique ID
    const uniqueID = `${alphanumericPart}:${numericCounter}`;

    return uniqueID;
}

const getCurrentDate = () => {
    return moment(Date.now()).format('YYYY-MM-DD[T]HH:mm:ss.SSSSSS');

}

const generateCsrfToken = () => {
    return crypto.randomUUID()
}



const exportJsonToExcel = (filteredData: any) => {
    return new Promise((resolve, reject) => {
        try {
            const filePath = `worksheet/${"Order"}-${new Date().getTime()}.xlsx`;
            const workbook = XLSX.utils.book_new();

            const orderStatus: any = {
                1: "new",
                2: "inProduction",
                3: "shipped",
                4: "error",
                5: "recieved",
                6: "cancelled"
            }

            const sheetArray = [
                'Merch Maker ID', 'Order Id', 'Customer Name', 'Customer Email', 'Customer Phone',
                'Order Amount', 'Order Date', 'Order Status', "Shipping Method", 'Shipping Address',
                "Shipping State", 'Shipping Country', "Freight Amount", "Tracking", "Ship Date",
                "Shipment Weight", "Dimensions", "SKU", "Product Name", 'Quantity',
            ];

            const sheet: any = XLSX.utils.aoa_to_sheet([sheetArray]);

            const rowData = [];

            for (let k = 0; k < filteredData?.length; k++) {
                const row = [];
                row.push(filteredData[k].displayId ?? '');
                row.push(filteredData[k].mwwOrderId ?? '');
                row.push(filteredData[k].userData.firstName ?? '');
                row.push(filteredData[k].userData.email ?? '');
                row.push(filteredData[k].shippingAddress.companyPhone ?? '');
                row.push(filteredData[k].amount ?? '');
                row.push(filteredData[k].orderDate ?? '');
                row.push(orderStatus[filteredData[k].status] ?? '');
                row.push(filteredData[k].shipMethodData.name ?? '');
                row.push(filteredData[k].shippingAddress.address1 ?? '');
                row.push(filteredData[k].shippingAddress.stateName ?? '');
                row.push(filteredData[k].shippingAddress.country ?? '');
                row.push(filteredData[k].freightAmount ?? '');
                row.push(filteredData[k].tracking ?? '');
                row.push(filteredData[k].shipDate ?? '');
                row.push(filteredData[k].shipmentWeight ?? '');
                row.push(filteredData[k].dimensions ?? '');
                row.push(filteredData[k].sku ?? '');

                if (filteredData[k]?.orderItems && filteredData[k]?.orderItems.length > 0) {
                    for (let j = 0; j < filteredData[k]?.orderItems?.length; j++) {
                        row.push(filteredData[k]?.orderItems[j]?.productTitle ?? '');
                        row.push(filteredData[k]?.orderItems[j]?.quantity ?? '');
                    }
                }

                rowData.push(row);
            }

            let counter = 1;
            for (let k = 0; k < rowData.length; k++) {
                XLSX.utils.sheet_add_aoa(sheet, [rowData[k]], { origin: counter + 1 });
                counter++;
            }

            XLSX.utils.book_append_sheet(workbook, sheet, 'Orders Data');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            // Handling asynchronous operation directly inside Promise constructor
            services.awsService.uploadToS3ExcelSheet(buffer, filePath)
                .then(excelLink => {
                    resolve({ status: true, message: "Excel for members created Successfully!", data: excelLink, code: 200 });
                })
                .catch(err => {
                    reject({ status: false, message: "Error Occurred while uploading to S3", data: err.message, code: 200 });
                });

        } catch (err: any) {
            console.log(err);
            reject({ status: false, message: "Error Occurred, please try again", data: err.message, code: 200 });
        }
    });
}



const convertImageToWebp = async (imageInBuffer: any) => {
    // console.log(imageInBuffer, "imageinbuffer")
    return new Promise((resolve, reject) => {
        sharp(imageInBuffer)
            .webp({ quality: 50 })
            .toBuffer()
            .then(async (newBuffer) => {
                resolve(newBuffer);
            })
            .catch(() => {
                reject(false);
            });
    });
};


function readFileAsyncChunks(filePath: string, bufferSize = 64 * 1024) { //64kb each chunk size
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, { highWaterMark: bufferSize }); //each chunk buffer size will be 64 kb max
        const chunks: any = [];

        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on('error', (error) => {
            reject(error);
        });

    });
}

const generateUsernames = (name: string, count: number, all_usernames: any = null) => {
    const usernames = [];
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < count; i++) {
        let username = name;
        for (let j = 0; j < 4; j++) {
            username += chars[Math.floor(Math.random() * chars.length)];
        }
        if (all_usernames) {
            const idx = all_usernames?.findIndex((it: any) => it.username == username);
            if (idx < 0) {
                usernames.push(username);
            }
        } else {
            usernames.push(username);
        }
    }
    return usernames;
};


type MyObject = { [key: string]: number };
const findClosestKey = async (targetValue: number, obj: MyObject) => {  //object in which all values are present targetValue is values to find in that object nearby
    // Initialize variables to store the closest key and the minimum difference
    let closestKey = null;
    let minDifference = Infinity;

    // Iterate over each key-value pair in the object
    for (const [key, value] of Object.entries(obj)) {
        // Calculate the difference between the target value and the current value
        const difference: number = Math.abs(targetValue - value);

        // If the current difference is smaller than the minimum difference, update the closest key and minimum difference
        if (difference < minDifference) {
            closestKey = key;
            minDifference = difference;
        }
    }

    // Return the closest key
    return closestKey;

}

export {
    bycrptPasswordHash,
    verifyBycryptHash,
    // convertIdToObjectId,
    generateRandomOtp,
    camelize,
    getFilterMonthDateYear,
    getCSVFromJSON,
    dynamicSort,
    arraySort,
    capitalize,
    getDistanceFromLatLonInKm,
    Comma_seprator,
    getCountAndPagination,
    generateUniqueCustomerId,
    getCurrentDate,
    generateCsrfToken,
    generateUsernames,
    convertImageToWebp,
    exportJsonToExcel,
    readFileAsyncChunks,
    findClosestKey,
    convertToObjectId


}
