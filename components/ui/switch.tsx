"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked);

    React.useEffect(() => {
      setIsChecked(checked);
    }, [checked]);

    const handleClick = () => {
      if (disabled) return;
      
      const newValue = !isChecked;
      setIsChecked(newValue);
      onCheckedChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white",
          isChecked ? "bg-indigo-600 shadow-inner" : "bg-slate-200",
          disabled ? "cursor-not-allowed opacity-50" : "",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-all duration-200 ease-in-out",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
