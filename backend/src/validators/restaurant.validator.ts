import { z } from "zod";

const priceRange = z.enum(["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"]);
const restaurantBodySchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  address: z.string().min(2).max(255),
  area: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  phone: z.string().max(40).optional(),
  website: z.string().url().optional(),
  priceRange: priceRange.optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional()
});

export const restaurantListSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    q: z.string().optional(),
    area: z.string().optional(),
    city: z.string().optional(),
    categoryId: z.string().uuid().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
    priceRange: priceRange.optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});

export const restaurantIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const createRestaurantSchema = z.object({ body: restaurantBodySchema });
export const updateRestaurantSchema = z.object({ params: z.object({ id: z.string().uuid() }), body: restaurantBodySchema.partial() });
