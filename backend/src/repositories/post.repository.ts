import { prisma } from "../config/prisma";

export const postInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  restaurant: { include: { category: true, images: { where: { deletedAt: null }, orderBy: { position: "asc" as const } } } },
  category: true,
  images: { where: { deletedAt: null }, orderBy: { position: "asc" as const } },
  tags: { include: { tag: true } },
  comments: {
    where: { deletedAt: null, parentId: null },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      replies: {
        where: { deletedAt: null },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" as const }
      }
    },
    orderBy: { createdAt: "desc" as const }
  }
} as const;

export const postListInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  restaurant: { include: { category: true, images: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, take: 1 } } },
  category: true,
  images: { where: { deletedAt: null }, orderBy: { position: "asc" as const }, take: 1 },
  tags: { include: { tag: true } }
} as const;

export const postRepository = {
  findMany(args: Record<string, unknown>) {
    return prisma.post.findMany(args);
  },
  count(where: Record<string, unknown>) {
    return prisma.post.count({ where });
  },
  findById(id: string) {
    return prisma.post.findFirst({ where: { id, deletedAt: null }, include: postInclude });
  }
};
