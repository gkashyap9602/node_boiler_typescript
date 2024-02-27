// const sendFcmNotification = (to, data) => {
//     return new Promise((resolve, reject) => {
//         getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
//             (FIREBASE_SERVER_KEY) => {
//                 var fcm = new FCM(FIREBASE_SERVER_KEY);

//                 var message = {
//                     to,
//                     priority: "high",
//                     notification: data,
//                     data,
//                 };
//                 fcm.send(message, (err, response) => {
//                     if (err) {
//                         console.log(err);
//                         resolve(err);
//                     }
//                     resolve(JSON.parse(response));
//                 });
//             }
//         );
//     });
// };
// const sendFcmNotificationTopic = (to, data) => {
//     return new Promise((resolve, reject) => {
//         getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
//             (FIREBASE_SERVER_KEY) => {
//                 console.log(FIREBASE_SERVER_KEY);
//                 var fcm = new FCM(FIREBASE_SERVER_KEY);
//                 var message = {
//                     to: "/topics/" + to,
//                     priority: "high",
//                     notification: data,
//                     data,
//                 };
//                 fcm.send(message, (err, response) => {
//                     if (err) {
//                         console.log(err, "err of noification");
//                         resolve(err);
//                     }
//                     console.log(response);
//                     resolve(JSON.parse(response));
//                 });
//             }
//         );
//     });
// };
// const sendFcmNotificationMultiple = (to, data, show) => {
//     return new Promise((resolve, reject) => {
//         getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
//             (FIREBASE_SERVER_KEY) => {
//                 var fcm = new FCM(FIREBASE_SERVER_KEY);
//                 data = { ...data, show: show ? show : false };
//                 var message = {
//                     registration_ids: to,
//                     priority: "high",
//                     notification: data,
//                     data,
//                 };
//                 fcm.send(message, (err, response) => {
//                     if (err) {
//                         resolve(JSON.parse(err));
//                     }
//                     resolve(JSON.parse(response));
//                 });
//             }
//         );
//     });
// };