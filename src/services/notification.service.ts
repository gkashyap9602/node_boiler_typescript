import firebaseAdmin from "../configs/firebase.config";
import { showResponse } from "../utils/response.util";

const sendTopicNotification = async (topic: string, title: string, message: string, data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let messageData = {
                topic: topic,
                notification: {
                    title: title,
                    body: message
                },
                data: { data: JSON.stringify(data) }
            };

            await firebaseAdmin.messaging().send(messageData)
                .then((response) => {
                    console.log(response);
                    return resolve(showResponse(true, "Notification sent successfully", response, null, 200));
                })
                .catch((error) => {
                    console.log(error);
                    return resolve(showResponse(false, "Failed to send notification", error, null, 500));
                });

        } catch (err: any) {
            console.log(err);
            return resolve(showResponse(true, "Unable to send notification", err.message, null, 200));
        }
    });
}
//ends

export { sendTopicNotification }

