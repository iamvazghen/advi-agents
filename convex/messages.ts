import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHOW_COMMENTS = true;

export const list = query({
  args: {
    chatId: v.id("chats"),
    orgId: v.optional(v.string()), // Add orgId as optional fallback
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("list: No organization in session or args for chatId:", args.chatId);
      throw new Error("No organization provided");
    }

    // Verify the chat belongs to the organization
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    if (SHOW_COMMENTS) {
      console.log("📜 Retrieved messages:", {
        chatId: args.chatId,
        count: messages.length,
      });
    }

    return messages;
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    orgId: v.optional(v.string()), // Add orgId as optional
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("📤 Sending message:", {
        chatId: args.chatId,
        content: args.content,
        orgId: args.orgId,
      });
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("send: No organization in session or args for chatId:", args.chatId);
      throw new Error("No organization provided");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== identity.subject || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    // Save the user message with preserved newlines
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      createdAt: Date.now(),
      isLiked: false,
      isDisliked: false,
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Saved user message:", {
        messageId,
        chatId: args.chatId,
      });
    }

    return messageId;
  },
});

export const store = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    orgId: v.optional(v.string()), // Add orgId as optional
  },
  handler: async (ctx, args) => {
    if (SHOW_COMMENTS) {
      console.log("💾 Storing message:", {
        chatId: args.chatId,
        role: args.role,
        contentLength: args.content.length,
        orgId: args.orgId,
      });
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("store: No organization in session or args for chatId:", args.chatId);
      throw new Error("No organization provided");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    // Store message with preserved newlines
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: args.role,
      createdAt: Date.now(),
      isLiked: false,
      isDisliked: false,
    });

    if (SHOW_COMMENTS) {
      console.log("✅ Stored message:", {
        messageId,
        chatId: args.chatId,
        role: args.role,
      });
    }

    return messageId;
  },
});

export const getLastMessage = query({
  args: {
    chatId: v.id("chats"),
    orgId: v.optional(v.string()), // Add orgId as optional fallback
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("getLastMessage: No organization in session or args for chatId:", args.chatId);
      throw new Error("No organization provided");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== identity.subject || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return messages;
  },
});

export const likeMessage = mutation({
  args: {
    messageId: v.id("messages"),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("likeMessage: No organization in session or args for messageId:", args.messageId);
      throw new Error("No organization provided");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Get the chat to verify authorization
    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    // Update the message to be liked and not disliked
    await ctx.db.patch(args.messageId, {
      isLiked: true,
      isDisliked: false,
    });

    if (SHOW_COMMENTS) {
      console.log("👍 Liked message:", {
        messageId: args.messageId,
        chatId: message.chatId,
      });
    }

    return true;
  },
});

export const dislikeMessage = mutation({
  args: {
    messageId: v.id("messages"),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const organizationId = identity.organizationId || args.orgId;
    if (!organizationId) {
      console.warn("dislikeMessage: No organization in session or args for messageId:", args.messageId);
      throw new Error("No organization provided");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Get the chat to verify authorization
    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.organizationId !== organizationId) {
      throw new Error("Unauthorized");
    }

    // Update the message to be disliked and not liked
    await ctx.db.patch(args.messageId, {
      isLiked: false,
      isDisliked: true,
    });

    if (SHOW_COMMENTS) {
      console.log("👎 Disliked message:", {
        messageId: args.messageId,
        chatId: message.chatId,
      });
    }

    return true;
  },
});