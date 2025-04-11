// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

interface CheckoutRequest {
  priceId: string;
  organizationId: string;
}

interface CheckoutResponse {
  url: string;
}

const convex = getConvexClient();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse request body
    const { priceId, organizationId } = (await request.json()) as CheckoutRequest;
    if (!priceId || typeof priceId !== "string" || !organizationId) {
      return NextResponse.json({ error: "Invalid priceId or organizationId" }, { status: 400 });
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

    // Check if team already has a Stripe customer ID
    const teamData = await convex.query(api.stripeData.getTeamById, { organizationId });
    let customerId = teamData?.stripeCustomerId;

    // If no customer ID exists, create a new Stripe customer and initialize record
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { clerkOrganizationId: organizationId },
      });
      customerId = customer.id;

      await convex.mutation(api.stripeData.updateTeam, {
        organizationId,
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/dashboard/org/${organizationId}/team/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/org/${organizationId}/team/settings?canceled=true`,
      metadata: { organizationId },
    });

    console.log("[STRIPE_CHECKOUT] Created session:", {
      sessionId: session.id,
      url: session.url,
    });

    return NextResponse.json({ url: session.url } as CheckoutResponse);
  } catch (error: unknown) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
