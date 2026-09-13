import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "UAH"): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "uk-UA"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

/**
 * Human-readable allergen labels.
 * Falls back to the raw code (title-cased) for unknown allergens.
 */
export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: "Gluten",
  dairy: "Dairy",
  egg: "Egg",
  fish: "Fish",
  shellfish: "Shellfish",
  soy: "Soy",
  peanut: "Peanut",
  "tree-nut": "Tree nuts",
  sesame: "Sesame",
  mustard: "Mustard",
  celery: "Celery",
  sulphite: "Sulphites",
};

export function formatAllergen(code: string): string {
  return ALLERGEN_LABELS[code] ?? code.charAt(0).toUpperCase() + code.slice(1);
}

/** Format a slot label like "Mon, Sep 15". */
export function formatSlotDate(dateStr: string, locale: string = "uk-UA"): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Format a calorie value with kcal unit. */
export function formatCalories(kcal: number): string {
  return `${kcal} kcal`;
}
