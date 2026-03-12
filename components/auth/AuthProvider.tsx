"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const HEALTH_URL = API_URL.replace(/\/api$/, "/health");

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("accessToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = await authApi.getProfile();
        setUser(user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  // Keep backend warm — ping /health every 4 minutes to prevent Railway cold starts
  useEffect(() => {
    const ping = () => fetch(HEALTH_URL, { method: "GET" }).catch(() => {});
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
