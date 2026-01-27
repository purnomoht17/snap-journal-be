import express from "express";
import userController from "../controllers/user-controller.js";
import { updateUserValidation, updatePasswordValidation, fcmTokenValidation} from "../validations/user-validation.js"; 
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";

const userRouter = new express.Router();

userRouter.use(authMiddleware);

userRouter.put('/api/v1/user/profile',runValidation(updateUserValidation), userController.updateProfile);
userRouter.put('/api/v1/user/password', runValidation(updatePasswordValidation), userController.updatePassword);
userRouter.delete('/api/v1/user/delete', userController.deleteAccount);
userRouter.post('/api/v1/fcm/token', 
    runValidation(fcmTokenValidation), 
    userController.setFcmToken
);

export { userRouter };