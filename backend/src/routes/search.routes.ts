import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { validate } from "../middlewares/validate";
import { searchSchema } from "../validators/search.validator";

export const searchRouter = Router();

searchRouter.get("/", validate(searchSchema), searchController.search);
