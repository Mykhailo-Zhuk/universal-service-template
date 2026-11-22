import type { Metadata, Viewport } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Universal Service Template",
  description:
    "QR table ordering, slot booking, and an admin desk in one Next.js codebase.",
  keywords: ["restaurant", "booking", "QR menu", "Next.js", "template"],
  authors: [{ name: "Mykhailo Zhuk" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Universal Service Template",
    description:
      "QR table ordering, slot booking, and an admin desk in one Next.js codebase.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chivo:wght@400..700&family=Chivo+Mono:wght@400..500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-[#a1ffcb] selection:text-[#232323]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
