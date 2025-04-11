"use client";

import BrandUpload from "@/components/BrandUpload";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
      <section className="flex-1 overflow-y-auto bg-gray-50">
        {isReady && user ? (
          // Removed the extra div with max-w-4xl to prevent layout conflicts
          <BrandUpload />
        ) : (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6">Database</h2>
              <div className="flex justify-start animate-in fade-in-0">
                <div className="rounded-2xl px-4 py-3 bg-white text-purple-900 shadow-sm ring-1 ring-inset ring-purple-200">
                  <div className="flex items-center gap-1.5">
                    {[0.3, 0.15, 0].map((delay, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `-${delay}s` }}
                      />
                    ))}
                    {!isRedirecting && !isReady && isOrgLoaded && organization && (
                      <span className="ml-2 text-sm">Loading brand settings</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}