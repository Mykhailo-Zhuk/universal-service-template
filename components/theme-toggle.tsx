"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative h-9 w-9 border-border bg-background hover:bg-surface"
    >
      <Moon className="h-4 w-4 rotate-0 scale-100 transition-transform duration-150 dark:rotate-90 dark:scale-0" />
      <Sun className="absolute h-4 w-4 -rotate-90 scale-0 transition-transform duration-150 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
