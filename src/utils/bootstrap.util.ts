import { findOne, upsert } from '../helpers/db.helpers';
import AdminModel from '../models/admin.model';
import clientModel from '../models/client.model';
import { genHash } from './common.util';

export const bootstrapAdmin = async function (cb: Function) {
  const userPassword = await genHash("123456");
  const adminData = {
    password: userPassword,
    email: 'boilerplate@yopmail.com',
    firstName: 'Admin',
    lastName: 'Account',
  };
  const adminDoc = await findOne(AdminModel, { email: adminData.email });
  if (!adminDoc) {
    await upsert(AdminModel, adminData)
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