import slugify from "slugify";

export function createSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true, locale: "vi" });
}

export function withUniqueSuffix(slug: string) {
  return `${slug}-${Date.now().toString(36)}`;
}
