import Image from "next/image";
import type { PostDto } from "@/app/(services)/api";
import { defaultPostImage } from "@/types/blog";

interface Props {
  post: PostDto;
}

export default function BlogHero({ post }: Props) {
  const image = post.images?.[0]?.url ?? post.restaurant?.coverImage ?? defaultPostImage;
  const tags = post.tags?.map((item) => item.tag?.name).filter((tag): tag is string => Boolean(tag)) ?? [];

  return (
    <section className="relative h-[320px] overflow-hidden rounded-[32px] md:h-[480px]">
      <Image src={image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1024px" priority />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute bottom-8 left-8 z-10 space-y-4 text-white md:bottom-12 md:left-12">
        <div className="flex flex-wrap items-center gap-3">
          {(tags.length ? tags : [post.category?.name ?? post.restaurant?.category?.name ?? "Food Review"]).slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium odd:bg-orange-500">{tag}</span>
          ))}
        </div>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{post.title}</h1>
        <div className="flex items-center gap-5 text-sm md:text-base">
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {post.restaurant?.name ? <span>{post.restaurant.name}</span> : null}
        </div>
      </div>
    </section>
  );
}
