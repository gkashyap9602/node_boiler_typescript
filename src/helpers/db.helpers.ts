import { Model } from 'mongoose'
import { showResponse } from '../utils/response.util';
import { ApiResponse, fromNotification, IRecordOfAny, toNotification } from '../utils/interfaces.util';
import statusCodes from '../constants/statusCodes';

export const findOne = (Model: Model<any>, queryObject: IRecordOfAny, fields: IRecordOfAny = {}, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        let queryBuilder = Model.findOne(queryObject, fields)

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        queryBuilder.exec()
            .then(data => {
                if (!data) {
                    const response = showResponse(false, 'Data Retrieval Failed', 'error occured');
                    resolve(response);
                } else {
                    const doc = data?.toObject();
                    const response = showResponse(true, 'Data Found', doc);
                    resolve(response);
                }
            })
            .catch((err: any) => {
                const response = showResponse(false, 'Data Retrieval Failed', err);
                resolve(response);
            });
    });
};


export const createOne = (modalReference: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        modalReference.save()
            .then((savedData: any) => {
                const doc = savedData?.toObject();
                const response = showResponse(true, 'Data Saved Successfully', doc);
                resolve(response);
            })
            .catch((err: any) => {
                const response = showResponse(false, 'Data Save Failed', err);
                resolve(response);
            });
    });
};


export const insertMany = (Model: Model<any>, dataArray: any[]): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.insertMany(dataArray)
            .then(data => {
                const response = showResponse(true, 'Success', data);
                resolve(response);
            })
            .catch(err => {
                const response = showResponse(false, 'Data Save Failed', err);
                resolve(response);
            });
    });
};



export const findOneAndUpdate = (Model: Model<any>, queryObject: IRecordOfAny, updateObj: IRecordOfAny, upsert: boolean = false): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndUpdate(queryObject, { $set: updateObj }, { new: true, upsert: upsert })
            .then(updatedData => {
                if (updatedData) {
                    const doc = updatedData?.toObject();
                    const response = showResponse(true, 'Success', doc);
                    resolve(response);
                } else {
                    const response = showResponse(false, 'Failed', null);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed error', err);
                resolve(response);
            });
    });
};


export const findByIdAndUpdate = (Model: Model<any>, _id: string, updateObj: IRecordOfAny): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findByIdAndUpdate(_id, { $set: updateObj }, { new: true })
            .then(updatedData => {
                const doc = updatedData?.toObject();
                const response = showResponse(true, 'Success', doc);
                resolve(response);
            })
            .catch(err => {
                const response = showResponse(false, 'Failed', err);
                resolve(response);
            });
    });
};


export const updateMany = (Model: Model<any>, queryObject: IRecordOfAny, updateObj: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.updateMany(queryObject, { $set: updateObj }, { multi: true, new: true }).lean()
            .exec()
            .then((updatedData: any) => {
                const response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            })
            .catch((err: any) => {
                const response = showResponse(false, err);
                return resolve(response);
            });
    });
};


export const deleteMany = (Model: Model<any>, queryObject: IRecordOfAny): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.deleteMany(queryObject)
            .then(() => {
                const response = showResponse(true, 'Success');
                resolve(response);
            })
            .catch((err: any) => {
                const response = showResponse(false, 'Failed', err);
                resolve(response);
            });
    });
};

export const findOneAndDelete = (Model: Model<any>, queryObject: IRecordOfAny): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndDelete(queryObject)
            .lean()
            .then(result => {
                if (!result) {
                    const response = showResponse(false, 'Failed', null);
                    resolve(response);
                } else {
                    const response = showResponse(true, 'Success', result);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed', err);
                resolve(response);
            });
    });
};

export const findByIdAndRemove = (Model: Model<any>, _id: string): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndDelete({ _id: _id })
            .lean()
            .then(result => {
                if (!result) {
                    const response = showResponse(false, 'Failed', null);
                    resolve(response);
                } else {
                    const response = showResponse(true, 'Success', result);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed', err);
                resolve(response);
            });
    });
};




//example how to use
//  let result = await removeItemFromArray(ModelName, { _id: sizeCategoryId }, 'parameters', sizeParamId)
//1st param  =>> model 
//2nd param =>> main Object Id
//3rd param =>> array feild name 
//4th param =>> match condition objectId that you want to delete in array of object  
export const removeItemFromArray = (Model: Model<any>, mainIdObj: any, arrayKey: string, itemIdObj: any): Promise<ApiResponse> => {
    return Model.updateOne(mainIdObj, { $pull: { [arrayKey]: itemIdObj } }).lean()
        .then((updatedData: any) => {
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                return showResponse(true, 'Success', updatedData);
            } else {
                return showResponse(false, 'Update failed', {});
            }
        })
        .catch((err: any) => {
            return showResponse(false, err, {});
        });
};


export const bulkOperationQuery = (Model: Model<any>, bulkOperations: any) => {
    return new Promise((resolve) => {
        Model.bulkWrite(bulkOperations)
            .then(result => {
                if (result?.ok === 1) {
                    const response = showResponse(true, 'Success', result);
                    resolve(response);
                } else {
                    const response = showResponse(false, 'Failed', result);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, err.message || err);
                resolve(response);
            });
    });
};



//example how to use
// let result = await addItemInArray(ModelName, matchObj, 'parameters', parameters)
//1st param  =>> model 
//2nd param =>> main Object Id
//3rd param =>> array feild name 
//4th param =>> object that you want to add in array of object  

export const addItemInArray = (Model: Model<any>, mainIdObj: any, arrayKey: string, itemToAddObj: any): Promise<ApiResponse> => {
    return Model.updateOne(mainIdObj, { $push: { [arrayKey]: itemToAddObj } })
        .then((updatedData: any) => {
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                return showResponse(true, 'Success', updatedData);
            } else {
                return showResponse(false, 'Update failed', {});
            }
        })
        .catch((err: any) => {
            return showResponse(false, err, {});
        });
};

export const findAll = (Model: Model<any>, queryObject: IRecordOfAny, project_field?: string, pagination?: number | null, sort?: any | null, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        let queryBuilder = Model.find(queryObject, project_field);

        if (pagination) {
            queryBuilder = queryBuilder.limit(pagination);
        }

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        if (sort) {
            queryBuilder = queryBuilder.sort(sort);
        }

        // Enable lean and virtuals
        // queryBuilder = queryBuilder.lean({ virtuals: true });

        queryBuilder.exec()
            .then(data => {
                if (!data || data.length === 0) {
                    const response = showResponse(false, "No data found");
                    resolve(response);
                } else {
                    const response = showResponse(true, "Data found", data);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, err);
                resolve(response);
            });
    });
};


export const getCount = (Model: Model<any>, queryObject: IRecordOfAny): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.countDocuments(queryObject).then((result: any) => {
            const response = showResponse(true, 'Success', result, 200);
            resolve(response);
        }).catch((err: any) => {
            const response = showResponse(false, 'Failed', err, 404);
            resolve(response);
        });
    });
};


//examp edit obj -- >> { $push: { tax_filing: { $each: tax_filing } } }
//let response = await findAndUpdatePushOrSet(model, { _id: findUser.data._id }, editObj); //edit obj is object that you want to push in array 
export const findAndUpdatePushOrSet = (Model: Model<any>, queryObject: IRecordOfAny, updateMethodWithObject: any): Promise<ApiResponse> => {
    return Model.findOneAndUpdate(queryObject, updateMethodWithObject, { new: true })
        .lean() // return plain object
        .then((updatedData: any) => {
            if (updatedData) {
                return showResponse(true, 'Success', updatedData);
            } else {
                return showResponse(false, 'Failed', null);
            }
        })
        .catch((err: any) => {
            return showResponse(false, 'Failed error', err);
        });
};

// { fieldNameToIncrement: 1 },  1 for increment -1 for decrement
export const findValueAndIncrement = (Model: Model<any>, queryObject: IRecordOfAny, incObjectWithValue: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndUpdate(queryObject, { $inc: incObjectWithValue }, { returnOriginal: true }) //Return the updated document
            .then(updatedData => {
                if (updatedData) {
                    const doc = updatedData?.toObject();
                    const response = showResponse(true, 'Success', doc);
                    resolve(response);
                } else {
                    const response = showResponse(false, 'Failed', null);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed error', err);
                resolve(response);
            });
    });
};

// export const saveNotification = async (from: fromNotification, to: toNotification, title: string, message: string): Promise<ApiResponse> => {
//     try {
//         const obj: any = { title, message, from, to }

//         const ref = new adminNotificationModel(obj)
//         const result = await createOne(ref)
//         if (result.status) {
//             return showResponse(true, 'Notification Saved Successfully', result?.data, statusCodes.SUCCESS);
//         }

//         return showResponse(false, 'Notification Failed to saved', null, statusCodes.API_ERROR);

//     } catch (error: any) {
//         return showResponse(false, error?.message ?? error, null, statusCodes.API_ERROR);
//     }
// }//ends




