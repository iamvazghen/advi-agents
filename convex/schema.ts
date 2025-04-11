import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    organizationId: v.string(), // Added to tie chats to organizations
    createdAt: v.number(),
    agentType: v.union(
      v.literal("code"),
      v.literal("data"),
      v.literal("math"),
      v.literal("research"),
      v.literal("stream"),
      v.literal("writing"),
      v.literal("sales"),
      v.literal("accountant"),
      v.literal("investor"),
      v.literal("business"),
      v.literal("productivity")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"]), // Index for efficient filtering

  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
    isLiked: v.optional(v.boolean()),
    isDisliked: v.optional(v.boolean()),
  }).index("by_chat", ["chatId"]),

  automations: defineTable({
    userId: v.string(),
    organizationId: v.string(), // Added to tie automations to organizations
    type: v.string(), // "dailyReport", "weeklySummary", or "dataBackup"
    enabled: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_and_type", ["userId", "type"])
    .index("by_org_and_type", ["organizationId", "type"]), // New index for organization-specific queries

    paragon_integrations: defineTable({
      userId: v.string(),      // User ID
      organizationId: v.string(), // Organization/team ID
      type: v.string(),        // e.g., "notion", "slack", "hubspot"
      enabled: v.boolean(),    // Whether the integration is enabled
      scopes: v.array(v.string()), // Available permission scopes
      lastUpdated: v.number(), // Timestamp of last update
      metadata: v.any(),       // Additional integration-specific data
      
      // Additional fields for team management
      isOrgWide: v.optional(v.boolean()), // Whether this integration is available org-wide
      allowedUserIds: v.optional(v.array(v.string())), // Specific users who can access this integration
      createdBy: v.optional(v.string()),  // User who created the integration
      createdAt: v.optional(v.number()), // Creation timestamp
    })
    // Define indexes for faster queries
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_organization", ["userId", "organizationId"])
    .index("by_user_organization_type", ["userId", "organizationId", "type"])
    .index("by_organization_type", ["organizationId", "type"]),

  

      userData: defineTable({
        userId: v.string(),
        organizationId: v.string(),
        // Company Information
        companyName: v.string(),
        targetedAudience: v.string(),
        companyShortTermGoals: v.string(),
        companyLongTermGoals: v.string(),
        companyAdditionalContext: v.string(),
        // User Information
        userFullName: v.string(),
        userShortTermGoals: v.string(),
        userLongTermGoals: v.string(),
        userAdditionalContext: v.string(),
        // Files
        files: v.array(
          v.object({
            name: v.string(),
            type: v.string(),
            size: v.number(),
            storageId: v.string(),
            // Note that content is now required, not optional
            content: v.string(),
            uploadedAt: v.number(),
            metadata: v.optional(
              v.object({
                title: v.optional(v.string()),
                author: v.optional(v.string()),
                subject: v.optional(v.string()),
                keywords: v.optional(v.string()),
                creator: v.optional(v.string()),
                producer: v.optional(v.string()),
                creationDate: v.optional(v.string()),
                modificationDate: v.optional(v.string()),
                pageCount: v.optional(v.number()),
                version: v.optional(v.string()),
                truncated: v.optional(v.boolean()),
                originalTokenCount: v.optional(v.number()),
              })
            ),
          })
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_organization", ["organizationId"])
        .index("by_user_and_organization", ["userId", "organizationId"]),

  teams: defineTable({
    organizationId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    nextBillingDate: v.optional(v.number()),
  }).index("by_organizationId", ["organizationId"]),

  stripeData: defineTable({
    userId: v.optional(v.string()), // For user-specific data
    organizationId: v.optional(v.string()), // For team-specific data
    stripeCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    nextBillingDate: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    priceId: v.optional(v.string()), // Added priceId field
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["organizationId"]),
});
