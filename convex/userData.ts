//convex/userData.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserData = query({
  args: {
    userId: v.string(),
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    // Find by user ID and organization ID combination
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();
    
    if (userData) {
      return userData;
    }
    
    // If not found with the specific combination, return null
    // This ensures we only get data for the specific user and organization
    return null;
  },
});

export const getUserFiles = query({
  args: {
    userId: v.string(),
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    // Find by user ID and organization ID combination
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();
      
    // Return files only if found for the specific user and organization
    return userData?.files || [];
  },
});

export const verifyFileAccess = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();

    if (!userData) {
      return null;
    }

    // Find the file in the user's files array
    const file = userData.files.find(file => file.storageId === args.storageId);
    
    // Return the file metadata if found, null otherwise
    return file || null;
  },
});

export const getFileByStorageId = query({
  args: {
    storageId: v.string(),
    organizationId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If both userId and organizationId are provided, try to find in that specific combination first
    if (args.userId && args.organizationId) {
      const userData = await ctx.db
        .query("userData")
        .withIndex("by_user_and_organization", (q) =>
          q.eq("userId", args.userId as string)
           .eq("organizationId", args.organizationId as string)
        )
        .first();
      
      if (userData) {
        const file = userData.files.find(file => file.storageId === args.storageId);
        if (file) {
          return file;
        }
      }
    }
    // If only organizationId is provided, try to find in that specific organization
    else if (args.organizationId) {
      const userData = await ctx.db
        .query("userData")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", args.organizationId as string)
        )
        .first();
      
      if (userData) {
        const file = userData.files.find(file => file.storageId === args.storageId);
        if (file) {
          return file;
        }
      }
    }
    
    // If not found or no specific identifiers provided, search in all organizations
    // This is a fallback for backward compatibility with existing tools
    const allUserData = await ctx.db.query("userData").collect();
    
    for (const userData of allUserData) {
      const file = userData.files.find(file => file.storageId === args.storageId);
      if (file) {
        return file;
      }
    }
    
    // Return null if file not found
    return null;
  },
});

export const upsertUserData = mutation({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    companyName: v.string(),
    targetedAudience: v.string(),
    companyShortTermGoals: v.string(),
    companyLongTermGoals: v.string(),
    companyAdditionalContext: v.string(),
    userFullName: v.string(),
    userShortTermGoals: v.string(),
    userLongTermGoals: v.string(),
    userAdditionalContext: v.string(),
  },
  handler: async (ctx, args) => {
    // Look for existing data with the specific user and organization combination
    const existing = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        companyName: args.companyName,
        targetedAudience: args.targetedAudience,
        companyShortTermGoals: args.companyShortTermGoals,
        companyLongTermGoals: args.companyLongTermGoals,
        companyAdditionalContext: args.companyAdditionalContext,
        userFullName: args.userFullName,
        userShortTermGoals: args.userShortTermGoals,
        userLongTermGoals: args.userLongTermGoals,
        userAdditionalContext: args.userAdditionalContext,
        updatedAt: Date.now(),
      });
    }

    // Create new entry for this specific user and organization combination
    return await ctx.db.insert("userData", {
      userId: args.userId,
      organizationId: args.organizationId,
      companyName: args.companyName,
      targetedAudience: args.targetedAudience,
      companyShortTermGoals: args.companyShortTermGoals,
      companyLongTermGoals: args.companyLongTermGoals,
      companyAdditionalContext: args.companyAdditionalContext,
      userFullName: args.userFullName,
      userShortTermGoals: args.userShortTermGoals,
      userLongTermGoals: args.userLongTermGoals,
      userAdditionalContext: args.userAdditionalContext,
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const addFile = mutation({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    file: v.object({
      name: v.string(),
      type: v.string(),
      size: v.number(),
      storageId: v.string(),
      content: v.string(),
      metadata: v.object({
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
        originalTokenCount: v.optional(v.number())
      })
    }),
  },
  handler: async (ctx, args) => {
    // Find user data with the specific user and organization combination
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();

    if (!userData) {
      throw new Error("User data not found for this user and organization");
    }

    return await ctx.db.patch(userData._id, {
      files: [...userData.files, { ...args.file, uploadedAt: Date.now() }],
      updatedAt: Date.now(),
    });
  },
});

export const removeFile = mutation({
  args: {
    userId: v.string(),
    organizationId: v.string(),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user data with the specific user and organization combination
    const userData = await ctx.db
      .query("userData")
      .withIndex("by_user_and_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId)
      )
      .first();

    if (!userData) {
      throw new Error("User data not found for this user and organization");
    }

    return await ctx.db.patch(userData._id, {
      files: userData.files.filter((file) => file.storageId !== args.storageId),
      updatedAt: Date.now(),
    });
  },
});