import { prisma } from "../config/prisma";
import { restaurantInclude, restaurantRepository } from "../repositories/restaurant.repository";
import { AppError } from "../utils/appError";
import { getPagination, paginated } from "../utils/pagination";
import { createSlug, withUniqueSuffix } from "../utils/slug";
import type { PriceRange } from "../types/domain";

export interface RestaurantFilters {
  q?: string;
  area?: string;
  city?: string;
  categoryId?: string;
  priceRange?: PriceRange;
  minRating?: number;
}

export interface RestaurantInput {
  name: string;
  description?: string;
  address: string;
  area?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  priceRange?: PriceRange;
  coverImage?: string;
  categoryId?: string;
  imageUrls?: string[];
}

function whereFromFilters(filters: RestaurantFilters) {
  return {
    deletedAt: null,
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { address: { contains: filters.q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(filters.area ? { area: { contains: filters.area, mode: "insensitive" } } : {}),
    ...(filters.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.priceRange ? { priceRange: filters.priceRange } : {}),
    ...(filters.minRating ? { ratingAvg: { gte: filters.minRating } } : {})
  };
}

async function uniqueSlug(name: string, existingId?: string) {
  const base = createSlug(name);
  const existing = await prisma.restaurant.findFirst({ where: { slug: base, ...(existingId ? { id: { not: existingId } } : {}) } });
  return existing ? withUniqueSuffix(base) : base;
}

async function replaceImages(restaurantId: string, imageUrls?: string[]) {
  if (!imageUrls) return;
  await prisma.restaurantImage.deleteMany({ where: { restaurantId } });
  if (imageUrls.length) {
    await prisma.restaurantImage.createMany({ data: imageUrls.map((url, index) => ({ restaurantId, url, position: index })) });
  }
}

function restaurantData(data: Partial<RestaurantInput>) {
  const { imageUrls: _imageUrls, ...rest } = data;
  return rest;
}

export const restaurantService = {
  async list(query: RestaurantFilters & Record<string, unknown>) {
    const { page, limit, skip, take, sortBy, sortOrder } = getPagination(query);
    const where = whereFromFilters(query);
    const safeSort = ["createdAt", "ratingAvg", "ratingCount", "name"].includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const [items, total] = await prisma.$transaction([
      restaurantRepository.findMany({ where, include: restaurantInclude, orderBy: { [safeSort]: sortOrder }, skip, take }),
      restaurantRepository.count(where)
    ]);
    return paginated(items, total, page, limit);
  },

  async get(id: string) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) throw new AppError("Restaurant not found", 404, "RESTAURANT_NOT_FOUND");
    return restaurant;
  },

  async create(data: RestaurantInput, userId: string) {
    const slug = await uniqueSlug(data.name);
    const restaurant = await prisma.restaurant.create({
      data: {
        ...restaurantData(data),
        slug,
        createdById: userId,
        coverImage: data.coverImage ?? data.imageUrls?.[0],
        images: data.imageUrls?.length ? { create: data.imageUrls.map((url, index) => ({ url, position: index, alt: data.name })) } : undefined
      },
      include: restaurantInclude
    });
    return restaurant;
  },

  async update(id: string, data: Partial<RestaurantInput>) {
    await this.get(id);
    const updateData: Record<string, unknown> = restaurantData(data);
    if (typeof data.name === "string") updateData.slug = await uniqueSlug(data.name, id);
    if (data.imageUrls?.length && !data.coverImage) updateData.coverImage = data.imageUrls[0];
    await prisma.restaurant.update({ where: { id }, data: updateData });
    await replaceImages(id, data.imageUrls);
    return this.get(id);
  },

  async remove(id: string) {
    await this.get(id);
    return prisma.restaurant.update({ where: { id }, data: { deletedAt: new Date() } });
  }
};
