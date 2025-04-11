// app/api/stripe/actions.ts
"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function createPortalSession() {
  const { userId } = await auth();
  console.log("[CREATE_PORTAL_SESSION] userId:", userId);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const convex = getConvexClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not defined in environment variables");
  }

  const stripeData = await convex.query(api.stripeData.getUserById, { userId });
  console.log("[CREATE_PORTAL_SESSION] stripeData:", stripeData);

  if (!stripeData?.stripeCustomerId) {
    throw new Error("No subscription found");
  }

  const configurationId = "bpc_1QzHe0Kyxf15zPwDtUgT4yHv"; // Your Configuration ID

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeData.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`, // Updated to /dashboard/settings
    configuration: configurationId,
  });

  console.log("[CREATE_PORTAL_SESSION] Created session:", {
    sessionId: session.id,
    url: session.url,
  });

  return { url: session.url };
}