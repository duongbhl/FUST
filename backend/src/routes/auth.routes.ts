import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { googleSchema, loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/google", validate(googleSchema), authController.google);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.post("/logout", authenticate, authController.logout);
