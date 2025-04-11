"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";
import { BotIcon, ClipboardCopy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MessageBubbleProps {
  content: string;
  isUser?: boolean;
  messageId?: Id<"messages">;
  orgId?: string;
}

const formatMessage = (content: string): string => {
  // First unescape backslashes
  content = content.replace(/\\\\/g, "\\");

  // Then handle newlines
  content = content.replace(/\\n/g, "\n");

  // Remove only the markers but keep the content between them
  content = content.replace(/---START---\n?/g, "").replace(/\n?---END---/g, "");

  // Trim any extra whitespace that might be left
  return content.trim();
};

export function MessageBubble({ content, isUser, messageId, orgId, message }: MessageBubbleProps & { message?: any }) {
  const { user } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm ring-1 ring-inset relative",
          isUser
            ? "bg-purple-600 text-white rounded-br-none ring-purple-700"
            : isDark
              ? "bg-gray-800 text-gray-100 rounded-bl-none ring-gray-700"
              : "bg-white text-gray-900 rounded-bl-none ring-gray-200"
        )}
      >
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />
        </div>
        <div className={cn(
          "flex items-center justify-end gap-1 mt-2 -mr-1",
          isUser ? "justify-start -ml-1" : "justify-end -mr-1"
        )}>
          <MessageActions
            content={formatMessage(content)}
            messageId={messageId}
            orgId={orgId}
            isLiked={message?.isLiked}
            isDisliked={message?.isDisliked}
          />
        </div>
        <div
          className={`absolute bottom-0 ${
            isUser
              ? "right-0 translate-x-1/2 translate-y-1/2"
              : "left-0 -translate-x-1/2 translate-y-1/2"
          }`}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm",
              isUser
                ? isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
                : isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-purple-600 border-white"
            )}
          >
            {isUser ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {/* Use a consistent value for both server and client until hydration is complete */}
                  {typeof window === 'undefined' ? 'U' :
                    (!user ? 'U' : (user.firstName?.charAt(0) ||
                    user.emailAddresses?.[0]?.emailAddress?.charAt(0) ||
                    'U'))}
                </AvatarFallback>
              </Avatar>
            ) : (
              <BotIcon className={cn("h-5 w-5", isDark ? "text-gray-100" : "text-white")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageActionsProps {
  content: string;
  messageId?: Id<"messages">;
  orgId?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
}

function MessageActions({ content, messageId, orgId, isLiked, isDisliked }: MessageActionsProps) {
  const [liked, setLiked] = useState(isLiked || false);
  const [disliked, setDisliked] = useState(isDisliked || false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Convex mutations
  const likeMessage = useMutation(api.messages.likeMessage);
  const dislikeMessage = useMutation(api.messages.dislikeMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLike = async () => {
    if (!messageId || !orgId) return;
    
    try {
      setLiked(!liked);
      if (disliked) setDisliked(false);
      
      // Only call the mutation if we're liking (not unliking)
      if (!liked) {
        await likeMessage({ messageId, orgId });
      }
    } catch (error) {
      console.error("Failed to like message:", error);
      // Revert UI state if the mutation fails
      setLiked(false);
    }
  };

  const handleDislike = async () => {
    if (!messageId || !orgId) return;
    
    try {
      setDisliked(!disliked);
      if (liked) setLiked(false);
      
      // Only call the mutation if we're disliking (not un-disliking)
      if (!disliked) {
        await dislikeMessage({ messageId, orgId });
      }
    } catch (error) {
      console.error("Failed to dislike message:", error);
      // Revert UI state if the mutation fails
      setDisliked(false);
    }
  };

  return (
    <>
      <SimpleTooltip content="Copy to clipboard">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className={cn(
            "h-7 w-7 rounded-full",
            copied ? "text-blue-500" : isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
        </Button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Like">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={cn(
            "h-7 w-7 rounded-full",
            liked ? "text-green-500" : isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
      </SimpleTooltip>
      
      <SimpleTooltip content="Dislike">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDislike}
          className={cn(
            "h-7 w-7 rounded-full",
            disliked ? "text-red-500" : isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </SimpleTooltip>
    </>
  );
}
