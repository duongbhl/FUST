import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { updateMeSchema } from "../validators/user.validator";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get("/me", userController.me);
userRouter.patch("/me", validate(updateMeSchema), userController.updateMe);
userRouter.post("/avatar", upload.single("image"), userController.avatar);
