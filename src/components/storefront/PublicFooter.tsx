"use client";

import Link from "next/link";
import { MapPin, ShieldCheck, Store } from "lucide-react";
import { routes } from "@/lib/routes";
import { APP_NAME } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: routes.customer.products },
      { label: "Categories", href: routes.customer.products },
      { label: "Wishlist", href: routes.customer.wishlist },
      { label: "Cart", href: routes.customer.cart },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Customer Login", href: routes.auth.login },
      { label: "My Orders", href: routes.customer.orders },
      { label: "My Profile", href: routes.customer.profile },
    ],
  },
  {
    title: "For Business",
    links: [
      { label: "Seller Login", href: routes.auth.sellerLogin },
      { label: "Master Admin", href: routes.auth.masterLogin },
    ],
  },
];

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Nearby Shopping • Trusted Shops • Easy Billing
          </p>
          <div className="flex flex-col gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Discover shops near you
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified, trusted retailers
            </span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t py-4">
        <p className="container text-center text-xs text-muted-foreground">
          © {year} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
