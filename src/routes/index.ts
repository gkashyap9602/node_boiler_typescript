import express from 'express';
const Route = express.Router();

import adminAuthRoutes from './Admin/admin.auth.route'
import adminCommonRoutes from './Admin/admin.common.route'
import adminUserRoutes from './Admin/admin.user.route'
import userAuthRoutes from './User/user.auth.route'
import commonRoutes from './Common/common.route'

//assign order of routes for swagger in last to show on first
Route.use('/admin/common', adminCommonRoutes);
Route.use('/admin/user', adminUserRoutes);
Route.use('/admin/auth', adminAuthRoutes);
Route.use('/user/auth', userAuthRoutes);
Route.use('/common', commonRoutes);

export default Route;