import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import SYSTEM_MESSAGE from "@/constants/systemMessage-code";
import { googleSearchTool } from "../tools/googleSearch";
import { infoExtractorTool } from "../tools/InfoExtractor";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { UserContextData } from "../lib/getUserContext";

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
});

// Initialize wxflows tools
const wxflowsTools = await toolClient.lcTools;
console.log("Available wxflows tools:", wxflowsTools.map(tool => ({
  name: tool.name,
  description: tool.description
})));

// Ensure wxflows tools are properly initialized before combining
const tools = wxflowsTools ? [
  ...wxflowsTools,
  googleSearchTool,
  infoExtractorTool,
] : [googleSearchTool, infoExtractorTool];

// Log all available tools with detailed information
console.log("All available tools:", tools.map(tool => ({
  name: tool.name,
  description: tool.description
})));
const toolNode = new ToolNode(tools);

const initialiseModel = () => {
  const model = new ChatAnthropic({
    modelName: "claude-3-5-sonnet-20241022",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 8000,
    streaming: true,
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
    },
    callbacks: [
      {
        handleLLMStart: async () => {},
        handleLLMEnd: async (output) => {
          console.log("🤖 End LLM call", output);
        },
      },
    ],
  }).bindTools(tools);

  return model;
};

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    // Enhanced logging and validation for tool calls
    const toolCalls = lastMessage.tool_calls.map(call => {
      const tool = tools.find(t => t.name === call.name);
      let args;
      try {
        args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
      } catch (e) {
        console.error(`Failed to parse args for tool ${call.name}:`, e);
        args = call.args;
      }

      // Special handling for youtube_transcript tool
      if (call.name === 'youtube_transcript') {
        const { videoUrl, langCode } = args;
        if (!videoUrl || !langCode) {
          console.error('Missing required parameters for youtube_transcript:', {
            videoUrl: !!videoUrl,
            langCode: !!langCode
          });
        }
      }

      return {
        name: call.name,
        args,
        toolExists: !!tool,
        toolSchema: tool?.schema
      };
    });

    console.log("Tool calls detected:", toolCalls);
    console.log("Available tools during call:", tools.map(tool => ({
      name: tool.name,
      schema: tool.schema
    })));
    
    return "tools";
  }

  if (lastMessage.content && lastMessage._getType() === "tool") {
    // Enhanced logging for tool responses
    // Enhanced logging for tool responses with type checking
    const content = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
      
    console.log("Tool response received:", {
      type: lastMessage._getType(),
      content,
      isError: content.includes('error')
    });
    return "agent";
  }

  return END;
}

// Modified to accept user context
const createWorkflow = (userContext?: UserContextData) => {
  const model = initialiseModel();

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const systemContent = SYSTEM_MESSAGE(userContext);

      // Log available tools for debugging
      console.log("Available tools for the agent:", tools.map(tool => ({
        name: tool.name,
        description: tool.description
      })));
      
      // Log the full system message for debugging
      console.log("Full system message:", systemContent);
          
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      const trimmedMessages = await trimmer.invoke(state.messages);
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
      const response = await model.invoke(prompt);

      return { messages: [response] };
    })
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");
};

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  if (!messages.length) return messages;

  const cachedMessages = [...messages];
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: { type: "ephemeral" },
      },
    ];
  };

  addCache(cachedMessages.at(-1)!);

  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        addCache(cachedMessages[i]);
        break;
      }
    }
  }

  return cachedMessages;
}

// Function to fetch user context from Convex
async function fetchUserContext(userId: string, organizationId: string): Promise<UserContextData | undefined> {
  try {
    console.log("Fetching user context for:", { userId, organizationId });
    
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not defined in environment variables");
      return undefined;
    }

    // Create a Convex client
    const convexClient = new ConvexHttpClient(convexUrl);
    
    // Fetch user data
    console.log("Querying userData.getUserData");
    const userData = await convexClient.query(api.userData.getUserData, {
      userId,
      organizationId,
    });
    
    if (!userData) {
      console.warn("No user data found for", { userId, organizationId });
      return undefined;
    }
    
    console.log("User data fetched successfully:", {
      companyName: userData.companyName,
      userFullName: userData.userFullName
    });
    
    // Fetch user files
    console.log("Querying userData.getUserFiles");
    const userFiles = await convexClient.query(api.userData.getUserFiles, {
      userId,
      organizationId,
    });
    
    console.log(`Found ${userFiles?.length || 0} user files`);
    
    // Return user context data
    const context: UserContextData = {
      userId: userData.userId,
      organizationId: userData.organizationId,
      companyName: userData.companyName || "",
      targetedAudience: userData.targetedAudience || "",
      companyShortTermGoals: userData.companyShortTermGoals || "",
      companyLongTermGoals: userData.companyLongTermGoals || "",
      companyAdditionalContext: userData.companyAdditionalContext || "",
      userFullName: userData.userFullName || "",
      userShortTermGoals: userData.userShortTermGoals || "",
      userLongTermGoals: userData.userLongTermGoals || "",
      userAdditionalContext: userData.userAdditionalContext || "",
      files: userFiles || [],
    };
    
    return context;
  } catch (error) {
    console.error("Error fetching user context:", error);
    return undefined;
  }
}

// Updated to fetch and include user context
export async function submitQuestion(
  messages: BaseMessage[], 
  chatId: string,
  userId?: string, 
  organizationId?: string
) {
  let userContext: UserContextData | undefined;

  // Only fetch user context if both userId and organizationId are provided
  if (userId && organizationId) {
    console.log("Will fetch user context for:", { userId, organizationId });
    try {
      userContext = await fetchUserContext(userId, organizationId);
      if (userContext) {
        console.log("User context fetched successfully. User name:", userContext.userFullName);
      } else {
        console.log("Failed to fetch user context");
      }
    } catch (error) {
      console.error("Error fetching user context:", error);
    }
  } else {
    console.log("No userId or organizationId provided. Skipping user context fetch.");
  }

  const cachedMessages = addCachingHeaders(messages);
  const workflow = createWorkflow(userContext);
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  console.log("submitQuestion received chatId:", chatId);
  
  // Include user and organization IDs in the configurable options if available
  const configurable: Record<string, string> = { thread_id: chatId };
  if (userId) configurable.user_id = userId;
  if (organizationId) configurable.organization_id = organizationId;
  
  console.log("Config passed to streamEvents:", { configurable });

  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: "v2",
      configurable,
      streamMode: "messages",
      runId: chatId,
    }
  );
  return stream;
}