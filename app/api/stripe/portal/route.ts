// app/api/stripe/portal/route.ts
import { stripe } from "@/lib/stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const convex = getConvexClient();

interface PortalRequest {
  organizationId: string;
}

interface PortalResponse {
  url: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const { organizationId } = (await request.json()) as PortalRequest;
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Ensure the user is an admin of the organization
    const client = await clerkClient();
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId,
    });
    const membership = memberships.data.find((m) => m.publicUserData?.userId === userId);
    if (!membership || membership.role !== "org:admin") {
      return NextResponse.json({ error: "Only admins can manage subscriptions" }, { status: 403 });
    }

    // Ensure NEXT_PUBLIC_APP_URL is defined
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not defined in environment variables");
    }

    // Get team's Stripe data from Convex
    const teamData = await convex.query(api.stripeData.getTeamById, { organizationId });
    if (!teamData?.stripeCustomerId) {
      return new NextResponse("No subscription found for this team", { status: 404 });
    }

    // Create Stripe Billing Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: teamData.stripeCustomerId,
      return_url: `${appUrl}/dashboard/org/${organizationId}/team/settings`,
    });

    return NextResponse.json({ url: session.url } as PortalResponse);
  } catch (error: unknown) {
    console.error("[STRIPE_PORTAL_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
