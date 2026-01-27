import express from "express";
import cors from "cors";

import { errorMiddleware } from "../middlewares/error-middleware.js";
import { publicRouter } from "../routes/public-api.js";
import { userRouter } from "../routes/user-api.js";
import { authRouter } from "../routes/auth-api.js";
import { journalRouter } from "../routes/journal-api.js";
import { notificationRouter } from "../routes/notification-api.js";
import { cronRouter } from "../routes/cron-api.js";

export const web = express();

web.use(
  cors({
    origin: true,
    credentials: true,
  })
);

web.use(express.json());
web.use("/public", express.static("public"));

web.use(publicRouter);
web.use(cronRouter);
web.use(authRouter);
web.use(userRouter);
web.use(journalRouter);
web.use(notificationRouter);

web.use(errorMiddleware);