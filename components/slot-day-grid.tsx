import { formatSlotDate } from "@/lib/utils";
import type { ServiceSlot } from "@/lib/schemas";

export function SlotDayCard({
  date,
  slots,
  columnsClass = "grid-cols-3 gap-2 sm:grid-cols-4",
  renderSlot,
}: {
  date: string;
  slots: ServiceSlot[];
  columnsClass?: string;
  renderSlot: (slot: ServiceSlot) => React.ReactNode;
}) {
  const availableCount = slots.filter((s) => s.available).length;
  return (
    <div className="rounded-[16px] border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {formatSlotDate(date)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {availableCount > 0 ? `${availableCount} free` : "fully booked"}
        </p>
      </div>
      <div className={`grid ${columnsClass}`}>{slots.map(renderSlot)}</div>
    </div>
  );
}
