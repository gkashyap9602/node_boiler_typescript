import { findOne, createOne } from '../helpers/db.helpers';
import adminModel from '../models/Admin/admin.model';
import userModel from '../models/User/user.model';
import commonContentModel from '../models/Admin/commonContent.model';
import commonHelper from '../helpers/common.helper';
import moment from 'moment';


export const bootstrapAdmin = async function (cb: Function) {
  const userPassword = await commonHelper.bycrptPasswordHash("123456");
  const adminData = {
    password: userPassword,
    email: 'boilerplate@yopmail.com',
    first_name: 'Admin',
    last_name: 'Account',
    created_on: moment().unix(),

  };

  const commonContentData = {
    about: "<p> About us </p>",
    privacy_policy: "<p> Privacy Policy </p>",
    terms_conditions: "<p> Default Terms </p>",
    created_on: moment().unix(),
  };

  const adminDoc = await findOne(adminModel, { email: adminData.email });
  // console.log(adminDoc,"adminDocc")
  if (!adminDoc.status) {
    let adminRef = new adminModel(adminData)
    await createOne(adminRef)
  }


  const commonContent = await findOne(commonContentModel, {})
  if (!commonContent.status) {

    let commonContentRef = new commonContentModel(commonContentData)
    await createOne(commonContentRef)
  }

  cb();
};