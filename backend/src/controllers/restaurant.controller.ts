import type { Request, Response } from "express";
import { restaurantService } from "../services/restaurant.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { getRequiredParam } from "../utils/request";

export const restaurantController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await restaurantService.list(req.query);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await restaurantService.get(getRequiredParam(req, "id"));
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Authentication required", 401);
    const data = await restaurantService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await restaurantService.update(getRequiredParam(req, "id"), req.body);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await restaurantService.remove(getRequiredParam(req, "id"));
    res.status(204).send();
  })
};
