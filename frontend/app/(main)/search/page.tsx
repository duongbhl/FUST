"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import BlogCard from "../_components/_blog/BlogCard";
import { restaurantsApi, searchApi } from "@/app/(services)/api";
import { postToBlog } from "@/types/blog";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [area, setArea] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [minRating, setMinRating] = useState("");

  const search = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchApi.search({ q, limit: 20 }),
    enabled: Boolean(q)
  });

  const restaurantFilters = useMemo(() => ({
    q: q || undefined,
    area: area || undefined,
    priceRange: priceRange || undefined,
    minRating: minRating ? Number(minRating) : undefined,
    limit: 20,
    sortBy: "ratingAvg"
  }), [area, minRating, priceRange, q]);

  const filteredRestaurants = useQuery({
    queryKey: ["restaurants", restaurantFilters],
    queryFn: () => restaurantsApi.list(restaurantFilters),
    enabled: Boolean(area || priceRange || minRating)
  });

  const cards = useMemo(() => (search.data?.posts ?? []).map(postToBlog), [search.data]);
  const restaurants = filteredRestaurants.data?.items ?? search.data?.restaurants ?? [];

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-20">
      <Header />
      <Container className="py-12">
        <h1 className="text-4xl font-bold text-gray-900">Search: {q || "all"}</h1>
        <div className="mt-8 grid gap-4 rounded-[28px] bg-white p-5 shadow-sm md:grid-cols-3">
          <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500">
            <option value="">Any price</option><option value="CHEAP">Cheap</option><option value="MODERATE">Moderate</option><option value="EXPENSIVE">Expensive</option><option value="LUXURY">Luxury</option>
          </select>
          <select value={minRating} onChange={(event) => setMinRating(event.target.value)} className="h-12 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500">
            <option value="">Any rating</option><option value="3">3+ stars</option><option value="4">4+ stars</option><option value="5">5 stars</option>
          </select>
        </div>

        {search.isLoading ? <p className="mt-8 text-gray-500">Searching...</p> : null}
        {search.error ? <p className="mt-8 text-red-600">{search.error instanceof Error ? search.error.message : "Search failed"}</p> : null}

        <h2 className="mt-10 text-2xl font-semibold text-gray-900">Posts</h2>
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {cards.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
        </div>
        {!search.isLoading && !cards.length ? <p className="mt-5 text-gray-500">No posts found.</p> : null}

        <h2 className="mt-12 text-2xl font-semibold text-gray-900">Restaurants</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="rounded-[24px] bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
              <p className="mt-2 text-gray-500">{restaurant.address}</p>
              <p className="mt-3 text-sm font-medium text-emerald-700">Rating {Number(restaurant.ratingAvg ?? 0).toFixed(1)}</p>
            </div>
          ))}
        </div>
        {!search.isLoading && !restaurants.length ? <p className="mt-5 text-gray-500">No restaurants found.</p> : null}
      </Container>
    </main>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F8FC]" />}><SearchContent /></Suspense>;
}
