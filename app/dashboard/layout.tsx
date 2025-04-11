"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { NavigationProvider, useNavigation } from "@/lib/context/navigation";
import { Authenticated } from "convex/react";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import type { SidebarView } from "@/components/Sidebar"; // Import SidebarView type
import { cn } from "@/lib/utils"; // Import cn utility

// Inner component that consumes the navigation context
function DashboardLayoutInner({
  children,
  sidebarView,
  setSidebarView
}: {
  children: React.ReactNode;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
}) {
  const { isSidebarOpen } = useNavigation(); // Consume context here

  return (
    <div className="flex h-screen">
      <Authenticated>
        <Sidebar
          sidebarView={sidebarView}
          setSidebarView={setSidebarView}
          isOpen={isSidebarOpen}
        />
      </Authenticated>
      {/* Add conditional padding-left for absolute sidebar */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out", // Added transition
        isSidebarOpen ? "md:pl-72" : "md:pl-0"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto hide-scrollbar">{children}</main>
      </div>
    </div>
  );
}

// Main layout component that provides the context
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarView, setSidebarView] = useState<SidebarView>("main");

  return (
    <ConvexClientProvider>
      <NavigationProvider>
        {/* Render the inner component *inside* the provider */}
        <DashboardLayoutInner
          sidebarView={sidebarView}
          setSidebarView={setSidebarView}
        >
          {children}
        </DashboardLayoutInner>
      </NavigationProvider>
    </ConvexClientProvider>
  );
}
