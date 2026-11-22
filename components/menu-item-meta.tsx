import type { MenuItem } from "@/lib/schemas";

export function MenuItemMeta({
  item,
  className = "mt-3",
}: {
  item: Pick<MenuItem, "weight" | "calories" | "allergens">;
  className?: string;
}) {
  return (
    <div
      className={`${className} flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground`}
    >
      {item.weight && <span>{item.weight}</span>}
      {item.weight && item.calories !== undefined && (
        <span aria-hidden="true">·</span>
      )}
      {item.calories !== undefined && <span>{item.calories} kcal</span>}
      {item.allergens && item.allergens.length > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-sans">
            Allergens: {item.allergens.join(", ")}
          </span>
        </>
      )}
    </div>
  );
}
