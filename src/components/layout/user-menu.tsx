"use client";

import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  function handleLogout() {
    setOpen(false);
    logout();
    router.replace("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 text-sm transition-colors hover:bg-muted"
      >
        <Avatar name={user.name} />
        <span className="hidden max-w-[10rem] truncate text-left font-medium sm:block">
          {user.name}
        </span>
        <ChevronDown
          className="hidden size-4 text-muted-foreground sm:block"
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-md"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tRoles(user.role)}
            </p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <UserIcon
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
            {tNav("profile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            {tCommon("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
