"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  CheckCircle2,
  Server,
  ScrollText,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standards", label: "Standards", icon: Shield },
  { href: "/review/new", label: "New Review", icon: FilePlus },
  { href: "/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/provisioning", label: "Provisioning", icon: Server },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <nav className="flex flex-1 flex-col gap-0.5 p-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href === "/review/new" && pathname.startsWith("/review")) ||
            (href !== "/dashboard" && href !== "/review/new" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-slate-700" : "text-slate-500"
                )}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
