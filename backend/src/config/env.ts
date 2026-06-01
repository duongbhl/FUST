import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(8)
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
