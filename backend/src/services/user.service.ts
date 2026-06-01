import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";

const selectPublicUser = {
  id: true,
  email: true,
  name: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  role: { select: { name: true } }
};

export const userService = {
  async me(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: selectPublicUser });
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    return user;
  },

  async updateMe(userId: string, data: { name?: string; bio?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id: userId }, data, select: selectPublicUser });
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({ where: { id: userId }, data: { avatarUrl }, select: selectPublicUser });
  }
};
