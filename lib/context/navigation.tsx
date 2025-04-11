"use client";

import { createContext, useState, useContext } from "react";

interface NavigationContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  closeMobileNav: () => void;
  isSidebarOpen: boolean; // Added state for desktop sidebar
  toggleSidebar: () => void; // Added toggle function
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar starts open

  const closeMobileNav = () => setIsMobileNavOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev); // Toggle function

  return (
    <NavigationContext
      value={{ isMobileNavOpen, setIsMobileNavOpen, closeMobileNav, isSidebarOpen, toggleSidebar }}
    >
      {children}
    </NavigationContext>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
