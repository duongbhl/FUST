import type { Request, Response } from "express";
import { favoriteService } from "../services/favorite.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

export const favoriteController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await favoriteService.create(req.user.id, req.body.postId);
    res.status(201).json({ success: true, data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const postId = String(req.body.postId ?? req.query.postId ?? "");
    await favoriteService.remove(req.user.id, postId);
    res.status(204).send();
  })
};
