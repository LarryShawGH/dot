import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        draft: "bg-slate-100 text-slate-700 border border-slate-200",
        review: "bg-amber-100 text-amber-800 border border-amber-200",
        approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        success: "bg-emerald-100 text-emerald-800",
        failure: "bg-red-100 text-red-800",
        warning: "bg-amber-100 text-amber-800",
        provisioning: "bg-violet-100 text-violet-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
