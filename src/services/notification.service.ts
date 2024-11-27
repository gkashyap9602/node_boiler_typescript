import firebaseAdmin from "../configs/firebase.config";
import { showResponse } from "../utils/response.util";

const sendTopicNotification = (topic: string, title: string, message: string, data: any) => {
    return new Promise((resolve) => {
        try {

            //no need to parse stringify data in fronend 
            const stringData = Object.keys(data).reduce((acc: any, key) => {
                acc[key] = String(data[key]);
                return acc;
            }, {});

            const messageData = {
                topic: topic.toString(),
                notification: {
                    title: title,
                    body: message
                },
                data: stringData,
                android: {
                    notification: {
                        channel_id: "high-priority-channel" as any, // Must match the ID created in the app
                        priority: "high" as any  // Sets the priority for pre-Oreo devices
                    }
                },
            };

            firebaseAdmin.messaging().send(messageData)
                .then((response) => {
                    console.log(response);
                    return resolve(showResponse(true, "Notification sent successfully", response, 200));
                })
                .catch((error) => {
                    console.log(error);
                    return resolve(showResponse(false, "Failed to send notification", error, 500));
                });

        } catch (err: any) {
            console.log(err);
            return resolve(showResponse(true, "Unable to send notification", err.message, 200));
        }
    });
}
//ends

export { sendTopicNotification }

