import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : undefined;
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: error.issues
    });
  }

  const prismaCode = getErrorCode(error);
  if (prismaCode === "P2002") return res.status(409).json({ success: false, message: "Unique constraint violation", code: prismaCode });
  if (prismaCode === "P2025") return res.status(404).json({ success: false, message: "Record not found", code: prismaCode });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return res.status(500).json({ success: false, message });
}
