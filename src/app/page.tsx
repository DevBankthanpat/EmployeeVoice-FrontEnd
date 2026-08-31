"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FullPageSpinner } from "@/components/layout/full-page-spinner";
import { homePathForRole } from "@/lib/auth";

/**
 * App root. Sends the visitor to their role home when signed in, or to /login
 * otherwise. Renders a spinner while the mock session hydrates.
 */
export default function IndexPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    router.replace(user ? homePathForRole(user.role) : "/login");
  }, [status, user, router]);

  return <FullPageSpinner />;
}
