import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const AUTH_TOKEN = 'f8428e38b2c4-419a-b29f-dc8208dc1a6e:sk-M2RkZDMyYzktN2Y2Ni00YTU2LTk3YTctZDc1MTY4ZTY1OGM1';
const API_ENDPOINT = 'https://api-d7b62b.stack.tryrelevance.com/latest/studios/37557271-2dd8-4fda-955a-5e8b096fe91a/trigger_limited';

// Define the tool using DynamicStructuredTool with proper schema
export const googleSearchTool = new DynamicStructuredTool({
  name: "google_search",
  description: "Search Google for recent information. You can specify how many days back to search.",
  schema: z.object({
    query: z.string().describe("The search query to look up"),
    pastDays: z.number().optional().describe("Number of past days to search in (default: 730)"),
  }),
  func: async ({ query, pastDays = 0 }) => {
    console.log("🔍 Starting Google search with:", { query, pastDays });
    
    const payload = {
      params: {
        past_x_days_news: pastDays,
        search_query: query,
      },
      project: "f8428e38b2c4-419a-b29f-dc8208dc1a6e",
    };

    try {
      console.log("📡 Making API request to:", API_ENDPOINT);
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_TOKEN,
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status);
      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}: ${responseText}`);
      }

      try {
        const result = JSON.parse(responseText);
        console.log("✅ Successfully parsed response");
        return JSON.stringify(result, null, 2);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        throw new Error(`Failed to parse API response: ${responseText}`);
      }
    } catch (error) {
      console.error("❌ Error in Google search tool:", error);
      if (error instanceof Error) {
        throw new Error(`Google search failed: ${error.message}`);
      }
      throw new Error("Google search failed with an unknown error");
    }
  },
});