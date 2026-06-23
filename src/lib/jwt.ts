/**
 * Edge- and browser-safe JWT decoding helpers.
 *
 * These DECODE the token payload only — they do NOT verify the signature
 * (a public client can never safely hold the signing secret). Signature
 * verification is the backend's job; on the client we only read claims such
 * as the user's role for routing/UX decisions. Never trust these values for
 * actual authorization of data — the API must always re-check on its side.
 */

export type JwtPayload = Record<string, unknown>;

function decodeBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const padded = b64 + pad;

  // `atob` exists in both the browser and the Edge runtime (middleware).
  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  // Node.js fallback (e.g. during static build / SSR).
  return Buffer.from(padded, "base64").toString("utf-8");
}

/** Decode a JWT's payload without verifying its signature. Returns null on any error. */
export function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Safely extract a normalized role string from a JWT.
 *
 * Tolerant of common claim shapes: `role`, `userRole`, `roles[]`,
 * `authorities[]`, `scope`. Strips a leading `ROLE_` and upper-cases the
 * result so it matches the `UserRole` constants used across the app.
 */
export function getRoleFromToken(token?: string | null): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const pick = (v: unknown): string | undefined => {
    if (typeof v === "string") return v;
    if (Array.isArray(v) && v.length > 0) return String(v[0]);
    return undefined;
  };

  const raw =
    pick(payload.role) ??
    pick(payload.userRole) ??
    pick(payload.roles) ??
    pick(payload.authorities) ??
    pick(payload.scope);

  if (!raw) return null;
  return raw.replace(/^ROLE_/i, "").toUpperCase();
}
