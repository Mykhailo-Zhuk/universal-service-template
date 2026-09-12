import type { Restaurant, Service } from "@/lib/schemas";

export const DEMO_RESTAURANT: Restaurant = {
  id: "demo-restaurant",
  name: "Demo Restaurant",
  description:
    "A modern European cuisine restaurant in the heart of the city. Farm-to-table ingredients, signature cocktails and a warm atmosphere.",
  logo: "/images/demo-logo.svg",
  address: "Khreshchatyk St. 1, Kyiv, Ukraine",
  phone: "+380 44 123 4567",
  currency: "UAH",
  categories: [
    { id: "starters", name: "Starters", icon: "🥗" },
    { id: "mains", name: "Main Courses", icon: "🍝" },
    { id: "grill", name: "Grill & BBQ", icon: "🥩" },
    { id: "pizza", name: "Pizza", icon: "🍕" },
    { id: "desserts", name: "Desserts", icon: "🍰" },
    { id: "drinks", name: "Drinks", icon: "🍷" },
    { id: "cocktails", name: "Cocktails", icon: "🍸" },
  ],
  items: [
    // Starters
    {
      id: "i1",
      name: "Burrata with Tomatoes",
      description:
        "Creamy burrata cheese, heirloom tomatoes, fresh basil, olive oil and aged balsamic.",
      price: 320,
      category: "starters",
      available: true,
      weight: "220 g",
      allergens: ["dairy"],
    },
    {
      id: "i2",
      name: "Beef Tartare",
      description:
        "Hand-cut beef tenderloin, capers, shallots, quail egg yolk, toasted brioche.",
      price: 380,
      category: "starters",
      available: true,
      weight: "180 g",
      allergens: ["gluten", "egg"],
    },
    {
      id: "i3",
      name: "Shrimp Ceviche",
      description:
        "Tiger shrimp, lime, red onion, cilantro, avocado, jalapeño.",
      price: 290,
      category: "starters",
      available: true,
      weight: "200 g",
      allergens: ["shellfish"],
    },
    // Mains
    {
      id: "i4",
      name: "Risotto with Porcini",
      description:
        "Creamy Arborio rice, porcini mushrooms, white wine, parmesan, truffle oil.",
      price: 420,
      category: "mains",
      available: true,
      weight: "320 g",
      allergens: ["dairy"],
    },
    {
      id: "i5",
      name: "Duck Breast with Cherry Sauce",
      description:
        "Pan-seared duck breast, cherry jus, sweet potato purée, seasonal greens.",
      price: 580,
      category: "mains",
      available: true,
      weight: "350 g",
    },
    {
      id: "i6",
      name: "Atlantic Salmon",
      description:
        "Grilled salmon, lemon butter, asparagus, quinoa, micro greens.",
      price: 620,
      category: "mains",
      available: true,
      weight: "300 g",
      allergens: ["fish", "dairy"],
    },
    {
      id: "i7",
      name: "Linguine alle Vongole",
      description:
        "Fresh linguine, clams, garlic, white wine, parsley, olive oil.",
      price: 460,
      category: "mains",
      available: false,
      weight: "320 g",
      allergens: ["shellfish", "gluten"],
    },
    // Grill
    {
      id: "i8",
      name: "Ribeye Steak 350g",
      description:
        "USDA Prime ribeye, grilled to perfection, served with grilled vegetables and choice of sauce.",
      price: 890,
      category: "grill",
      available: true,
      weight: "350 g",
    },
    {
      id: "i9",
      name: "BBQ Pork Ribs",
      description:
        "Slow-cooked pork ribs, house BBQ glaze, coleslaw, cornbread.",
      price: 520,
      category: "grill",
      available: true,
      weight: "400 g",
      allergens: ["gluten"],
    },
    {
      id: "i10",
      name: "Lamb Chops",
      description:
        "New Zealand lamb chops, rosemary jus, roasted potatoes, mint pesto.",
      price: 760,
      category: "grill",
      available: true,
      weight: "320 g",
    },
    // Pizza
    {
      id: "i11",
      name: "Margherita",
      description:
        "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.",
      price: 280,
      category: "pizza",
      available: true,
      weight: "450 g",
      allergens: ["gluten", "dairy"],
    },
    {
      id: "i12",
      name: "Diavola",
      description:
        "Tomato sauce, mozzarella, spicy salami, chili oil, fresh chili.",
      price: 340,
      category: "pizza",
      available: true,
      weight: "480 g",
      allergens: ["gluten", "dairy"],
    },
    {
      id: "i13",
      name: "Quattro Formaggi",
      description:
        "Mozzarella, gorgonzola, parmesan, taleggio, thyme, truffle honey.",
      price: 380,
      category: "pizza",
      available: true,
      weight: "480 g",
      allergens: ["gluten", "dairy"],
    },
    {
      id: "i14",
      name: "Prosciutto e Rucola",
      description:
        "Mozzarella, prosciutto di Parma, arugula, cherry tomatoes, parmesan shavings.",
      price: 390,
      category: "pizza",
      available: true,
      weight: "500 g",
      allergens: ["gluten", "dairy"],
    },
    // Desserts
    {
      id: "i15",
      name: "Tiramisu",
      description:
        "Classic Italian tiramisu with mascarpone, espresso, cocoa and savoiardi.",
      price: 220,
      category: "desserts",
      available: true,
      weight: "180 g",
      allergens: ["dairy", "gluten", "egg"],
    },
    {
      id: "i16",
      name: "Chocolate Lava Cake",
      description:
        "Warm chocolate cake with a molten center, vanilla ice cream, fresh berries.",
      price: 240,
      category: "desserts",
      available: true,
      weight: "200 g",
      allergens: ["dairy", "gluten", "egg"],
    },
    {
      id: "i17",
      name: "Panna Cotta",
      description:
        "Vanilla bean panna cotta, passion fruit coulis, mango.",
      price: 190,
      category: "desserts",
      available: true,
      weight: "160 g",
      allergens: ["dairy"],
    },
    // Drinks
    {
      id: "i18",
      name: "Still Water 0.5L",
      description: "Premium mineral still water.",
      price: 60,
      category: "drinks",
      available: true,
      weight: "500 ml",
    },
    {
      id: "i19",
      name: "Sparkling Water 0.5L",
      description: "Premium mineral sparkling water.",
      price: 70,
      category: "drinks",
      available: true,
      weight: "500 ml",
    },
    {
      id: "i20",
      name: "Fresh Lemonade",
      description: "House-made lemonade with mint and ginger.",
      price: 120,
      category: "drinks",
      available: true,
      weight: "400 ml",
    },
    {
      id: "i21",
      name: "Espresso",
      description: "Single shot of premium Italian espresso.",
      price: 80,
      category: "drinks",
      available: true,
      weight: "30 ml",
    },
    // Cocktails
    {
      id: "i22",
      name: "Negroni",
      description:
        "Gin, Campari, sweet vermouth, orange peel. A timeless classic.",
      price: 220,
      category: "cocktails",
      available: true,
      weight: "120 ml",
    },
    {
      id: "i23",
      name: "Espresso Martini",
      description:
        "Vodka, fresh espresso, Kahlúa, vanilla syrup. Shaken, not stirred.",
      price: 240,
      category: "cocktails",
      available: true,
      weight: "120 ml",
    },
    {
      id: "i24",
      name: "Aperol Spritz",
      description:
        "Aperol, prosecco, soda water, orange slice. Italian sunshine in a glass.",
      price: 200,
      category: "cocktails",
      available: true,
      weight: "180 ml",
    },
  ],
};

export const DEMO_SERVICES: Service[] = [
  {
    id: "haircut-classic",
    name: "Classic Haircut",
    description:
      "Consultation, wash, precision cut and blow-dry. Suitable for any hair type.",
    duration: 60,
    price: 450,
    provider: "Demo Barbershop",
    available: true,
  },
  {
    id: "beard-trim",
    name: "Beard Trim & Shape",
    description:
      "Hot towel, beard shaping, line-up and beard oil treatment. Includes a complimentary drink.",
    duration: 30,
    price: 250,
    provider: "Demo Barbershop",
    available: true,
  },
  {
    id: "massage-60",
    name: "Relaxation Massage 60min",
    description:
      "Full body Swedish massage with aromatherapy oils. Reduces stress and muscle tension.",
    duration: 60,
    price: 1200,
    provider: "Demo Spa",
    available: true,
  },
  {
    id: "massage-90",
    name: "Deep Tissue Massage 90min",
    description:
      "Intensive deep tissue work targeting chronic muscle tension. Recommended for athletes.",
    duration: 90,
    price: 1700,
    provider: "Demo Spa",
    available: true,
  },
  {
    id: "consultation",
    name: "Free Consultation",
    description:
      "30-minute introductory consultation with our specialist. Perfect for first-time visitors.",
    duration: 30,
    price: 0,
    provider: "Demo Clinic",
    available: true,
  },
];

export const ADMIN_LOG = [
  {
    id: "l1",
    timestamp: "2026-09-12T14:23:11Z",
    level: "info" as const,
    message: "Booking created: service=haircut-classic, customer=John Doe",
  },
  {
    id: "l2",
    timestamp: "2026-09-12T14:18:42Z",
    level: "success" as const,
    message: "Payment processed: orderId=ord_abc123, amount=450 UAH (LiqPay)",
  },
  {
    id: "l3",
    timestamp: "2026-09-12T13:55:09Z",
    level: "info" as const,
    message: "Bot webhook received: /start from chat 123456",
  },
  {
    id: "l4",
    timestamp: "2026-09-12T13:40:22Z",
    level: "warning" as const,
    message: "Menu item 'Linguine alle Vongole' marked as unavailable",
  },
  {
    id: "l5",
    timestamp: "2026-09-12T12:10:05Z",
    level: "success" as const,
    message: "Booking confirmed: service=massage-60, customer=Jane Smith",
  },
  {
    id: "l6",
    timestamp: "2026-09-12T11:02:30Z",
    level: "info" as const,
    message: "QR code generated for restaurant 'Demo Restaurant'",
  },
  {
    id: "l7",
    timestamp: "2026-09-12T10:15:00Z",
    level: "info" as const,
    message: "System started, version 0.1.0",
  },
];
