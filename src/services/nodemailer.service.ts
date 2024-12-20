import nodemailer from 'nodemailer'
import { showResponse } from "../utils/response.util";
import { ApiResponse } from "../utils/interfaces.util";
import { EMAIL_CREDENTIAL } from "../constants/app.constant";

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
            transporter.sendMail(mailOptions, (error: any) => {
                if (error) {
                    return resolve(showResponse(false, 'Email Sent Error', error, 200));
                }

                // console.log(data, "datatatatataemail")
                return resolve(showResponse(true, 'Email Sent Successfully', null, 200));
            })
        } catch (err) {
            console.log("in catch err", err)
            return resolve(showResponse(false, "Error while sending Email", err, 200));
        }
    });
}

export { nodemail } 