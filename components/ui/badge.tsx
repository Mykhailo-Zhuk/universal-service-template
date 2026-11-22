import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "mint";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-surface text-foreground",
    outline: "border-border-strong bg-transparent text-foreground",
    mint: "border-transparent bg-[#a1ffcb] text-[#232323]",
    success:
      "border-transparent bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300",
    warning:
      "border-transparent bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
