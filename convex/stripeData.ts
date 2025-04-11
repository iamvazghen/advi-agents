// convex/stripeData.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// User-Specific Queries and Mutations

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getUserByCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    return await ctx.db
      .query("stripeData")
      .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    data: v.object({
      stripeCustomerId: v.optional(v.string()),
      subscriptionId: v.optional(v.string()),
      subscriptionStatus: v.optional(v.string()),
      nextBillingDate: v.optional(v.number()),
      priceId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userId, data }) => {
    const record = await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (record) {
      return await ctx.db.patch(record._id, {
        ...data,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("stripeData", {
        userId,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    status: v.string(),
    nextBillingDate: v.number(),
    priceId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, subscriptionId, status, nextBillingDate, priceId }) => {
    const record = await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!record) {
      throw new Error("Stripe data not found for this user");
    }

    console.log("[STRIPE_DATA] Updating user subscription:", { userId, subscriptionId, status, nextBillingDate, priceId });

    return await ctx.db.patch(record._id, {
      subscriptionId,
      subscriptionStatus: status,
      nextBillingDate,
      priceId,
      trialEnd: status === "trialing" ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined, // 30 day trial
      updatedAt: Date.now(),
    });
  },
});

export const manuallyCheckSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const record = await ctx.db
      .query("stripeData")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!record || !record.subscriptionId) {
      return null;
    }

    return await ctx.db.patch(record._id, {
      subscriptionStatus: "active",
      updatedAt: Date.now(),
    });
  },
});

// Team-Specific Queries and Mutations

export const getTeamById = query({
  args: { organizationId: v.string() },
  handler: async (ctx, { organizationId }) => {
    return await ctx.db
      .query("stripeData")
      .withIndex("by_team", (q) => q.eq("organizationId", organizationId))
      .first();
  },
});

// Get payment history for a team
export const getTeamPaymentHistory = query({
  args: { organizationId: v.string() },
  handler: async (ctx, { organizationId }) => {
    // This is a placeholder - in a real implementation you would either:
    // 1. Query a separate payments table in your database
    // 2. Call a Stripe API to get payment history
    
    // For now, we'll return mock data
    return [
      {
        date: Date.now() - 30 * 24 * 60 * 60 * 1000,
        amount: 599700, // in cents
        status: 'succeeded'
      },
      {
        date: Date.now() - 60 * 24 * 60 * 60 * 1000,
        amount: 599700, // in cents
        status: 'succeeded'
      }
    ];
  }
});

export const updateTeam = mutation({
  args: {
    organizationId: v.string(),
    data: v.object({
      stripeCustomerId: v.optional(v.string()),
      subscriptionId: v.optional(v.string()),
      subscriptionStatus: v.optional(v.string()),
      nextBillingDate: v.optional(v.number()),
      priceId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { organizationId, data }) => {
    const record = await ctx.db
      .query("stripeData")
      .withIndex("by_team", (q) => q.eq("organizationId", organizationId))
      .first();

    if (record) {
      return await ctx.db.patch(record._id, {
        ...data,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("stripeData", {
        organizationId,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateTeamSubscription = mutation({
  args: {
    organizationId: v.string(),
    subscriptionId: v.string(),
    status: v.string(),
    nextBillingDate: v.number(),
    priceId: v.optional(v.string()),
  },
  handler: async (ctx, { organizationId, subscriptionId, status, nextBillingDate, priceId }) => {
    const record = await ctx.db
      .query("stripeData")
      .withIndex("by_team", (q) => q.eq("organizationId", organizationId))
      .first();

    if (!record) {
      throw new Error("Stripe data not found for this team");
    }

    console.log("[STRIPE_DATA] Updating team subscription:", {
      organizationId,
      subscriptionId,
      status,
      nextBillingDate,
      priceId
    });

    return await ctx.db.patch(record._id, {
      subscriptionId,
      subscriptionStatus: status,
      nextBillingDate,
      priceId,
      updatedAt: Date.now(),
    });
  },
});