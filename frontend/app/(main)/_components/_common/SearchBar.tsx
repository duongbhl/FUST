"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function SearchBar() {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-12 w-[220px] items-center gap-3 rounded-full border border-gray-200 bg-[#F5F7FF] px-5 lg:w-[320px] xl:w-[420px]">
      <Search size={18} className="text-black" />

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        type="text"
        placeholder={t("header.searchPlaceholder")}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
      />
    </form>
  );
}
