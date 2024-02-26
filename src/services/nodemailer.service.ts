const nodemailer = require('nodemailer');
import { showResponse } from "../utils/response.util";
import { ApiResponse } from "../utils/interfaces.util";

const sendEmailService = async (to: string, subject: string, body: any, attachments: any = []): Promise<ApiResponse> => {
    return new Promise(async (resolve, reject) => {
        // let SMTP_MAIL = await getParameterFromAWS({ name: 'STMP_EMAIL' });
        // let SMTP_APP_PASSWORD = await getParameterFromAWS({ name: 'SMTP_APP_PASSWORD' });

        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: 'digismartdisc@gmail.com',
                    pass: 'xmcscwkzvrlorqtc'
                }
            });
            let mailOptions = {
                from: 'digismartdisc@gmail.com',
                to,
                subject,
                html: body,
                attachments
            }
            transporter.sendMail(mailOptions, (error: any, data: any) => {
                if (error) {
                    return resolve(showResponse(false, 'Email Sent Error', error, null, 200));
                }

                console.log(data, "datatatatataemail")
                return resolve(showResponse(true, 'Email Sent Successfully', null, null, 200));
            })
        } catch (err) {
            console.log("in catch err", err)
            return resolve(showResponse(false, "Error while sending Email", err, null, 200));
        }
    });
}

export default sendEmailService