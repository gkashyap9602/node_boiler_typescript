import { showResponse } from "../utils/response.util";
import { ApiResponse } from "../utils/interfaces.util";
import { EMAIL_CREDENTIAL } from "../constants/app.constant";
import sgMail from '@sendgrid/mail'
import statusCodes from '../constants/statusCodes';

const sendgridMail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    const EMAIL_HOST = await EMAIL_CREDENTIAL.EMAIL_HOST
    const SENDGRID_API_KEY = await EMAIL_CREDENTIAL.SENDGRID_API_KEY
    const SENDGRID_UNAME = await EMAIL_CREDENTIAL.SENDGRID_API
    console.log(EMAIL_HOST, "EMAIL_HOST");
    console.log(SENDGRID_UNAME, "SENDGRID_UNAME");
    
    sgMail.setApiKey(SENDGRID_API_KEY);

    return new Promise((resolve, reject) => {

        try {

            const mailOptions = {
                to:to,
                from: SENDGRID_UNAME,
                subject,
                html: body,
                // attachments
            }
            
            sgMail.send(mailOptions).then(() => {

                return resolve(showResponse(true, 'Email Sent Successfully', null, statusCodes.SUCCESS));
            }).catch((error: any) => {
                console.log(error)
                return reject(showResponse(false, 'Email Sent Error', error, statusCodes.API_ERROR));
            });
        } catch (err) {
            return reject(showResponse(false, "Error while sending Email", err, statusCodes.API_ERROR));
        }
    });
}

export { sendgridMail } 