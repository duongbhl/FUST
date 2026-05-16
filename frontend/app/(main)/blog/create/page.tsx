// app/(main)/blog/create/page.tsx
import { ImagePlus, Upload, MapPin } from "lucide-react";
import Header from "../../_components/_common/Header";
import Container from "../../_components/_common/Cointainer";

export default function CreateBlogPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-20">
      <Header />

      <Container className="py-8 md:py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
              New Blog Post
            </h1>

            <p className="mt-3 text-base text-gray-500 md:text-lg">
              Share your culinary expertise with the FreshBite community.
            </p>
          </div>

          <button className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 text-lg font-medium text-white transition hover:bg-emerald-600">
            <Upload size={20} />
            Publish Blog
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
          {/* LEFT */}
          <div className="space-y-8">
            {/* TITLE */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <label className="text-lg font-semibold text-gray-700">
                Blog Title
              </label>

              <input
                type="text"
                placeholder="Enter a catchy title for your recipe or review..."
                className="mt-4 w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-gray-400 md:text-3xl"
              />
            </div>

            {/* ADDRESS */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <label className="text-lg font-semibold text-gray-700">
                Địa chỉ quán (Restaurant Address)
              </label>

              <div className="mt-4 flex items-center gap-3">
                <MapPin className="text-gray-400" size={24} />

                <input
                  type="text"
                  placeholder="Nhập địa chỉ để hiển thị trên bản đồ..."
                  className="w-full bg-transparent text-lg outline-none placeholder:text-gray-400 md:text-2xl"
                />
              </div>
            </div>

            {/* EDITOR */}
            <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center gap-5 border-b border-gray-100 bg-[#F4F6FF] px-5 py-4 md:px-6">
                <button className="text-lg font-bold">B</button>

                <button className="text-lg italic">I</button>

                <button className="text-lg">•</button>

                <button className="text-lg">1.</button>

                <div className="h-6 w-px bg-gray-300" />

                <button className="text-lg">🔗</button>

                <button className="text-lg">🖼️</button>

                <button className="text-lg">❝</button>

                <div className="h-6 w-px bg-gray-300" />

                <button className="text-lg">↶</button>

                <button className="text-lg">↷</button>
              </div>

              {/* TEXTAREA */}
              <textarea
                placeholder="Start writing your delicious story here..."
                className="min-h-[400px] w-full resize-none p-6 text-base outline-none placeholder:text-gray-400 md:min-h-[520px] md:p-10 md:text-lg"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-[28px] bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Cover Image
              </h2>

              <span className="font-medium text-orange-500">Required</span>
            </div>

            {/* UPLOAD */}
            <div className="mt-6 flex h-[420px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-emerald-200 bg-[#F5F7FF] px-6 text-center md:h-[680px]">
              <ImagePlus
                size={64}
                className="text-emerald-500 md:size-[72px]"
              />

              <p className="mt-6 text-lg font-semibold text-gray-800 md:text-xl">
                Click to upload or drag & drop
              </p>

              <p className="mt-2 text-sm text-gray-500 md:text-base">
                PNG, JPG or WEBP (Max. 5MB)
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}