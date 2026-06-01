"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import { notificationsApi } from "@/app/(services)/api";
import { useAuth } from "@/app/context/AuthContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login?next=/notifications");
  }, [isAuthenticated, loading, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ limit: 30 }),
    enabled: isAuthenticated
  });

  const items = data?.items ?? [];

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <Header />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {isLoading ? <p className="mt-6 text-gray-500">Loading notifications...</p> : null}
          {error ? <p className="mt-6 text-red-600">{error instanceof Error ? error.message : "Cannot load notifications"}</p> : null}
          <div className="mt-6 space-y-4">
            {items.length ? items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-[#F7F8FC] p-5">
                <h2 className="font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-1 text-gray-600">{item.message}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            )) : !isLoading ? <p className="text-gray-500">No notifications yet.</p> : null}
          </div>
        </div>
      </Container>
    </main>
  );
}
