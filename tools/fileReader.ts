import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Define the tool using DynamicStructuredTool with proper schema
export const fileReaderTool = new DynamicStructuredTool({
  name: "file_reader",
  description: "Read content from files uploaded by the user",
  schema: z.object({
    storageId: z.string().describe("The unique storage ID of the file to read (format: file-timestamp-filename)"),
  }),
  func: async ({ storageId }) => {
    console.log("📚 Starting file read with storageId:", storageId);
    
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined in environment variables");
      }

      // Create a Convex client
      const convexClient = new ConvexHttpClient(convexUrl);
      
      console.log("📡 Querying file content from Convex");
      
      // Use GraphQL-like query format for consistency with system message instructions
      const file = await convexClient.query(api.userData.getFileByStorageId, {
        storageId,
      });
      
      const result = {
        readFile: file
      };
      
      if (!result.readFile) {
        throw new Error(`File not found with storageId: ${storageId}`);
      }
      
      console.log("✅ Successfully retrieved file:", result.readFile.name);
      
      return JSON.stringify({
        content: result.readFile.content || "No content available",
        mimeType: result.readFile.type || "text/plain",
        fileName: result.readFile.name,
        metadata: result.readFile.metadata || {},
      }, null, 2);
    } catch (error) {
      console.error("❌ Error in file reader tool:", error);
      if (error instanceof Error) {
        throw new Error(`File reading failed: ${error.message}`);
      }
      throw new Error("File reading failed with an unknown error");
    }
  },
});