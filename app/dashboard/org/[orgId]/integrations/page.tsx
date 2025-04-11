// app/dashboard/org/[orgId]/integrations/page.tsx
"use client";

import ParagonIntegration from "@/components/ParagonIntegration";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useOrganizationRedirect } from "@/lib/hooks/useOrganizationRedirect";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const params = useParams();
  const orgId = params.orgId as string;
  const [isReady, setIsReady] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use the shared organization redirect hook
  const { isRedirecting } = useOrganizationRedirect();

  // Check if the organization is ready
  useEffect(() => {
    if (isUserLoaded && isOrgLoaded && !isRedirecting) {
      if (organization && organization.id === orgId) {
        // Add 2-second delay before showing content
        const timer = setTimeout(() => {
          setIsReady(true);
          setShowLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setIsReady(false);
        setShowLoading(true);
      }
    }
  }, [isUserLoaded, isOrgLoaded, organization, orgId, isRedirecting]);

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className={cn(
        "flex-1 overflow-y-auto",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-4xl mx-auto">
          {(showLoading || !isReady || !user) ? (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className={cn(
                  "text-2xl font-semibold mb-6",
                  isDark ? "text-white" : "text-gray-900"
                )}>Integrations</h2>
                <div className="flex justify-start animate-in fade-in-0">
                  <div className={cn(
                    "rounded-2xl px-4 py-3 shadow-sm ring-1 ring-inset",
                    isDark ? "bg-gray-800 text-purple-300 ring-purple-700" : "bg-white text-purple-900 ring-purple-200"
                  )}>
                    <div className="flex items-center gap-1.5">
                      {!isReady && isOrgLoaded && organization && (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-sm",
                            isDark ? "text-gray-300" : "text-gray-900"
                          )}>Loading your integrations</span>
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full animate-bounce",
                                isDark ? "bg-purple-500" : "bg-purple-400"
                              )}
                              style={{
                                animationDelay: `${i * 0.15}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ParagonIntegration userId={user.id} orgId={orgId} />
          )}
        </div>
      </section>
    </main>
  );
}
