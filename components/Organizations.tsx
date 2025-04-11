// components/Organizations.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { OrganizationProfile } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Organizations() {
  const { user } = useUser();
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isLoaded: listLoaded, userMemberships } = useOrganizationList({
    userMemberships: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const organizationId = params.orgId as string;
  
  // State to track if authentication is ready
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Check if the organization in the URL matches the active organization
  useEffect(() => {
    if (orgLoaded && organization) {
      // Only set auth ready when organization is loaded and matches the URL param
      if (organization.id === organizationId) {
        setIsAuthReady(true);
      } else {
        setIsAuthReady(false);
      }
    }
  }, [orgLoaded, organization, organizationId]);

  // Ensure 2-second minimum loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle settings redirect
  const handleSettingsRedirect = () => {
    if (organization?.id) {
      router.push(`/dashboard/org/${organization.id}/team/settings?teamId=${organization.id}`);
    } else {
      alert("No team selected. Please choose a team first.");
    }
  };

  // Loading state with 2-second animation
  if (!user || !orgLoaded || !listLoaded || isLoading || !isAuthReady) {
    return (
      <div className={cn(
        "p-6",
        isDark ? "bg-gray-900/95 backdrop-blur-sm" : "bg-gray-50"
      )}>
        <div className="max-w-2xl mx-auto">
          <h1 className={cn(
            "text-2xl font-semibold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>Team Dashboard</h1>
          <div className="flex justify-start animate-in fade-in-0">
            <div className={cn(
              "rounded-2xl px-4 py-3 shadow-md ring-1 ring-inset",
              isDark ? "bg-gray-800/90 text-purple-200 ring-purple-500/50 shadow-purple-900/20" : "bg-white text-purple-900 ring-purple-200"
            )}>
              <div className="flex items-center gap-1.5">
              <p>Loading organization information</p>
                {[0.3, 0.15, 0].map((delay, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-bounce",
                      isDark ? "bg-purple-500" : "bg-purple-400"
                    )}
                    style={{ animationDelay: `-${delay}s` }}
                  />
                ))}
                {orgLoaded && organization && organization.id !== organizationId && (
                  <span className="ml-2 text-sm">Switching organization</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 max-w-4xl mx-auto",
      isDark ? "bg-gray-900/95 backdrop-blur-sm" : "bg-gray-50"
    )}>
      <h1 className={cn(
        "text-2xl font-semibold mb-6",
        isDark ? "text-white" : "text-gray-900"
      )}>Team Dashboard</h1>
      <p className={cn(
        "mb-4",
        isDark ? "text-gray-300" : "text-gray-600"
      )}>
        Manage your teams, invite members, and configure subscriptions from your dashboard.
      </p>

      {/* Settings Button */}
      <div className="mt-6">
        <button
          onClick={handleSettingsRedirect}
          className={cn(
            "w-full rounded-lg py-5 text-white shadow transition-all duration-200 menu-item text-center mt-3 sm:mt-4",
            isDark
              ? "bg-purple-600/90 hover:bg-purple-500 shadow-purple-900/20 hover:shadow-purple-800/30"
              : "bg-purple-600 hover:bg-purple-700"
          )}
        >
          Team Billing Settings
        </button>
      </div>

      {/* Current Team Details */}
      {organization && (
        <div className="mt-6 space-y-4">
          <div className={cn(
            "p-4 rounded-lg shadow-md",
            isDark ? "bg-gray-800/90 shadow-gray-900/20" : "bg-white"
          )}>
            <OrganizationProfile
              routing="hash" // Switch to hash-based routing
              appearance={{
                elements: {
                  card: cn(
                    "shadow-md rounded-lg",
                    isDark ? "bg-gray-800/90 shadow-gray-900/20" : "bg-white"
                  ),
                  formFieldInput: cn(
                    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200",
                    isDark ? "bg-gray-700/90 border-gray-600/50 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900"
                  ),
                  formButtonPrimary: "w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors",
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}