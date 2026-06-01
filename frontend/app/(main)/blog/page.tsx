"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import BlogCard from "../_components/_blog/BlogCard";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { postsApi } from "@/app/(services)/api";
import { postToBlog } from "@/types/blog";

export default function BlogPage() {
  const { t } = useLanguage();
  const [area, setArea] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const params = useMemo(
    () => ({
      limit: 12,
      sortBy,
      sortOrder: "desc",
      area: area || undefined,
      minRating: minRating ? Number(minRating) : undefined
    }),
    [area, minRating, sortBy]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", params],
    queryFn: () => postsApi.list(params)
  });

  const cards = useMemo(() => (data?.items ?? []).map(postToBlog), [data]);

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-24">
      <Header />

      <Container className="pt-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">{t("blog.title")}</h1>
          <p className="text-lg text-gray-500">{t("blog.subtitle")}</p>
        </div>

        <div className="mt-8 grid gap-4 rounded-[28px] bg-white p-5 shadow-sm md:grid-cols-3">
          <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Filter by area" className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <select value={minRating} onChange={(event) => setMinRating(event.target.value)} className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500">
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500">
            <option value="createdAt">Newest</option>
            <option value="rating">Top rated</option>
            <option value="likeCount">Most liked</option>
            <option value="viewCount">Most viewed</option>
          </select>
        </div>

        {error ? <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error instanceof Error ? error.message : "Cannot load posts"}</div> : null}
        {isLoading ? <p className="mt-10 text-gray-500">Loading reviews...</p> : null}

        {!isLoading && !cards.length ? (
          <div className="mt-10 rounded-[28px] bg-white p-8 text-center text-gray-500 shadow-sm">No reviews found. Create the first review from the + button.</div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {cards.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
        </div>
      </Container>

      <Link href="/blog/create" className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl" aria-label="Create review">
        <Plus size={30} />
      </Link>
    </main>
  );
}
