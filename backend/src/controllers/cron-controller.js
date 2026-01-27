import { checkInactiveUsers } from "../jobs/checkInactiveUsers.js";

const triggerReminder = async (req, res, next) => {
    try {
        console.log("Manual Trigger: Check Inactive Users");
        
        await checkInactiveUsers();

        res.status(200).json({
            data: {
                message: "Cron Job Triggered Successfully"
            }
        });
    } catch (e) {
        next(e);
    }
}

export default {
    triggerReminder
}