import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await notificationService.list(req.user.id, req.query);
    res.json({ success: true, data });
  })
};
