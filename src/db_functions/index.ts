var helpers = require('../services/helper');
import { Model } from 'mongoose'

//findOne
export const findOne = (Model: Model<any>, query: object, fields: string, populate: string | null = null) => {
    return new Promise((resolve, reject) => {
        let queryBuilder = Model.findOne(query, fields);

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        // Enable lean and virtuals
        queryBuilder = queryBuilder.lean({ virtuals: true });

        queryBuilder.exec((err, data) => {
            if (err || !data) {
                let response = helpers.showResponse(false, 'Data Retrieval Failed', err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'Data Found', data);
            return resolve(response);
        });
    });
};


export const createOne = (modalReference: any) => {
    return new Promise((resolve, reject) => {
        modalReference.save((err: any, savedData: any) => {
            if (err) {
                let response = helpers.showResponse(false, 'Data Save Failed', err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'Data Saved Successfully', savedData);
            return resolve(response);
        });
    });
};


export const insertMany = (Model: any, dataArray: any[]) => {
    return new Promise((resolve, reject) => {
        try {
            Model.insertMany(dataArray, (err: any, data: any) => {
                if (err) {
                    let response = helpers.showResponse(false, 'Data Save Failed', err);
                    return resolve(response);
                }
                let response = helpers.showResponse(true, 'Success', data);
                return resolve(response);
            });
        } catch (err) {
            let response = helpers.showResponse(false, 'Data Save Failed', err);
            return resolve(response);
        }
    });
};


export const findOneAndUpdate = (Model: any, updateObject: any, matchObj: any) => {
    return new Promise((resolve, reject) => {
        Model.findOneAndUpdate(matchObj, { $set: updateObject }, { new: true }, (err: any, updatedData: any) => {
            if (err) {
                let response = helpers.showResponse(false, 'Failed error', err);
                return resolve(response);
            }
            if (updatedData) {
                let response = helpers.showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            let response = helpers.showResponse(false, 'Failed', null);
            return resolve(response);
        });
    });
};




export const findByIdAndUpdate = (Model: any, DataObject: any, _id: string) => {
    return new Promise((resolve, reject) => {
        Model.findByIdAndUpdate(_id, { $set: DataObject }, { new: true }, (err: any, updatedData: any) => {
            if (err) {
                let response = helpers.showResponse(false, "Failed", err);
                return resolve(response);
            }

            let response = helpers.showResponse(true, 'Success', updatedData);
            return resolve(response);
        });
    });
};


export const updateMany = (Model: any, DataObject: any, filter: any) => {
    return new Promise((resolve, reject) => {
        Model.updateMany(filter, { $set: DataObject }, { multi: true, new: true })
            .exec()
            .then((updatedData: any) => {
                let response = helpers.showResponse(true, 'Success', updatedData);
                return resolve(response);
            })
            .catch((err: any) => {
                let response = helpers.showResponse(false, err);
                return resolve(response);
            });
    });
};


export const deleteMany = (Model: any, query: any) => {
    return new Promise((resolve, reject) => {
        Model.deleteMany(query, (err: any) => {
            if (err) {
                let response = helpers.showResponse(false, 'Failed', err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'Success');
            return resolve(response);
        });
    });
};


export const findByIdAndRemove = (Model: any, id: string) => {
    return new Promise((resolve, reject) => {
        Model.findByIdAndRemove(id, (err: any, result: any) => {
            if (err || !result) {
                let response = helpers.showResponse(false, 'Failed', err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'Success', result);
            return resolve(response);
        });
    });
};

export const removeItemFromArray = (Model: any, mainIdObj: any, arrayKey: string, itemId: string) => {
    return new Promise((resolve, reject) => {
        Model.updateOne(mainIdObj, { $pull: { [arrayKey]: { _id: itemId } } }, (err: any, updatedData: any) => {
            if (err) {
                let response = helpers.showResponse(false, err, {});
                return resolve(response);
            }
            if (updatedData?.modifiedCount && updatedData.modifiedCount > 0) {
                let response = helpers.showResponse(true, 'Success', updatedData);
                return resolve(response);
            }
            let response = helpers.showResponse(false, 'Update failed', {});
            return resolve(response);
        });
    });
};






export const bulkOperationQuery = async (Model: any, bulkOperations: any[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Execute bulk operation 
            const result = await Model.bulkWrite(bulkOperations);
            if (result?.ok == 1) {
                let response = helpers.showResponse(true, 'Success', result);
                return resolve(response);
            }

            let response = helpers.showResponse(false, 'Failed', result);
            return resolve(response);
        } catch (err) {
            let response = helpers.showResponse(false, err);
            return reject(response);
        }
    });
};

export const getDataArray = (Model: Model<any>, query: object, fields: string, pagination?: number | null, sort?: object | null, populate?: string | null) => {
    return new Promise((resolve, reject) => {
        let queryBuilder = Model.find(query, fields);

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

        queryBuilder.exec((err, data) => {
            if (err || !data || data.length === 0) {
                let response = helpers.showResponse(false, err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, "Data found", data);
            return resolve(response);
        });
    });
};


export const getJoinData = async (
    Model: Model<any>,
    query: object,
    fields: string,
    lookup?: object | null, pagination?: { skip: number; limit: number } | null, sortObj?: object | null) => {
    return new Promise(async (resolve, reject) => {
        try {
            let aggregation = Model.aggregate().match(query).project(fields);

            if (lookup) {
                aggregation = aggregation.lookup(lookup);
            }

            if (sortObj) {
                aggregation = aggregation.sort(sortObj);
            } else {
                aggregation = aggregation.sort({ _id: 0 });
            }

            if (pagination) {
                aggregation = aggregation.skip(pagination.skip).limit(pagination.limit);
            }

            let data = await aggregation.exec();

            if (data.length > 0) {
                return resolve(helpers.showResponse(true, "Data found", data));
            } else {
                return resolve(helpers.showResponse(false, 'NO_DATA'));
            }
        } catch (err: any) {
            console.log(err);
            return resolve(helpers.showResponse(false, err.message));
        }
    });
};


export const getCount = (Model: any, query: any) => {
    return new Promise((resolve, reject) => {
        Model.countDocuments(query, (err: any, result: any) => {
            if (err) {
                let response = helpers.showResponse(false, 'Failed', err, null, 404);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'Success', result, null, 200);
            return resolve(response);
        });
    });
};
