import { cn } from "@/lib/utils";

export function FormField({
  label,
  children,
  required,
  className,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
