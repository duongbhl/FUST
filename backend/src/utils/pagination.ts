import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function getPagination(query: unknown) {
  const parsed = paginationSchema.parse(query);
  return {
    ...parsed,
    skip: (parsed.page - 1) * parsed.limit,
    take: parsed.limit
  };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
