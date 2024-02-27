import { findOne, createOne } from '../helpers/db.helpers';
import adminModel from '../models/admin.model';
import userModel from '../models/user.model';
import commonHelper from '../helpers/common.helper';


export const bootstrapAdmin = async function (cb: Function) {
  const userPassword = await commonHelper.bycrptPasswordHash("123456");
  const adminData = {
    password: userPassword,
    email: 'boilerplate@yopmail.com',
    first_name: 'Admin',
    last_name: 'Account',
  };
  const adminDoc = await findOne(adminModel, { email: adminData.email });
  // console.log(adminDoc,"adminDocc")
  if (!adminDoc.status) {
    let adminRef = new adminModel(adminData)
    await createOne(adminRef)
  }

  // const user = await findOne(userModel, {})
  // if (!user) {
  //   await upsert(userModel, {})
  // }

  cb();
};