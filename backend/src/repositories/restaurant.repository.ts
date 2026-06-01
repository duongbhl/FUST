import { prisma } from "../config/prisma";

export const restaurantInclude = {
  category: true,
  images: { where: { deletedAt: null }, orderBy: { position: "asc" as const } },
  createdBy: { select: { id: true, name: true, avatarUrl: true } }
} as const;

export const restaurantRepository = {
  findMany(args: Record<string, unknown>) {
    return prisma.restaurant.findMany(args);
  },
  count(where: Record<string, unknown>) {
    return prisma.restaurant.count({ where });
  },
  findById(id: string) {
    return prisma.restaurant.findFirst({ where: { id, deletedAt: null }, include: restaurantInclude });
  }
};
