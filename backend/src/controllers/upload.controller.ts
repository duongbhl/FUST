import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadController = {
  images: asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const folder = typeof req.body.folder === "string" ? `food-review/${req.body.folder}` : "food-review/rich-text";
    const data = await uploadService.uploadImages(files, folder);
    res.status(201).json({ success: true, data });
  })
};
