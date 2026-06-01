import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";

export const commentService = {
  async create(userId: string, data: { postId: string; parentId?: string; content: string }) {
    const post = await prisma.post.findFirst({ where: { id: data.postId, deletedAt: null }, select: { id: true, authorId: true, title: true } });
    if (!post) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    if (data.parentId) {
      const parent = await prisma.comment.findFirst({ where: { id: data.parentId, postId: data.postId, deletedAt: null } });
      if (!parent) throw new AppError("Parent comment not found", 404, "PARENT_COMMENT_NOT_FOUND");
    }
    const comment = await prisma.comment.create({
      data: { ...data, authorId: userId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, replies: true }
    });
    await prisma.post.update({ where: { id: data.postId }, data: { commentCount: { increment: 1 } } });
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: userId,
          type: data.parentId ? "REPLY" : "COMMENT",
          title: data.parentId ? "New reply" : "New comment",
          message: `Someone commented on ${post.title}`,
          postId: post.id,
          commentId: comment.id
        }
      });
    }
    return comment;
  },

  async update(id: string, user: Express.UserPayload, content: string) {
    const comment = await prisma.comment.findFirst({ where: { id, deletedAt: null } });
    if (!comment) throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    if (comment.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new AppError("You cannot update this comment", 403, "FORBIDDEN");
    }
    return prisma.comment.update({ where: { id }, data: { content }, include: { author: { select: { id: true, name: true, avatarUrl: true } } } });
  },

  async remove(id: string, user: Express.UserPayload) {
    const comment = await prisma.comment.findFirst({ where: { id, deletedAt: null } });
    if (!comment) throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    if (comment.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new AppError("You cannot delete this comment", 403, "FORBIDDEN");
    }
    await prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
    await prisma.post.update({ where: { id: comment.postId }, data: { commentCount: { decrement: 1 } } });
  }
};
