import moment from 'moment'
import { Model } from 'mongoose'
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose'
import { REDIS_CREDENTIAL } from '../constants/app.constant'
import Queue from 'bull'




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


// Function to format duration from seconds to HH:MM:SS
const formatDuration = (durationInSeconds: number) => { //in number not string
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.round(durationInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

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

} //ends


//example -- availability.data ==>> :[ {start_time:017411551515 , end_time:071544545}] it should be timestamp
function generateSlotsForDay(availability: any) { //availability array 
    // Generate slots based on available time slots for the day
    const slots = availability?.data.flatMap((slot: any) => {
        const startDateTime = moment.unix(slot.start_time);
        const endDateTime = moment.unix(slot.end_time);
        const slotDuration = moment.duration(30, 'minutes');

        const generatedSlots = [];

        let currentSlotStart = startDateTime.clone();
        while (currentSlotStart.isBefore(endDateTime)) {
            const currentSlotEnd = currentSlotStart.clone().add(slotDuration);
            generatedSlots.push({
                start_time: currentSlotStart.unix(),
                end_time: currentSlotEnd.unix(),
            });
            currentSlotStart.add(slotDuration);
        }

        return generatedSlots;
    });

    return slots;
}


//generate bull queue 
export const generateQueue = (queueName: string) => {
    const queue = new Queue(queueName, {
        redis: {
            port: REDIS_CREDENTIAL.PORT,
            host: REDIS_CREDENTIAL.URI,
        }
    })

    return queue
}


//example to use platform_ids: joi.array().custom(validateMongoIdsInArrayForJoi),
// Custom Joi validator function to check if array elements are valid Mongoose ObjectIds
const validateMongoIdsInArrayForJoi = (value: any, helpers: any) => {
    // Check if the value is an array
    if (!Array.isArray(value)) {
        return helpers.error('any.invalid');
    }

    // Check each element of the array
    for (const element of value) {
        // Check if each element is a valid Mongoose ObjectId
        if (!mongoose.Types.ObjectId.isValid(element)) {
            return helpers.error('any.invalid');
        }
    }

    // If all elements are valid, return the value
    return value;
};

export {
    bycrptPasswordHash,
    verifyBycryptHash,
    generateRandomOtp,
    camelize,
    getFilterMonthDateYear,
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
    findClosestKey,
    convertToObjectId,
    formatDuration,
    generateSlotsForDay,
    validateMongoIdsInArrayForJoi,
}
