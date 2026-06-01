type PrismaDelegate = Record<string, (...args: any[]) => any>;

export interface PrismaClientLike {
  role: PrismaDelegate;
  user: PrismaDelegate;
  category: PrismaDelegate;
  restaurant: PrismaDelegate;
  restaurantImage: PrismaDelegate;
  post: PrismaDelegate;
  postImage: PrismaDelegate;
  comment: PrismaDelegate;
  vote: PrismaDelegate;
  favorite: PrismaDelegate;
  tag: PrismaDelegate;
  postTag: PrismaDelegate;
  notification: PrismaDelegate;
  $transaction<T extends any[]>(promises: [...T]): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
  $disconnect(): Promise<void>;
}

const { PrismaClient } = require("@prisma/client") as { PrismaClient: new (options?: Record<string, unknown>) => PrismaClientLike };

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
