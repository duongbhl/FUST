
import { blogs } from "@/data/blogs";
import { Plus } from "lucide-react";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import BlogCard from "../_components/_blog/BlogCard";
import Link from "next/link";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-24">
      <Header />

      <Container className="pt-12">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Community Stories
          </h1>

          <p className="text-lg text-gray-500">
            Real experiences from local foodies and culinary explorers.
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