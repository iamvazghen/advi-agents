"use client";

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Loading() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Generate random number between 2 and 6
  const numMessages = Math.floor(Math.random() * 5) + 2;

  return (
    <div className={cn("flex-1 overflow-hidden", isDark ? "bg-gray-900" : "bg-gray-50")}>
      {/* Messages section */}
      <div className="h-[calc(100vh-65px)] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {[...Array(numMessages)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "w-2/3 rounded-2xl p-4",
                    i % 2 === 0
                      ? "bg-purple-600/10 rounded-br-none dark:bg-purple-900/50 dark:text-gray-200"
                      : "bg-white rounded-bl-none border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className="space-y-3">
                    <div
                      className={cn("h-4 animate-pulse rounded w-[90%]", i % 2 === 0 ? "bg-white/40 dark:bg-gray-700/50" : "bg-gray-200 dark:bg-gray-700")}
                    />
                    <div
                      className={cn("h-4 animate-pulse rounded w-[75%]", i % 2 === 0 ? "bg-white/40 dark:bg-gray-700/50" : "bg-gray-200 dark:bg-gray-700")}
                    />
                    <div
                      className={cn("h-4 animate-pulse rounded w-[60%]", i % 2 === 0 ? "bg-white/40 dark:bg-gray-700/50" : "bg-gray-200 dark:bg-gray-700")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input section */}
        <div className={cn("border-t p-4", isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200")}>
          <div className="max-w-4xl mx-auto">
            <div className={cn("h-12 rounded-full animate-pulse", isDark ? "bg-gray-800" : "bg-gray-100")} />
          </div>
        </div>
      </div>
    </div>
  );
}
