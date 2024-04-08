import firebaseAdmin from "../configs/firebase.config";
import { showResponse } from "../utils/response.util";

const sendTopicNotification = (topic: string, title: string, message: string, data: any) => {
    return new Promise((resolve, reject) => {
        try {
            const messageData = {
                topic: topic,
                notification: {
                    title: title,
                    body: message
                },
                data: { data: JSON.stringify(data) }
            };

            firebaseAdmin.messaging().send(messageData)
                .then((response) => {
                    console.log(response);
                    return resolve(showResponse(true, "Notification sent successfully", response, 200));
                })
                .catch((error) => {
                    console.log(error);
                    return reject(showResponse(false, "Failed to send notification", error, 500));
                });

        } catch (err: any) {
            console.log(err);
            return reject(showResponse(true, "Unable to send notification", err.message, 200));
        }
    });
}
//ends

export { sendTopicNotification }

