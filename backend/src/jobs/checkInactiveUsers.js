import { database } from "../applications/database.js";
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid";

export const checkInactiveUsers = async () => {
    console.log("--- Starting Job: Check Inactive Users ---");

    try {
        const usersRef = database.collection("users");
        const notificationsRef = database.collection("notifications");
        const now = new Date();
        const cutoffTime = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        const snapshot = await usersRef
            .where("last_entry", "<", cutoffTime.toISOString())
            .get();

        if (snapshot.empty) {
            console.log("No inactive users found.");
            return;
        }

        let countProcessed = 0;

        const batchPromises = snapshot.docs.map(async (doc) => {
            const user = doc.data();
            const userId = doc.id;
            
            if (!user.fcm_token) return;

            if (user.last_reminder_at) {
                const lastReminded = new Date(user.last_reminder_at);
                const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                if (lastReminded > twentyFourHoursAgo) return;
            }

            const notificationId = uuidv4();
            const title = "We want to hear your story again :(";
            const body = `Hey ${user.name || 'Friend'}, it’s been 48 hours since your last journal.`;

            try {
                await admin.messaging().send({
                    token: user.fcm_token,
                    notification: { title, body },
                    data: { type: "reminder", click_action: "FLUTTER_NOTIFICATION_CLICK" }
                });
                console.log(`FCM Sent to ${user.name}`);
            } catch (fcmError) {
                console.warn(`[TESTING INFO] Gagal kirim FCM (Token Palsu?): ${fcmError.message}`);
            }

            await notificationsRef.doc(notificationId).set({
                id: notificationId,
                type: "reminder",
                notifiable_type: "user",
                notifiable_id: userId, 
                data: JSON.stringify({ title, message: body, type: "reminder" }),
                read_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            await usersRef.doc(userId).update({ 
                last_reminder_at: new Date().toISOString()
            });

            countProcessed++;
        });

        await Promise.all(batchPromises);
        console.log(`--- Job Finished. Processed ${countProcessed} users. ---`);

    } catch (error) {
        console.error("Job Error:", error);
    }
};