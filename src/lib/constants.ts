export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "GG Shop India";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export const STORAGE_KEYS = {
  accessToken: "si_access_token",
  refreshToken: "si_refresh_token",
  user: "si_user",
  shopId: "si_shop_id",
} as const;

/**
 * Cookie names mirrored from the session so that `middleware.ts` (which cannot
 * read localStorage) can perform server/edge-side route protection. Kept in
 * sync by setSession()/clearSession() in src/lib/auth.ts.
 */
export const COOKIE_KEYS = {
  accessToken: "si_access_token",
  role: "si_role",
} as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
