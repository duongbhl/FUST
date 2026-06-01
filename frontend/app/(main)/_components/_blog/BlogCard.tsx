import Image from "next/image";
import Link from "next/link";
import { Heart, MessageSquare, Star } from "lucide-react";
import { Blog } from "@/types/blog";

interface Props {
  blog: Blog;
}

export default function BlogCard({ blog }: Props) {
  return (
    <Link
      href={`/blog/${blog.id}`}
      className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1"
    >
      <div className="relative h-[240px] w-full overflow-hidden">
        <Image src={blog.image} alt={blog.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
            {blog.category}
          </span>
          {blog.rating ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-500">
              <Star size={16} fill="currentColor" /> {blog.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-2xl font-semibold text-gray-900">{blog.title}</h3>

        <p className="line-clamp-3 text-gray-500">{blog.description}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image src={blog.avatar} alt={blog.author} fill className="object-cover" sizes="40px" />
            </div>

            <div>
              <span className="block font-medium text-gray-800">{blog.author}</span>
              <span className="text-xs text-gray-400">{blog.readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Heart size={16} />{blog.likeCount ?? 0}</span>
            <span className="flex items-center gap-1"><MessageSquare size={16} />{blog.commentCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
