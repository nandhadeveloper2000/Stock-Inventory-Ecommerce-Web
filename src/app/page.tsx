"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgePercent,
  MapPin,
  Receipt,
  Search,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/storefront/PublicHeader";
import { PublicFooter } from "@/components/storefront/PublicFooter";
import { ProductGrid } from "@/components/ecommerce/ProductGrid";
import { categoriesService } from "@/services/catalog.service";
import { shopProductsService } from "@/services/shopProducts.service";
import { shopsService } from "@/services/shops.service";
import { routes } from "@/lib/routes";
import { APP_NAME } from "@/lib/constants";

/**
 * PUBLIC customer-facing homepage — served at `/`
 * (production: https://ggshopindia.com/).
 *
 * No authentication required. Data is fetched best-effort and the page always
 * renders a complete storefront even when the API is unreachable, so the
 * welcome experience never breaks.
 */

const FALLBACK_CATEGORIES = [
  "Mobiles & Accessories",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Grocery",
  "Beauty & Health",
  "Automotive",
  "Sports & Outdoors",
  "Toys & Baby",
  "Books & Stationery",
];

const TRUST_BADGES = [
  { icon: MapPin, title: "Nearby Shopping", desc: "Buy from shops around you" },
  { icon: ShieldCheck, title: "Trusted Shops", desc: "Verified local retailers" },
  { icon: Receipt, title: "Easy Billing", desc: "Instant invoices & GST bills" },
];

const OFFERS = [
  {
    title: "Mega Festive Sale",
    subtitle: "Up to 60% off across categories",
    cta: "Shop deals",
    className: "from-rose-500 to-orange-500",
  },
  {
    title: "Free Local Delivery",
    subtitle: "On orders above ₹499 from nearby shops",
    cta: "Order now",
    className: "from-indigo-500 to-sky-500",
  },
];

export default function PublicHomePage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["public", "categories"],
    queryFn: categoriesService.list,
    retry: false,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["public", "shop-products"],
    queryFn: () => shopProductsService.list(),
    retry: false,
  });

  const { data: shops = [] } = useQuery({
    queryKey: ["public", "shops"],
    queryFn: shopsService.list,
    retry: false,
  });

  const categoryNames =
    categories.length > 0 ? categories.map((c) => c.name) : FALLBACK_CATEGORIES;

  const nearbyShops = shops.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* ── Welcome / Hero ─────────────────────────────────────────── */}
        <section className="border-b bg-gradient-to-br from-primary via-primary to-primary-hover text-primary-foreground">
          <div className="container grid gap-8 py-12 lg:grid-cols-2 lg:py-16">
            <div className="space-y-5">
              <Badge className="bg-white/20 text-primary-foreground hover:bg-white/20">
                Welcome
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome to {APP_NAME}
              </h1>
              <p className="text-base font-medium text-primary-foreground/90 lg:text-lg">
                Nearby Shopping • Trusted Shops • Easy Billing
              </p>
              <p className="max-w-md text-sm text-primary-foreground/80">
                Shop genuine products from verified local shops near you, track every
                order, and get instant easy bills — all in one place.
              </p>

              {/* Hero search */}
              <form action={routes.customer.products} className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search for products, brands or shops…"
                  className="h-11 bg-white pl-9 text-foreground"
                />
                <Button type="submit" className="absolute right-1 top-1 h-9">
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href={routes.customer.products}>
                    Start Shopping <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Link href={routes.auth.sellerLogin}>
                    <Store className="mr-1 h-4 w-4" /> Sell on {APP_NAME}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-3 self-center sm:grid-cols-3 lg:grid-cols-1">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b.title}
                  className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-primary-foreground/80">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container space-y-12 py-10 lg:py-12">
          {/* ── Categories ───────────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Shop by Category"
              href={routes.customer.products}
              linkLabel="View all"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {categoryNames.slice(0, 10).map((name) => (
                <Link key={name} href={routes.customer.products}>
                  <Card className="h-full cursor-pointer overflow-hidden transition hover:border-primary hover:shadow-sm">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Store className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium leading-tight">{name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Offers / Banners ─────────────────────────────────────── */}
          <section className="grid gap-4 md:grid-cols-2">
            {OFFERS.map((o) => (
              <div
                key={o.title}
                className={`flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r ${o.className} p-6 text-white`}
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-white/80">
                    <BadgePercent className="h-3.5 w-3.5" /> Offer
                  </div>
                  <h3 className="text-lg font-semibold">{o.title}</h3>
                  <p className="text-sm text-white/85">{o.subtitle}</p>
                </div>
                <Button asChild variant="secondary" size="sm" className="shrink-0">
                  <Link href={routes.customer.products}>{o.cta}</Link>
                </Button>
              </div>
            ))}
          </section>

          {/* ── Nearby Shops ─────────────────────────────────────────── */}
          <section>
            <SectionHeading title="Nearby Shops" />
            {nearbyShops.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyShops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Store className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {shop.name ?? "Local Shop"}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {shop.address?.area ?? shop.address?.district ?? "Near you"}
                        </p>
                        {shop.deliveryAvailable && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
                            <Truck className="h-3 w-3" /> Delivery available
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Discovering shops near you</p>
                  <p className="text-xs text-muted-foreground">
                    Trusted local shops will appear here based on your location.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* ── Featured Products ────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Featured Products"
              href={routes.customer.products}
              linkLabel="View all"
            />
            <ProductGrid products={products.slice(0, 10)} />
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
      {href && linkLabel && (
        <Button variant="link" asChild className="text-primary">
          <Link href={href}>
            {linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
