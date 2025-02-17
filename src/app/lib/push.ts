import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";

if (!admin.apps.length) {
    const serviceAccount = require("@/../service_key.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const SendPush = async (
    token: string,
    title: string,
    message: string,
    link: string
) => {
    // console.log("push 알림");
    try {
        const payload: Message = {
            token,
            data: {
                title: title,
                body: message,
                link: link,
            },
            // webpush: {
            //     fcmOptions: {
            //         link: "https://youtube.com",
            //     },
            // },
        };

        await admin.messaging().send(payload);
    } catch (error) {
        //fcm error
        // console.log("fcm error");
        // throw error;
    }
};
