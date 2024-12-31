import { showResponse } from "../utils/response.util";
import { ApiResponse, EmailSendType } from "../utils/interfaces.util";
import { APP, EMAIL_CREDENTIAL, EMAIL_SEND_TYPE } from "../constants/app.constant";
import sgMail from '@sendgrid/mail'
import statusCodes from '../constants/statusCodes';
import ejs from 'ejs'
import path from 'path'
import responseMessages from "../constants/responseMessages";


const sendgridMail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    const SENDGRID_API_KEY = await EMAIL_CREDENTIAL.SENDGRID_API_KEY
    const SENDGRID_UNAME = await EMAIL_CREDENTIAL.SENDGRID_API
    // console.log(SENDGRID_UNAME, "SENDGRID_UNAME");
    sgMail.setApiKey(SENDGRID_API_KEY);

    return new Promise((resolve) => {
        try {

            const mailOptions = {
                to: to,
                from: SENDGRID_UNAME,
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
}



const sendEmailViaSendGrid = async (emailType: EmailSendType, recipientEmail: string, body: any) => {
    try {
        const { user_name, otp } = body;
        const logoPath = `${APP.BITBUCKET_URL}/${APP.PROJECT_LOGO}`;
        const email_payload: any = { project_name: APP.PROJECT_NAME, user_name, project_logo: logoPath }
        const to = recipientEmail
        let template = ''
        let subject = ''

        if (emailType === EMAIL_SEND_TYPE.REGISTER_EMAIL) {
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'registration.ejs'), email_payload);
            subject = `New user registered`
            email_payload.otp = otp //add otp in email payload for ejs template
        }

        if (emailType === EMAIL_SEND_TYPE.FORGOT_PASSWORD_EMAIL) {
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'forgotPassword.ejs'), email_payload);
            subject = `Forgot Password`
            email_payload.otp = otp //add otp in email payload for ejs template
        }

        if (emailType === EMAIL_SEND_TYPE.SEND_OTP_EMAIL) {
            template = await ejs.renderFile(path.join(process.cwd(), './src/templates', 'resendOtp.ejs'), email_payload);
            subject = `Your Verification Code`
            email_payload.otp = otp //add otp in email payload for ejs template
        }

        const emailSent = await sendgridMail(to, subject, template)
        if (!emailSent.status) {
            return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);
        }

        return showResponse(true, responseMessages.common.email_sent_success, emailSent, statusCodes.SUCCESS);

    } catch (error: any) {
        return showResponse(false, responseMessages.common.email_sent_error, null, statusCodes.API_ERROR);
    }
}

export { sendgridMail, sendEmailViaSendGrid } 