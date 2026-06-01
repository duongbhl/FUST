import { OAuth2Client } from "google-auth-library";
import type { RoleName } from "../types/domain";
import { env, isProduction } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { comparePassword, compareToken, hashPassword, hashToken } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);

function publicUser(user: { id: string; email: string; name: string; avatarUrl: string | null; role: { name: RoleName | string } }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role.name as RoleName };
}

async function defaultRoleId() {
  const role = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER", description: "Default application user" }
  });
  return role.id;
}

async function issueTokens(user: { id: string; email: string; role: { name: RoleName | string } }) {
  const payload = { sub: user.id, email: user.email, role: user.role.name as RoleName };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: await hashToken(refreshToken) } });
  return { accessToken, refreshToken };
}

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" as const : "lax" as const,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api/v1/auth/refresh",
  maxAge: 30 * 24 * 60 * 60 * 1000
};

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const exists = await userRepository.findByEmail(input.email);
    if (exists) throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: await hashPassword(input.password),
        roleId: await defaultRoleId()
      },
      include: { role: true }
    });

    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email.toLowerCase());
    if (!user?.passwordHash) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async google(idToken: string) {
    if (!env.GOOGLE_CLIENT_ID) throw new AppError("Google OAuth is not configured", 503, "GOOGLE_NOT_CONFIGURED");
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) throw new AppError("Invalid Google token", 401, "INVALID_GOOGLE_TOKEN");

    const byGoogle = await userRepository.findByGoogleId(payload.sub);
    if (byGoogle) {
      const tokens = await issueTokens(byGoogle);
      return { user: publicUser(byGoogle), ...tokens };
    }

    const existing = await userRepository.findByEmail(payload.email.toLowerCase());
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { googleId: payload.sub, avatarUrl: existing.avatarUrl ?? payload.picture },
          include: { role: true }
        })
      : await prisma.user.create({
          data: {
            email: payload.email.toLowerCase(),
            name: payload.name ?? payload.email.split("@")[0],
            avatarUrl: payload.picture,
            googleId: payload.sub,
            roleId: await defaultRoleId()
          },
          include: { role: true }
        });

    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new AppError("Refresh token is required", 401, "REFRESH_TOKEN_REQUIRED");
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);
    if (!user?.refreshTokenHash) throw new AppError("Refresh session not found", 401, "INVALID_REFRESH_SESSION");
    const valid = await compareToken(refreshToken, user.refreshTokenHash);
    if (!valid) throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async logout(userId?: string) {
    if (userId) {
      await prisma.user.updateMany({ where: { id: userId }, data: { refreshTokenHash: null } });
    }
  }
};
