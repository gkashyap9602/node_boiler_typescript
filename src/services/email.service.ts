import nodemailer from 'nodemailer'
import { showResponse } from "../utils/response.util";
import { ApiResponse, EmailSendType } from "../utils/interfaces.util";
import { APP, EMAIL_CREDENTIAL } from "../constants/app.constant";
import { EMAIL_SEND_TYPE } from "../constants/workflow.constant";
import ejs from 'ejs'
import path from 'path'
import responseMessages from "../constants/responseMessages";
import statusCodes from '../constants/statusCodes';
import sgMail from '@sendgrid/mail'

const nodemail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    const EMAIL_HOST = await EMAIL_CREDENTIAL.EMAIL_HOST
    const SMTP_EMAIL = await EMAIL_CREDENTIAL.SMTP_EMAIL
    const SMTP_API_KEY = await EMAIL_CREDENTIAL.SMTP_API_KEY

    return new Promise((resolve) => {

        try {
            const transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: SMTP_EMAIL,
                    pass: SMTP_API_KEY
                }
            });

            const mailOptions = {
                from: EMAIL_HOST,
                to,
                subject,
                html: body,
                attachments
            }
            transporter.sendMail(mailOptions, (error: any, data: any) => {
                if (error) {
                    return resolve(showResponse(false, responseMessages.common.email_sent_error, error, statusCodes.API_ERROR));
                }
                return resolve(showResponse(true, responseMessages.common.email_sent_success, data, statusCodes.SUCCESS));
            })
        } catch (err) {
            console.log("in catch err", err)
            return resolve(showResponse(false, responseMessages.common.email_sent_error, err, statusCodes.API_ERROR));
        }
    });
}//ends


const sendgridMail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    const SENDGRID_FROM_EMAIL = await EMAIL_CREDENTIAL.SMTP_EMAIL
    const SENDGRID_API_KEY = await EMAIL_CREDENTIAL.SMTP_API_KEY
    // console.log(SENDGRID_FROM_EMAIL, "SENDGRID_FROM_EMAIL");
    sgMail.setApiKey(SENDGRID_API_KEY);

    return new Promise((resolve) => {
        try {

            const mailOptions = {
                to: to,
                from: SENDGRID_FROM_EMAIL,
                subject,
                html: body,
                attachments
            }

            sgMail.send(mailOptions).then(() => {

                return resolve(showResponse(true, responseMessages.common.email_sent_success, null, statusCodes.SUCCESS));
            }).catch((error: any) => {
                console.log(error)
                return resolve(showResponse(false, responseMessages.common.email_sent_error, error, statusCodes.API_ERROR));
            });
        } catch (err) {
            return resolve(showResponse(false, responseMessages.common.email_sent_error, err, statusCodes.API_ERROR));
        }
    });
}//ends

const sendEmail = async (emailType: EmailSendType, recipientEmail: string, body: any, transportMethod: string, useLocalLogo = false) => {
    try {
        const { user_name, otp, html } = body;
        const to = recipientEmail;
        let template = '';
        let subject = '';

        const logoPath = useLocalLogo
            ? path.join(process.cwd(), './public', 'logo.png')
            : `${APP.BITBUCKET_URL}/${APP.PROJECT_LOGO}`;

        const attachments = useLocalLogo ? [{
            filename: 'logo.png',
            path: logoPath,
            cid: 'unique@Logo',
        }] : [];

        const email_payload: any = {
            project_name: APP.PROJECT_NAME,
            user_name,
            project_logo: useLocalLogo ? null : logoPath,
            cidLogo: useLocalLogo ? 'unique@Logo' : '',
        };

        switch (emailType) {
            case EMAIL_SEND_TYPE.REGISTER_EMAIL:
                email_payload.otp = otp;
                subject = 'New user registered';
                template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
                break;
            case EMAIL_SEND_TYPE.FORGOT_PASSWORD_EMAIL:
                email_payload.otp = otp;
                subject = 'Forgot Password';
                template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), email_payload);
                break;
            case EMAIL_SEND_TYPE.SEND_OTP_EMAIL:
                email_payload.otp = otp;
                subject = 'Your Verification Code';
                template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'resendOtp.ejs'), email_payload);
                break;
            case EMAIL_SEND_TYPE.REPLY_CONTACTUS_EMAIL:
                email_payload.reply = html;
                template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'contactUs.ejs'), email_payload);
                subject = 'Reply To Your Query';
                break;
            default:
                return showResponse(false, responseMessages.common.invalid_type, null, statusCodes.API_ERROR);
        }

        const emailSent = transportMethod === 'sendgrid'
            ? await sendgridMail(to, subject, template)
            : await nodemail(to, subject, template, attachments);

        if (!emailSent.status) {
            return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessages.common.email_sent_success, emailSent, statusCodes.SUCCESS);
    } catch (error: any) {
        return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);
    }
};




const sendEmailViaSendGrid = (emailType: EmailSendType, recipientEmail: string, body: any) => sendEmail(emailType, recipientEmail, body, 'sendgrid');
const sendEmailViaNodemail = (emailType: EmailSendType, recipientEmail: string, body: any, useLocalLogo = false) => sendEmail(emailType, recipientEmail, body, 'nodemailer', useLocalLogo);


export { sendEmailViaSendGrid, sendEmailViaNodemail } 