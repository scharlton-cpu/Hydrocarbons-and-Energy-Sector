import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-surface-2 text-muted border border-border",
        accent: "bg-accent-soft text-accent-strong border border-accent/30",
        positive: "bg-positive-soft text-positive border border-positive/30",
        negative: "bg-negative-soft text-negative border border-negative/30",
        warning: "bg-warning-soft text-warning border border-warning/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
