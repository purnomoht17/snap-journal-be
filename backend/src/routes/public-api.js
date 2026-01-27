import express from "express";
import authController from "../controllers/auth-controller.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { registerUserValidation, loginUserValidation, forgotPasswordValidation, resetPasswordValidation} from "../validations/auth-validation.js"; 

const publicRouter = new express.Router();

publicRouter.post(
    "/api/v1/auth/register",
    runValidation(registerUserValidation),
    authController.register
);

publicRouter.post(
    "/api/v1/auth/login",
    runValidation(loginUserValidation),
    authController.login
);

publicRouter.get('/api/v1/auth/email/verify', authController.verifyEmail);
publicRouter.post('/api/v1/auth/forgot-password', runValidation(forgotPasswordValidation), authController.forgotPassword);
publicRouter.post('/api/v1/auth/reset-password', runValidation(resetPasswordValidation), authController.resetPassword);

export { publicRouter };