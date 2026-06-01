"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import { useAuth } from "@/app/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await register(name, email, password);
      router.push("/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <Header />
      <Container className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Register</h1>
          <p className="mt-2 text-gray-500">Create a FreshBite account.</p>
          {error ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
          <label className="mt-6 block text-sm font-medium text-gray-700">Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <label className="mt-4 block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <button disabled={submitting} className="mt-6 h-12 w-full rounded-2xl bg-emerald-600 font-medium text-white disabled:opacity-60">
            {submitting ? "Creating..." : "Register"}
          </button>
          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="font-medium text-emerald-600">Login</Link>
          </p>
        </form>
      </Container>
    </main>
  );
}
