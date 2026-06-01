"use client";

import { Crosshair, Plus, Minus, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "../_components/_common/Header";
import { useLanguage } from "@/app/context/LanguageContext";
import { restaurantsApi } from "@/app/(services)/api";

export default function MapPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({ queryKey: ["map-restaurants"], queryFn: () => restaurantsApi.list({ limit: 8, sortBy: "ratingAvg", sortOrder: "desc" }) });
  const restaurants = data?.items ?? [];

  return (
    <main className="relative h-screen overflow-hidden bg-[#EEF1FA]">
      <Header />
      <div className="relative h-[calc(100vh-64px)] w-full bg-[radial-gradient(circle_at_30%_30%,#dff7ea,transparent_35%),radial-gradient(circle_at_75%_35%,#ffe7d2,transparent_30%),linear-gradient(135deg,#eef7ff,#f7fff5)]">
        {restaurants.map((restaurant, index) => (
          <div key={restaurant.id} className="absolute" style={{ left: `${20 + (index % 4) * 18}%`, top: `${25 + Math.floor(index / 4) * 25}%` }}>
            <div className="h-5 w-5 rounded-full bg-red-600 shadow-lg" />
            <div className="mt-3 w-72 rounded-3xl bg-white p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">🍴</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500">{restaurant.area ?? restaurant.address}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && !restaurants.length ? <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-3xl bg-white p-8 text-gray-500 shadow-xl">No restaurants available yet.</div> : null}

        <div className="absolute bottom-10 left-10 flex w-[360px] items-center justify-between rounded-[28px] bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">🍴</div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{t("map.vegetarianDestinations")}</h3>
              <p className="text-gray-500">{restaurants.length} {t("map.blogReviewedInHanoi")}</p>
            </div>
          </div>
          <ChevronRight />
        </div>

        <div className="absolute bottom-10 right-10 flex flex-col gap-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg" aria-label="Center map"><Crosshair /></button>
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <button className="flex h-14 w-14 items-center justify-center border-b border-gray-200" aria-label="Zoom in"><Plus /></button>
            <button className="flex h-14 w-14 items-center justify-center" aria-label="Zoom out"><Minus /></button>
          </div>
        </div>
      </div>
    </main>
  );
}
