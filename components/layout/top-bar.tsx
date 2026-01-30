"use client";

import { useState } from "react";
import { ChevronDown, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole, ROLES, type Role } from "@/context/role-context";
import { clearDemoLocalStorage } from "@/lib/demo-reset";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { role, setRole } = useRole();
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset all demo data? This clears local storage and server data. The page will reload.")
    ) {
      return;
    }
    setResetting(true);
    try {
      await fetch("/api/admin/reset", { method: "POST" });
      clearDemoLocalStorage();
      window.location.href = "/dashboard";
    } catch {
      clearDemoLocalStorage();
      window.location.href = "/dashboard";
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-lg font-semibold tracking-tight text-slate-800">
          Architecture Review Automation
        </h1>
        <div className="flex items-center gap-2">
          {role === "Admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              disabled={resetting}
              className="border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetting ? "Resetting…" : "Reset Demo Data"}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[8rem] justify-between gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  {role}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
              {ROLES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => setRole(r as Role)}
                  className={cn(
                    "cursor-pointer",
                    r === role && "bg-slate-100 font-medium"
                  )}
                >
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
