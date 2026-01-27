import express from "express";
import authController from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const authRouter = new express.Router();

authRouter.use(authMiddleware);

authRouter.delete('/api/v1/auth/logout', authController.logout);
authRouter.get('/api/v1/auth/me', authController.getMe);
authRouter.post('/api/v1/auth/email/verify-notification', authController.sendVerificationEmail);

export { authRouter };