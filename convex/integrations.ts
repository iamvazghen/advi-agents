import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { GenericId } from "convex/values";

function mapConnectionStatus(status: string): "pending" | "active" | "error" | "expired" {
  const upperStatus = status.toUpperCase();
  switch (upperStatus) {
    case "PENDING":
      return "pending";
    case "ACTIVE":
    case "CONNECTED":
      return "active";
    case "ERROR":
    case "FAILED":
      return "error";
    case "EXPIRED":
    case "DISCONNECTED":
      return "expired";
    default:
      return "pending";
  }
}

export const getIntegrationsByOrg = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgIds = identity.orgIds as string[] | undefined;
    const userId = identity.subject;
    const isUserInOrg = (orgIds ?? []).some((orgId: string) => orgId === args.organizationId);

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    if (!isUserInOrg) {
      return integrations.filter(
        (integration) =>
          integration.userId === userId || integration.userId.startsWith(`${userId}:`)
      );
    }

    return integrations;
  },
});

export const storeConnection = mutation({
  args: {
    provider: v.string(),
    connectionId: v.string(),
    organizationId: v.string(),
    userId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    tokenType: v.optional(v.string()),
    scope: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountEmail: v.optional(v.string()),
    externalAccountId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("error"),
      v.literal("expired")
    ),
    metadata: v.optional(v.any()),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const existingConnection = await ctx.db
      .query("integrations")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first();

    if (existingConnection) {
      await ctx.db.patch(existingConnection._id, {
        provider: args.provider,
        userId: args.userId,
        organizationId: args.organizationId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        tokenType: args.tokenType,
        scope: args.scope,
        accountName: args.accountName,
        accountEmail: args.accountEmail,
        externalAccountId: args.externalAccountId,
        status: args.status,
        metadata: args.metadata,
        updatedAt: now,
        lastCheckedAt: now,
        agentId: args.agentId,
      });
      return { success: true, id: existingConnection._id };
    } else {
      const id = await ctx.db.insert("integrations", {
        provider: args.provider,
        connectionId: args.connectionId,
        organizationId: args.organizationId,
        userId: args.userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        tokenType: args.tokenType,
        scope: args.scope,
        accountName: args.accountName,
        accountEmail: args.accountEmail,
        externalAccountId: args.externalAccountId,
        status: args.status,
        metadata: args.metadata,
        createdAt: now,
        updatedAt: now,
        lastCheckedAt: now,
        agentId: args.agentId,
      });
      return { success: true, id };
    }
  },
});

export const storeInitialConnection = mutation({
  args: {
    provider: v.string(),
    connectionId: v.string(),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = Date.now();

    const existingConnection = await ctx.db
      .query("integrations")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first();

    if (!existingConnection) {
      const id = await ctx.db.insert("integrations", {
        provider: args.provider,
        connectionId: args.connectionId,
        organizationId: args.organizationId,
        userId,
        status: "pending",
        accessToken: "",
        refreshToken: "",
        expiresAt: 0,
        tokenType: "",
        scope: "",
        accountName: "",
        accountEmail: "",
        externalAccountId: "",
        metadata: {},
        errorDetails: "",
        createdAt: now,
        updatedAt: now,
        lastCheckedAt: now,
        agentId: "",
      });
      return { success: true, id };
    }

    return { success: true, id: existingConnection._id };
  },
});

export const updateConnectionStatus = mutation({
  args: {
    connectionId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("error"),
      v.literal("expired")
    ),
    metadata: v.optional(v.any()),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const connection = await ctx.db
      .query("integrations")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first();

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    await ctx.db.patch(connection._id, {
      status: args.status,
      metadata: args.metadata,
      updatedAt: Date.now(),
      lastCheckedAt: Date.now(),
      agentId: args.agentId,
    });

    return { success: true };
  },
});

export const deleteIntegration = mutation({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgIds = identity.orgIds as string[] | undefined;
    const userId = identity.subject;

    const connection = await ctx.db
      .query("integrations")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first();

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    const isUserInOrg = (orgIds ?? []).some((orgId: string) => orgId === connection.organizationId);
    const connectionUserId = connection.userId.split(':')[0];

    if (connectionUserId !== userId && !isUserInOrg) {
      return { success: false, error: "Unauthorized" };
    }

    await ctx.db.delete(connection._id);
    return { success: true };
  },
});

export const checkConnectionStatus = action({
  args: {
    connectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const pipedreamApiKey = process.env.PIPEDREAM_API_KEY;

    if (!pipedreamApiKey) {
      return { success: false, error: "Missing Pipedream API key" };
    }

    try {
      const response = await fetch(`https://api.pipedream.com/v1/users/me/accounts/${args.connectionId}`, {
        headers: {
          Authorization: `Bearer ${pipedreamApiKey}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to check connection status: ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        status: mapConnectionStatus(data.status),
        metadata: data.metadata || {},
        account: {
          id: data.id,
          name: data.name,
          email: data.email,
          external_account_id: data.external_account_id,
          app: data.app,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Error checking connection: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

export const handleWebhook = mutation({
  args: {
    event: v.string(),
    connectionId: v.string(),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
    userId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const connection = await ctx.db
      .query("integrations")
      .withIndex("by_connectionId", (q) => q.eq("connectionId", args.connectionId))
      .first();

    const metadata = args.metadata || {};

    if (args.event === "CONNECTION_SUCCESS") {
      const updateData: {
        provider: string; // Explicitly typed as string
        status: "pending" | "active" | "error" | "expired";
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
        tokenType: string;
        scope: string;
        accountName: string;
        accountEmail: string;
        externalAccountId: string;
        metadata: any;
        updatedAt: number;
        lastCheckedAt: number;
        agentId: string;
      } = {
        provider: (metadata.provider as string) || "unknown", // Guaranteed to be string
        status: "active",
        accessToken: metadata.access_token || "",
        refreshToken: metadata.refresh_token || "",
        expiresAt: metadata.expires_at || 0,
        tokenType: metadata.token_type || "",
        scope: metadata.scope || "",
        accountName: metadata.account_name || "",
        accountEmail: metadata.account_email || "",
        externalAccountId: metadata.external_account_id || "",
        metadata,
        updatedAt: now,
        lastCheckedAt: now,
        agentId: args.agentId || "",
      };

      if (connection) {
        await ctx.db.patch(connection._id, updateData);
      } else if (args.userId && args.organizationId) {
        await ctx.db.insert("integrations", {
          connectionId: args.connectionId,
          userId: args.userId,
          organizationId: args.organizationId,
          provider: updateData.provider, // Now guaranteed to be string
          status: "active",
          accessToken: updateData.accessToken,
          refreshToken: updateData.refreshToken,
          expiresAt: updateData.expiresAt,
          tokenType: updateData.tokenType,
          scope: updateData.scope,
          accountName: updateData.accountName,
          accountEmail: updateData.accountEmail,
          externalAccountId: updateData.externalAccountId,
          metadata: updateData.metadata,
          createdAt: now,
          updatedAt: now,
          lastCheckedAt: now,
          agentId: updateData.agentId,
        });
      }
    } else if (args.event === "CONNECTION_ERROR") {
      if (connection) {
        await ctx.db.patch(connection._id, {
          status: "error",
          errorDetails: metadata.error || "Unknown error",
          metadata,
          updatedAt: now,
          lastCheckedAt: now,
        });
      } else if (args.userId && args.organizationId) {
        await ctx.db.insert("integrations", {
          provider: (metadata.provider as string) || "unknown",
          connectionId: args.connectionId,
          userId: args.userId,
          organizationId: args.organizationId,
          status: "error",
          errorDetails: metadata.error || "Unknown error",
          metadata,
          createdAt: now,
          updatedAt: now,
          lastCheckedAt: now,
          accessToken: "",
          refreshToken: "",
          expiresAt: 0,
          tokenType: "",
          scope: "",
          accountName: "",
          accountEmail: "",
          externalAccountId: "",
          agentId: args.agentId || "",
        });
      }
    } else if (args.event === "CONNECTION_DISCONNECTED") {
      if (connection) {
        await ctx.db.patch(connection._id, {
          status: "expired",
          metadata,
          updatedAt: now,
          lastCheckedAt: now,
        });
      } else if (args.userId && args.organizationId) {
        await ctx.db.insert("integrations", {
          provider: (metadata.provider as string) || "unknown",
          connectionId: args.connectionId,
          userId: args.userId,
          organizationId: args.organizationId,
          status: "expired",
          metadata,
          createdAt: now,
          updatedAt: now,
          lastCheckedAt: now,
          accessToken: "",
          refreshToken: "",
          expiresAt: 0,
          tokenType: "",
          scope: "",
          accountName: "",
          accountEmail: "",
          externalAccountId: "",
          agentId: args.agentId || "",
        });
      }
    } else {
      if (connection) {
        await ctx.db.patch(connection._id, {
          status: "pending",
          metadata: { unhandled_event: args.event, ...metadata },
          updatedAt: now,
          lastCheckedAt: now,
        });
      } else if (args.userId && args.organizationId) {
        await ctx.db.insert("integrations", {
          provider: (metadata.provider as string) || "unknown",
          connectionId: args.connectionId,
          userId: args.userId,
          organizationId: args.organizationId,
          status: "pending",
          metadata: { unhandled_event: args.event, ...metadata },
          createdAt: now,
          updatedAt: now,
          lastCheckedAt: now,
          accessToken: "",
          refreshToken: "",
          expiresAt: 0,
          tokenType: "",
          scope: "",
          accountName: "",
          accountEmail: "",
          externalAccountId: "",
          agentId: args.agentId || "",
        });
      }
    }

    return { success: true };
  },
});