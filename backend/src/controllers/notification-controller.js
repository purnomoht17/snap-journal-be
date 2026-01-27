import notificationService from "../services/notification-service.js";

const list = async (req, res, next) => {
    try {
        const result = await notificationService.list(req.user, req.query);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const markAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const result = await notificationService.markAsRead(req.user, notificationId);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    list,
    markAsRead
}