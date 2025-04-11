"use client";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react"; // Import sidebar toggle icons
import { Button } from "@/components/ui/button"; // Import Button component
import { useNavigation } from "@/lib/context/navigation";
import { useAgent } from "@/lib/context/agent";
import { agents } from "@/constants/agents";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import UserButtonWrapper from "./UserButtonWrapper";
import { ChatSettings } from "./ChatSettingsPopup";

export default function Header() {
  // Get sidebar state and toggle function from context
  const { setIsMobileNavOpen, toggleSidebar, isSidebarOpen } = useNavigation();
  const { agentName, agentIcon, agentType } = useAgent();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Get icon from agent type if agentIcon is not set but agentType is
  const displayIcon = agentIcon || (agentType ? agents[agentType].icon : undefined);

  return (
    <header className={cn(
      "border-b sticky top-0 z-50 backdrop-blur-sm",
      isDark ? (
        "border-gray-700/50 bg-gray-900/80"
      ) : (
        "border-gray-200/50 bg-white/80"
      )
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "hidden md:flex", // Only show on md screens and up
              isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
            )}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Mobile Nav Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className={cn(
              "md:hidden p-2 rounded-md transition-colors",
              isDark ? (
                "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              ) : (
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              )
            )}
            suppressHydrationWarning
          >
            <HamburgerMenuIcon className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>
          <div className="flex items-center gap-3">
            {displayIcon && (
              <img
                src={displayIcon}
                alt={agentName || "Agent"}
                className="w-8 h-8 rounded-lg object-cover"
              />
            )}
            <div className={cn(
              "font-semibold bg-clip-text text-transparent",
              isDark ? (
                "bg-gradient-to-r from-purple-400 to-purple-200"
              ) : (
                "bg-gradient-to-r from-gray-800 to-gray-600"
              )
            )}>
              {agentName ? agentName : "Advi Agents"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChatSettings />
          <UserButtonWrapper />
        </div>
      </div>
    </header>
  );
}
