import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

const AUTOMATION_TYPES = [
  "dailyReport", 
  "weeklySummary", 
  "dataBackup",
  "slackNotifications",
  "whatsappNotifications",
  "teamsNotifications"
] as const;
type AutomationType = typeof AUTOMATION_TYPES[number];

interface AutomationSettings {
  dailyReport: boolean;
  weeklySummary: boolean;
  dataBackup: boolean;
  slackNotifications: boolean;
  whatsappNotifications: boolean;
  teamsNotifications: boolean;
}

export const getSettings = query({
  args: {
    organizationId: v.string(),
    userId: v.optional(v.string())
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // If userId is provided, ensure the requester is authorized
    if (args.userId && identity.subject !== args.userId) {
      throw new Error("Unauthorized: User ID does not match authenticated user");
    }
    
    const userId = args.userId || identity.subject;

    // Query all automation types for this user and organization
    const automations = await Promise.all(
      AUTOMATION_TYPES.map(async (type) => {
        // Try to find by organization and type first
        let automation = await db
          .query("automations")
          .withIndex("by_org_and_type", (q) =>
            q.eq("organizationId", args.organizationId).eq("type", type)
          )
          .first();
          
        // If not found and userId is provided, try to find by user and type
        if (!automation && userId) {
          automation = await db
            .query("automations")
            .withIndex("by_user_and_type", (q) =>
              q.eq("userId", userId).eq("type", type)
            )
            .first();
        }

        return {
          type,
          enabled: automation?.enabled ?? false
        };
      })
    );

    // Convert to the expected format for the frontend
    const settings: AutomationSettings = {
      dailyReport: automations.find(a => a.type === "dailyReport")?.enabled ?? false,
      weeklySummary: automations.find(a => a.type === "weeklySummary")?.enabled ?? false,
      dataBackup: automations.find(a => a.type === "dataBackup")?.enabled ?? false,
      slackNotifications: automations.find(a => a.type === "slackNotifications")?.enabled ?? false,
      whatsappNotifications: automations.find(a => a.type === "whatsappNotifications")?.enabled ?? false,
      teamsNotifications: automations.find(a => a.type === "teamsNotifications")?.enabled ?? false,
    };

    return settings;
  }
});

export const updateSettings = mutation({
  args: {
    organizationId: v.string(),
    userId: v.optional(v.string()),
    newSettings: v.object({
      dailyReport: v.optional(v.boolean()),
      weeklySummary: v.optional(v.boolean()),
      dataBackup: v.optional(v.boolean()),
    }),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // If userId is provided, ensure the requester is authorized
    if (args.userId && identity.subject !== args.userId) {
      throw new Error("Unauthorized: User ID does not match authenticated user");
    }
    
    const userId = args.userId || identity.subject;
    const { organizationId, newSettings } = args;

    // Update each automation type that was provided in newSettings
    const updates = await Promise.all(
      (Object.entries(newSettings) as [AutomationType, boolean][]).map(
        async ([type, enabled]) => {
          // Try to find by organization and type first
          let automation = await db
            .query("automations")
            .withIndex("by_org_and_type", (q) =>
              q.eq("organizationId", organizationId).eq("type", type)
            )
            .first();
            
          // If not found and userId is provided, try to find by user and type
          if (!automation && userId) {
            automation = await db
              .query("automations")
              .withIndex("by_user_and_type", (q) =>
                q.eq("userId", userId).eq("type", type)
              )
              .first();
          }

          if (!automation) {
            // Create if it doesn't exist
            const newAutomation: Omit<Doc<"automations">, "_id" | "_creationTime"> = {
              userId,
              organizationId,
              type,
              enabled,
              createdAt: Date.now(),
            };
            const id = await db.insert("automations", newAutomation);
            return { type, enabled };
          }

          // Update existing automation
          await db.patch(automation._id, { enabled });
          return { type, enabled };
        }
      )
    );

    // Return the full settings object
    const settings: AutomationSettings = {
      dailyReport: updates.find(a => a.type === "dailyReport")?.enabled ?? false,
      weeklySummary: updates.find(a => a.type === "weeklySummary")?.enabled ?? false,
      dataBackup: updates.find(a => a.type === "dataBackup")?.enabled ?? false,
      slackNotifications: updates.find(a => a.type === "slackNotifications")?.enabled ?? false,
      whatsappNotifications: updates.find(a => a.type === "whatsappNotifications")?.enabled ?? false,
      teamsNotifications: updates.find(a => a.type === "teamsNotifications")?.enabled ?? false,
    };

    return settings;
  }
});
