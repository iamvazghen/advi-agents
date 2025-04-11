// app/api/stripe/server-actions.ts
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function createPortalSession(organizationId: string) {
  const { userId } = await auth();
  const convex = getConvexClient();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not defined in environment variables");
  }

  const stripeData = await convex.query(api.stripeData.getTeamById as any, { organizationId });

  if (!stripeData?.stripeCustomerId) {
    throw new Error("No subscription found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeData.stripeCustomerId,
    return_url: `${appUrl}/dashboard/org/${organizationId}/team/settings`,
  });

  return { url: session.url };
}
