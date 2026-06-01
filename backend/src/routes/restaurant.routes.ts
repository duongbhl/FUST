import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createRestaurantSchema, restaurantIdSchema, restaurantListSchema, updateRestaurantSchema } from "../validators/restaurant.validator";

export const restaurantRouter = Router();

restaurantRouter.get("/", validate(restaurantListSchema), restaurantController.list);
restaurantRouter.get("/:id", validate(restaurantIdSchema), restaurantController.get);
restaurantRouter.post("/", authenticate, validate(createRestaurantSchema), restaurantController.create);
restaurantRouter.patch("/:id", authenticate, authorize("ADMIN", "MODERATOR"), validate(updateRestaurantSchema), restaurantController.update);
restaurantRouter.delete("/:id", authenticate, authorize("ADMIN", "MODERATOR"), validate(restaurantIdSchema), restaurantController.remove);
