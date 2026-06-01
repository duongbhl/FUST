import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

export const uploadRouter = Router();

uploadRouter.post("/images", authenticate, upload.array("images", 10), uploadController.images);
