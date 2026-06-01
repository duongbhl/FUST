"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, tokenStorage, userApi, type AuthResponse, type UserDto } from "@/app/(services)/api";

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((data: AuthResponse) => {
    tokenStorage.set(data);
    setUser(data.user);
  }, []);

  const reloadMe = useCallback(async () => {
    const me = await userApi.me();
    setUser(me);
  }, []);

  useEffect(() => {
    let alive = true;
    async function boot() {
      try {
        if (!tokenStorage.getAccessToken() && tokenStorage.getRefreshToken()) {
          const data = await authApi.refresh();
          if (alive) persistAuth(data);
        }
        if (tokenStorage.getAccessToken()) {
          const me = await userApi.me();
          if (alive) setUser(me);
        }
      } catch {
        tokenStorage.clear();
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void boot();
    return () => {
      alive = false;
    };
  }, [persistAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const data = await authApi.login({ email, password });
        persistAuth(data);
      },
      register: async (name, email, password) => {
        const data = await authApi.register({ name, email, password });
        persistAuth(data);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
      reloadMe
    }),
    [loading, persistAuth, reloadMe, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
