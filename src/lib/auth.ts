import { COOKIE_KEYS, STORAGE_KEYS } from "./constants";
import type { AuthUser } from "@/types/auth.types";

/**
 * Mirror the access token + role into cookies so that middleware.ts can read
 * the session at the edge (it has no access to localStorage). These cookies are
 * NOT httpOnly — they are a client convenience for routing only; the API must
 * still authenticate every request via the Authorization header.
 */
export function setAuthCookies(accessToken: string, role?: string) {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  const base = `; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
  document.cookie = `${COOKIE_KEYS.accessToken}=${encodeURIComponent(accessToken)}${base}`;
  if (role) document.cookie = `${COOKIE_KEYS.role}=${encodeURIComponent(role)}${base}`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  const expire = "; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = `${COOKIE_KEYS.accessToken}=${expire}`;
  document.cookie = `${COOKIE_KEYS.role}=${expire}`;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function setSession(user: AuthUser, accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  setAuthCookies(accessToken, String(user.role));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.shopId);
  clearAuthCookies();
}
