import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null }, include: { role: true } });
  },
  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
  },
  findByGoogleId(googleId: string) {
    return prisma.user.findFirst({ where: { googleId, deletedAt: null }, include: { role: true } });
  }
};
