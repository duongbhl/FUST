"use client";

import Link from "next/link";
import { Bell, CircleUserRound, LogOut, Map, Globe } from "lucide-react";
import SearchBar from "./SearchBar";
import { useLanguage } from "@/app/context/LanguageContext";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center gap-8">
          <Link href="/blog" className="text-3xl font-bold text-emerald-600">
            {t("header.brand")}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/blog" className="border-b-2 border-emerald-600 pb-1 font-medium text-gray-900">
              {t("header.blog")}
            </Link>
            <Link href="/map" className="font-medium text-gray-500 hover:text-gray-900">
              Map
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>

          <Link href="/map" className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white" aria-label="Open map">
            <Map size={20} />
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="hidden text-gray-700 lg:flex" aria-label="Notifications">
                <Bell />
              </Link>
              <Link href="/profile" className="hidden items-center gap-2 text-gray-700 lg:flex">
                <CircleUserRound />
                <span className="max-w-28 truncate text-sm font-medium">{user?.name}</span>
              </Link>
              <button onClick={() => void logout()} className="hidden text-gray-700 lg:flex" aria-label="Logout">
                <LogOut />
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white lg:block">
              Login
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
              title={t("language.switch")}
            >
              <Globe size={20} />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setLanguage("en");
                    setShowLanguageMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm font-medium transition ${
                    language === "en" ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {t("language.en")}
                </button>
                <button
                  onClick={() => {
                    setLanguage("vi");
                    setShowLanguageMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm font-medium transition ${
                    language === "vi" ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {t("language.vi")}
                </button>
                <button
                  onClick={() => {
                    setLanguage("ja");
                    setShowLanguageMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm font-medium transition ${
                    language === "ja" ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {t("language.ja")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
