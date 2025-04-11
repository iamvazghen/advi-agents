"use client";

import React, { createContext, useContext, useState } from 'react';

import { AgentType } from "@/constants/agents";

interface AgentContextType {
  agentName: string | undefined;
  setAgentName: (name: string | undefined) => void;
  agentIcon: string | undefined;
  setAgentIcon: (icon: string | undefined) => void;
  agentType: AgentType | undefined;
  setAgentType: (type: AgentType | undefined) => void;
  userFiles: Array<{
    name: string;
    type: string;
    size: number;
    storageId: string;
    uploadedAt: number;
  }>;
  setUserFiles: (files: Array<{
    name: string;
    type: string;
    size: number;
    storageId: string;
    uploadedAt: number;
  }>) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agentName, setAgentName] = useState<string | undefined>();
  const [agentIcon, setAgentIcon] = useState<string | undefined>();
  const [agentType, setAgentType] = useState<AgentType | undefined>();
  const [userFiles, setUserFiles] = useState<AgentContextType['userFiles']>([]);

  return (
    <AgentContext.Provider value={{
      agentName,
      setAgentName,
      agentIcon,
      setAgentIcon,
      agentType,
      setAgentType,
      userFiles,
      setUserFiles
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}