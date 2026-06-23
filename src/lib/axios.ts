import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "./constants";
import { getLoginPortalFor } from "./portals";
import type { AuthUser } from "@/types/auth.types";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      // Public pages (the storefront home, login portals, the 403 page) must not
      // be force-redirected on a 401 — anonymous visitors hit authed endpoints
      // best-effort and should just see fallback content, not get bounced.
      const isPublic =
        path === "/" ||
        path === "/unauthorized" ||
        path === "/login" ||
        path === "/master" ||
        path === "/seller" ||
        path.startsWith("/auth");

      if (!isPublic) {
        let portal = "/login";
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.user);
          if (raw) {
            const u = JSON.parse(raw) as AuthUser;
            portal = getLoginPortalFor(u.role);
          }
        } catch {
          // ignore
        }
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.user);
        window.location.href = portal;
      }
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.request<T>(config);
  return res.data;
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
