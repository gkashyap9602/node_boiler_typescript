const nodemailer = require('nodemailer');
import { showResponse } from "../utils/response.util";
import { ApiResponse } from "../utils/interfaces.util";
import { EMAIL_CREDENTIAL } from "../constants/app.constant";

const nodemail = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    return new Promise(async (resolve, reject) => {

        try {
            const transporter = nodemailer.createTransport({
                host: EMAIL_CREDENTIAL.EMAIL_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: EMAIL_CREDENTIAL.SENDGRID_API,
                    pass: EMAIL_CREDENTIAL.SENDGRID_API_KEY
                }
            });

            let mailOptions = {
                from: EMAIL_CREDENTIAL.EMAIL_HOST,
                to,
                subject,
                html: body,
                attachments
            }
            transporter.sendMail(mailOptions, (error: any, data: any) => {
                if (error) {
                    return resolve(showResponse(false, 'Email Sent Error', error, null, 200));
                }

                // console.log(data, "datatatatataemail")
                return resolve(showResponse(true, 'Email Sent Successfully', null, null, 200));
            })
        } catch (err) {
            console.log("in catch err", err)
            return resolve(showResponse(false, "Error while sending Email", err, null, 200));
        }
    });
}

export default { nodemail } 