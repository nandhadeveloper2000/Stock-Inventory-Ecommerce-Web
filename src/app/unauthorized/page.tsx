"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { getRoleHome } from "@/lib/roles";
import { getLoginPortalFor } from "@/lib/portals";
import { APP_NAME } from "@/lib/constants";

/**
 * 403 Access Denied — shown when a signed-in user tries to open a route their
 * role is not allowed to access. Reachable from middleware redirects and as a
 * direct fallback. Offers a way back to where the user *is* allowed to go.
 */
export default function UnauthorizedPage() {
  const user = useAuthStore((s) => s.user);

  const primaryHref = user ? getRoleHome(user.role) : "/login";
  const primaryLabel = user ? "Go to my dashboard" : "Go to login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">403 — Access Denied</p>
            <h1 className="text-xl font-semibold">You don&apos;t have access to this page</h1>
            <p className="text-sm text-muted-foreground">
              {user
                ? "Your account role isn't permitted to view this section."
                : "Please sign in with an account that has access."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <Button asChild className="sm:flex-1">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="sm:flex-1">
              <Link href="/">Back to {APP_NAME}</Link>
            </Button>
          </div>

          {user && (
            <Link
              href={getLoginPortalFor(user.role)}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Sign in as a different user
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
