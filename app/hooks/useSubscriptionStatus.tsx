"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export type SubscriptionStatus = "active" | "trialing" | "inactive" | "expired" | "past_due" | "canceled" | "unpaid" | "loading";

export interface SubscriptionData {
  isSubscribed: boolean;
  status: SubscriptionStatus;
  planName: string;
  isLoading: boolean;
  nextBillingDate?: string;
  trialEndDate?: string;
  isTrialExpired?: boolean;
  hasValidAccess: boolean;
  isTrial: boolean;
  priceId?: string;
}

export function useSubscriptionStatus(): SubscriptionData {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get team profile data for the current organization
  const teamProfile = useQuery(
    api.stripeData.getTeamById,
    isClient && isOrgLoaded && organization?.id 
      ? { organizationId: organization.id } 
      : "skip"
  );

  // Define the plan name based on the price ID
  const getPlanName = (priceId?: string): string => {
    switch (priceId) {
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID:
        return "Standard";
      case "price_1R7PyDKyxf15zPwDwL42roNg":
        return "Premium";
      case "price_1R7PymKyxf15zPwDY4VyAtRh":
        return "Enterprise";
      default:
        return "Unknown";
    }
  };

  // Define if we're still loading
  const isLoading = !isClient || !isOrgLoaded || teamProfile === undefined;

  // Subscription status calculations
  const subscriptionStatus = teamProfile?.subscriptionStatus;
  const isSubscribed = subscriptionStatus === "active";
  const isTrial = subscriptionStatus === "trialing";
  const isPastDue = subscriptionStatus === "past_due";
  const isCanceled = subscriptionStatus === "canceled";
  
  // Trial and billing dates
  const trialEnd = teamProfile?.trialEnd;
  const trialEndDate = trialEnd ? new Date(trialEnd).toLocaleDateString() : undefined;
  const isTrialExpired = isTrial && trialEnd ? new Date() > new Date(trialEnd) : false;
  
  const nextBillingDateRaw = teamProfile?.nextBillingDate;
  const nextBillingDate = nextBillingDateRaw 
    ? new Date(nextBillingDateRaw).toLocaleDateString() 
    : undefined;

  // Determine user status
  let status: SubscriptionStatus = "loading";
  
  if (!isLoading) {
    if (isSubscribed) {
      status = "active";
    } else if (isTrial) {
      status = isTrialExpired ? "expired" : "trialing";
    } else if (isPastDue) {
      status = "past_due";
    } else if (isCanceled) {
      status = "canceled";
    } else {
      status = "inactive";
    }
  }

  // Determine if the user has valid access to premium features
  const hasValidAccess = isSubscribed || (isTrial && !isTrialExpired);

  return {
    isSubscribed,
    status,
    planName: getPlanName(teamProfile?.priceId),
    isLoading,
    nextBillingDate,
    trialEndDate,
    isTrialExpired,
    hasValidAccess,
    isTrial,
    priceId: teamProfile?.priceId
  };
}

// Hook to check if user should be redirected to subscription page
export function useSubscriptionRedirect(): { shouldRedirect: boolean, redirectPath: string | null } {
  const { organization } = useOrganization();
  const { status, hasValidAccess, isLoading } = useSubscriptionStatus();
  
  // Don't redirect while still loading
  if (isLoading || !organization) {
    return { shouldRedirect: false, redirectPath: null };
  }
  
  // If the organization doesn't have valid access, redirect to team settings
  if (!hasValidAccess) {
    return { 
      shouldRedirect: true, 
      redirectPath: `/dashboard/org/${organization.id}/team` 
    };
  }
  
  return { shouldRedirect: false, redirectPath: null };
}