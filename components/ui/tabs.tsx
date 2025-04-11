"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: "",
  onValueChange: () => null,
});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
    const [tabValue, setTabValue] = React.useState(value || defaultValue || "");

    React.useEffect(() => {
      if (value !== undefined) {
        setTabValue(value);
      }
    }, [value]);

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        setTabValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    return (
      <TabsContext.Provider
        value={{ value: tabValue, onValueChange: handleValueChange }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white p-1 text-slate-600 shadow-sm",
          className
        )}
      {...props}
    >
      {children}
    </div>
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
    const isActive = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-slate-100 text-purple-700 shadow-sm"
            : "text-slate-600 hover:text-purple-600 hover:bg-slate-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(TabsContext);
    const isActive = selectedValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        className={cn("mt-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
