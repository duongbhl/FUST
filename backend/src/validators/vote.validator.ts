import { z } from "zod";

export const postActionSchema = z.object({
  body: z.object({ postId: z.string().uuid() })
});
