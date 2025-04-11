"use client";

import Organizations from "@/components/Organizations";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className={cn(
        "flex-1 overflow-y-auto",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-4xl mx-auto">
          <Organizations />
        </div>
      </section>
    </main>
  );
}