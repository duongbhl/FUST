import type { Request, Response } from "express";
import { postService } from "../services/post.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { getRequiredParam } from "../utils/request";

export const postController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await postService.list(req.query);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await postService.get(getRequiredParam(req, "id"));
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await postService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await postService.update(getRequiredParam(req, "id"), req.user, req.body);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    await postService.remove(getRequiredParam(req, "id"), req.user);
    res.status(204).send();
  })
};
