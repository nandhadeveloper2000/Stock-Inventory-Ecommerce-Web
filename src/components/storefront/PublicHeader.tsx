"use client";

import Link from "next/link";
import { Heart, LogIn, Search, ShoppingCart, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { routes } from "@/lib/routes";
import { getRoleHome } from "@/lib/roles";
import { APP_NAME } from "@/lib/constants";

/**
 * Header for the PUBLIC storefront (the `/` landing page).
 *
 * Unlike CustomerHeader, this renders with or without a logged-in session and
 * never assumes a customer role — so it is safe to show on the public homepage.
 */
export function PublicHeader() {
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-3 lg:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline text-sm font-semibold leading-tight">{APP_NAME}</span>
        </Link>

        {/* Search */}
        <form action={routes.customer.products} className="relative ml-2 hidden flex-1 max-w-xl md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search products, brands and shops…"
            className="h-9 w-full pl-9"
          />
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="icon" variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href={routes.customer.wishlist} aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button size="icon" variant="ghost" asChild className="relative">
            <Link href={routes.customer.cart} aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]"
                >
                  {count}
                </Badge>
              )}
            </Link>
          </Button>

          {user ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link href={getRoleHome(user.role)}>My Account</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="gap-1.5">
              <Link href={routes.auth.login}>
                <LogIn className="h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
