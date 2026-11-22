"use client";

import { cn } from "@/lib/utils";

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

export function StatusFilterPills<T extends string>({
  options,
  value,
  counts,
  onChange,
}: {
  options: ReadonlyArray<FilterOption<T>>;
  value: T;
  counts: Record<T, number>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((f) => {
        const active = value === f.value;
        const count = counts[f.value];
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-foreground bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-border-strong"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-mono text-xs tabular-nums",
                active
                  ? "bg-[#a1ffcb] text-[#232323]"
                  : "bg-surface text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
