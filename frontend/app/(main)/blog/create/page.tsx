"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload, MapPin, UtensilsCrossed, Undo, Redo, Quote, Link as LinkIcon, ListOrdered, List, Italic, Bold, Image as ImageIcon, Star } from "lucide-react";
import Header from "../../_components/_common/Header";
import Container from "../../_components/_common/Cointainer";
import { useLanguage } from "@/app/context/LanguageContext";
import { postsApi, uploadsApi } from "@/app/(services)/api";
import { useAuth } from "@/app/context/AuthContext";

export default function CreateBlogPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login?next=/blog/create");
  }, [isAuthenticated, loading, router]);

  const fileNames = useMemo(() => files.map((file) => file.name).join(", "), [files]);

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !restaurantName.trim() || !address.trim() || !content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề, nhà hàng, địa chỉ và nội dung.");
      return;
    }

    try {
      setSubmitting(true);
      const uploaded = files.length ? await uploadsApi.images(files, "posts") : [];
      const imageUrls = uploaded.map((image) => image.url);
      const post = await postsApi.create({
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().slice(0, 220),
        rating,
        restaurant: {
          name: restaurantName.trim(),
          address: address.trim(),
          area: area.trim() || undefined,
          city: "Hanoi",
          priceRange: "MODERATE",
          coverImage: imageUrls[0]
        },
        imageUrls,
        tags: [area.trim(), "Food Review"].filter(Boolean)
      });
      router.push(`/blog/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-20">
      <Header />

      <Container className="py-8 md:py-10">
        <form onSubmit={handlePublish}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">{t("createBlog.title")}</h1>

              <p className="mt-3 text-base text-gray-500 md:text-lg">{t("createBlog.subtitle")}</p>
            </div>

            <button disabled={submitting} className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 text-lg font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              <Upload size={20} />
              {submitting ? "Publishing..." : t("createBlog.publishButton")}
            </button>
          </div>

          {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{error}</div> : null}

          <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
            <div className="space-y-8">
              <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                <label className="text-xl font-semibold text-gray-700">{t("createBlog.blogTitle")}</label>
                <div className="mt-4 flex items-center gap-3">
                  <UtensilsCrossed className="text-gray-400" size={24} />
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    type="text"
                    placeholder={t("createBlog.blogTitlePlaceholder")}
                    className="w-full bg-transparent text-lg text-black outline-none placeholder:text-gray-400 md:text-2xl"
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                  <label className="text-xl font-semibold text-gray-700">Restaurant</label>
                  <div className="mt-4 flex items-center gap-3">
                    <UtensilsCrossed className="text-gray-400" size={24} />
                    <input
                      value={restaurantName}
                      onChange={(event) => setRestaurantName(event.target.value)}
                      type="text"
                      placeholder="Restaurant name"
                      className="w-full bg-transparent text-lg text-black outline-none placeholder:text-gray-400 md:text-2xl"
                    />
                  </div>
                </div>

                <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                  <label className="text-xl font-semibold text-gray-700">Rating</label>
                  <div className="mt-4 flex items-center gap-3 text-orange-500">
                    <Star size={24} fill="currentColor" />
                    <input
                      value={rating}
                      onChange={(event) => setRating(Number(event.target.value))}
                      type="number"
                      min={1}
                      max={5}
                      className="w-full bg-transparent text-lg text-black outline-none placeholder:text-gray-400 md:text-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                <label className="text-xl font-semibold text-gray-700">{t("createBlog.address")}</label>
                <div className="mt-4 flex items-center gap-3">
                  <MapPin className="text-gray-400" size={24} />
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    type="text"
                    placeholder={t("createBlog.addressPlaceholder")}
                    className="w-full bg-transparent text-lg text-black outline-none placeholder:text-gray-400 md:text-2xl"
                  />
                </div>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  type="text"
                  placeholder="Area / district, e.g. Hoan Kiem"
                  className="mt-5 w-full border-t border-gray-100 bg-transparent pt-5 text-lg text-black outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-md">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 md:px-6">
                  <button type="button" className="toolbar-btn"><Bold size={18} /></button>
                  <button type="button" className="toolbar-btn"><Italic size={18} /></button>
                  <button type="button" className="toolbar-btn"><List size={18} /></button>
                  <button type="button" className="toolbar-btn"><ListOrdered size={18} /></button>
                  <div className="divider" />
                  <button type="button" className="toolbar-btn"><LinkIcon size={18} /></button>
                  <button type="button" className="toolbar-btn"><ImageIcon size={18} /></button>
                  <button type="button" className="toolbar-btn"><Quote size={18} /></button>
                  <div className="divider" />
                  <button type="button" className="toolbar-btn"><Undo size={18} /></button>
                  <button type="button" className="toolbar-btn"><Redo size={18} /></button>
                </div>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={t("createBlog.contentPlaceholder")}
                  className="min-h-[400px] w-full resize-none p-6 text-lg text-gray-800 outline-none placeholder:text-gray-400 md:min-h-[520px] md:p-10 md:text-xl"
                />
              </div>
            </div>

            <label className="cursor-pointer rounded-[28px] bg-white p-5 shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">{t("createBlog.image")}</h2>
                <span className="font-medium text-orange-500">{t("createBlog.required")}</span>
              </div>

              <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />

              <div className="mt-6 flex h-[420px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-emerald-200 bg-[#F5F7FF] px-6 text-center md:h-[680px]">
                <ImagePlus size={64} className="text-emerald-500 md:size-[72px]" />

                <p className="mt-6 text-lg font-semibold text-gray-800 md:text-xl">{files.length ? `${files.length} image(s) selected` : t("createBlog.clickToUpload")}</p>

                <p className="mt-2 text-sm text-gray-500 md:text-base">{fileNames || "PNG, JPG, WEBP up to backend limit"}</p>
              </div>
            </label>
          </div>
        </form>
      </Container>
    </main>
  );
}
