
"use client";

import { blogs } from "@/data/blogs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import Header from "./_components/_common/Header";
import Container from "./_components/_common/Cointainer";
import BlogCard from "./_components/_blog/BlogCard";

export default function BlogPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-24">
      <Header />

      <Container className="pt-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            {t("blog.title")}
          </h1>

          <p className="text-lg text-gray-500">
            {t("blog.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </Container>

      <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl">
        <Link href="/blog/create">
          <Plus size={30} />
        </Link>
      </button>
    </main>
  );
}