"use client";

import { useOrganization } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Clock, Zap } from "lucide-react";
import TeamSubscriptionHandler from "./TeamSubscriptionHandler";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const TeamSubscriptionStatus = ({ teamId }: { teamId: string }) => {
  const { organization, isLoaded } = useOrganization();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [minLoadingElapsed, setMinLoadingElapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("status");

  useEffect(() => {
    setIsClient(true);
  }, []);

  type TeamProfile = {
    _id: string;
    organizationId?: string;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: "active" | "trialing" | "incomplete" | "past_due" | "canceled" | "unpaid";
    trialEnd?: number;
    nextBillingDate?: number;
    createdAt: number;
    updatedAt: number;
  };

  const teamProfile = useQuery(api.stripeData.getTeamById, 
    isClient && teamId ? { organizationId: teamId } : "skip"
  ) as TeamProfile | null | undefined;

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: teamId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create portal session: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (!data.url || typeof data.url !== "string") {
        throw new Error("Invalid response: URL not provided");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingElapsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Function to handle tab switching
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!isLoaded || !isClient || !minLoadingElapsed) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="h-3 w-3 rounded-full bg-purple-400 animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!organization || organization.id !== teamId) {
    return null; // Wait for the correct team to load
  }

  if (teamProfile === undefined) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="h-3 w-3 rounded-full bg-purple-400 animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const isSubscribed = teamProfile?.subscriptionStatus === "active";
  const isTrial = teamProfile?.subscriptionStatus === "trialing";
  const isPastDue = teamProfile?.subscriptionStatus === "past_due";
  const isCanceled = teamProfile?.subscriptionStatus === "canceled";
  const trialEndDate = teamProfile?.trialEnd ? new Date(teamProfile.trialEnd) : undefined;
  const nextBillingDate = teamProfile?.nextBillingDate ? new Date(teamProfile.nextBillingDate) : undefined;
  const isTrialExpired = isTrial && trialEndDate && new Date() > trialEndDate;
  
  // Define the plan based on the price ID and subscription status
  const getPlanName = () => {
    if (!isSubscribed) {
      return isTrial ? "Trial" : "No Plan";
    }
    
    switch (teamProfile?.priceId) {
      case process.env.NEXT_PUBLIC_STRIPE_PRICE_ID:
        return "Standard";
      case "price_1R7PyDKyxf15zPwDwL42roNg":
        return "Premium";
      case "price_1R7PymKyxf15zPwDY4VyAtRh":
        return "Enterprise";
      default:
        return "Standard"; // Default to Standard if price ID doesn't match
    }
  };

  // Get status badge details
  const getStatusBadge = () => {
    if (isSubscribed) {
      return { 
        text: "Active", 
        variant: "success" as const,
        icon: <Check className="h-4 w-4 mr-1" />
      };
    } else if (isTrial && !isTrialExpired) {
      return { 
        text: "Trial", 
        variant: "default" as const,
        icon: <Clock className="h-4 w-4 mr-1" />
      };
    } else if (isTrial && isTrialExpired) {
      return { 
        text: "Trial Expired", 
        variant: "destructive" as const,
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      };
    } else if (isPastDue) {
      return { 
        text: "Payment Required", 
        variant: "destructive" as const,
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      };
    } else if (isCanceled) {
      return { 
        text: "Canceled", 
        variant: "outline" as const,
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      };
    } else {
      return { 
        text: "Inactive", 
        variant: "outline" as const,
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      };
    }
  };

  const statusBadge = getStatusBadge();
  const planName = getPlanName();

  return (
    <Card className={cn(
      "shadow-md",
      isDark ? "border-gray-700 bg-gray-800" : "border-purple-200"
    )}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={cn(
              "text-2xl",
              isDark ? "text-white" : "text-gray-900"
            )}>Team Subscription</CardTitle>
            <CardDescription className={isDark ? "text-gray-400" : ""}>
              Manage your team's access to features
            </CardDescription>
          </div>
          <Badge 
            className={`text-sm py-1.5 px-3 flex items-center ${
              statusBadge.variant === 'success' 
                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                : statusBadge.variant === 'destructive'
                  ? 'bg-red-100 text-red-800 hover:bg-red-100'
                  : statusBadge.variant === 'default'
                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            }`}
            variant={statusBadge.variant}
          >
            {statusBadge.icon}
            {statusBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="px-6">
          <TabsList className={cn(
            "w-full grid grid-cols-2",
            isDark ? "bg-gray-700" : "bg-purple-50"
          )}>
            <TabsTrigger value="status" className="data-[state=active]:bg-white">
              Current Status
            </TabsTrigger>
            <TabsTrigger value="select" className="data-[state=active]:bg-white">
              Select Plan
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="status" className="pt-4">
          <CardContent>
            <div className="space-y-6">
              <div className={cn(
                "rounded-lg p-4 border",
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-purple-50 border-purple-100"
              )}>
                <div className="flex items-center mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                    isDark ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600"
                  )}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-semibold text-lg",
                      isDark ? "text-purple-300" : "text-purple-900"
                    )}>
                      {planName} Subscription
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-purple-400" : "text-purple-700"
                    )}>
                      {isSubscribed 
                        ? "Your team has full access to all features"
                        : isTrial && !isTrialExpired
                          ? "Trial access to all premium features"
                          : "Limited access to features"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={cn(
                    "p-3 rounded-md border",
                    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-purple-100"
                  )}>
                    <p className={cn(
                      "text-xs mb-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Current Plan</p>
                    <p className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>{planName}</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-md border",
                    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-purple-100"
                  )}>
                    <p className={cn(
                      "text-xs mb-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Status</p>
                    <p className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>{statusBadge.text}</p>
                  </div>
                  {trialEndDate && isTrial && (
                    <div className={cn(
                      "p-3 rounded-md border",
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-purple-100"
                    )}>
                      <p className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>Trial Ends</p>
                      <p className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-gray-900"
                      )}>{trialEndDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  {nextBillingDate && isSubscribed && (
                    <div className={cn(
                      "p-3 rounded-md border",
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-purple-100"
                    )}>
                      <p className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>Next Billing</p>
                      <p className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-gray-900"
                      )}>{nextBillingDate.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className={cn(
                  "p-3 rounded-md border text-sm",
                  isDark
                    ? "bg-red-900/20 border-red-700 text-red-400"
                    : "bg-red-50 border-red-100 text-red-700"
                )}>
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            {isSubscribed && (
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? "Loading..." : "Manage Billing"}
              </Button>
            )}
            {!isSubscribed && (
              <Button
                onClick={() => handleTabChange("select")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isTrial ? "Upgrade Plan" : "Select a Plan"}
              </Button>
            )}
            {isSubscribed && (
              <Button
                onClick={() => handleTabChange("select")}
                variant="outline"
                className="border-purple-200 text-purple-700"
              >
                Change Plan
              </Button>
            )}
          </CardFooter>
        </TabsContent>

        <TabsContent value="select">
          <CardContent className="pt-6">
            <TeamSubscriptionHandler teamId={teamId} />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TeamSubscriptionStatus;
