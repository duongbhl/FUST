import { Router } from "express";
import { favoriteController } from "../controllers/favorite.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { postActionSchema } from "../validators/vote.validator";

export const favoriteRouter = Router();

favoriteRouter.post("/", authenticate, validate(postActionSchema), favoriteController.create);
favoriteRouter.delete("/", authenticate, favoriteController.remove);
