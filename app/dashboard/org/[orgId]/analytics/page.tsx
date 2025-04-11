"use client";

import Analytics from "@/components/Analytics";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useOrganizationRedirect } from "@/lib/hooks/useOrganizationRedirect";

export default function BrandPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const params = useParams();
  const orgId = params.orgId as string;
  const [isReady, setIsReady] = useState(false);
  
  // Use the shared organization redirect hook
  const { isRedirecting } = useOrganizationRedirect();

  // Check if the organization is ready
  useEffect(() => {
    if (isUserLoaded && isOrgLoaded && !isRedirecting) {
      if (organization && organization.id === orgId) {
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    }
  }, [isUserLoaded, isOrgLoaded, organization, orgId, isRedirecting]);

  return (
    <main className="flex flex-col h-full">
      <section className="flex-1 overflow-y-auto">
        {isReady && user ? (
          // Removed the extra div with max-w-4xl to prevent layout conflicts
          <Analytics />
        ) : (
          <div className="p-6">
            <div className="max-w-6xl mx-auto mb-16">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold">Analytics Overview</h2>
                <Badge className="text-xs py-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Still in development
                </Badge>
              </div>
              <p className="mb-8 text-gray-600">
                View usage statistics and performance metrics for your organization.
                {organization && (
                  <span className="ml-2 font-medium text-purple-600">
                    Organization: {organization.name}
                  </span>
                )}
              </p>
              <div className="flex justify-start animate-in fade-in-0 mb-8">
                <div className="rounded-2xl px-4 py-3 bg-white text-purple-900 shadow-sm ring-1 ring-inset ring-purple-200">
                  <div className="flex items-center gap-1.5">
                    <p>Loading your analytics</p>
                    {[0.3, 0.15, 0].map((delay, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `-${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-md mb-8 border bg-purple-50 border-purple-200">
                <h4 className="font-medium mb-1 text-purple-700">Analytics Overview</h4>
                <p className="text-sm text-purple-600">
                  These analytics provide insights into your team's usage patterns and the value generated.
                  Track time saved, messages sent, and other key metrics to optimize your workflow.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}