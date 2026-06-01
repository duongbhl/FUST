"use client";

import Link from "next/link";
import { Suspense } from "react";
import Script from "next/script";
import { FormEvent, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../_components/_common/Header";
import Container from "../_components/_common/Cointainer";
import { useAuth } from "@/app/context/AuthContext";
import { authApi, tokenStorage } from "@/app/(services)/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, reloadMe } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const nextPath = searchParams.get("next") ?? "/blog";

  const renderGoogleButton = useCallback(() => {
    const target = document.getElementById("google-login-button");
    if (!target || !googleClientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) return;
        try {
          const data = await authApi.google(response.credential);
          tokenStorage.set(data);
          await reloadMe();
          router.push(nextPath);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google login failed");
        }
      }
    });
    target.innerHTML = "";
    window.google.accounts.id.renderButton(target, { theme: "outline", size: "large", width: 320 });
  }, [googleClientId, nextPath, reloadMe, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await login(email, password);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {googleClientId ? <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={renderGoogleButton} /> : null}
      <Header />
      <Container className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-gray-500">Sign in to review restaurants and save posts.</p>
          {error ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
          <label className="mt-6 block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
          <button disabled={submitting} className="mt-6 h-12 w-full rounded-2xl bg-emerald-600 font-medium text-white disabled:opacity-60">
            {submitting ? "Logging in..." : "Login"}
          </button>
          {googleClientId ? <div id="google-login-button" className="mt-5 flex justify-center" /> : null}
          <p className="mt-5 text-center text-sm text-gray-500">
            No account? <Link href="/register" className="font-medium text-emerald-600">Register</Link>
          </p>
        </form>
      </Container>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F8FC]" />}><LoginContent /></Suspense>;
}
