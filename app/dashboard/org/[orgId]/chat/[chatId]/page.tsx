import ChatInterface from "@/components/ChatInterface";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/lib/convex-server"; // Updated import
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Agent Chat",
};

interface ChatPageProps {
  params: Promise<{ orgId: string; chatId: Id<"chats"> }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { orgId, chatId } = await params;

  const { userId, orgId: clerkOrgId, getToken } = await auth();
  if (!userId) {
    console.log("Redirecting to /: No userId");
    redirect("/");
  }

  if (!clerkOrgId || clerkOrgId !== orgId) {
    console.log("Redirecting to /dashboard: Invalid or missing organization context", {
      urlOrgId: orgId,
      clerkOrgId,
    });
    redirect("/dashboard");
  }

  try {
    const token = await getToken({ template: "convex" });
if (!token) {
  throw new Error("No Convex auth token available");
}
const convex = getServerConvexClient(token); // This should now work // Pass token to Convex client
    // Ensure we're passing the correct parameters to getChat
    const chat = await convex.query(api.chats.getChat, {
      id: chatId,
      userId,
      orgId: orgId, // Changed from orgId to organizationId
    });

    if (!chat) {
      console.log("Chat not found for ID:", chatId);
      return <div>Chat not found for ID: {chatId}</div>;
    }
    if (chat.organizationId !== orgId) {
      console.log("Organization mismatch", {
        chatOrg: chat.organizationId,
        currentOrg: orgId,
      });
      return <div>This chat belongs to a different organization.</div>;
    }

    const [initialMessages, userFiles] = await Promise.all([
      convex.query(api.messages.list, { chatId, orgId }),
      convex.query(api.userData.getUserFiles, { userId, organizationId: orgId }),
    ]);

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          chatId={chatId}
          orgId={orgId}
          initialMessages={initialMessages}
          agentType={chat.agentType}
          userFiles={userFiles}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading chat:", error);
    return <div>Error loading chat: {String(error)}</div>;
  }
}