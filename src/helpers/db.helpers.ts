import { Model } from 'mongoose'
import { showResponse } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const findOne = (Model: Model<any>, query: object, fields: object = {}, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        let queryBuilder = Model.findOne(query, fields)

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        queryBuilder.exec()
            .then(data => {
                if (!data) {
                    const response = showResponse(false, 'Data Retrieval Failed', 'error occured');
                    reject(response);
                } else {
                    const doc = data?.toObject();
                    const response = showResponse(true, 'Data Found', doc);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Data Retrieval Failed', err);
                reject(response);
            });
    });
};


export const createOne = (modalReference: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        modalReference.save()
            .then((savedData: any) => {
                const doc = savedData?.toObject();
                const response = showResponse(true, 'Data Saved Successfully', doc);
                resolve(response);
            })
            .catch((err: any) => {
                const response = showResponse(false, 'Data Save Failed', err);
                reject(response);
            });
    });
};


export const insertMany = (Model: Model<any>, dataArray: any[]): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.insertMany(dataArray)
            .then(data => {
                const response = showResponse(true, 'Success', data);
                resolve(response);
            })
            .catch(err => {
                const response = showResponse(false, 'Data Save Failed', err);
                reject(response);
            });
    });
};



export const findOneAndUpdate = (Model: Model<any>, matchObj: any, updateObject: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findOneAndUpdate(matchObj, { $set: updateObject }, { new: true })
            .then(updatedData => {
                if (updatedData) {
                    const doc = updatedData?.toObject();
                    const response = showResponse(true, 'Success', doc);
                    resolve(response);
                } else {
                    const response = showResponse(false, 'Failed', null);
                    reject(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed error', err);
                reject(response);
            });
    });
};


export const findByIdAndUpdate = (Model: Model<any>, DataObject: any, _id: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findByIdAndUpdate(_id, { $set: DataObject }, { new: true })
            .then(updatedData => {
                const doc = updatedData?.toObject();
                const response = showResponse(true, 'Success', doc);
                resolve(response);
            })
            .catch(err => {
                const response = showResponse(false, 'Failed', err);
                reject(response);
            });
    });
};


export const updateMany = (Model: Model<any>, DataObject: any, filter: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.updateMany(filter, { $set: DataObject }, { multi: true, new: true }).lean()
            .exec()
            .then((updatedData: any) => {
                const response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            })
            .catch((err: any) => {
                const response = showResponse(false, err);
                return reject(response);
            });
    });
};


export const deleteMany = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.deleteMany(query, (err: any) => {
            if (err) {
                const response = showResponse(false, 'Failed', err);
                return reject(response);
            }
            const response = showResponse(true, 'Success');
            return resolve(response);
        }).lean()
    });
};

export const findByIdAndRemove = (Model: Model<any>, id: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findOneAndDelete({ _id: id })
            .lean()
            .then(result => {
                if (!result) {
                    const response = showResponse(false, 'Failed', null);
                    reject(response);
                } else {
                    const response = showResponse(true, 'Success', result);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, 'Failed', err);
                reject(response);
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
    return new Promise((resolve, reject) => {
        Model.updateOne(mainIdObj, { $pull: { [arrayKey]: itemIdObj } }, (err: any, updatedData: any) => {
            if (err) {
                const response = showResponse(false, err, {});
                return reject(response);
            }
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                const response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            const response = showResponse(false, 'Update failed', {});
            return reject(response);
        }).lean()
    });
};


export const bulkOperationQuery = (Model: Model<any>, bulkOperations: any) => {
    return new Promise((resolve, reject) => {
        Model.bulkWrite(bulkOperations)
            .then(result => {
                if (result?.ok === 1) {
                    const response = showResponse(true, 'Success', result);
                    resolve(response);
                } else {
                    const response = showResponse(false, 'Failed', result);
                    reject(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, err.message || err);
                reject(response);
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
    return new Promise((resolve, reject) => {
        Model.updateOne(mainIdObj, { $push: { [arrayKey]: itemToAddObj } }, (err: any, updatedData: any) => {
            if (err) {
                const response = showResponse(false, err, {});
                return reject(response);
            }
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                const response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            const response = showResponse(false, 'Update failed', {});
            return reject(response);
        });
    });
};

export const findAll = (Model: Model<any>, query: object, project_field?: string, pagination?: number | null, sort?: any | null, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
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
                    reject(response);
                } else {
                    const response = showResponse(true, "Data found", data);
                    resolve(response);
                }
            })
            .catch(err => {
                const response = showResponse(false, err);
                reject(response);
            });
    });
};


export const getCount = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.countDocuments(query).then((result: any) => {
            const response = showResponse(true, 'Success', result, null, 200);
            resolve(response);
        }).catch((err: any) => {
            const response = showResponse(false, 'Failed', err, null, 404);
            reject(response);
        });
    });
};



