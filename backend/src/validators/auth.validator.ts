import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const googleSchema = z.object({
  body: z.object({
    idToken: z.string().min(10)
  })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().optional() }).optional().default({})
});
