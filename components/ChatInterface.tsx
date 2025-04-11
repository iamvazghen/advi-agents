"use client";

import { useEffect, useRef, useState } from "react";
import { useAgent } from "@/lib/context/agent";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import WelcomeMessage from "@/components/WelcomeMessage";
import { createSSEParser } from "@/lib/SSEParser";
import { MessageBubble } from "@/components/MessageBubble";
import { ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  orgId: string;
  initialMessages: Doc<"messages">[];
  agentType: "code" | "data" | "math" | "research" | "stream" | "writing" | "sales" | "accountant" | "investor" | "business" | "productivity";
  userFiles: Array<{
    name: string;
    type: string;
    size: number;
    storageId: string;
    uploadedAt: number;
  }>;
}

const AGENT_NAMES = {
  code: "Felini, professional copywriter and email manager",
  data: "Lika, she's great at taking photos and getting likes",
  math: "Tato, your top tier marketer and prospect researcher",
  research: "Ars, constantly improves others around him",
  stream: "Musho, your 24/7 security for all it operations",
  writing: "Kuku, will take care of all compliance",
  sales: "Sergo, your expert sales strategist and deal closer",
  accountant: "Kamo, your financial wizard and tax optimization expert",
  investor: "Rubo, your venture capitalist and portfolio manager",
  business: "Hracho, your business growth strategist",
  productivity: "Zara, your supercharged productivity assistant",
};

export default function ChatInterface({
  chatId,
  orgId,
  initialMessages,
  agentType,
  userFiles,
}: ChatInterfaceProps) {
  const { setAgentName, setUserFiles } = useAgent();
  const { user } = useUser();
  // Add explicit type annotations to avoid "excessively deep" TypeScript error
  const storeMessage = useMutation<typeof api.messages.store>(api.messages.store);
  const storeUserMessage = useMutation<typeof api.messages.store>(api.messages.store); // Separate mutation for user messages

  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);

  useEffect(() => {
    setAgentName(AGENT_NAMES[agentType]);
    setUserFiles(userFiles);
    return () => {
      setAgentName(undefined);
      setUserFiles([]);
    };
  }, [agentType, setAgentName, setUserFiles, userFiles]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  };

  const formatTerminalOutput = (tool: string, input: unknown, output: unknown) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
      <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
        <span class="text-red-500">●</span>
        <span class="text-yellow-500">●</span>
        <span class="text-green-500">●</span>
        <span class="text-gray-400 ml-1 text-sm">~/${tool}</span>
      </div>
      <div class="text-gray-400 mt-1">$ Input</div>
      <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
      <div class="text-gray-400 mt-2">$ Output</div>
      <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
    </div>`;
    return `---START---\n${terminalHtml}\n---END---`;
  };

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !user) return;
  
    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setIsLoading(true);
  
    // Create temporary optimistic message for UI
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;
    
    // Immediately update UI with the user's message
    setMessages((prev) => [...prev, optimisticUserMessage]);
    
    // Store the user's message in the database
    // This is the ONLY place where user messages should be stored to avoid duplication
    try {
      await storeUserMessage({
        chatId,
        content: trimmedInput,
        role: "user",
        orgId,
      });
      console.log("User message stored in Convex from ChatInterface");
    } catch (error) {
      console.error("Failed to store user message:", error);
    }
  
    let fullResponse = "";
  
    try {
      // Ensure we're passing userId and orgId to the API
      const requestBody: ChatRequestBody = {
        messages: messages.length > 0
          ? messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
          : [{ role: "user", content: trimmedInput }], // Ensure at least one message
        newMessage: trimmedInput,
        chatId,
        userFiles,
        userId: user.id, // User ID from Clerk
        orgId, // Organization ID from props
      };
  
      // Log the request for debugging
      console.log("Sending chat request with user context:", {
        userId: user.id,
        orgId,
        chatId: chatId.toString(),
        messageCount: messages.length,
        filesCount: userFiles.length,
      });
  
      const response = await fetch(`/api/chat/${agentType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body available");

      const parser = createSSEParser();
      const reader = response.body.getReader();

      await processStream(reader, async (chunk) => {
        const messages = parser.parse(chunk);

        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;
            case StreamMessageType.ToolStart:
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });
                fullResponse += formatTerminalOutput(message.tool, message.input, "Processing...");
                setStreamedResponse(fullResponse);
              }
              break;
            case StreamMessageType.ToolEnd:
              if ("tool" in message && currentTool) {
                const lastTerminalIndex = fullResponse.lastIndexOf('<div class="bg-[#1e1e1e]');
                if (lastTerminalIndex !== -1) {
                  fullResponse =
                    fullResponse.substring(0, lastTerminalIndex) +
                    formatTerminalOutput(message.tool, currentTool.input, message.output);
                  setStreamedResponse(fullResponse);
                }
                setCurrentTool(null);
              }
              break;
            case StreamMessageType.Error:
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;
            case StreamMessageType.Done:
              // Store the assistant's message using the authenticated mutation hook
              const realMessageId = await storeMessage({
                chatId,
                content: fullResponse,
                role: "assistant",
                orgId,
              });

              // Create message with the real ID from Convex
              const assistantMessage: Doc<"messages"> = {
                _id: realMessageId,
                chatId,
                content: fullResponse,
                role: "assistant",
                createdAt: Date.now(),
                isLiked: false,
                isDisliked: false,
              } as Doc<"messages">;

              setMessages((prev) => [...prev, assistantMessage]);
              setStreamedResponse("");
              return;
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
      setStreamedResponse(
        formatTerminalOutput(
          "error",
          "Failed to process message",
          error instanceof Error ? error.message : "Unknown error"
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <section className={cn(
        "flex-1 overflow-y-auto p-2 md:p-0",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {messages?.length === 0 && <WelcomeMessage />}

          {messages?.map((message: Doc<"messages">) => (
            <MessageBubble
              key={message._id}
              messageId={message._id}
              content={message.content}
              isUser={message.role === "user"}
              orgId={orgId}
              message={message}
            />
          ))}

          {streamedResponse && <MessageBubble content={streamedResponse} />}

          {isLoading && !streamedResponse && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className={cn(
                "rounded-2xl px-4 py-3 rounded-bl-none shadow-sm ring-1 ring-inset",
                isDark ? "bg-gray-800 text-gray-300 ring-gray-700" : "bg-white text-gray-900 ring-gray-200"
              )}>
                <div className="flex items-center gap-1.5">
                  {[0.3, 0.15, 0].map((delay, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full animate-bounce",
                        isDark ? "bg-gray-500" : "bg-gray-400"
                      )}
                      style={{ animationDelay: `-${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className={cn(
        "border-t p-4",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Agent..."
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12",
                isDark ?
                  "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" :
                  "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
              )}
              disabled={isLoading}
              suppressHydrationWarning={true}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all ${
                input.trim()
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  : isDark ? "bg-gray-700 text-gray-500" : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}