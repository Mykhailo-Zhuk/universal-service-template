import { z } from "zod";

// Common allergen codes used across menu items.
// Keep the list short and human-friendly; restaurants can extend it.
export const ALLERGEN_CODES = [
  "gluten",
  "dairy",
  "egg",
  "fish",
  "shellfish",
  "soy",
  "peanut",
  "tree-nut",
  "sesame",
  "mustard",
  "celery",
  "sulphite",
] as const;

export const AllergenSchema = z.enum(ALLERGEN_CODES);

// Variation: optional size / portion / option for a menu item (e.g. Small / Medium / Large).
export const ItemVariationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  priceDelta: z.number().int(), // delta vs base price, may be negative or zero
});

export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  category: z.string().min(1),
  image: z.string().optional(),
  available: z.boolean().default(true),
  allergens: z.array(AllergenSchema).optional(),
  weight: z.string().optional(),
  // New (G-256) — detailed fields for the item detail page.
  ingredients: z.array(z.string().min(1).max(60)).optional(),
  calories: z.number().int().nonnegative().optional(),
  variations: z.array(ItemVariationSchema).optional(),
});

export const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  description: z.string().optional(),
  icon: z.string().optional(),
  // G-258 — sorting helper for the admin categories CRUD.
  sortOrder: z.number().int().nonnegative().optional(),
});

export const RestaurantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  logo: z.string().optional(),
  address: z.string().min(1),
  phone: z.string().min(1),
  currency: z.string().default("UAH"),
  categories: z.array(MenuCategorySchema),
  items: z.array(MenuItemSchema),
});

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  duration: z.number().int().positive(), // minutes
  price: z.number().nonnegative(),
  provider: z.string().min(1),
  available: z.boolean().default(true),
  // New (G-256) — optional detailed fields.
  category: z.string().min(1).optional(),
  masterName: z.string().min(1).max(120).optional(),
  image: z.string().optional(),
});

// Path-param schema used by /api/menu/[restaurantId]/item/[itemId]
export const MenuItemParamsSchema = z.object({
  restaurantId: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/i, "Invalid restaurantId"),
  itemId: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/i, "Invalid itemId"),
});

// Path-param schema used by /api/book/[serviceId]/slot/[slotId]
export const ServiceSlotParamsSchema = z.object({
  serviceId: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/i, "Invalid serviceId"),
  slotId: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/i, "Invalid slotId"),
});

// One available slot for a service (used by /api/book/[serviceId]/slot/[slotId])
export const ServiceSlotSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  available: z.boolean().default(true),
});

export const BookingSchema = z.object({
  serviceId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Invalid phone number"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  notes: z.string().max(500).optional(),
  locale: z.enum(["uk", "en", "ru"]).default("uk"),
});

export const PaymentCreateSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("UAH"),
  description: z.string().min(1).max(200),
  orderId: z.string().min(1),
  provider: z.enum(["liqpay", "monopay"]).default("liqpay"),
  customerEmail: z.string().email().optional(),
});

export const PaymentCallbackSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["success", "failure", "pending"]),
  amount: z.number().positive(),
  provider: z.enum(["liqpay", "monopay"]),
  transactionId: z.string().optional(),
});

export const BotWebhookSchema = z.object({
  update_id: z.number().int().optional(),
  message: z
    .object({
      chat: z.object({ id: z.number() }),
      from: z.object({ id: z.number(), first_name: z.string().optional() }).optional(),
      text: z.string().optional(),
    })
    .optional(),
});

// =====================================================================
// G-258 — Admin Panel + Orders Dashboard schemas
// =====================================================================

// Order lifecycle: created → preparing → ready → served → paid (or cancelled at any point).
export const ORDER_STATUSES = [
  "new",
  "preparing",
  "ready",
  "served",
  "paid",
  "cancelled",
] as const;
export const OrderStatusSchema = z.enum(ORDER_STATUSES);

export const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const PAYMENT_METHODS = ["cash", "card", "online", "liqpay", "monopay"] as const;
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);

// A single line inside an order. Snapshots the item's name and unit price so
// historical orders stay meaningful even if the menu later changes.
export const OrderItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1).max(120),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  notes: z.string().max(200).optional(),
  // Optional variation chosen by the customer (e.g. "XL portion").
  variationId: z.string().optional(),
  variationName: z.string().optional(),
  variationPriceDelta: z.number().int().optional(),
});

export const OrderSchema = z.object({
  id: z.string().min(1),
  restaurantId: z.string().min(1),
  tableId: z.string().min(1),
  tableLabel: z.string().min(1).optional(),
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(8).max(20),
  items: z.array(OrderItemSchema).min(1),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema.optional(),
  total: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(),
  // Optional links to other entities.
  bookingId: z.string().optional(),
});

// Payload for creating a new order (QR-menu flow).
export const OrderCreateSchema = z.object({
  restaurantId: z.string().min(1).max(80),
  tableId: z.string().min(1).max(40),
  customerName: z.string().min(2).max(120),
  customerPhone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Invalid phone number"),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1),
        quantity: z.number().int().positive(),
        variationId: z.string().optional(),
        notes: z.string().max(200).optional(),
      })
    )
    .min(1),
  notes: z.string().max(500).optional(),
});

// Payload for PATCH /api/orders/[id] — all fields optional, at least one required.
export const OrderUpdateSchema = z
  .object({
    status: OrderStatusSchema.optional(),
    paymentStatus: PaymentStatusSchema.optional(),
    paymentMethod: PaymentMethodSchema.optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.paymentStatus !== undefined ||
      data.paymentMethod !== undefined ||
      data.notes !== undefined,
    { message: "At least one field must be provided" }
  );

// Table schema — a physical table in the venue that customers can order from.
export const TableSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(40), // e.g. "Table #5"
  seats: z.number().int().positive().default(2),
  zone: z.string().optional(), // e.g. "Main hall", "Terrace"
  active: z.boolean().default(true),
});

// Admin CRUD schemas — slightly looser than the public Zod schemas because
// the admin is trusted and creates the IDs server-side.
export const AdminMenuItemCreateSchema = MenuItemSchema.omit({ id: true }).extend({
  id: z.string().optional(),
});

export const AdminMenuItemUpdateSchema = AdminMenuItemCreateSchema.partial();

export const AdminCategoryCreateSchema = MenuCategorySchema.omit({ id: true }).extend({
  id: z.string().optional(),
});

export const AdminCategoryUpdateSchema = AdminCategoryCreateSchema.partial();

// Admin settings payload (kept lightweight — this is a demo template).
export const SettingsSchema = z.object({
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal("")),
  hours: z.string().min(1).max(200), // human-readable
  currency: z.string().min(1).max(8).default("UAH"),
  // Sensitive — never returned to the client in plain text. The route
  // returns `***masked***` so the UI knows a value is set.
  telegramBotToken: z.string().optional(),
  liqpayPublicKey: z.string().optional(),
  liqpayPrivateKey: z.string().optional(),
  monopayPublicKey: z.string().optional(),
  monopayPrivateKey: z.string().optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategory = z.infer<typeof MenuCategorySchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ItemVariation = z.infer<typeof ItemVariationSchema>;
export type ServiceSlot = z.infer<typeof ServiceSlotSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentCallback = z.infer<typeof PaymentCallbackSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Table = z.infer<typeof TableSchema>;
export type Settings = z.infer<typeof SettingsSchema>;