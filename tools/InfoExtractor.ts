import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const AUTH_TOKEN = 'f8428e38b2c4-419a-b29f-dc8208dc1a6e:sk-M2RkZDMyYzktN2Y2Ni00YTU2LTk3YTctZDc1MTY4ZTY1OGM1';
const API_ENDPOINT = 'https://api-d7b62b.stack.tryrelevance.com/latest/studios/4398ada9-2b0f-4bb1-9cd2-16ec9bf1908c/trigger_limited';

// Define the tool using DynamicStructuredTool with proper schema
export const infoExtractorTool = new DynamicStructuredTool({
  name: "info_extractor",
  description: "Extract specific information from any website on the internet.",
  schema: z.object({
    url: z.string().describe("The URL of the website to extract information from"),
    objectOfScrape: z.string().describe("What specific information you want to extract from the website"),
  }),
  func: async ({ url, objectOfScrape }) => {
    console.log("🔍 Starting info extraction with:", { url, objectOfScrape });
    
    const payload = {
      params: {
        url: url,
        object_of_scrape: objectOfScrape,
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
      console.error("❌ Error in info extraction tool:", error);
      if (error instanceof Error) {
        throw new Error(`Info extraction failed: ${error.message}`);
      }
      throw new Error("Info extraction failed with an unknown error");
    }
  },
});