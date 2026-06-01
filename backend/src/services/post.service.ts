import { prisma } from "../config/prisma";
import { postInclude, postListInclude, postRepository } from "../repositories/post.repository";
import { AppError } from "../utils/appError";
import { getPagination, paginated } from "../utils/pagination";
import { createSlug, withUniqueSuffix } from "../utils/slug";
import type { PriceRange } from "../types/domain";

export interface PostCreateInput {
  title: string;
  excerpt?: string;
  content: string;
  rating: number;
  restaurantId?: string;
  restaurant?: {
    name: string;
    address: string;
    area?: string;
    city?: string;
    priceRange?: PriceRange;
    categoryId?: string;
    coverImage?: string;
    imageUrls?: string[];
  };
  categoryId?: string;
  imageUrls?: string[];
  tags?: string[];
  published?: boolean;
}

export interface PostFilters {
  q?: string;
  area?: string;
  restaurantId?: string;
  categoryId?: string;
  tag?: string;
  minRating?: number;
}

function whereFromFilters(filters: PostFilters) {
  return {
    deletedAt: null,
    published: true,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { excerpt: { contains: filters.q, mode: "insensitive" } },
            { content: { contains: filters.q, mode: "insensitive" } },
            { restaurant: { name: { contains: filters.q, mode: "insensitive" } } }
          ]
        }
      : {}),
    ...(filters.area ? { restaurant: { area: { contains: filters.area, mode: "insensitive" } } } : {}),
    ...(filters.restaurantId ? { restaurantId: filters.restaurantId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.tag ? { tags: { some: { tag: { slug: createSlug(filters.tag) } } } } : {}),
    ...(filters.minRating ? { rating: { gte: filters.minRating } } : {})
  };
}

async function uniquePostSlug(title: string, existingId?: string) {
  const base = createSlug(title);
  const existing = await prisma.post.findFirst({ where: { slug: base, ...(existingId ? { id: { not: existingId } } : {}) } });
  return existing ? withUniqueSuffix(base) : base;
}

async function connectTags(postId: string, tags: string[] = []) {
  await prisma.postTag.deleteMany({ where: { postId } });
  for (const raw of tags) {
    const name = raw.trim();
    if (!name) continue;
    const slug = createSlug(name);
    const tag = await prisma.tag.upsert({ where: { slug }, create: { name, slug }, update: { name } });
    await prisma.postTag.upsert({ where: { postId_tagId: { postId, tagId: tag.id } }, update: {}, create: { postId, tagId: tag.id } });
  }
}

async function recalcRestaurantRating(restaurantId?: string | null) {
  if (!restaurantId) return;
  const aggregate = await prisma.post.aggregate({
    where: { restaurantId, deletedAt: null, published: true },
    _avg: { rating: true },
    _count: { rating: true }
  });
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { ratingAvg: aggregate._avg.rating ?? 0, ratingCount: aggregate._count.rating }
  });
}

function plainText(value: string) {
  return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "").trim();
}

export const postService = {
  async list(query: PostFilters & Record<string, unknown>) {
    const { page, limit, skip, take, sortBy, sortOrder } = getPagination(query);
    const where = whereFromFilters(query);
    const safeSort = ["createdAt", "rating", "likeCount", "viewCount", "commentCount"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const [items, total] = await prisma.$transaction([
      postRepository.findMany({ where, include: postListInclude, orderBy: { [safeSort]: sortOrder }, skip, take }),
      postRepository.count(where)
    ]);
    return paginated(items, total, page, limit);
  },

  async get(id: string) {
    const post = await postRepository.findById(id);
    if (!post) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return post;
  },

  async create(data: PostCreateInput, authorId: string) {
    const slug = await uniquePostSlug(data.title);
    const content = plainText(data.content);
    const restaurantId = data.restaurantId ?? (data.restaurant
      ? (await prisma.restaurant.create({
          data: {
            name: data.restaurant.name,
            slug: withUniqueSuffix(createSlug(data.restaurant.name)),
            address: data.restaurant.address,
            area: data.restaurant.area,
            city: data.restaurant.city,
            priceRange: data.restaurant.priceRange ?? "MODERATE",
            categoryId: data.restaurant.categoryId ?? data.categoryId,
            coverImage: data.restaurant.coverImage ?? data.imageUrls?.[0],
            createdById: authorId,
            images: data.restaurant.imageUrls?.length
              ? { create: data.restaurant.imageUrls.map((url, index) => ({ url, position: index, alt: data.restaurant?.name })) }
              : undefined
          }
        })).id
      : undefined);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt ?? content.slice(0, 220),
        content,
        rating: data.rating,
        readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 220))} min read`,
        published: data.published ?? true,
        authorId,
        restaurantId,
        categoryId: data.categoryId,
        images: data.imageUrls?.length
          ? { create: data.imageUrls.map((url, index) => ({ url, position: index, alt: data.title })) }
          : undefined
      },
      include: postInclude
    });
    await connectTags(post.id, data.tags);
    await recalcRestaurantRating(restaurantId);
    return this.get(post.id);
  },

  async update(id: string, user: Express.UserPayload, data: Partial<PostCreateInput>) {
    const existing = await prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    if (existing.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new AppError("You cannot update this post", 403, "FORBIDDEN");
    }
    const updateData: Record<string, unknown> = {
      title: data.title,
      excerpt: data.excerpt,
      rating: data.rating,
      restaurantId: data.restaurantId,
      categoryId: data.categoryId,
      published: data.published
    };
    if (data.content) {
      updateData.content = plainText(data.content);
      updateData.readTime = `${Math.max(1, Math.ceil(plainText(data.content).split(/\s+/).length / 220))} min read`;
    }
    if (data.title) updateData.slug = await uniquePostSlug(data.title, id);

    await prisma.post.update({ where: { id }, data: updateData });
    if (data.imageUrls) {
      await prisma.postImage.deleteMany({ where: { postId: id } });
      await prisma.postImage.createMany({ data: data.imageUrls.map((url, index) => ({ postId: id, url, position: index, alt: data.title ?? existing.title })) });
    }
    if (data.tags) await connectTags(id, data.tags);
    await recalcRestaurantRating(existing.restaurantId);
    return this.get(id);
  },

  async remove(id: string, user: Express.UserPayload) {
    const post = await prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    if (post.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new AppError("You cannot delete this post", 403, "FORBIDDEN");
    }
    await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    await recalcRestaurantRating(post.restaurantId);
  }
};
