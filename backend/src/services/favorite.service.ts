import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";

export const favoriteService = {
  async create(userId: string, postId: string) {
    const post = await prisma.post.findFirst({ where: { id: postId, deletedAt: null }, select: { id: true, authorId: true, title: true } });
    if (!post) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    const existing = await prisma.favorite.findUnique({ where: { userId_postId: { userId, postId } } });
    if (existing && !existing.deletedAt) return existing;
    const favorite = existing
      ? await prisma.favorite.update({ where: { id: existing.id }, data: { deletedAt: null } })
      : await prisma.favorite.create({ data: { userId, postId } });
    await prisma.post.update({ where: { id: postId }, data: { favoriteCount: { increment: 1 } } });
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: { recipientId: post.authorId, actorId: userId, type: "FAVORITE", title: "New save", message: `Someone saved ${post.title}`, postId }
      });
    }
    return favorite;
  },

  async remove(userId: string, postId: string) {
    const favorite = await prisma.favorite.findUnique({ where: { userId_postId: { userId, postId } } });
    if (!favorite || favorite.deletedAt) return;
    await prisma.favorite.update({ where: { id: favorite.id }, data: { deletedAt: new Date() } });
    await prisma.post.update({ where: { id: postId }, data: { favoriteCount: { decrement: 1 } } });
  }
};
