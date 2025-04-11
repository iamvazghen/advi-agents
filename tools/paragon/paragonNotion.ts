import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { RunnableConfig } from "@langchain/core/runnables";

// Define the schema for the tool
const ParagonNotionSchema = z.object({
  action: z
    .enum(["check_connection", "get_permissions", "create_page"])
    .default("check_connection")
    .describe("The action to perform with Notion via Paragon"),
  pageContent: z
    .string()
    .optional()
    .describe("Content for creating a new Notion page (required if action is 'create_page')"),
});

// Define the tool using DynamicStructuredTool
export const paragonNotionTool = new DynamicStructuredTool({
  name: "paragon_notion",
  description: `Tool to interact with Notion via Paragon in an enterprise team context. Can check if Notion is connected, retrieve permission scopes, or create a page for the user's current team. Uses server-side API calls to fetch integrations for the user and their active organization, adapting to team switches. Ideal for managing Notion-related tasks within email and copywriting workflows.

Parameters:
- action (required): The action to perform ("check_connection", "get_permissions", "create_page"), defaults to "check_connection"
- pageContent (optional): The content for creating a new Notion page (required if action is "create_page")

Example Usage:
- Check connection: { "action": "check_connection" }
- Get permissions: { "action": "get_permissions" }
- Create page: { "action": "create_page", "pageContent": "Team Meeting Notes - April 2025" }

Best practices:
- Before creating pages or using Notion features, first check if the connection is active
- Always check the response's "success" field to determine if the operation succeeded
- Handle different response outcomes appropriately based on success/failure
- If Notion isn't connected, offer to guide the user through setting up the connection

Context handling:
- The tool automatically extracts user and organization context from the conversation
- No need to manually provide userId or organizationId in most cases
- For debugging, the response will include the userId and organizationId that were used

Available Actions:
1. "check_connection": Verifies if Notion is connected for the user's current team
   - Returns: Success or failure with appropriate message
   - Example success: "Notion is connected via Paragon for your current team."
   - Example failure: "Notion is not currently connected to your account."
2. "get_permissions": Retrieves Notion permission scopes for the current team
   - Returns: List of permission scopes if connection exists
   - Only use if connection is confirmed
3. "create_page": Creates a new page in Notion for the current team
   - Requires: pageContent parameter with the content to add to the page
   - Returns success or failure with page ID when successful
   - Example success: "Notion page created successfully!"

Error Handling:
- Connection missing: "Notion is not currently connected to your account."
- Missing content: "Page content is required to create a Notion page."
- Authentication errors: "Failed to retrieve Paragon authentication token."
- If errors persist, suggest contacting support or checking team permissions

Returns JSON with fields: success, message, and action-specific data (e.g., integrationId, scopes, pageId, userId, organizationId).`,
  schema: ParagonNotionSchema,
  func: async (
    { action, pageContent }: z.infer<typeof ParagonNotionSchema>,
    runManager?: CallbackManagerForToolRun,
    config?: RunnableConfig
  ) => {
    try {
      // Extract user and organization IDs from the provided context
      let userId: string | undefined;
      let organizationId: string | undefined;

      console.log("Tool execution context:", {
        hasConfig: !!config,
        configKeys: config ? Object.keys(config) : [],
        hasRunManager: !!runManager
      });
      
      // Try to get IDs from configurable property
      if (config && 'configurable' in config && config.configurable) {
        const configObj = config.configurable as Record<string, any>;
        userId = configObj.user_id as string | undefined;
        organizationId = configObj.organization_id as string | undefined;
        console.log("Using user/org from config.configurable:", { userId, organizationId });
      }
      
      // If still missing, check for thread_id in the configurable and use it to fetch user/org
      if ((!userId || !organizationId) && config && 'configurable' in config && config.configurable) {
        const configObj = config.configurable as Record<string, any>;
        const threadId = configObj.thread_id as string | undefined;
        
        if (threadId) {
          console.log("Attempting to extract user/org from thread ID:", threadId);
          
          try {
            // You may need to implement a function to get user/org from thread ID
            const threadInfo = await getThreadInfo(threadId);
            if (threadInfo) {
              userId = threadInfo.userId;
              organizationId = threadInfo.organizationId;
              console.log("Retrieved user/org from thread ID:", { userId, organizationId });
            }
          } catch (error) {
            console.error("Error retrieving thread info:", error);
          }
        }
      }
      
      // Try to access tags from runManager if available (newer LangChain API)
      if ((!userId || !organizationId) && runManager && 'tags' in runManager) {
        const tags = (runManager as any).tags as string[] | undefined;
        if (tags) {
          // Look for tags that might contain user/org info
          // Often formatted as "user_id:123" or similar
          console.log("Available tags:", tags);
          
          for (const tag of tags) {
            if (tag.startsWith('user_id:')) {
              userId = tag.split(':')[1];
            }
            if (tag.startsWith('organization_id:')) {
              organizationId = tag.split(':')[1];
            }
          }
          
          if (userId || organizationId) {
            console.log("Extracted from tags:", { userId, organizationId });
          }
        }
      }
      
      // Check config.callbacks as a last resort (some implementations store metadata here)
      if ((!userId || !organizationId) && config && 'callbacks' in config && config.callbacks) {
        // This is a bit of a hack, but sometimes metadata is stored as a property
        const callbackObj = config.callbacks as any;
        if (callbackObj && typeof callbackObj === 'object') {
          // Try to find user/org in various common locations
          if (!userId && 'user_id' in callbackObj) {
            userId = callbackObj.user_id as string;
          }
          if (!organizationId && 'organization_id' in callbackObj) {
            organizationId = callbackObj.organization_id as string;
          }
          
          // Some implementations use a metadata property
          if (callbackObj.metadata && typeof callbackObj.metadata === 'object') {
            if (!userId && 'user_id' in callbackObj.metadata) {
              userId = callbackObj.metadata.user_id as string;
            }
            if (!organizationId && 'organization_id' in callbackObj.metadata) {
              organizationId = callbackObj.metadata.organization_id as string;
            }
          }
          
          if (userId || organizationId) {
            console.log("Extracted from callbacks:", { userId, organizationId });
          }
        }
      }

      // Log debug info if still missing
      if (!userId || !organizationId) {
        console.error("Missing userId or organizationId:", { 
          userId, 
          organizationId,
          config: JSON.stringify(config, null, 2)
        });
        
        return JSON.stringify({
          success: false,
          message: "Cannot access Notion: User ID or Organization ID missing. Please contact support if this persists.",
          debug: {
            missingUserID: !userId,
            missingOrgID: !organizationId,
            availableContext: {
              hasConfig: !!config,
              hasConfigurableObject: !!(config && 'configurable' in config && config.configurable),
              hasRunManager: !!runManager
            }
          }
        });
      }

      // We'll use the proxy endpoint which handles token generation internally
      let notionIntegration = null;
      
      try {
        // Fetch and validate Notion integration for user:organization
        notionIntegration = await getNotionIntegration(userId, organizationId);
        
        if (!notionIntegration) {
          console.log(`No Notion integration found for ${userId}:${organizationId}`);
          return JSON.stringify({
            success: false,
            message: "Notion is not currently connected to your account. Would you like me to guide you through setting up the connection?",
            userId,
            organizationId,
            status: "not_connected"
          });
        }
      } catch (error) {
        // If we get an authentication error, return a more helpful message
        console.error("Authentication error with Paragon:", error);
        
        // Check if it's a 401 Unauthorized error
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isAuthError = errorMessage.includes("401") ||
                           errorMessage.includes("Unauthorized") ||
                           errorMessage.includes("Authentication");
        
        if (isAuthError) {
          return JSON.stringify({
            success: false,
            message: "Notion is not currently connected to your account. Would you like me to guide you through setting up the connection?",
            userId,
            organizationId,
            status: "auth_error",
            error: "Authentication error with Paragon API"
          });
        }
        
        // For other errors, provide a different message
        return JSON.stringify({
          success: false,
          message: "I encountered an issue connecting to Notion. Would you like me to help you troubleshoot the connection?",
          userId,
          organizationId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }

      // Handle the requested action
      switch (action) {
        case "check_connection":
          return JSON.stringify({
            success: true,
            message: "Notion is connected via Paragon for your current team.",
            integrationId: notionIntegration?.id || "unknown",
            userId,
            organizationId,
          });
        case "get_permissions":
          const scopes = notionIntegration?.scopes || ["Unknown scopes"];
          return JSON.stringify({
            success: true,
            message: "Notion permission scopes retrieved for your current team.",
            scopes,
            userId,
            organizationId,
          });
        case "create_page":
          if (!pageContent) {
            return JSON.stringify({
              success: false,
              message: "Page content is required to create a Notion page.",
            });
          }
          return await createPage(pageContent, userId, organizationId);
        default:
          return JSON.stringify({
            success: false,
            message: "Invalid action specified.",
          });
      }
    } catch (error) {
      console.error("Error in paragon_notion tool:", error);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      
      return JSON.stringify({
        success: false,
        message: "Sorry, there was an error checking your Notion connection. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
});

// Function to get thread info (userId and organizationId) from thread ID
// This is a placeholder - implement actual database access logic
async function getThreadInfo(threadId: string): Promise<{ userId: string; organizationId: string } | null> {
  try {
    // You would replace this with your actual database query
    // For example, using Convex client to query thread information
    
    // Mock implementation for now
    console.log(`Attempting to get thread info for thread: ${threadId}`);
    
    // If you're using Convex, you might do something like:
    // const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    // const convexClient = new ConvexHttpClient(convexUrl);
    // const threadData = await convexClient.query(api.chats.getChat, { chatId: threadId });
    
    // For now, return null as this is just a placeholder
    return null;
  } catch (error) {
    console.error("Error fetching thread info:", error);
    return null;
  }
}

// Fetch Paragon token server-side using /api/paragon-token
async function getParagonToken(userId: string, organizationId?: string): Promise<string | null> {
  try {
    // Determine the base URL for API calls (works in both development and production)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : '');
    
    // Use combined format if organizationId is provided, matching ParagonIntegration.tsx
    const queryUserId = organizationId ? `${userId}:${organizationId}` : userId;
    const url = `${baseUrl}/api/paragon-token?userId=${encodeURIComponent(queryUserId)}`;
    console.log("Fetching Paragon token from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error("Failed to fetch Paragon token:", response.status, response.statusText);
      return null;
    }
    
    const { token } = await response.json();
    console.log("Paragon token fetch response:", token ? "Token received" : "No token");
    return token || null;
  } catch (error) {
    console.error("Error fetching Paragon token:", error);
    return null;
  }
}

// Fetch Notion integration for the specific user:organization
async function getNotionIntegration(
  userId: string,
  organizationId: string
): Promise<any | null> {
  try {
    console.log(`Fetching Notion integration for ${userId}:${organizationId}`);
    
    // Validate inputs
    if (!userId || !organizationId) {
      throw new Error("Missing userId or organizationId for Paragon API request");
    }
    
    // Use our proxy endpoint to fetch integrations
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : '');
    
    // Make sure we're using the correct format for userId and organizationId
    const response = await fetch(`${baseUrl}/api/paragon-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId.trim(),
        organizationId: organizationId.trim(),
        endpoint: "integrations", // This will be mapped to the correct URL in the proxy
        method: "GET"
      }),
    });
    
    console.log("Sent request to proxy endpoint for integrations");
    
    // Get response data regardless of status
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error("Could not parse response:", parseError);
      responseData = null;
    }
    
    if (!response.ok) {
      console.error("Failed to fetch integrations:", response.status, response.statusText);
      console.error("Error response data:", responseData);
      
      // If we get a 401, throw a specific error with details
      if (response.status === 401) {
        throw new Error(`Authentication failed with Paragon API (401 Unauthorized). Details: ${JSON.stringify(responseData)}`);
      }
      
      // For other errors, throw a generic error
      throw new Error(`Failed to fetch integrations: ${response.status} ${response.statusText}`);
    }
    
    // If we got here, the response was successful but might be empty
    if (!responseData || !Array.isArray(responseData)) {
      console.log("No integrations found or invalid response format");
      return null;
    }
    
    const integrations = await response.json();
    console.log(`Retrieved ${integrations.length} integrations from Paragon`);
    
    // Find Notion integration
    const notionIntegration = integrations.find(
      (integration: any) => integration.type === "notion" && integration.enabled
    );
    
    if (notionIntegration) {
      console.log("Found active Notion integration:", notionIntegration.id);
      return notionIntegration;
    }
    
    console.log("No active Notion integration found");
    return null;
  } catch (error) {
    console.error("Error fetching Notion integration:", error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
    
    return null;
  }
}

// Create a page in Notion
async function createPage(
  content: string,
  userId: string,
  organizationId: string
): Promise<string> {
  
  const notionIntegration = await getNotionIntegration(userId, organizationId);
  if (!notionIntegration) {
    return JSON.stringify({
      success: false,
      message: "Cannot create page: Notion is not connected to your account.",
      userId,
      organizationId
    });
  }

  try {
    console.log(`Creating Notion page with content length: ${content.length} characters`);
    
    // Use our proxy endpoint to create the page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : '');
    
    const response = await fetch(`${baseUrl}/api/paragon-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        organizationId,
        endpoint: "actions", // This will be mapped to the correct URL in the proxy
        method: "POST",
        data: {
          action: "NOTION_CREATE_PAGE",
          parameters: {
            content,
            userId: `${userId}:${organizationId}`, // Ensure team context
          },
        }
      }),
    });
    
    console.log("Sent request to proxy endpoint for creating page");
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("Failed to create Notion page:", result);
      
      // Log more detailed error information
      console.error("Error details:", {
        status: response.status,
        statusText: response.statusText,
        result: JSON.stringify(result)
      });
      
      return JSON.stringify({
        success: false,
        message: "Failed to create Notion page. Please check your Notion permissions and try again.",
        error: result.error || "Unknown error",
        status: response.status
      });
    }

    return JSON.stringify({
      success: true,
      message: "Notion page created successfully!",
      pageId: result.pageId || "Unknown page ID",
      userId,
      organizationId,
    });
  } catch (error) {
    console.error("Error creating Notion page:", error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
    
    return JSON.stringify({
      success: false,
      message: "There was an error creating your Notion page. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}