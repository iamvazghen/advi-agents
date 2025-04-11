"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";
import { useOrganization } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function OrganizationSwitcherWrapper() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { organization } = useOrganization();

  return (
    <OrganizationSwitcher
      afterCreateOrganizationUrl="/dashboard/org/:id"
      afterLeaveOrganizationUrl="/dashboard"
      // Don't specify afterSwitchOrganizationUrl to let our custom hook handle it
      // This allows us to maintain the current page path when switching orgs
      appearance={{
        elements: {
          rootBox: cn(
            "w-[240px] p-2 rounded-lg shadow-sm overflow-hidden",
            isDark ? "bg-gray-800" : "bg-white"
          ),
          organizationSwitcherTrigger: cn(
            "w-full group/trigger transition-colors",
            isDark
              ? "text-purple-300 hover:text-purple-400"
              : "text-purple-800 hover:text-purple-600"
          ),
          organizationName: cn(
            "w-[180px] truncate transition-colors",
            isDark
              ? "text-purple-300 hover:text-purple-400"
              : "text-purple-800 hover:trigger:text-purple-600"
          ),
          organizationPreview: cn(
            "w-full transition-colors",
            isDark
              ? "text-purple-300 hover:text-purple-400"
              : "text-purple-800 hover:text-purple-600"
          ),
          organizationSwitcherTriggerIcon: cn(
            "transition-colors",
            isDark
              ? "text-purple-300 hover:text-purple-400"
              : "text-purple-800 hover:text-purple-600"
          ),
          organizationPreviewTextContainer: cn(
            "transition-colors",
            isDark
              ? "text-purple-300 hover:text-purple-400"
              : "text-purple-800 hover:text-purple-600"
          )
        }
      }}
      // Add a key to force re-render when organization changes
      key={organization?.id || 'no-org'}
    />
  );
}