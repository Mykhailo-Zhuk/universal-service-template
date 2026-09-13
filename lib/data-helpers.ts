import type { MenuItem, Service, ServiceSlot } from "@/lib/schemas";
import { DEMO_RESTAURANT, DEMO_SERVICES } from "@/data/demo";

/**
 * Generate a deterministic-but-realistic set of available slots for a
 * service for the upcoming 7 days. Times are 09:00-19:00 in 60 min steps.
 *
 * Slots are pseudo-random (no two services share the same pattern) but
 * the result is stable per (serviceId, date) so the UI doesn't flicker.
 */
export function generateSlotsForService(
  serviceId: string,
  daysAhead: number = 7
): ServiceSlot[] {
  const slots: ServiceSlot[] = [];
  const HOURS = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Simple deterministic hash → seed for "this slot is taken" decisions.
  let seed = 0;
  for (let i = 0; i < serviceId.length; i++) {
    seed = (seed * 31 + serviceId.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 8) / 0xffffff;
  };

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);

    for (const time of HOURS) {
      // ~30% of slots already booked
      const taken = rand() < 0.3;
      slots.push({
        id: `slot-${serviceId}-${dateStr}-${time.replace(":", "")}`,
        serviceId,
        date: dateStr,
        time,
        available: !taken,
      });
    }
  }
  return slots;
}

export function getSlotsByDate(slots: ServiceSlot[]): Record<string, ServiceSlot[]> {
  const grouped: Record<string, ServiceSlot[]> = {};
  for (const s of slots) {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  }
  return grouped;
}

/**
 * Return up to `limit` related menu items — same category as `item`,
 * excluding itself. Falls back to any available items if not enough
 * same-category items exist.
 */
export function getRelatedItems(item: MenuItem, limit: number = 4): MenuItem[] {
  const sameCategory = DEMO_RESTAURANT.items.filter(
    (i) => i.category === item.category && i.id !== item.id
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = DEMO_RESTAURANT.items.filter(
    (i) => i.id !== item.id && !sameCategory.includes(i)
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Return up to `limit` related services — same category as `service`,
 * excluding itself. Falls back to other available services otherwise.
 */
export function getRelatedServices(service: Service, limit: number = 3): Service[] {
  if (service.category) {
    const sameCategory = DEMO_SERVICES.filter(
      (s) => s.category === service.category && s.id !== service.id
    );
    if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
    const others = DEMO_SERVICES.filter(
      (s) => s.id !== service.id && !sameCategory.includes(s)
    );
    return [...sameCategory, ...others].slice(0, limit);
  }
  return DEMO_SERVICES.filter((s) => s.id !== service.id).slice(0, limit);
}
