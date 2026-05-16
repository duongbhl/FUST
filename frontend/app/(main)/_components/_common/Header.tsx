"use client";

import Link from "next/link";
import { Bell, CircleUserRound, Map } from "lucide-react";
import SearchBar from "./SearchBar";


export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center gap-8">
          <Link href="/blog" className="text-3xl font-bold text-emerald-600">
            FreshBite
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/blog"
              className="border-b-2 border-emerald-600 pb-1 font-medium text-gray-900"
            >
              Blog
            </Link>

            {/* <Link href="/map" className="font-medium text-gray-500">
              Restaurant
            </Link> */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Link href='/map'>
              <Map size={20} />
            </Link>
          </button>
          <button className="hidden lg:flex text-gray-700">
            <CircleUserRound />
          </button>
        </div>
      </div>
    </header>
  );
}