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
  title: "Brado Brey — Барбершоп",
  description:
    "Мережа барбершопів Brado Brey: чоловічі стрижки, гоління, догляд за бородою. Онлайн-запис у 24 локаціях.",
  keywords: ["restaurant", "booking", "QR menu", "Next.js", "template"],
  authors: [{ name: "Mykhailo Zhuk" }],
  openGraph: {
    title: "Brado Brey — Барбершоп",
    description:
      "Мережа барбершопів Brado Brey: чоловічі стрижки, гоління, догляд за бородою. Онлайн-запис у 24 локаціях.",
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
