"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import TeamSubscriptionStatus from "@/components/TeamSubscriptionStatus";
import toast, { Toaster } from "react-hot-toast";
import styled from "styled-components";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Styled component for the logo with purple styling
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
  background-color: #d8b4fe; // Light purple background
  border-radius: 8px;
  border: 1px solid rgb(166, 83, 255); // Subtle purple border
  padding: 2px;

  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    border-radius: 6px; // Slightly smaller radius than wrapper for nested effect
  }
`;

export default function TeamSettingsClient({ teamId }: { teamId: string }) {
  const searchParams = useSearchParams();
  const params = useParams();
  const organizationId = params.orgId as string;
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { user } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get("session_id");
  const canceled = searchParams.get("canceled");
  
  // State to track if authentication is ready
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Check if the organization in the URL matches the active organization
  useEffect(() => {
    if (isOrgLoaded && organization) {
      // Only set auth ready when organization is loaded and matches the URL param
      if (organization.id === organizationId) {
        setIsAuthReady(true);
      } else {
        setIsAuthReady(false);
      }
    }
  }, [isOrgLoaded, organization, organizationId]);

  // Simple loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Stripe verification feedback
  useEffect(() => {
    if (sessionId) {
      console.log("Payment successful for team! Session ID:", sessionId);
      fetch("/api/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, organizationId: teamId }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            toast.success("Team subscription successful! Your team is now on the Premium plan.", {
              duration: 8000,
              position: "bottom-right",
            });
          } else {
            console.error("Verification failed:", data.error);
            toast.error("Subscription verification failed. Please try again.", {
              duration: 8000,
              position: "bottom-right",
            });
          }
        })
        .catch((err: Error) => {
          console.error("Error verifying team subscription:", err.message);
          toast.error("An error occurred while verifying the subscription.", {
            duration: 8000,
            position: "bottom-right",
          });
        });
    } else if (canceled === "true") {
      console.log("Checkout canceled by user for team.");
      toast("Checkout was canceled. Your team is still on the Free plan.", {
        duration: 8000,
        position: "bottom-right",
        icon: "⚠️",
        style: {
          background: "#fef3c7",
          color: "#92400e",
        },
      });
    }
  }, [sessionId, canceled, teamId]);

  // Loading state
  if (isLoading || !organization || !isAuthReady) {
    return (
      <div className={cn(
        "p-6",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <h1 className={cn(
          "text-2xl font-semibold mb-6",
          isDark ? "text-white" : "text-gray-900"
        )}>Team Subscription Management</h1>
        <div className="flex justify-start animate-in fade-in-0">
          <div className={cn(
            "rounded-2xl px-4 py-3 shadow-sm ring-1 ring-inset",
            isDark ? "bg-gray-800 text-purple-300 ring-purple-700" : "bg-white text-purple-900 ring-purple-200"
          )}>
            <div className="flex items-center gap-1.5">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "container mx-auto px-4 py-8",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* Toaster component for styled notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: "8px",
            padding: "16px",
            fontSize: "16px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
          success: {
            style: {
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #bbf7d0",
            },
            iconTheme: {
              primary: "#166534",
              secondary: "#dcfce7",
            },
          },
          error: {
            style: {
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
            iconTheme: {
              primary: "#991b1b",
              secondary: "#fee2e2",
            },
          },
        }}
      />
      <div className="grid grid-cols-1">
        <div className="col-span-1">
          <div className="">
            <div className="flex items-center gap-3 mb-6">
              <h1 className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Team Subscription Management - {organization.name}
              </h1>
              {organization.imageUrl && (
                <LogoWrapper>
                  <img 
                    src={organization.imageUrl} 
                    alt={`${organization.name} logo`}
                  />
                </LogoWrapper>
              )}
            </div>

            {sessionId && (
              <div className={cn(
                "mb-6 p-4 rounded-lg",
                isDark ? "bg-green-900/20 text-green-400" : "bg-green-100 text-green-800"
              )}>
                <p>Payment completed! Your team is now on Premium.</p>
              </div>
            )}
            {canceled === "true" && (
              <div className={cn(
                "mb-6 p-4 rounded-lg",
                isDark ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-800"
              )}>
                <p>Checkout canceled. No changes made.</p>
              </div>
            )}

            <div className="mb-6">
              <TeamSubscriptionStatus teamId={teamId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}