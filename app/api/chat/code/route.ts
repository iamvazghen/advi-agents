// app/api/chat/code/route.ts
import { submitQuestion } from "@/lib/langgraph-code";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { getConvexClient } from "@/lib/convex";
import {
  ChatRequestBody,
  StreamMessage,
  StreamMessageType,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
} from "@/lib/types";

export const runtime = "edge";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      console.error("No userId from auth");
      return new Response("Unauthorized", { status: 401 });
    }
    console.log("Authenticated userId:", userId);

    const { messages, newMessage, chatId, orgId, userFiles } = (await req.json()) as ChatRequestBody;
    console.log("Request payload:", { chatId, userId, orgId, messageCount: messages.length, filesCount: userFiles?.length || 0 });

    // Get the Convex auth token from Clerk
    const token = await getToken({ template: "convex" });
    if (!token) {
      console.error("Failed to get authentication token");
      return new Response("Failed to get authentication token", { status: 500 });
    }
    
    // Create and authenticate the Convex client
    const convex = getConvexClient();
    convex.setAuth(token); // Set the auth token on the client

    // Create stream with larger queue strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for nginx
      },
    });

    // Handle the streaming response
    (async () => {
      try {
        // Send initial connection established message
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });
        console.log("Sent SSE Connected message");

        // Convert messages to LangChain format
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          // Add the new message for this session's processing
          new HumanMessage(newMessage),
        ];
        
        // We'll send the message to Convex AFTER starting the event stream
        // This prevents the message from being duplicated when reopening the chat

        try {
          console.log("Submitting question with context:", { userId, orgId, chatId: chatId.toString() });
          
          // Create the event stream - Pass userId and orgId for user context
          const eventStream = await submitQuestion(
            langChainMessages, 
            chatId.toString(),
            userId,     // Add userId to fetch user context
            orgId       // Add orgId to fetch user context
          );
          console.log("Started event stream processing");

          // We don't need to send the message to Convex here
          // The ChatInterface component already stores the user message
          // Sending it again here would cause the message to be duplicated
          
          // Process the events
          for await (const event of eventStream) {
            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk;
              if (token) {
                const text = token.content.at(0)?.["text"];
                if (text) {
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  });
                }
              }
            } else if (event.event === "on_tool_start") {
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolStart,
                tool: event.name || "unknown",
                input: event.data.input,
              });
              console.log("Tool started:", event.name, "with input:", event.data.input);
            } else if (event.event === "on_tool_end") {
              const toolMessage = new ToolMessage(event.data.output);
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || "unknown",
                output: event.data.output,
              });
              console.log("Tool ended:", toolMessage.lc_kwargs.name, "with output:", event.data.output);
            }
          }

          // Send completion message
          await sendSSEMessage(writer, { type: StreamMessageType.Done });
          console.log("Sent SSE Done message");
        } catch (streamError) {
          console.error("Error in event stream:", streamError);
          
          // Check if it's an overload error
          const errorString = streamError instanceof Error
            ? streamError.message
            : String(streamError);
          
          const isOverloaded = errorString.includes("overloaded") ||
                              errorString.includes("Overloaded");
          
          if (isOverloaded) {
            // Send a more user-friendly overload error message
            await sendSSEMessage(writer, {
              type: StreamMessageType.Error,
              error: "The service is currently experiencing high demand. Please try again with a shorter message or wait a moment before trying again."
            });
          } else {
            // For other errors, send the original error message
            await sendSSEMessage(writer, {
              type: StreamMessageType.Error,
              error: streamError instanceof Error
                ? streamError.message
                : "Stream processing failed",
            });
          }
        }
      } catch (error) {
        console.error("Error in stream:", error);
        await sendSSEMessage(writer, {
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        try {
          await writer.close();
          console.log("Stream writer closed");
        } catch (closeError) {
          console.error("Error closing writer:", closeError);
        }
      }
    })();

    return response;
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" } as const,
      { status: 500 }
    );
  }
}