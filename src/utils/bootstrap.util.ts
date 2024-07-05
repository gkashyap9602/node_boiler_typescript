import { findOne, createOne } from '../helpers/db.helpers';
import adminModel from '../models/Admin/admin.auth.model';
import commonContentModel from '../models/Admin/commonContent.model';
import * as commonHelper from '../helpers/common.helper';
import moment from 'moment';
import { APP } from '../constants/app.constant'


type CallbackFunction = () => void; // Define the type of the callback function


export const bootstrapAdmin = async function (cb: CallbackFunction) {
  const userPassword = await commonHelper.bycrptPasswordHash("123456");
  const adminData = {
    password: userPassword,
    email: `${APP.ADMIN_CRED_EMAIL}`,
    first_name: 'Admin',
    last_name: 'Account',

  };

  const commonContentData = {
    about: "<p> About us </p>",
    privacy_policy: "<p> Privacy Policy </p>",
    terms_conditions: "<p> Default Terms </p>",
  };

  const adminDoc = await findOne(adminModel, {});
  if (!adminDoc.status) {
    const adminRef = new adminModel(adminData)
    await createOne(adminRef)
  }


  const commonContent = await findOne(commonContentModel, {})
  if (!commonContent.status) {

    const commonContentRef = new commonContentModel(commonContentData)
    await createOne(commonContentRef)
  }

  cb();
};