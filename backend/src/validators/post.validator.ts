import { z } from "zod";

const restaurantInlineSchema = z.object({
  name: z.string().min(2).max(160),
  address: z.string().min(2).max(255),
  area: z.string().optional(),
  city: z.string().optional(),
  priceRange: z.enum(["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"]).optional(),
  categoryId: z.string().uuid().optional(),
  coverImage: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional()
});

const postBodySchema = z.object({
  title: z.string().min(4).max(220),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5),
  restaurantId: z.string().uuid().optional(),
  restaurant: restaurantInlineSchema.optional(),
  categoryId: z.string().uuid().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  published: z.boolean().optional()
});

export const postListSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    q: z.string().optional(),
    area: z.string().optional(),
    restaurantId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    tag: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

export const postIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const createPostSchema = z.object({ body: postBodySchema });
export const updatePostSchema = z.object({ params: z.object({ id: z.string().uuid() }), body: postBodySchema.partial() });
