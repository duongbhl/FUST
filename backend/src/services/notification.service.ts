import { prisma } from "../config/prisma";
import { getPagination, paginated } from "../utils/pagination";

export const notificationService = {
  async list(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip, take } = getPagination(query);
    const where = { recipientId: userId, deletedAt: null };
    const [items, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        include: { actor: { select: { id: true, name: true, avatarUrl: true } }, post: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.notification.count({ where })
    ]);
    return paginated(items, total, page, limit);
  }
};
