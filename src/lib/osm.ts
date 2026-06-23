/**
 * OpenStreetMap (Nominatim) helpers for the business-location form.
 *
 * - searchOsm(query): forward geocode a free-text query (shop name / address)
 * - reverseOsm(lat, lon): reverse geocode coordinates from "Get Current Location"
 *
 * Nominatim is free and CORS-enabled. Usage policy asks for <= 1 req/sec, so
 * callers should debounce. No API key required.
 */

import { INDIAN_STATES } from "./constants";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export interface OsmAddressFill {
  street?: string;
  area?: string;
  taluk?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
}

export interface OsmPlace {
  /** Full human-readable label, shown in the suggestions dropdown. */
  displayName: string;
  /** Address/coords to auto-fill when the user picks this place. */
  fill: OsmAddressFill;
}

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  city_district?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  district?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResult {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
}

/** Map a free-text state name to the exact value used in the State dropdown. */
function matchIndianState(name?: string): string | undefined {
  if (!name) return undefined;
  const found = INDIAN_STATES.find((s) => s.toLowerCase() === name.toLowerCase());
  return found ?? name;
}

function firstOf(...vals: (string | undefined)[]): string | undefined {
  return vals.find((v) => typeof v === "string" && v.trim().length > 0);
}

function toFill(lat: string | undefined, lon: string | undefined, a: NominatimAddress): OsmAddressFill {
  const district = firstOf(a.state_district, a.district, a.county);
  let taluk = firstOf(a.county, a.municipality, a.city_district);
  // Avoid taluk duplicating the district value.
  if (taluk && district && taluk.toLowerCase() === district.toLowerCase()) taluk = undefined;
  return {
    street: firstOf(a.road, a.pedestrian, a.neighbourhood),
    area: firstOf(a.suburb, a.neighbourhood, a.village, a.town, a.city, a.hamlet),
    taluk,
    district,
    state: matchIndianState(a.state),
    pincode: a.postcode,
    latitude: lat,
    longitude: lon,
  };
}

export async function searchOsm(query: string, signal?: AbortSignal): Promise<OsmPlace[]> {
  const url =
    `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in` +
    `&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`OpenStreetMap search failed (${res.status})`);
  const data = (await res.json()) as NominatimResult[];
  return data.map((r) => ({
    displayName: r.display_name ?? "Unnamed place",
    fill: toFill(r.lat, r.lon, r.address ?? {}),
  }));
}

export async function reverseOsm(lat: number, lon: number): Promise<OsmAddressFill> {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`);
  const data = (await res.json()) as NominatimResult;
  return toFill(String(lat), String(lon), data.address ?? {});
}
