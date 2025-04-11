// app/api/stripe/verify/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const convex = getConvexClient();

interface VerifyRequest {
  sessionId: string;
  organizationId: string;
}

export async function POST(request: Request) {
  try {
    const { sessionId, organizationId } = (await request.json()) as VerifyRequest;
    if (!sessionId || typeof sessionId !== "string" || !organizationId) {
      return NextResponse.json({ error: "Invalid sessionId or organizationId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId = session.subscription as string;

    if (!subscriptionId || session.metadata?.organizationId !== organizationId) {
      return NextResponse.json({ error: "Invalid subscription or organization mismatch" }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const nextBillingDate = subscription.current_period_end * 1000;

    console.log("[STRIPE_VERIFY] Subscription data:", {
      subscriptionId,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      nextBillingDate,
    });

    await convex.mutation(api.stripeData.updateTeamSubscription, {
      organizationId,
      subscriptionId,
      status: subscription.status,
      nextBillingDate,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[STRIPE_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}