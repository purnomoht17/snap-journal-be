import express from "express";
import { limiter, corsOptions } from "../middlewares/security-middleware.js";

import { errorMiddleware } from "../middlewares/error-middleware.js";
import { publicRouter } from "../routes/public-api.js";
import { userRouter } from "../routes/user-api.js";
import { authRouter } from "../routes/auth-api.js";
import { journalRouter } from "../routes/journal-api.js";
import { notificationRouter } from "../routes/notification-api.js";
import swaggerDocs from "./swagger.js";

export const web = express();

web.set('trust proxy', true);
web.use(limiter);
web.use(corsOptions);

web.use(express.json());

swaggerDocs(web);

web.use("/public", express.static("public"));
web.use(publicRouter);
web.use(authRouter);
web.use(userRouter);
web.use(journalRouter);
web.use(notificationRouter);

web.use(errorMiddleware);