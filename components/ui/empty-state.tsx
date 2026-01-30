import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  guidance: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  guidance,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-6 text-center",
        className
      )}
    >
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{guidance}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
