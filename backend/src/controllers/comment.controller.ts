import type { Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { getRequiredParam } from "../utils/request";

export const commentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await commentService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await commentService.update(getRequiredParam(req, "id"), req.user, req.body.content);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    await commentService.remove(getRequiredParam(req, "id"), req.user);
    res.status(204).send();
  })
};
