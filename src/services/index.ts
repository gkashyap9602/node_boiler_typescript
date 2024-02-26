

// const nodemailer = require('./nodemailer.service');
// const awsService = require('./aws.service');
// const notificationService = require('./notification.service');
import nodemailer from './nodemailer.service'
// import awsService from './aws.service'
// import notificationService from './notification.service'

export default {
    emailService: {
        nodemailer
    },
    // awsService,
    // notificationService
};