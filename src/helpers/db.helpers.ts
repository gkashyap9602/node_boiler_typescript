import { Model } from 'mongoose'
import { showResponse } from '../utils/response.util';
import { ApiResponse } from '../utils/interfaces.util';

export const findOne = (Model: Model<any>, query: object, fields: object = {}, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        let queryBuilder = Model.findOne(query, fields)

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        // Enable lean and virtuals
        queryBuilder = queryBuilder.lean({ virtuals: true });

        queryBuilder.exec((err, data) => {
            if (err || !data) {
                let response = showResponse(false, 'Data Retrieval Failed', err);
                return resolve(response);
            }
            let response = showResponse(true, 'Data Found', data);
            return resolve(response);
        });
    });
};


export const createOne = (modalReference: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        modalReference.save((err: any, savedData: any) => {
            if (err) {
                let response = showResponse(false, 'Data Save Failed', err);
                return resolve(response);
            }
            let response = showResponse(true, 'Data Saved Successfully', savedData);
            return resolve(response);
        })
    });
};


export const insertMany = (Model: Model<any>, dataArray: any[]): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        try {
            Model.insertMany(dataArray, (err: any, data: any) => {
                if (err) {
                    let response = showResponse(false, 'Data Save Failed', err);
                    return resolve(response);
                }
                let response = showResponse(true, 'Success', data);
                return resolve(response);
            })
        } catch (err) {
            let response = showResponse(false, 'Data Save Failed', err);
            return resolve(response);
        }
    });
};


export const findOneAndUpdate = (Model: Model<any>, matchObj: any, updateObject: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findOneAndUpdate(matchObj, { $set: updateObject }, { new: true }, (err: any, updatedData: any) => {
            if (err) {
                let response = showResponse(false, 'Failed error', err);
                return resolve(response);
            }
            if (updatedData) {
                let response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            let response = showResponse(false, 'Failed', null);
            return resolve(response);
        }).lean() //return plane object
    });
};




export const findByIdAndUpdate = (Model: Model<any>, DataObject: any, _id: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findByIdAndUpdate(_id, { $set: DataObject }, { new: true }, (err: any, updatedData: any) => {
            if (err) {
                let response = showResponse(false, "Failed", err);
                return resolve(response);
            }

            let response = showResponse(true, 'Success', updatedData);
            return resolve(response);
        }).lean()
    })
};


export const updateMany = (Model: Model<any>, DataObject: any, filter: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.updateMany(filter, { $set: DataObject }, { multi: true, new: true }).lean()
            .exec()
            .then((updatedData: any) => {
                let response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            })
            .catch((err: any) => {
                let response = showResponse(false, err);
                return resolve(response);
            });
    });
};


export const deleteMany = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.deleteMany(query, (err: any) => {
            if (err) {
                let response = showResponse(false, 'Failed', err);
                return resolve(response);
            }
            let response = showResponse(true, 'Success');
            return resolve(response);
        }).lean()
    });
};


export const findByIdAndRemove = (Model: Model<any>, id: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.findByIdAndRemove(id, (err: any, result: any) => {
            if (err || !result) {
                let response = showResponse(false, 'Failed', err);
                return resolve(response);
            }
            let response = showResponse(true, 'Success', result);
            return resolve(response);
        }).lean()
    });
};



//example how to use
//  let result = await removeItemFromArray(ModelName, { _id: sizeCategoryId }, 'parameters', sizeParamId)
//1st param  =>> model 
//2nd param =>> main arrayOfObject Id
//3rd param =>> array feild name 
//4th param =>> objectId that you want to delete in array of object  
export const removeItemFromArray = (Model: Model<any>, mainIdObj: any, arrayKey: string, itemId: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.updateOne(mainIdObj, { $pull: { [arrayKey]: { _id: itemId } } }, (err: any, updatedData: any) => {
            if (err) {
                let response = showResponse(false, err, {});
                return resolve(response);
            }
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                let response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            let response = showResponse(false, 'Update failed', {});
            return resolve(response);
        }).lean()
    });
};


export const bulkOperationQuery = async (Model: Model<any>, bulkOperations: any[]): Promise<ApiResponse> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Execute bulk operation 
            const result = await Model.bulkWrite(bulkOperations)
            if (result?.ok == 1) {
                let response = showResponse(true, 'Success', result);
                return resolve(response);
            }

            let response = showResponse(false, 'Failed', result);
            return resolve(response);
        } catch (err: any) {
            let response = showResponse(false, err);
            return reject(response);
        }
    });
};


//example how to use
// let result = await addItemInArray(ModelName, matchObj, 'parameters', parameters)
//1st param  =>> model 
//2nd param =>> main arrayOfObject Id
//3rd param =>> array feild name 
//4th param =>> object that you want to add in array of object  

export const addItemInArray = (Model: Model<any>, mainIdObj: any, arrayKey: string, itemToAdd: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.updateOne(mainIdObj, { $push: { [arrayKey]: itemToAdd } }, (err: any, updatedData: any) => {
            if (err) {
                let response = showResponse(false, err, {});
                return resolve(response);
            }
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                let response = showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            let response = showResponse(false, 'Update failed', {});
            return resolve(response);
        });
    });
};

export const findAll = (Model: Model<any>, query: object, project_field?: string, pagination?: number | null, sort?: any | null, populate?: string | null): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        let queryBuilder = Model.find(query, project_field)

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
        queryBuilder = queryBuilder.lean({ virtuals: true });

        queryBuilder.exec((err: any, data: any) => {
            if (err || !data || data.length === 0) {
                let response = showResponse(false, err);
                return resolve(response);
            }
            let response = showResponse(true, "Data found", data);
            return resolve(response);
        });
    });
};


export const getJoinData = async (
    Model: Model<any>,
    query: object,
    fields: string | any,
    lookup?: any | null, pagination?: { skip: number; limit: number } | null, sortObj?: any | null): Promise<ApiResponse> => {
    return new Promise(async (resolve, reject) => {
        try {
            let aggregation = Model.aggregate().match(query).project(fields);

            if (lookup) {
                aggregation = aggregation.lookup(lookup);
            }

            if (sortObj) {
                aggregation = aggregation.sort(sortObj);
            } else {
                aggregation = aggregation.sort({ _id: -1 });
            }

            if (pagination) {
                aggregation = aggregation.skip(pagination.skip).limit(pagination.limit);
            }

            let data = await aggregation.exec();

            if (data.length > 0) {
                return resolve(showResponse(true, "Data found", data));
            } else {
                return resolve(showResponse(false, 'NO_DATA'));
            }
        } catch (err: any) {
            console.log(err);
            return resolve(showResponse(false, err.message));
        }
    });
};


export const getCount = (Model: Model<any>, query: any): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
        Model.countDocuments(query, (err: any, result: any) => {
            if (err) {
                let response = showResponse(false, 'Failed', err, null, 404);
                return resolve(response);
            }
            let response = showResponse(true, 'Success', result, null, 200);
            return resolve(response);
        });
    });
};



