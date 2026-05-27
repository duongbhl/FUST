// app/(main)/blog/create/page.tsx
"use client";

import { ImagePlus, Upload, MapPin, Heading, FolderPen, UtensilsCrossed, Undo, Redo, Quote, Link, ListOrdered, List, Italic, Bold, Image } from "lucide-react";
import Header from "../../_components/_common/Header";
import Container from "../../_components/_common/Cointainer";
import { useLanguage } from "@/app/context/LanguageContext";

export default function CreateBlogPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-20">
      <Header />

      <Container className="py-8 md:py-10">
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
              {t("createBlog.title")}
            </h1>

            <p className="mt-3 text-base text-gray-500 md:text-lg">
              {t("createBlog.subtitle")}
            </p>
          </div>

          <button className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 text-lg font-medium text-white transition hover:bg-emerald-600 cursor-pointer">
            <Upload size={20} />
            {t("createBlog.publishButton")}
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
          {/* LEFT */}
          <div className="space-y-8">
            {/* TITLE */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <label className="text-xl font-semibold text-gray-700">
                {t("createBlog.blogTitle")}
              </label>
              <div className="mt-4 flex items-center gap-3">
                <UtensilsCrossed className="text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder={t("createBlog.blogTitlePlaceholder")}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-gray-400 md:text-2xl text-black"
                />
              </div>

            </div>

            {/* ADDRESS */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
              <label className="text-xl font-semibold text-gray-700">
                {t("createBlog.address")}
              </label>
              <div className="mt-4 flex items-center gap-3">
                <MapPin className="text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder={t("createBlog.addressPlaceholder")}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-gray-400 md:text-2xl text-black"
                />
              </div>

            </div>


            {/* EDITOR */}
            <div className="overflow-hidden rounded-[28px] bg-white shadow-md border border-gray-200">
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 md:px-6">
                {/* Text style */}
                <button className="toolbar-btn">
                  <Bold size={18} />
                </button>

                <button className="toolbar-btn">
                  <Italic size={18} />
                </button>

                <button className="toolbar-btn">
                  <List size={18} />
                </button>

                <button className="toolbar-btn">
                  <ListOrdered size={18} />
                </button>

                <div className="divider" />

                {/* Insert */}
                <button className="toolbar-btn">
                  <Link size={18} />
                </button>

                <button className="toolbar-btn">
                  <Image size={18} />
                </button>

                <button className="toolbar-btn">
                  <Quote size={18} />
                </button>

                <div className="divider" />

                {/* Actions */}
                <button className="toolbar-btn">
                  <Undo size={18} />
                </button>
    
                <button className="toolbar-btn">
                  <Redo size={18} />
                </button>
              </div>

              {/* TEXTAREA */}
              <textarea
                placeholder={t("createBlog.contentPlaceholder")}
                className="min-h-[400px] w-full resize-none p-6 text-lg outline-none placeholder:text-gray-400 md:min-h-[520px] md:p-10 md:text-xl text-gray-800"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-[28px] bg-white p-5 shadow-sm md:p-6 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t("createBlog.image")}
              </h2>

              <span className="font-medium text-orange-500">{t("createBlog.required")}</span>
            </div>

            {/* UPLOAD */}
            <div className="mt-6 flex h-[420px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-emerald-200 bg-[#F5F7FF] px-6 text-center md:h-[680px]">
              <ImagePlus
                size={64}
                className="text-emerald-500 md:size-[72px]"
              />

              <p className="mt-6 text-lg font-semibold text-gray-800 md:text-xl">
                {t("createBlog.clickToUpload")}
              </p>

              <p className="mt-2 text-sm text-gray-500 md:text-base">
                {t("createBlog.file type")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}