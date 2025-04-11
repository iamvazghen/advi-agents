"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BadgeCheck, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export async function createCheckoutSession(priceId: string, organizationId: string): Promise<void> {
  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, organizationId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create checkout session: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    if (!data.url || typeof data.url !== "string") {
      throw new Error("Invalid response: URL not provided");
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    throw error;
  }
}

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  monthlyPrice: string;
  description: string;
  features: PlanFeature[];
  trialDays?: number;
  popular?: boolean;
}

const TeamSubscriptionHandler: React.FC<{ teamId: string }> = ({ teamId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [error, setError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showNewOrgMessage, setShowNewOrgMessage] = useState(false);

  // Get the current organization's subscription status
  const teamProfile = useQuery(
    api.stripeData.getTeamById as any,
    teamId ? { organizationId: teamId } : "skip"
  );
  
  const currentSubscriptionStatus = teamProfile?.subscriptionStatus;
  const currentPriceId = teamProfile?.priceId;
  const trialEnd = teamProfile?.trialEnd;
  const isTrialing = currentSubscriptionStatus === "trialing";
  const isActive = currentSubscriptionStatus === "active";
  const trialEndDate = trialEnd ? new Date(trialEnd) : null;
  const isTrialExpired = isTrialing && trialEndDate && new Date() > trialEndDate;

  // Force re-render when subscription status changes
  useEffect(() => {
    // This empty effect will trigger re-render when dependencies change
  }, [currentSubscriptionStatus, currentPriceId, trialEnd]);

  // Plans data with more detailed information
  const plans: Plan[] = [
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID as string,
      name: "Standard",
      price: "$5,997",
      monthlyPrice: "$1999/mo",
      description: "Complete solution for smaller teams & startups",
      features: [
        { text: "5 team members included" },
        { text: "10 automations/month" },
        { text: "Basic agent access" },
        { text: "Email support (24h response)" },
        { text: "Knowledge base access" },
      ],
      trialDays: 4
    },
    {
      id: "price_1R7PyDKyxf15zPwDwL42roNg", 
      name: "Premium",
      price: "$11,997",
      monthlyPrice: "$3999/mo",
      description: "Advanced features for growing teams",
      features: [
        { text: "15 team members included", highlight: true },
        { text: "50 automations/month", highlight: true },
        { text: "Advanced agent access", highlight: true },
        { text: "Priority support (12h response)", highlight: true },
        { text: "Custom integrations", highlight: true },
      ],
      popular: true
    },
    {
      id: "price_1R7PymKyxf15zPwDY4VyAtRh",
      name: "Enterprise", 
      price: "$17,997",
      monthlyPrice: "$5999/mo",
      description: "Full-featured solution for large organizations",
      features: [
        { text: "Unlimited team members", highlight: true },
        { text: "Unlimited automations", highlight: true },
        { text: "All agent access + custom agents", highlight: true },
        { text: "24/7 dedicated support", highlight: true },
        { text: "Custom deployment & white labeling", highlight: true },
      ],
    }
  ];

  useEffect(() => {
    // Auto-start trial when component mounts for new organizations
    const startTrial = async () => {
      try {
        setLoadingPlan("price_1R7PyDKyxf15zPwDwL42roNg");
        await createCheckoutSession("price_1R7PyDKyxf15zPwDwL42roNg", teamId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoadingPlan(null);
      }
    };

    // Check if this is a new organization by looking for a query param
    const urlParams = new URLSearchParams(window.location.search);
    const isNewOrg = urlParams.get('newOrg') === 'true';
    
    if (isNewOrg) {
      setShowNewOrgMessage(true);
      if (!isActive && !isTrialing) {
        startTrial();
      }
    }
  }, [teamId, isActive, isTrialing]);

  const handleSubscription = async (priceId: string) => {
    setLoadingPlan(priceId);
    setError(null);

    try {
      await createCheckoutSession(priceId, teamId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  // Find the current plan details with memoization to prevent unnecessary re-renders
  const currentPlan = React.useMemo(() => {
    return plans.find(plan => plan.id === currentPriceId);
  }, [currentPriceId, plans]);

  return (
    <div className={cn(
      "subscription-handler space-y-6",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      {showNewOrgMessage && (
        <Card className={cn(
          "mb-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-purple-50 border-purple-200"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <div className="text-purple-500 mt-1">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-medium text-purple-700">Setting up your organization</h3>
                <p className="text-sm text-purple-600">
                  We're preparing your workspace. Please select a plan to continue setting up your organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isTrialExpired && (
        <Card className={cn(
          "mb-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-purple-50 border-purple-200"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <div className="text-purple-500 mt-1">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-medium text-purple-700">Trial period has ended</h3>
                <p className="text-sm text-purple-600">
                  Your trial period has expired. Please select a plan to continue using all features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isTrialing && !isTrialExpired && trialEndDate && (
        <Card className={cn(
          "mb-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-purple-50 border-purple-200"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <div className="text-purple-500 mt-1">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-medium text-purple-700">Trial Active</h3>
                <p className="text-sm text-purple-600">
                  You're currently on a trial period that ends on {trialEndDate.toLocaleDateString()}.
                  Select a plan to continue after your trial ends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isActive && currentPlan && (
        <Card className={cn(
          "mb-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-purple-50 border-purple-200"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <div className="text-purple-500 mt-1">
                <BadgeCheck size={20} />
              </div>
              <div>
                <h3 className="font-medium text-purple-700">Active Subscription</h3>
                <p className="text-sm text-purple-600">
                  You currently have an active {currentPlan.name} plan. You can update your plan below if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = isActive && plan.id === currentPriceId;
          const isPlanPopular = plan.popular;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative border-2 h-full flex flex-col transition-all duration-300 hover:shadow-lg overflow-hidden",
                isCurrentPlan
                  ? 'border-purple-500 shadow-md' // Current plan styles (light/dark handled by base card styles potentially)
                  : isPlanPopular
                    ? 'border-purple-400 shadow-md bg-purple-50 dark:bg-purple-900/30 dark:border-purple-600' // Popular plan styles with dark mode specifics
                    : 'border-purple-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-gray-600' // Default plan styles with dark mode specifics
              )}
            >
              {/* Status badge - improved version */}
              {isPlanPopular && !isCurrentPlan && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-2 bg-purple-600 text-white rounded-full px-4 py-1 text-xs font-medium shadow-sm z-10">
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 m-2 bg-purple-100 border border-purple-300 rounded-full px-2 py-0.5 z-10 flex items-center">
                  <CheckCircle size={12} className="text-green-600 mr-1" />
                  <span className="text-xs font-medium text-purple-800">CURRENT</span>
                </div>
              )}
              <div className={`p-6 pb-4 border-b border-purple-100 ${isPlanPopular && !isCurrentPlan ? 'pt-10' : ''}`}>
                <h3 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>{plan.price}</span>
                  <span className={cn(
                    "text-sm ml-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>3 months</span>
                </div>
                <p className="text-sm text-gray-600">{plan.monthlyPrice}</p>
              </div>
              
              <div className="p-6 flex-grow">
                <p className={cn(
                  "text-sm mb-6",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>{plan.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 mr-2 text-green-500">
                        <CheckCircle size={18} className="mt-0.5" />
                      </span>
                      <span className={cn(
                        "text-sm",
                        feature.highlight
                          ? isDark ? "font-medium text-white" : "font-medium text-gray-900"
                          : isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {plan.trialDays && (
                  <div className={cn(
                    "text-xs p-3 rounded-md mb-4 font-medium border",
                    isDark
                      ? "bg-gray-800 text-gray-300 border-gray-700"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  )}>
                    Includes {plan.trialDays}-day free trial
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 mt-auto">
                <Button 
                  onClick={() => handleSubscription(plan.id)} 
                  disabled={loadingPlan === plan.id || isCurrentPlan}
                  className={`w-full ${
                    isPlanPopular 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : isCurrentPlan
                        ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-300 hover:border-purple-400'
                  }`}
                  variant={isPlanPopular ? "default" : "outline"}
                >
                  {loadingPlan === plan.id 
                    ? "Processing..." 
                    : isCurrentPlan
                      ? "Current Plan"
                      : isTrialing && plan.id === currentPriceId
                        ? "Trial Active"
                        : isActive
                          ? "Upgrade to this Plan"
                          : "Select Plan"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {error && (
        <div className={cn(
          "p-4 rounded-md text-sm mt-6 border",
          isDark
            ? "bg-red-900/20 border-red-700 text-red-400"
            : "bg-red-50 border-red-200 text-red-700"
        )}>
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TeamSubscriptionHandler;
