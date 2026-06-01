import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { commentIdSchema, createCommentSchema, updateCommentSchema } from "../validators/comment.validator";

export const commentRouter = Router();

commentRouter.post("/", authenticate, validate(createCommentSchema), commentController.create);
commentRouter.patch("/:id", authenticate, validate(updateCommentSchema), commentController.update);
commentRouter.delete("/:id", authenticate, validate(commentIdSchema), commentController.remove);
