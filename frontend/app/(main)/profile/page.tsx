"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import { useAuth } from "@/app/context/AuthContext";
import { defaultAvatarImage } from "@/types/blog";
import { userApi } from "@/app/(services)/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, reloadMe } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login?next=/profile");
  }, [isAuthenticated, loading, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await userApi.updateMe({
      name: String(formData.get("name") ?? ""),
      bio: String(formData.get("bio") ?? "")
    });
    await reloadMe();
    setMessage("Profile updated.");
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await userApi.uploadAvatar(file);
    await reloadMe();
    setMessage("Avatar uploaded.");
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <Header />
      <Container className="py-12">
        <form key={user?.id ?? "anonymous"} onSubmit={submit} className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {message ? <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</div> : null}
          <div className="mt-8 flex items-center gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              <Image src={user?.avatarUrl ?? defaultAvatarImage} alt={user?.name ?? "avatar"} fill className="object-cover" sizes="96px" />
            </div>
            <label className="cursor-pointer rounded-2xl bg-gray-900 px-5 py-3 text-sm font-medium text-white">
              Upload avatar
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>
          </div>
          <label className="mt-8 block text-sm font-medium text-gray-700">Name</label>
          <input name="name" defaultValue={user?.name ?? ""} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <label className="mt-4 block text-sm font-medium text-gray-700">Bio</label>
          <textarea name="bio" defaultValue={user?.bio ?? ""} className="mt-2 min-h-32 w-full rounded-2xl border border-gray-200 p-4 text-gray-900 outline-none focus:border-emerald-500" />
          <button className="mt-6 h-12 rounded-2xl bg-emerald-600 px-6 font-medium text-white">Save changes</button>
        </form>
      </Container>
    </main>
  );
}
