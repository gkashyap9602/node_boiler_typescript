import nodemailer from 'nodemailer'
import { showResponse } from "../utils/response.util";
import { ApiResponse, EmailSendType } from "../utils/interfaces.util";
import { APP, EMAIL_CREDENTIAL, EMAIL_SEND_TYPE } from "../constants/app.constant";
import ejs from 'ejs'
import path from 'path'
import responseMessages from "../constants/responseMessages";
import statusCodes from '../constants/statusCodes';

const nodemail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    const EMAIL_HOST = await EMAIL_CREDENTIAL.EMAIL_HOST
    const SENDGRID_API = await EMAIL_CREDENTIAL.SENDGRID_API
    const SENDGRID_API_KEY = await EMAIL_CREDENTIAL.SENDGRID_API_KEY

    return new Promise((resolve) => {

        try {
            const transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: SENDGRID_API,
                    pass: SENDGRID_API_KEY
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
}


const sendEmailViaNodemail = async (emailType: EmailSendType, recipientEmail: string, body: any, useLocalLogo: boolean = false) => {
    try {
        const { user_name, otp } = body;
        const to = recipientEmail
        let template = ''
        let subject = ''

        //if useLocalLogo false then pass uploaded logo url
        const logoPath = useLocalLogo ? path.join(process.cwd(), './public', 'logo.png') : `${APP.BITBUCKET_URL}/${APP.PROJECT_LOGO}`;
        const attachments = useLocalLogo ? [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: 'unique@Logo',
            }
        ] : []

        const email_payload: any = { project_name: APP.PROJECT_NAME, user_name, project_logo: useLocalLogo ? null : logoPath, cidLogo: useLocalLogo ? 'unique@Logo' : '', }

        if (emailType === EMAIL_SEND_TYPE.REGISTER_EMAIL) {
            email_payload.otp = otp //add otp in email payload for ejs template
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
            subject = `New user registered`
        }

        if (emailType === EMAIL_SEND_TYPE.FORGOT_PASSWORD_EMAIL) {
            email_payload.otp = otp //add otp in email payload for ejs template
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), email_payload);
            subject = `Forgot Password`
        }

        if (emailType === EMAIL_SEND_TYPE.SEND_OTP_EMAIL) {
            email_payload.otp = otp //add otp in email payload for ejs template
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'resendOtp.ejs'), email_payload);
            subject = `Your Verification Code`
        }

        const emailSent = await nodemail(to, subject, template, attachments)
        if (!emailSent.status) {
            return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessages.common.email_sent_success, emailSent, statusCodes.SUCCESS);

    } catch (error: any) {
        return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);

    }
}


export { nodemail, sendEmailViaNodemail } 