import { z } from "zod";

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    type: z.enum(["all", "posts", "restaurants"]).optional()
  })
});
