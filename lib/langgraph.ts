"use server";

import {
  AIMessage,
  BaseMessage,
  SystemMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { ChatWatsonx } from "@langchain/community/chat_models/ibm";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import { Serialized } from "@langchain/core/load/serializable";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// Connect to wxflows
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
});

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

// Connect to the LLM provider
const model = new ChatWatsonx({
  model: "mistralai/mistral-large",
  projectId: process.env.WATSONX_AI_PROJECT_ID || "",
  serviceUrl: process.env.WATSONX_AI_ENDPOINT || "",
  version: "2024-05-31",
}).bindTools(tools);

// Define the function that determines whether to continue or not
// We can extract the state typing via `StateAnnotation.State`
function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    console.log("TOOL_CALL", JSON.stringify(lastMessage.tool_calls));
    return "tools";
  }
  // Otherwise, we stop (reply to the user)
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof StateAnnotation.State) {
  const systemMessage = new SystemMessage(
    "You are a helpful AI assistant. Only use the tools available, don't answer questions based on pre-trained data."
  );

  const messages = [systemMessage, ...state.messages];
  const response = await model.invoke(messages);

  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

export async function submitQuestion(
  messages: Array<Serialized>
): Promise<string> {
  try {
    const config = { configurable: { thread_id: "42" } };
    const finalState = await app.invoke(
      {
        messages: messages.map((msg) => {
          if (msg.type === "constructor" && msg.id[0] === "HumanMessage") {
            return new HumanMessage(msg.kwargs.content as string);
          }
          throw new Error("Invalid message format");
        }),
      },
      config
    );

    const lastMessage = finalState?.messages[finalState.messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      throw new Error("No response received");
    }

    return typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
  } catch (error) {
    console.error("Error in submitQuestion:", error);
    return "Something went wrong processing your request";
  }
}
