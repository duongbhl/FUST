import { Router } from "express";
import { postController } from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createPostSchema, postIdSchema, postListSchema, updatePostSchema } from "../validators/post.validator";

export const postRouter = Router();

postRouter.get("/", validate(postListSchema), postController.list);
postRouter.get("/:id", validate(postIdSchema), postController.get);
postRouter.post("/", authenticate, validate(createPostSchema), postController.create);
postRouter.patch("/:id", authenticate, validate(updatePostSchema), postController.update);
postRouter.delete("/:id", authenticate, validate(postIdSchema), postController.remove);
