import express from "express";
import notificationController from "../controllers/notification-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const notificationRouter = new express.Router();

notificationRouter.use(authMiddleware);

notificationRouter.get('/api/v1/notifications', notificationController.list);
notificationRouter.patch('/api/v1/notifications/:id/read', notificationController.markAsRead);

export { notificationRouter };