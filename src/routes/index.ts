import express from 'express';
const Route = express.Router();
const admin = require('./Admin/admin.route');
const user = require('./User/user.route');
const common = require('./Common/common.route');

Route.use('/admin', admin);
Route.use('/user', user);
Route.use('/common', common);


export default Route;