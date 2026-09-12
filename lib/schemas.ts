import { z } from "zod";

export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  category: z.string().min(1),
  image: z.string().optional(),
  available: z.boolean().default(true),
  allergens: z.array(z.string()).optional(),
  weight: z.string().optional(),
});

export const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  description: z.string().optional(),
  icon: z.string().optional(),
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

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategory = z.infer<typeof MenuCategorySchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentCallback = z.infer<typeof PaymentCallbackSchema>;
