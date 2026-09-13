import type { Booking } from "@/lib/schemas";
import { generateId } from "@/lib/utils";

/**
 * In-memory store for bookings created via the QR/booking flow.
 * In production this would be a DB. We seed it with a few demo
 * bookings so the admin Bookings page has something to show.
 */
type StoredBooking = Booking & {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled";
  createdAt: string;
  updatedAt: string;
};

function isoDaysAgo(d: number, hour = 12, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const _store: StoredBooking[] = [
  {
    id: generateId("book"),
    serviceId: "haircut-classic",
    customerName: "John Doe",
    customerPhone: "+380 67 123 4567",
    customerEmail: "john@example.com",
    date: new Date().toISOString().slice(0, 10),
    time: "14:00",
    notes: "First visit, prefers short sides",
    locale: "uk",
    status: "confirmed",
    createdAt: isoDaysAgo(0, 9, 12),
    updatedAt: isoDaysAgo(0, 9, 12),
  },
  {
    id: generateId("book"),
    serviceId: "massage-60",
    customerName: "Jane Smith",
    customerPhone: "+380 95 234 5678",
    date: new Date().toISOString().slice(0, 10),
    time: "16:30",
    locale: "uk",
    status: "pending",
    createdAt: isoDaysAgo(0, 10, 5),
    updatedAt: isoDaysAgo(0, 10, 5),
  },
  {
    id: generateId("book"),
    serviceId: "facial-classic",
    customerName: "Maria Petrenko",
    customerPhone: "+380 73 345 6789",
    customerEmail: "maria.p@example.com",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: "11:00",
    locale: "uk",
    status: "confirmed",
    createdAt: isoDaysAgo(1, 15, 0),
    updatedAt: isoDaysAgo(1, 15, 0),
  },
  {
    id: generateId("book"),
    serviceId: "kids-haircut",
    customerName: "Olga Ivanenko",
    customerPhone: "+380 50 456 7890",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: "13:30",
    notes: "Two kids (ages 5 and 8)",
    locale: "uk",
    status: "confirmed",
    createdAt: isoDaysAgo(2, 11, 20),
    updatedAt: isoDaysAgo(2, 11, 20),
  },
  {
    id: generateId("book"),
    serviceId: "beard-trim",
    customerName: "Serhii Kovalenko",
    customerPhone: "+380 67 567 8901",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: "18:00",
    locale: "uk",
    status: "completed",
    createdAt: isoDaysAgo(3, 10, 0),
    updatedAt: isoDaysAgo(1, 19, 0),
  },
  {
    id: generateId("book"),
    serviceId: "consultation",
    customerName: "Andrii Bondar",
    customerPhone: "+380 95 678 9012",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: "10:00",
    locale: "uk",
    status: "pending",
    createdAt: isoDaysAgo(0, 11, 30),
    updatedAt: isoDaysAgo(0, 11, 30),
  },
];

export const BOOKINGS_STORE: StoredBooking[] = _store;
export type { StoredBooking };