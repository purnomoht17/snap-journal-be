import express from "express";
import cronController from "../controllers/cron-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const cronRouter = new express.Router();

cronRouter.post('/api/test-cron', cronController.triggerReminder);

export { cronRouter };