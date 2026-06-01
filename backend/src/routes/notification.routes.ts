import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth";

export const notificationRouter = Router();

notificationRouter.get("/", authenticate, notificationController.list);
