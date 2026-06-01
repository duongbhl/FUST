import type { Request, Response } from "express";
import { userService } from "../services/user.service";
import { uploadService } from "../services/upload.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export const userController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const user = await userService.me(req.user.id);
    res.json({ success: true, data: user });
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const user = await userService.updateMe(req.user.id, req.body);
    res.json({ success: true, data: user });
  }),

  avatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const file = req.file;
    if (!file) throw new AppError("Avatar image is required", 400);
    const [image] = await uploadService.uploadImages([file], "food-review/avatars");
    const user = await userService.updateAvatar(req.user.id, image.url);
    res.json({ success: true, data: { user, image } });
  })
};
