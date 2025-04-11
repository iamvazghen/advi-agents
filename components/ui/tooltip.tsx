"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Simplified tooltip component that doesn't rely on complex contexts or props
export const SimpleTooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 500);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 min-w-max max-w-xs p-2 bg-gray-900 text-white text-xs rounded shadow",
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Export compatibility functions that don't do anything, just to avoid breaking existing code
export const TooltipProvider: React.FC<{children: React.ReactNode}> = ({children}) => children;
export const Tooltip: React.FC<{children: React.ReactNode}> = ({children}) => children;
export const TooltipTrigger: React.FC<{children: React.ReactNode}> = ({children}) => children;
export const TooltipContent: React.FC<{children: React.ReactNode}> = ({children}) => children;