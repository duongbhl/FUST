import type { PostDto } from "@/app/(services)/api";

export interface Blog {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  avatar: string;
  category: string;
  readTime: string;
  rating?: number;
  likeCount?: number;
  commentCount?: number;
}

export const defaultPostImage = "/images/Hanoi-Restaurants.webp";
export const defaultAvatarImage = "/images/avatar.webp";

export function postToBlog(post: PostDto): Blog {
  return {
    id: post.id,
    title: post.title,
    description: post.excerpt ?? post.content.replace(/<[^>]+>/g, "").slice(0, 180),
    image: post.images?.[0]?.url ?? post.restaurant?.coverImage ?? defaultPostImage,
    author: post.author?.name ?? "FreshBite User",
    avatar: post.author?.avatarUrl ?? defaultAvatarImage,
    category: post.category?.name ?? post.restaurant?.category?.name ?? "Food Review",
    readTime: post.readTime ?? "3 min read",
    rating: post.rating,
    likeCount: post.likeCount,
    commentCount: post.commentCount
  };
}
