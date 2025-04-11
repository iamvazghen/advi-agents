"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useOrganizationRedirect } from "@/lib/hooks/useOrganizationRedirect";
import {
  Users,
  ClipboardList,
  Link2,
  Hammer,
  Zap,
  Database,
  Building2,
  Moon,
  Sun,
  UserCog, // Added UserCog import
  AreaChart, // Added AreaChart for Analytics
} from "lucide-react";
import { OrganizationSwitcherWrapper } from "@/components/OrganizationSwitcherWrapper";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { ArrowLeft } from "lucide-react";
import TimeAgo from "react-timeago";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/context/navigation";
import { useAgent } from "@/lib/context/agent";
import { useTheme } from "@/lib/theme";
import { agents } from "@/constants/agents";
import type { AgentType } from "@/constants/agents";

export type SidebarView = "main" | "agents" | "agentChat" | "tasks";

interface SidebarProps {
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  isOpen: boolean; // Add isOpen prop
}

function ChatRow({
  chat,
  onDelete,
  header,
  isDark,
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
  header?: string;
  isDark: boolean;
}) {
  const agentIcon = agents[chat.agentType]?.icon;
  const router = useRouter();
  const { closeMobileNav } = useNavigation();
  const { setAgentName, setAgentIcon, setAgentType } = useAgent();
  const { organization } = useOrganization();
  const lastMessage = useQuery(
    api.messages.getLastMessage,
    organization?.id ? { chatId: chat._id, orgId: organization.id } : "skip"
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [chatTitle, setChatTitle] = useState(chat.title);
  const [isRenamingLoading, setIsRenamingLoading] = useState(false);
  const renameChat = useMutation(api.chats.renameChat);

  const handleClick = () => {
    if (!isRenaming && organization?.id) {
      const agent = agents[chat.agentType];
      if (agent) {
        setAgentType(chat.agentType);
        setAgentName(agent.name);
        setAgentIcon(agent.icon);
      }
      router.push(`/dashboard/org/${organization.id}/chat/${chat._id}`);
      closeMobileNav();
    }
  };

  const handleRename = async () => {
    if (!chatTitle.trim() || isRenamingLoading) return;
    setIsRenamingLoading(true);
    try {
      await renameChat({
        id: chat._id,
        title: chatTitle.trim(),
        orgId: organization?.id,
      });
      setIsRenaming(false);
    } catch (error) {
      console.error("Error renaming chat:", error);
    } finally {
      setIsRenamingLoading(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md",
        isDark ? (
          "border-gray-700/30 bg-gray-800/50 hover:bg-gray-800/80"
        ) : (
          "border-gray-200/30 bg-white/50 hover:bg-white/80"
        )
      )}
    >
      <div className="p-4">
        {header && (
          <p className={cn(
            "mb-1 text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>{header}</p>
        )}
        {isRenaming ? (
          <div className="flex flex-col gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename();
                  } else if (e.key === "Escape") {
                    setIsRenaming(false);
                    setChatTitle(chat.title);
                  }
                }}
                className={cn(
                  "flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
                  isDark ? (
                    "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  ) : (
                    "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                  )
                )}
                placeholder="Chat name..."
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleRename}
                disabled={isRenamingLoading}
                className="h-7 px-2 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsRenaming(false);
                  setChatTitle(chat.title);
                }}
                className={cn(
                  "h-7 px-2 text-xs",
                  isDark ? (
                    "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  ) : (
                    "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )
                )}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              {agentIcon && (
                <div className="flex-shrink-0 w-5 h-5 mr-2">
                  <img
                    src={agentIcon}
                    alt="Agent"
                    className="w-full h-full rounded-md object-cover"
                  />
                </div>
              )}
              <p className={cn(
                "text-sm font-medium",
                isDark ? "text-gray-200" : "text-gray-800"
              )}>{chatTitle}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
              >
                <Pencil1Icon className={cn(
                  "h-4 w-4 transition-colors",
                  isDark ? (
                    "text-gray-500 hover:text-purple-400"
                  ) : (
                    "text-gray-400 hover:text-purple-500"
                  )
                )} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat._id);
                }}
              >
                <TrashIcon className={cn(
                  "h-4 w-4 transition-colors",
                  isDark ? (
                    "text-gray-500 hover:text-red-400"
                  ) : (
                    "text-gray-400 hover:text-red-500"
                  )
                )} />
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-start justify-between">
          <p className={cn(
            "flex-1 truncate text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {lastMessage ? (
              <>
                {lastMessage.role === "user" ? "You: " : "AI: "}
                {lastMessage.content.replace(/\\n/g, "\n")}
              </>
            ) : (
              <span className={cn(
                isDark ? "text-gray-500" : "text-gray-400"
              )}>New conversation</span>
            )}
          </p>
        </div>
        {lastMessage && (
          <p className={cn(
            "mt-1 text-xs font-medium",
            isDark ? "text-gray-500" : "text-gray-400"
          )}>
            <TimeAgo date={lastMessage.createdAt} />
          </p>
        )}
      </div>
    </div>
  );
}

const getAgentTitle = (agentType: AgentType): string => {
  const titles = {
    code: "Email Manager",
    data: "Social Media Manager",
    math: "Advertiser",
    research: "HR & Educator",
    stream: "IT Operations",
    writing: "Lawyer",
    sales: "Sales Assistant",
    accountant: "Accountant & Advisor",
    investor: "Investor",
    business: "Business Development",
    productivity: "Productivity Assistant",
  };
  return titles[agentType];
};

// Destructure isOpen from props
export default function Sidebar({ sidebarView, setSidebarView, isOpen }: SidebarProps) {
  const router = useRouter();
  const { isMobileNavOpen, closeMobileNav } = useNavigation();
  const { setAgentName, setAgentIcon, setAgentType } = useAgent();
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const { organization } = useOrganization();
  const { setActive } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  // Use our custom hook to handle organization redirection
  const { isRedirecting } = useOrganizationRedirect();
  const orgId = organization?.id || "";

  // Check organization subscription status
  const teamProfile = useQuery(
    api.stripeData.getTeamById,
    orgId ? { organizationId: orgId } : "skip"
  );
  
  // Determine if the organization has an active subscription
  const hasActivePlan = teamProfile?.subscriptionStatus === "active" || 
                      teamProfile?.subscriptionStatus === "trialing";
  
  // Check if trial has expired if in trial mode
  const trialEndDate = teamProfile?.trialEnd ? new Date(teamProfile.trialEnd) : undefined;
  const isTrialExpired = teamProfile?.subscriptionStatus === "trialing" && 
                      trialEndDate && new Date(trialEndDate) < new Date();
  
  // Organization has valid access only if it exists and has an active/trial plan that hasn't expired
  const hasOrgAccess = !!orgId && hasActivePlan && !isTrialExpired;

  // We don't need to manually set the active organization here anymore
  // as the useOrganizationRedirect hook now handles this
  useEffect(() => {
    if (!orgId) {
      router.push("/dashboard");
    }
  }, [orgId, router]);

  const chats = useQuery(
    api.chats.listChats,
    orgId ? { agentType: selectedAgentType || undefined, orgId } : "skip"
  );

  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handleNewChat = async () => {
    if (!selectedAgentType || !orgId || !hasActivePlan) return;
    try {
      const chatId = await createChat({
        title: "New Chat",
        agentType: selectedAgentType,
        organizationId: orgId,
      });
      console.log("New chat created with ID:", chatId);
      await setActive({ organization: orgId }); // Already awaited
      router.push(`/dashboard/org/${orgId}/chat/${chatId}`);
      closeMobileNav();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleDeleteChat = async (id: Id<"chats">) => {
    try {
      // Pass the organization ID to the deleteChat mutation
      await deleteChat({ id, orgId });
      console.log(`Chat ${id} deleted successfully`);
      
      // Redirect if we're currently viewing the deleted chat
      if (window.location.pathname.includes(id)) {
        router.push(`/dashboard/org/${orgId}`);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      // You could add user notification here
    }
  };

  const BackButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setSidebarView("main")}
      className={cn(
        "mb-3 sm:mb-4 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors w-auto back-button",
        isDark ? (
          "bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-purple-400"
        ) : (
          "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-purple-700"
        )
      )}
    >
      <ArrowLeft className={cn(
        "h-5 w-5",
        isDark ? "text-gray-300" : "text-gray-700"
      )} />
      <span className="text-base font-medium">Back</span>
    </Button>
  );

  const renderMainMenu = () => {
    const menuItems = [
      { label: "Advi Agents", view: "agents", icon: <Users className="h-9 w-9 text-purple-600" /> },
      { label: "Task History", view: "tasks", icon: <ClipboardList className="h-9 w-9 text-purple-600" /> },
      {
        label: "Integrations",
        path: `/dashboard/org/${orgId}/integrations`,
        icon: <Link2 className="h-9 w-9 text-purple-600" />,
      },
      { label: "User Context", path: `/dashboard/org/${orgId}/brand`, icon: (
          <div className="flex items-center gap-2">
            <UserCog className="h-7 w-7 text-purple-600" />
          </div>
        )
      },
      { label: "Files Database", path: `/dashboard/org/${orgId}/brandupload`, icon: <Database className="h-9 w-9 text-purple-600" /> }, // Added File Upload link
      { label: "Team Settings", path: `/dashboard/org/${orgId}/team`, icon: <Building2 className="h-9 w-9 text-purple-600" /> },
      { label: "Analytics", path: `/dashboard/org/${orgId}/analytics`, icon: <AreaChart className="h-9 w-9 text-purple-600" /> }, // Added Analytics link
    ];

    return (
      <div className="flex flex-col flex-grow p-3 pt-24 sm:p-6 sm:pt-20 md:pt-6"> {/* Added flex-grow */}
        {!hasOrgAccess && orgId && (
          <div className="p-4 rounded-lg bg-yellow-100 text-yellow-700 mb-2">
            <p className="text-sm font-medium">No active plan selected. Please select a plan to access all features.</p>
            <Button
              onClick={() => router.push(`/dashboard/org/${orgId}/team`)}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
            >
              Select a Plan
            </Button>
          </div>
        )}
        {/* Wrap content in a scrollable container */}
        <div className="flex-grow overflow-y-auto space-y-3 sm:space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {menuItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => {
              if (item.path) {
                // Allow navigation to Team settings even without a plan
                if (item.label === "Teams" || hasOrgAccess) {
                  router.push(item.path);
                  closeMobileNav();
                } else if (orgId) {
                  // Redirect to team/subscription page if org exists but no active plan
                  router.push(`/dashboard/org/${orgId}/team`);
                  closeMobileNav();
                }
              } else if (hasOrgAccess || item.label === "Teams") {
                setSidebarView(item.view as SidebarView);
              } else if (orgId) {
                // Redirect to team/subscription page if org exists but no active plan
                router.push(`/dashboard/org/${orgId}/team`);
                closeMobileNav();
              }
            }}
            className={cn(
              "w-full rounded-lg py-8 shadow transition-colors menu-item",
              isDark ? (
                "bg-gray-800 text-white hover:bg-gray-700 bg-gradient-to-b from-purple-900/20 to-purple-800/10"
              ) : (
                "bg-white text-gray-800 hover:bg-gray-50 bg-gradient-to-b from-purple-50 to-purple-20/80"
              ),
              (!hasOrgAccess && item.label !== "Teams") && "opacity-70 cursor-not-allowed"
            )}
            disabled={!orgId || (!hasOrgAccess && item.label !== "Teams")}
          >
            <div className="flex items-center w-full px-6">
              <div className="w-16 flex justify-center">{item.icon}</div>
              <span className="text-lg font-medium">{item.label}</span>
            </div>
          </Button>
        ))}

        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg shadow mt-4",
          isDark ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="h-5 w-5 text-purple-400" />
            ) : (
              <Sun className="h-5 w-5 text-purple-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isDark ? "text-gray-200" : "text-gray-800"
            )}>Dark Mode</span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-purple-600"
          />
        </div> {/* Close scrollable container */}
        </div>
      </div>
    );
  };

  const renderAgents = () => {
    const agentTypes = Object.keys(agents) as AgentType[];

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 p-3 pt-24 sm:p-6 sm:pt-20 md:pt-6">
          <BackButton />
          <h2 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-gray-800"
        )}> Agents</h2>
        </div>
        {!hasOrgAccess && (
          <div className="p-4 m-3 rounded-lg bg-yellow-100 text-yellow-700">
            <p className="text-sm font-medium">No active plan selected. Please select a plan to access agents.</p>
            <Button 
              onClick={() => router.push(`/dashboard/org/${orgId}/team`)} 
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
            >
              Select a Plan
            </Button>
          </div>
        )}
        <div className="h-[calc(100vh-300px)] overflow-y-auto space-y-3 p-3 sm:space-y-4 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {agentTypes.map((type) => (
            <Button
              key={type}
              onClick={() => {
                if (hasOrgAccess) {
                  setSelectedAgentType(type);
                  setAgentType(type);
                  setAgentName(`${agents[type].name} | ${agents[type].title}`);
                  setAgentIcon(agents[type].icon);
                  setSidebarView("agentChat");
                } else if (orgId) {
                  router.push(`/dashboard/org/${orgId}/team`);
                }
              }}
              className={cn(
                "w-full rounded-lg shadow transition-colors py-6",
                isDark ? (
                  "bg-gray-800 hover:bg-gray-700 bg-gradient-to-b from-purple-900/20 to-purple-800/10"
                ) : (
                  "bg-white hover:bg-gray-50 bg-gradient-to-b from-purple-50 to-purple-20/80"
                ),
                !hasOrgAccess && "opacity-70 cursor-not-allowed"
              )}
              disabled={!hasOrgAccess}
            >
              <div className="flex items-center w-full px-4 py-2">
                <div className="flex-shrink-0 w-6 h-6">
                  <img
                    src={agents[type].icon}
                    alt={agents[type].name}
                    className="w-full h-full rounded-md object-cover"
                  />
                </div>
                <div className="flex-1 ml-5 flex flex-col text-left">
                  <span className={cn(
                    "text-sm font-medium leading-snug",
                    isDark ? "text-gray-200" : "text-black"
                  )}>
                    {agents[type].name}
                  </span>
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-purple-400" : "text-purple-500"
                  )}>
                    {agents[type].title}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const agentChats = useQuery(
    api.chats.listChats,
    orgId ? { agentType: selectedAgentType || undefined, orgId } : "skip"
  );

  const renderAgentChat = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-3 pt-24 sm:p-6 sm:pt-20 md:pt-6">
        <BackButton />
        <h2 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-gray-800"
        )}>
          {selectedAgentType ? `${getAgentTitle(selectedAgentType)} Chat History` : "Chat History"}
        </h2>
        {hasOrgAccess ? (
          <Button
            onClick={handleNewChat}
            className={cn(
              "mt-4 w-full rounded-lg py-3 shadow transition-colors",
              isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-800 hover:bg-gray-50"
            )}
            disabled={!orgId || !hasOrgAccess}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Chat
          </Button>
        ) : (
          <div className="p-3 mt-4 rounded-lg bg-yellow-100 text-yellow-700">
            <p className="text-sm font-medium">Please select a plan to create new chats.</p>
            <Button 
              onClick={() => router.push(`/dashboard/org/${orgId}/team`)} 
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
            >
              Select a Plan
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col h-[calc(88vh-200px)] overflow-y-auto space-y-3 p-3 sm:space-y-4 sm:p-6 relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {!orgId ? (
          <p className="text-gray-500 text-center">Please select an organization to view chats.</p>
        ) : !hasOrgAccess ? (
          <p className="text-gray-500 text-center">No plan selected yet.</p>
        ) : agentChats === undefined ? (
          <p className="text-gray-500 text-center">Loading chats...</p>
        ) : agentChats.length === 0 ? (
          <p className="text-gray-500 text-center">No chats for this agent yet.</p>
        ) : (
          agentChats.map((chat) => (
            <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} header={""} isDark={isDark} />
          ))
        )}
      </div>
    </div>
  );

  const allChats = useQuery(
    api.chats.listChats,
    orgId ? { agentType: undefined, orgId } : "skip"
  );

  const renderTasks = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-3 pt-24 sm:p-6 sm:pt-20 md:pt-6">
        <BackButton />
        <h2 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-gray-800"
        )}>All Tasks</h2>
      </div>
      <div className="flex flex-col h-[calc(93vh-200px)] overflow-y-auto space-y-3 p-3 sm:space-y-4 sm:p-6 relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {!orgId ? (
          <p className="text-gray-500 text-center">Please select an organization to view tasks.</p>
        ) : !hasOrgAccess ? (
          <p className="text-gray-500 text-center">No plan selected yet.</p>
        ) : allChats === undefined ? (
          <p className="text-gray-500 text-center">Loading tasks...</p>
        ) : allChats.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks yet.</p>
        ) : (
          allChats.map((chat) => (
            <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} header={""} isDark={isDark} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-shrink-0 flex-col border-r backdrop-blur-sm transition-transform duration-300 ease-in-out md:absolute", // Changed md:relative to md:absolute
        isDark ? "border-gray-700 bg-gray-900/95" : "border-gray-200 bg-gray-50/95",
        // Mobile uses translate based on isMobileNavOpen
        isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop uses translate based on isOpen
        isOpen ? "md:translate-x-0" : "md:-translate-x-full"
      )}
    >
      {sidebarView === "main" && renderMainMenu()}
      {sidebarView === "agents" && renderAgents()}
      {sidebarView === "agentChat" && renderAgentChat()}
      {sidebarView === "tasks" && renderTasks()}
      <div className={cn(
        "mt-auto p-4 sm:p-6 border-t",
        isDark ? "border-gray-700/50" : "border-gray-200/50"
      )}>
          <OrganizationSwitcherWrapper />
        </div>
    </div> // Reverted back to closing div
  );
}

