import { query } from "../_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    organizationId: v.string(),
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // If userId is provided, ensure the requester is authorized
    if (args.userId && identity.subject !== args.userId) {
      throw new Error("Unauthorized: User ID does not match authenticated user");
    }

    // Use the appropriate index based on what's provided
    let integrations;
    
    // Query by organizationId (this is the primary use case)
    integrations = await ctx.db
      .query("integrations")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Return a cleaner response structure
    if (integrations.length === 0) {
      return [];
    }

    return integrations.map((int) => ({
      provider: int.provider,
      connectionId: int.connectionId,
      isConnected: int.status === "active",
      status: int.status,
      metadata: int.metadata || {},
      lastCheckedAt: int.lastCheckedAt,
      expiresAt: int.expiresAt,
    }));
  },
});