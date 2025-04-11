"use client";

import { useParams } from "next/navigation";
import TeamSettingsClient from "./TeamSettingsClient";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function TeamSettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main className={cn(
      "flex flex-col h-[calc(100vh-theme(spacing.14))]",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <section className={cn(
        "flex-1 overflow-y-auto",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-4xl mx-auto">
          <TeamSettingsClient teamId={orgId} />
        </div>
      </section>
    </main>
  );
}