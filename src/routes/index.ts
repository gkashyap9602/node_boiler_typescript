import express from 'express';
const Route = express.Router();

//admin routes
import adminAuthRoutes from './Admin/admin.auth.route'
import adminCommonRoutes from './Admin/admin.common.route'
import adminUserRoutes from './Admin/admin.user.route'
import adminContactUsRoutes from './Admin/admin.contactus.route'

//user and admin all usertype common routes
import commonRoutes from './Common/common.route'

//user routes
import userAuthRoutes from './User/user.auth.route'
import userCommonRoutes from './User/user.common.route'



// *********assign order of routes for swagger in last to show on first **********


//admin routes
Route.use('/admin/common', adminCommonRoutes);
Route.use('/admin/user', adminUserRoutes);
Route.use('/admin/auth', adminAuthRoutes);
Route.use('/admin/contactus', adminContactUsRoutes);

//user routes
Route.use('/user/auth', userAuthRoutes);
Route.use('/user/common', userCommonRoutes);

//user and admin all usertype common routes
Route.use('/common', commonRoutes);

export default Route;