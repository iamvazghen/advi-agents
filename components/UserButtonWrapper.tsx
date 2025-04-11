"use client";

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function UserButtonWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox:
            "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50",
        },
      }}
    />
  );
}