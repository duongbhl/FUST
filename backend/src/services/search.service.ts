import { prisma } from "../config/prisma";
import { getPagination } from "../utils/pagination";

export const searchService = {
  async search(query: { q: string; type?: "all" | "posts" | "restaurants"; page?: number; limit?: number }) {
    const { skip, take } = getPagination(query);
    const q = query.q;
    const searchPosts = query.type !== "restaurants";
    const searchRestaurants = query.type !== "posts";

    const [posts, restaurants] = await Promise.all([
      searchPosts
        ? prisma.post.findMany({
            where: {
              deletedAt: null,
              published: true,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } }
              ]
            },
            include: {
              author: { select: { id: true, name: true, avatarUrl: true } },
              restaurant: true,
              images: { where: { deletedAt: null }, take: 1, orderBy: { position: "asc" } }
            },
            take,
            skip,
            orderBy: { createdAt: "desc" }
          })
        : Promise.resolve([]),
      searchRestaurants
        ? prisma.restaurant.findMany({
            where: {
              deletedAt: null,
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
                { area: { contains: q, mode: "insensitive" } }
              ]
            },
            include: { category: true },
            take,
            skip,
            orderBy: { ratingAvg: "desc" }
          })
        : Promise.resolve([])
    ]);
    return { posts, restaurants };
  }
};
