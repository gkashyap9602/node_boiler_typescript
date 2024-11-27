import { Model } from 'mongoose'
import { showResponse } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const findOne = (Model: Model<any>, query: object, fields: object = {}, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        let queryBuilder = Model.findOne(query, fields)

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



export const findOneAndUpdate = (Model: Model<any>, matchObj: any, updateObject: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndUpdate(matchObj, { $set: updateObject }, { new: true })
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


export const findByIdAndUpdate = (Model: Model<any>, DataObject: any, _id: string): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findByIdAndUpdate(_id, { $set: DataObject }, { new: true })
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


export const updateMany = (Model: Model<any>, DataObject: any, filter: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.updateMany(filter, { $set: DataObject }, { multi: true, new: true }).lean()
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


export const deleteMany = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.deleteMany(query)
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

export const findOneAndDelete = (Model: Model<any>, match_obj: object): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndDelete(match_obj)
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

export const findByIdAndRemove = (Model: Model<any>, id: string): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndDelete({ _id: id })
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

export const findAll = (Model: Model<any>, query: object, project_field?: string, pagination?: number | null, sort?: any | null, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        let queryBuilder = Model.find(query, project_field);

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


export const getCount = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.countDocuments(query).then((result: any) => {
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
export const findAndUpdatePushOrSet = (Model: Model<any>, matchObj: any, updateMethodWithObject: any): Promise<ApiResponse> => {
    return Model.findOneAndUpdate(matchObj, updateMethodWithObject, { new: true })
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
export const findValueAndIncrement = (Model: Model<any>, matchObj: any, incObjectWithValue: any): Promise<ApiResponse> => {
    return new Promise((resolve) => {
        Model.findOneAndUpdate(matchObj, { $inc: incObjectWithValue }, { returnOriginal: true }) //Return the updated document
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


// interface from {
//     user_id: string,
//     user_type: number
// }
// interface to {
//     user_id: string,
//     user_type: number
// }

// export const saveNotification = async (from: from, to: to, title: string, message: string): Promise<ApiResponse> => {
//     try {

//         let obj = {
//             title,
//             message,
//             from,
//             to,

//         }

//         let ref = new adminNotificationModel(obj)

//         let result = await createOne(ref)
//         console.log(result, "notification saved")

//         if (result.status) {
//             return showResponse(true, 'Notification Saved Successfully', result?.data, null, 200);
//         }

//         return showResponse(false, 'Notification Failed tO saved', null, null, 400);


//     } catch (error: any) {
//         return showResponse(false, error?.message ?? error, null, null, 400);

//     }

// };




