# 🍽️ Universal Service Template

**SaaS-шаблон** для ресторанів, кафе, салонів краси, автомийок, клінік та інших закладів. Один шаблон → багато клієнтів з мінімальними змінами.

## ✨ Що входить

- 📱 **QR-меню** — заміна паперового, адмін сам заповнює
- 📅 **Онлайн-запис** — вибір дати, часу, послуги
- 💳 **Оплата через QR** — інтеграція з LiqPay/MonoPay
- 👨‍💼 **Адмін-панель** — управління закладом або мережею
- 🤖 **Telegram-бот** — сповіщення адміну
- 🌐 **Багатомовність** (UA / EN / RU) — готова інфраструктура
- 🎨 **Дизайн у стилі Linear** — чистий, мінімалістичний
- 📱 **Mobile-first** + Dark/light theme

## 🚀 Демо

| Сторінка | URL | Опис |
|---|---|---|
| Головна | `/` | Landing page |
| QR-меню | `/menu/demo-restaurant` | 7 категорій, 24 страви |
| Запис | `/book/haircut-classic` | Online booking |
| Адмінка | `/admin` | Dashboard з логуванням |

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn-style components
- **Animations:** framer-motion
- **Validation:** Zod
- **Icons:** Lucide React
- **i18n:** next-intl (UA/EN/RU)
- **Deployment:** Vercel

## 📦 Встановлення

```bash
# 1. Клонуй репозиторій
git clone https://github.com/Mykhailo-Zhuk/universal-service-template.git
cd universal-service-template

# 2. Встанови залежності
npm install

# 3. Запусти dev server
npm run dev
# → http://localhost:3000
```

## 🔧 Як адаптувати під нового клієнта

### 1. Зміни дані ресторану/закладу
Відредагуй `data/demo.ts`:
```typescript
export const demoRestaurant = {
  id: 'your-restaurant',
  name: 'Your Restaurant Name',
  // ... категорії, страви, ціни
};
```

### 2. Зміни брендинг
- Кольори → `tailwind.config.ts` (заміни `indigo-600` на свій primary)
- Логотип → `public/logo.svg`
- Назва → `app/layout.tsx` (metadata)

### 3. Підключи реальні дані
- База даних: PostgreSQL через Supabase
- Оплата: додай `LiqPay` / `MonoPay` API keys у `.env`
- Telegram bot: створи через @BotFather, додай `TELEGRAM_BOT_TOKEN` у `.env`

## 🚢 Деплой на Vercel

### Варіант A: через Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Варіант B: через GitHub
1. Fork цей репозиторій
2. Імпортуй у [Vercel](https://vercel.com/new)
3. Додай environment variables
4. Deploy

## 📋 API Endpoints

| Method | Endpoint | Опис |
|---|---|---|
| GET | `/api/menu/[restaurantId]` | Меню закладу |
| GET | `/api/book?serviceId=X` | Вільні слоти |
| POST | `/api/book` | Створити запис |
| POST | `/api/payment/create` | Створити платіж |
| POST | `/api/payment/callback` | Callback від LiqPay |
| POST | `/api/bot/webhook` | Telegram webhook |
| GET | `/api/bot/log` | Історія команд бота |

## 💰 Модель монетизації

| План | Ціна | Що входить |
|---|---|---|
| Free | 0 ₴ | QR-меню до 30 позицій |
| Basic | 500 ₴/міс | + запис + 1 локація |
| Pro | 1 200 ₴/міс | + мережа + оплата + статистика |
| Enterprise | Узгоджується | Кастом + POS + CRM |

## 🎯 Цільова аудиторія

- 🍽 Ресторани, кафе, піцерії
- ☕ Кав'ярні, бари
- 💅 Салони краси, барбершопи
- 🚗 Автомийки, шиномонтажі
- 🏥 Стоматології, клініки
- 🎾 Спортивні зали

## 📝 License

MIT © [Mykhailo Zhuk](https://github.com/Mykhailo-Zhuk)

## 🤝 Contributing

PRs welcome! Для великих змін — спочатку open an issue.

## 📞 Контакт

- GitHub: [@Mykhailo-Zhuk](https://github.com/Mykhailo-Zhuk)
- Issues: [github.com/Mykhailo-Zhuk/universal-service-template/issues](https://github.com/Mykhailo-Zhuk/universal-service-template/issues)

---

**Зроблено з ❤️ в Україні**
