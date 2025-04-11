// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

// Define protected routes, explicitly excluding /dashboard/team/profile
const isProtectedRoute = createRouteMatcher([
  "/dashboard", // Protect the root dashboard
  "/dashboard/settings(.*)", // Protect settings and its sub-routes
  "/dashboard/team$", // Protect /dashboard/team exactly (but not its sub-routes)
  "/premium(.*)",
  "/api/stripe(.*)", // Protect Stripe API routes
]);

// Define subscription-required routes
const isSubscriptionRoute = createRouteMatcher([
  "/premium(.*)", // Routes requiring an active subscription
]);

// Function to check subscription status
async function checkSubscription(userId: string) {
  try {
    const convex = getConvexClient();
    const user = await convex.query(api.stripeData.getUserById, { userId });
    console.log("[MIDDLEWARE] Subscription check for user:", userId, "Result:", user);
    return user?.subscriptionStatus === "active";
  } catch (error) {
    console.error("[MIDDLEWARE] Subscription check error:", error);
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  console.log("[MIDDLEWARE] Processing request:", req.url);

  // Skip authentication for the upload API route
  const url = new URL(req.url);
  if (url.pathname === '/api/upload') {
    console.log("[MIDDLEWARE] Skipping auth for upload API");
    return NextResponse.next();
  }

  // Check if the route is protected
  if (isProtectedRoute(req)) {
    // Await auth() to get the resolved auth object
    const authObject = await auth();

    // Check if user is authenticated
    if (!authObject.userId) {
      console.log("[MIDDLEWARE] User not authenticated, redirecting to sign-in");
      return authObject.redirectToSignIn({ returnBackUrl: req.url });
    }

    const userId = authObject.userId;
    console.log("[MIDDLEWARE] Authenticated userId:", userId);

    // Check if the route requires an active subscription
    if (isSubscriptionRoute(req)) {
      const hasActiveSubscription = await checkSubscription(userId);

      if (!hasActiveSubscription) {
        console.log("[MIDDLEWARE] No active subscription, redirecting to /dashboard/settings");
        return NextResponse.redirect(new URL("/dashboard/settings", req.url));
      }
    }
  }

  // Allow the request to proceed if all checks pass
  console.log("[MIDDLEWARE] Request allowed to proceed");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};