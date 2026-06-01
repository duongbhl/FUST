import type { NextFunction, Request, Response } from "express";
import type { RoleName } from "../types/domain";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { verifyAccessToken } from "../utils/jwt";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      include: { role: true }
    });
    if (!user) throw new AppError("User no longer exists", 401, "UNAUTHENTICATED");
    req.user = { id: user.id, email: user.email, role: user.role.name as RoleName };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
  }
}

export const authorize = (...roles: RoleName[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
  if (!roles.includes(req.user.role)) return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
  next();
};
