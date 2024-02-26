import { findOne, createOne } from '../helpers/db.helpers';
import AdminModel from '../models/admin.model';
// import clientModel from '../models/client.model';
import commonHelper from '../helpers/common.helper';

export const bootstrapAdmin = async function (cb: Function) {
  const userPassword = await commonHelper.bycrptPasswordHash("123456");
  const adminData = {
    password: userPassword,
    email: 'boilerplate@yopmail.com',
    first_name: 'Admin',
    last_name: 'Account',
  };
  const adminDoc = await findOne(AdminModel, { email: adminData.email });
  // console.log(adminDoc,"adminDocc")
  if (!adminDoc.status) {
    let adminRef = new AdminModel(adminData)
    await createOne(adminRef)
  }

  // const client = await findOne(clientModel, {})
  // if (!client) {
  //   await upsert(clientModel, {})
  // }

  // const customerFeature = await findOne(customerFeatureModel, {})
  // if (!customerFeature) {
  //   await upsert(customerFeatureModel, {})
  // }

  // const domain = await findOne(domainModel, {})
  // if (!domain) {
  //   await upsert(domainModel, {})
  // }

  // const featureType = await findOne(featureTypeModel, {})
  // if (!featureType) {
  //   await upsert(featureTypeModel, {})
  // }

  // const feature = await findOne(featureModel, {})
  // if (!feature) {
  //   await upsert(featureModel, {})
  // }

  // const subscriptionPlanFeature = await findOne(subscriptionPlanFeatureModel, {})
  // if (!subscriptionPlanFeature) {
  //   await upsert(subscriptionPlanFeatureModel, {})
  // }

  // const subscriptionPlan = await findOne(subscriptionPlanModel, {})
  // if (!subscriptionPlan) {
  //   await upsert(subscriptionPlanModel, {})
  // }

  // const template = await findOne(templateModel, {})
  // if (!template) {
  //   await upsert(templateModel, {})
  // }


  cb();
};