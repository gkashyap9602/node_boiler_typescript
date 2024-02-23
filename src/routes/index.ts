import express from 'express';
const Route = express.Router();
const admin = require('./admin');
const client = require('./client');

Route.use('/admin', admin);
Route.use('/client', client);


export default Route;