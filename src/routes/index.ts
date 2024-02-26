import express from 'express';
const Route = express.Router();
const admin = require('./admin');
const user = require('./user');

Route.use('/admin', admin);
Route.use('/user', user);


export default Route;