import { Router } from "express";
import { voteController } from "../controllers/vote.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { postActionSchema } from "../validators/vote.validator";

export const voteRouter = Router();

voteRouter.post("/", authenticate, validate(postActionSchema), voteController.create);
voteRouter.delete("/", authenticate, voteController.remove);
