import type { Request } from "express";
import { AppError } from "./appError";

export function getRequiredParam(req: Request, key: string) {
  const value = req.params[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`Missing route parameter: ${key}`, 400, "INVALID_ROUTE_PARAM");
  }
  return value;
}
