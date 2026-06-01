import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    postId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
    content: z.string().min(1).max(3000)
  })
});

export const updateCommentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ content: z.string().min(1).max(3000) })
});

export const commentIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
