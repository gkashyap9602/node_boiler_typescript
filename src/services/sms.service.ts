
import twillioClient from 'twilio'
import { SMS_CREDENTIAL } from '../constants/app.constant';
import { showResponse } from '../utils/response.util';
import responseMessage from '../constants/responseMessage.constant'
import AWS from 'aws-sdk'

const sendSMSWithTwillio = async (to: string, body: string) => {
    try {

        let twillio_sid = await SMS_CREDENTIAL.TWILIO_ACCOUNT_SID
        let twillio_auth = await SMS_CREDENTIAL.TWILIO_AUTH_TOKEN

        const client = twillioClient(twillio_sid, twillio_auth);

        let response = await client.messages.create({
            body,
            from: SMS_CREDENTIAL.SEND_FROM_HOST,
            to
        });
        return response.sid
    } catch (err: any) {
        console.log(err, "error twilio")
        return err;
    }
}


const sendSMSWithAwsSNS = async (to: number, Message: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sns = new AWS.SNS();
            const params: any = {
                Message,
                PhoneNumber: to,
            };
            // Send the SMS
            sns.publish(params, (err, data) => {
                if (err) {
                    return resolve(
                        showResponse(
                            false,
                            responseMessage?.common?.sms_sent_error,
                            err,
                            null,
                            200
                        )
                    );
                } else {
                    return resolve(
                        showResponse(
                            true,
                            responseMessage?.common?.sms_sent_success,
                            data,
                            null,
                            200
                        )
                    );
                }
            });
        } catch (err) {
            console.log("in catch err", err);
            return resolve(
                showResponse(false, responseMessage?.common?.aws_error, err, null, 200)
            );
        }
    });
};

export { sendSMSWithTwillio, sendSMSWithAwsSNS }