import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";

export const voteService = {
  async create(userId: string, postId: string) {
    const post = await prisma.post.findFirst({ where: { id: postId, deletedAt: null }, select: { id: true, authorId: true, title: true } });
    if (!post) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    const existing = await prisma.vote.findUnique({ where: { userId_postId: { userId, postId } } });
    if (existing && !existing.deletedAt) return existing;
    const vote = existing
      ? await prisma.vote.update({ where: { id: existing.id }, data: { deletedAt: null } })
      : await prisma.vote.create({ data: { userId, postId } });
    await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: { recipientId: post.authorId, actorId: userId, type: "VOTE", title: "New like", message: `Someone liked ${post.title}`, postId }
      });
    }
    return vote;
  },

  async remove(userId: string, postId: string) {
    const vote = await prisma.vote.findUnique({ where: { userId_postId: { userId, postId } } });
    if (!vote || vote.deletedAt) return;
    await prisma.vote.update({ where: { id: vote.id }, data: { deletedAt: new Date() } });
    await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
  }
};
