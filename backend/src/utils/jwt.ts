import jwt, { type SignOptions } from "jsonwebtoken";
import type { RoleName } from "../types/domain";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}
