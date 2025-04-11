import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createChat = mutation({
  args: v.object({
    title: v.string(),
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
    organizationId: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("createChat: No identity found");
      throw new Error("Not authenticated");
    }

    const authOrgId = identity.organizationId;
    console.log("createChat - authOrgId:", authOrgId, "args.organizationId:", args.organizationId);

    if (!authOrgId) {
      console.warn("createChat: No organization in session, using args.organizationId:", args.organizationId);
    } else if (authOrgId !== args.organizationId) {
      console.warn("createChat: Organization mismatch, using args.organizationId:", {
        authOrgId,
        argsOrgId: args.organizationId,
      });
    }

    const chat = await ctx.db.insert("chats", {
      title: args.title,
      userId: identity.subject,
      organizationId: args.organizationId,
      createdAt: Date.now(),
      agentType: args.agentType,
    });

    console.log("Chat created with ID:", chat);
    return chat;
  },
});

export const listChats = query({
  args: v.object({
    agentType: v.optional(
      v.union(
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
      )
    ),
    orgId: v.optional(v.string()), // Add orgId as optional fallback
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("listChats: No identity found");
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("listChats: No organization in session or args");
      return [];
    }

    let query = ctx.db
      .query("chats")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId as string));

    if (args.agentType) {
      query = query.filter((q) => q.eq(q.field("agentType"), args.agentType));
    }

    const chats = await query.order("desc").collect();
    return chats;
  },
});

export const deleteChat = mutation({
  args: v.object({
    id: v.id("chats"),
    orgId: v.optional(v.string()) // Add optional orgId parameter
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("deleteChat: No identity found");
      throw new Error("Not authenticated");
    }

    // Use organization ID from identity or from args as fallback
    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.error("deleteChat: No organization in session or args");
      throw new Error("No organization selected");
    }

    const chat = await ctx.db.get(args.id);
    if (!chat) {
      console.error("deleteChat: Chat not found for ID:", args.id);
      throw new Error("Chat not found");
    }
    
    // Check if user has permission to delete this chat
    if (chat.userId !== identity.subject || chat.organizationId !== organizationId) {
      console.error("deleteChat: Unauthorized access", {
        chatUserId: chat.userId,
        identitySubject: identity.subject,
        chatOrgId: chat.organizationId,
        requestOrgId: organizationId
      });
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const renameChat = mutation({
  args: v.object({
    id: v.id("chats"),
    title: v.string(),
    orgId: v.optional(v.string()), // Add optional orgId parameter
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("renameChat: No identity found");
      throw new Error("Not authenticated");
    }

    // Use organization ID from identity or from args as fallback
    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.error("renameChat: No organization in session or args");
      throw new Error("No organization selected");
    }

    const chat = await ctx.db.get(args.id);
    if (!chat) {
      console.error("renameChat: Chat not found for ID:", args.id);
      throw new Error("Chat not found");
    }
    
    // Check if user has permission to rename this chat
    if (chat.userId !== identity.subject || chat.organizationId !== organizationId) {
      console.error("renameChat: Unauthorized access", {
        chatUserId: chat.userId,
        identitySubject: identity.subject,
        chatOrgId: chat.organizationId,
        requestOrgId: organizationId
      });
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { title: args.title });
    return args.title;
  },
});

export const getChat = query({
  args: v.object({
    id: v.id("chats"),
    userId: v.string(),
    orgId: v.string(), // Changed from organizationId to orgId to match frontend
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("getChat: No identity found for chatId:", args.id);
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("getChat: No organization in session or args for chatId:", args.id);
      return null;
    }

    const chat = await ctx.db.get(args.id);
    if (!chat) {
      console.log("getChat: Chat not found for ID:", args.id);
      return null;
    }

    if (chat.userId !== args.userId || chat.organizationId !== organizationId) {
      console.log("getChat: Unauthorized or mismatch", {
        chatId: args.id,
        chatUserId: chat.userId,
        chatOrgId: chat.organizationId,
        requestUserId: args.userId,
        requestOrgId: organizationId,
      });
      return null;
    }

    console.log("getChat: Chat found for ID:", args.id);
    return chat;
  },
});
