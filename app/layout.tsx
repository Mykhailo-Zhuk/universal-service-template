import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "СТО Львів — Автосервіс",
  description:
    "Автосервіс повного циклу у Львові: діагностика, ремонт ходової, ТО. Онлайн-запис на сервіс.",
  keywords: ["restaurant", "booking", "QR menu", "Next.js", "template"],
  authors: [{ name: "Mykhailo Zhuk" }],
  openGraph: {
    title: "СТО Львів — Автосервіс",
    description:
      "Автосервіс повного циклу у Львові: діагностика, ремонт ходової, ТО. Онлайн-запис на сервіс.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
