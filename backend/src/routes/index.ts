import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { restaurantRouter } from "./restaurant.routes";
import { postRouter } from "./post.routes";
import { commentRouter } from "./comment.routes";
import { voteRouter } from "./vote.routes";
import { favoriteRouter } from "./favorite.routes";
import { notificationRouter } from "./notification.routes";
import { uploadRouter } from "./upload.routes";
import { searchRouter } from "./search.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "food-review-backend" } }));
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/restaurants", restaurantRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/votes", voteRouter);
apiRouter.use("/favorites", favoriteRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/search", searchRouter);
