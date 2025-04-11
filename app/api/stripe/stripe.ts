import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

// Create a single Convex client instance at the top
const convex = getConvexClient();

// Helper function to get or create a Stripe customer
async function createOrRetrieveCustomer(
  userId: string,
  email: string
): Promise<string> {
  // 1) Check if we have a Stripe customer ID in stripeData
  //    (using `getUserById` from your updated stripeData.ts)
  const stripeData = await convex.query(api.stripeData.getUserById, {
    userId,
  });

  if (stripeData?.stripeCustomerId) {
    // If we already have a stored ID, return it
    return stripeData.stripeCustomerId;
  }

  // 2) Otherwise, create a new customer in Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // 3) Store the new Stripe customer ID in Convex
  //    (using `updateUser` instead of upsertStripeData)
  await convex.mutation(api.stripeData.updateUser, {
    userId,
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

// API route handler for creating checkout sessions
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    // Ensure the user is logged in and Clerk provides the user object
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    // Get (or create) the Stripe customer
    const customer = await createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0].emailAddress // grabbing the first user email
    );

    // Create a checkout session with that customer
    const session = await stripe.checkout.sessions.create({
      customer,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        userId,
      },
    });

    // Return the session URL for redirection
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
