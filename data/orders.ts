import type { Order, Table } from "@/lib/schemas";

/**
 * Ten tables for the demo venue. In a real deployment this would come
 * from a DB keyed by restaurant. Here we hard-code a single set.
 */
export const DEMO_TABLES: Table[] = [
  { id: "1", label: "Table #1", seats: 2, zone: "Main hall", active: true },
  { id: "2", label: "Table #2", seats: 4, zone: "Main hall", active: true },
  { id: "3", label: "Table #3", seats: 2, zone: "Window", active: true },
  { id: "4", label: "Table #4", seats: 6, zone: "Window", active: true },
  { id: "5", label: "Table #5", seats: 4, zone: "Main hall", active: true },
  { id: "6", label: "Table #6", seats: 2, zone: "Bar", active: true },
  { id: "7", label: "Table #7", seats: 4, zone: "Bar", active: true },
  { id: "8", label: "Table #8", seats: 8, zone: "Patio", active: true },
  { id: "9", label: "Table #9", seats: 4, zone: "Patio", active: true },
  { id: "10", label: "VIP Lounge", seats: 10, zone: "VIP", active: true },
];

/**
 * Generate a stable ISO timestamp relative to "now" so that the dashboard
 * always shows fresh-looking data without needing to mutate the source
 * file on every reload.
 */
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}
function daysAgo(d: number, hour = 13, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const DEMO_ORDERS: Order[] = [
  // ── Today ────────────────────────────────────────────────────────
  {
    id: "ord_today_1",
    restaurantId: "demo-restaurant",
    tableId: "5",
    tableLabel: "Table #5",
    customerName: "John Doe",
    customerPhone: "+380 67 123 4567",
    items: [
      {
        itemId: "i11",
        name: "Margherita",
        price: 280,
        quantity: 2,
        variationId: "i11-30",
        variationName: "30 cm",
        variationPriceDelta: 80,
      },
      { itemId: "i20", name: "Fresh Lemonade", price: 120, quantity: 2 },
    ],
    status: "new",
    paymentStatus: "pending",
    paymentMethod: "cash",
    total: 760,
    createdAt: hoursAgo(0.2),
    updatedAt: hoursAgo(0.2),
    notes: "No onions please",
  },
  {
    id: "ord_today_2",
    restaurantId: "demo-restaurant",
    tableId: "3",
    tableLabel: "Table #3",
    customerName: "Maria Petrenko",
    customerPhone: "+380 95 234 5678",
    items: [
      {
        itemId: "i8",
        name: "Ribeye Steak 350g",
        price: 890,
        quantity: 1,
        variationId: "i8-medium",
        variationName: "Medium",
      },
      { itemId: "i19", name: "Sparkling Water 0.5L", price: 70, quantity: 1 },
    ],
    status: "preparing",
    paymentStatus: "pending",
    paymentMethod: "card",
    total: 960,
    createdAt: hoursAgo(0.8),
    updatedAt: hoursAgo(0.5),
  },
  {
    id: "ord_today_3",
    restaurantId: "demo-restaurant",
    tableId: "8",
    tableLabel: "Table #8",
    customerName: "Oleksandr Kovalenko",
    customerPhone: "+380 50 345 6789",
    items: [
      { itemId: "i5", name: "Duck Breast with Cherry Sauce", price: 580, quantity: 2 },
      { itemId: "i15", name: "Tiramisu", price: 220, quantity: 2 },
      { itemId: "i22", name: "Negroni", price: 220, quantity: 2 },
    ],
    status: "ready",
    paymentStatus: "pending",
    paymentMethod: "card",
    total: 2040,
    createdAt: hoursAgo(1.2),
    updatedAt: hoursAgo(0.4),
  },
  {
    id: "ord_today_4",
    restaurantId: "demo-restaurant",
    tableId: "10",
    tableLabel: "VIP Lounge",
    customerName: "Anna Shevchenko",
    customerPhone: "+380 73 456 7890",
    items: [
      { itemId: "i4", name: "Risotto with Porcini", price: 420, quantity: 4 },
      { itemId: "i6", name: "Atlantic Salmon", price: 620, quantity: 2 },
      { itemId: "i23", name: "Espresso Martini", price: 240, quantity: 4 },
    ],
    status: "served",
    paymentStatus: "pending",
    paymentMethod: "online",
    total: 3680,
    createdAt: hoursAgo(2.5),
    updatedAt: hoursAgo(0.7),
  },
  {
    id: "ord_today_5",
    restaurantId: "demo-restaurant",
    tableId: "2",
    tableLabel: "Table #2",
    customerName: "Dmytro Bondar",
    customerPhone: "+380 67 567 8901",
    items: [
      { itemId: "i12", name: "Diavola", price: 340, quantity: 1 },
      { itemId: "i13", name: "Quattro Formaggi", price: 380, quantity: 1 },
      { itemId: "i18", name: "Still Water 0.5L", price: 60, quantity: 2 },
    ],
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    total: 840,
    createdAt: hoursAgo(3.5),
    updatedAt: hoursAgo(2.8),
  },

  // ── Yesterday ────────────────────────────────────────────────────
  {
    id: "ord_y_1",
    restaurantId: "demo-restaurant",
    tableId: "4",
    tableLabel: "Table #4",
    customerName: "Yulia Lysenko",
    customerPhone: "+380 95 678 9012",
    items: [
      { itemId: "i9", name: "BBQ Pork Ribs", price: 520, quantity: 1 },
      { itemId: "i24", name: "Aperol Spritz", price: 200, quantity: 2 },
    ],
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "card",
    total: 920,
    createdAt: daysAgo(1, 19, 30),
    updatedAt: daysAgo(1, 21, 0),
  },
  {
    id: "ord_y_2",
    restaurantId: "demo-restaurant",
    tableId: "7",
    tableLabel: "Table #7",
    customerName: "Andrii Melnyk",
    customerPhone: "+380 50 789 0123",
    items: [
      { itemId: "i1", name: "Burrata with Tomatoes", price: 320, quantity: 1 },
      { itemId: "i14", name: "Prosciutto e Rucola", price: 390, quantity: 1 },
      { itemId: "i17", name: "Panna Cotta", price: 190, quantity: 2 },
    ],
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "online",
    total: 1090,
    createdAt: daysAgo(1, 14, 15),
    updatedAt: daysAgo(1, 15, 30),
  },

  // ── Earlier this week (for chart) ────────────────────────────────
  {
    id: "ord_d2",
    restaurantId: "demo-restaurant",
    tableId: "6",
    tableLabel: "Table #6",
    customerName: "Kateryna Hryhorenko",
    customerPhone: "+380 73 890 1234",
    items: [
      { itemId: "i3", name: "Shrimp Ceviche", price: 290, quantity: 1 },
      { itemId: "i21", name: "Espresso", price: 80, quantity: 2 },
    ],
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "cash",
    total: 450,
    createdAt: daysAgo(2, 12, 45),
    updatedAt: daysAgo(2, 13, 30),
  },
  {
    id: "ord_d5",
    restaurantId: "demo-restaurant",
    tableId: "9",
    tableLabel: "Table #9",
    customerName: "Serhii Tkachenko",
    customerPhone: "+380 67 901 2345",
    items: [
      { itemId: "i10", name: "Lamb Chops", price: 760, quantity: 2 },
      { itemId: "i16", name: "Chocolate Lava Cake", price: 240, quantity: 2 },
    ],
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    total: 2000,
    createdAt: daysAgo(5, 20, 10),
    updatedAt: daysAgo(5, 20, 30),
    notes: "Customer cancelled — kitchen closed",
  },
  {
    id: "ord_d6",
    restaurantId: "demo-restaurant",
    tableId: "1",
    tableLabel: "Table #1",
    customerName: "Iryna Savchenko",
    customerPhone: "+380 95 012 3456",
    items: [
      { itemId: "i2", name: "Beef Tartare", price: 380, quantity: 1 },
      { itemId: "i22", name: "Negroni", price: 220, quantity: 2 },
    ],
    status: "paid",
    paymentStatus: "paid",
    paymentMethod: "liqpay",
    total: 820,
    createdAt: daysAgo(6, 19, 0),
    updatedAt: daysAgo(6, 20, 30),
  },
];